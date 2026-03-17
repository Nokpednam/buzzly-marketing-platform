-- ============================================================================
-- Migration: Fix tier not displaying after Support Adjust — sync loyalty_point_id
-- Timestamp: 20260320000059
--
-- Problem: After Support adjusts tier, customer still sees old tier. profile_customers
--          has loyalty_point_id; if not synced when creating loyalty_points,
--          the customer view may read wrong/stale data.
--
-- Fix: 1. admin_override_tier: UPDATE profile_customers.loyalty_point_id when creating
--         new loyalty_points
--      2. ensure_loyalty_wallet: same
--      3. Backfill: sync profile_customers.loyalty_point_id for all existing rows
-- ============================================================================

-- ─── 1. admin_override_tier: sync loyalty_point_id when creating wallet ───────

CREATE OR REPLACE FUNCTION public.admin_override_tier(
    p_user_id UUID,
    p_new_tier_name TEXT,
    p_reason TEXT
)
RETURNS void AS $$
DECLARE
    v_profile_customer_id UUID;
    v_loyalty_points_id UUID;
    v_old_tier_name TEXT;
    v_new_tier_id UUID;
    v_admin_id UUID;
    v_bronze_tier_id UUID;
BEGIN
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    IF NOT public.is_employee(v_admin_id) THEN
        RAISE EXCEPTION 'permission_denied: only employees can adjust tier';
    END IF;

    SELECT pc.id INTO v_profile_customer_id
    FROM public.profile_customers pc
    WHERE pc.user_id = p_user_id
    LIMIT 1;

    IF v_profile_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer not found';
    END IF;

    SELECT lp.id, lt.name
    INTO v_loyalty_points_id, v_old_tier_name
    FROM public.loyalty_points lp
    LEFT JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
    WHERE lp.profile_customer_id = v_profile_customer_id
    LIMIT 1;

    IF v_loyalty_points_id IS NULL THEN
        SELECT id INTO v_bronze_tier_id
        FROM public.loyalty_tiers
        WHERE name = 'Bronze' AND is_active = true
        LIMIT 1;

        IF v_bronze_tier_id IS NULL THEN
            RAISE EXCEPTION 'Bronze tier not found in loyalty_tiers';
        END IF;

        INSERT INTO public.loyalty_points (
            profile_customer_id, loyalty_tier_id, point_balance, lifetime_points
        ) VALUES (
            v_profile_customer_id, v_bronze_tier_id, 0, 0
        )
        RETURNING id INTO v_loyalty_points_id;

        -- Sync profile_customers.loyalty_point_id so customer view shows correct tier
        UPDATE public.profile_customers
        SET loyalty_point_id = v_loyalty_points_id, updated_at = now()
        WHERE id = v_profile_customer_id;

        v_old_tier_name := 'Bronze';
    END IF;

    v_old_tier_name := COALESCE(NULLIF(TRIM(v_old_tier_name), ''), 'Bronze');

    SELECT id INTO v_new_tier_id
    FROM public.loyalty_tiers
    WHERE name = p_new_tier_name
    LIMIT 1;

    IF v_new_tier_id IS NULL THEN
        RAISE EXCEPTION 'New tier not found';
    END IF;

    IF (SELECT loyalty_tier_id FROM public.loyalty_points WHERE id = v_loyalty_points_id) IS NOT DISTINCT FROM v_new_tier_id THEN
        RAISE EXCEPTION 'tier_unchanged: select a different tier';
    END IF;

    UPDATE public.loyalty_points
    SET loyalty_tier_id = v_new_tier_id,
        _override_changer_id = v_admin_id,
        manual_override_at = now()
    WHERE id = v_loyalty_points_id;

    UPDATE public.loyalty_points
    SET _override_changer_id = NULL
    WHERE id = v_loyalty_points_id;

    INSERT INTO public.loyalty_tier_history (
        profile_customer_id,
        old_tier,
        new_tier,
        change_type,
        change_reason,
        changer_id,
        changed_at
    ) VALUES (
        v_profile_customer_id,
        v_old_tier_name,
        p_new_tier_name,
        'manual',
        COALESCE(NULLIF(TRIM(p_reason), ''), 'Manual override by support'),
        v_admin_id,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 2. ensure_loyalty_wallet: sync loyalty_point_id ─────────────────────────

CREATE OR REPLACE FUNCTION public.ensure_loyalty_wallet()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_profile_id uuid;
    v_bronze_id uuid;
    v_lp_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    SELECT id INTO v_profile_id
    FROM public.profile_customers
    WHERE user_id = v_user_id
    LIMIT 1;

    IF v_profile_id IS NULL THEN
        RETURN;
    END IF;

    SELECT id INTO v_lp_id
    FROM public.loyalty_points
    WHERE profile_customer_id = v_profile_id
    LIMIT 1;

    IF v_lp_id IS NOT NULL THEN
        -- Sync loyalty_point_id if missing (fixes existing customers)
        UPDATE public.profile_customers
        SET loyalty_point_id = v_lp_id, updated_at = now()
        WHERE id = v_profile_id AND (loyalty_point_id IS NULL OR loyalty_point_id != v_lp_id);
        RETURN;
    END IF;

    SELECT id INTO v_bronze_id
    FROM public.loyalty_tiers
    WHERE name = 'Bronze' AND is_active = true
    LIMIT 1;

    IF v_bronze_id IS NOT NULL THEN
        INSERT INTO public.loyalty_points (
            profile_customer_id, loyalty_tier_id, point_balance, lifetime_points
        ) VALUES (v_profile_id, v_bronze_id, 0, 0)
        RETURNING id INTO v_lp_id;

        UPDATE public.profile_customers
        SET loyalty_point_id = v_lp_id, updated_at = now()
        WHERE id = v_profile_id;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_loyalty_wallet() TO authenticated;

-- ─── 3. Backfill: sync all profile_customers.loyalty_point_id ────────────────

UPDATE public.profile_customers pc
SET loyalty_point_id = lp.id, updated_at = now()
FROM public.loyalty_points lp
WHERE lp.profile_customer_id = pc.id
  AND (pc.loyalty_point_id IS NULL OR pc.loyalty_point_id != lp.id);

-- Enable Realtime for loyalty_points so customer sees tier updates from Support immediately
ALTER TABLE public.loyalty_points REPLICA IDENTITY FULL;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'loyalty_points'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_points;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
