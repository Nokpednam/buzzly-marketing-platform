-- ============================================================================
-- Migration: Fix manual tier persist + Support-only display when Adjust Tier
-- Timestamp: 20260320000052
--
-- Bug 1: When Support Adjust Tier, history should show ONLY Support — not System.
--        System entries (e.g. from evaluate_inactivity) can appear at same time.
--        Fix: evaluate_inactivity and sync_tier must SKIP recently manual-overridden users.
--
-- Bug 2: Support sets Gold but system overwrites to Silver (evaluate_inactivity).
--        Fix: Add manual_override_at — when Support overrides, set it. Auto logic skips.
-- ============================================================================

-- 1. Add column to track when Support last manually overrode tier
ALTER TABLE public.loyalty_points
    ADD COLUMN IF NOT EXISTS manual_override_at timestamptz;

COMMENT ON COLUMN public.loyalty_points.manual_override_at IS
    'Set when Support manually overrides tier. evaluate_inactivity and sync_tier skip these users for retention_period_days.';

-- 2. admin_override_tier: set manual_override_at so auto logic won't overwrite
CREATE OR REPLACE FUNCTION public.admin_override_tier(
    p_user_id UUID,
    p_new_tier_name TEXT,
    p_reason TEXT
)
RETURNS void AS $$
DECLARE
    v_profile_customer_id TEXT;
    v_loyalty_points_id UUID;
    v_old_tier_name TEXT;
    v_new_tier_id UUID;
    v_admin_id UUID;
BEGIN
    v_admin_id := auth.uid();

    SELECT pc.id, lp.id, lt.name
    INTO v_profile_customer_id, v_loyalty_points_id, v_old_tier_name
    FROM public.profile_customers pc
    JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
    LEFT JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
    WHERE pc.user_id = p_user_id
    LIMIT 1;

    IF v_profile_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer not found';
    END IF;

    SELECT id INTO v_new_tier_id
    FROM public.loyalty_tiers
    WHERE name = p_new_tier_name
    LIMIT 1;

    IF v_new_tier_id IS NULL THEN
        RAISE EXCEPTION 'New tier not found';
    END IF;

    -- Set _override_changer_id (trigger skip) + manual_override_at (evaluate/sync skip)
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
        v_profile_customer_id::UUID,
        COALESCE(NULLIF(TRIM(v_old_tier_name), ''), 'Bronze'),
        p_new_tier_name,
        'manual',
        p_reason,
        v_admin_id,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. evaluate_inactivity_tier_downgrades: skip users with recent manual override
CREATE OR REPLACE FUNCTION public.evaluate_inactivity_tier_downgrades()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r              RECORD;
    v_tier         RECORD;
    v_qualified_id  UUID;
    v_downgraded   INT := 0;
    v_cutoff       TIMESTAMPTZ;
    v_override_cutoff TIMESTAMPTZ;
BEGIN
    IF auth.uid() IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.employees WHERE user_id = auth.uid()) THEN
        RAISE EXCEPTION 'employees_only';
    END IF;

    FOR v_tier IN
        SELECT id, name, COALESCE(retention_period_days, 90) AS days
        FROM public.loyalty_tiers
        WHERE is_active = true AND retention_period_days IS NOT NULL
    LOOP
        v_cutoff := now() - (v_tier.days || ' days')::interval;
        v_override_cutoff := now() - (v_tier.days || ' days')::interval;

        FOR r IN
            SELECT lp.id, lp.profile_customer_id, lp.loyalty_tier_id, lp.lifetime_points, lp.manual_override_at
            FROM public.loyalty_points lp
            WHERE lp.loyalty_tier_id = v_tier.id
              AND COALESCE(lp.last_activity_at, lp.updated_at, lp.created_at) < v_cutoff
              -- Skip if Support manually overrode within retention period
              AND (lp.manual_override_at IS NULL OR lp.manual_override_at < v_override_cutoff)
        LOOP
            SELECT id INTO v_qualified_id
            FROM public.loyalty_tiers
            WHERE is_active = true
              AND COALESCE(min_points, 0) <= COALESCE(r.lifetime_points, 0)
            ORDER BY priority_level DESC
            LIMIT 1;

            IF v_qualified_id IS NOT NULL AND v_qualified_id IS DISTINCT FROM r.loyalty_tier_id THEN
                UPDATE public.loyalty_points
                SET loyalty_tier_id = v_qualified_id, updated_at = now()
                WHERE id = r.id;
                v_downgraded := v_downgraded + 1;
            END IF;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('downgraded_count', v_downgraded);
END;
$$;

-- 4. sync_tier_from_lifetime_points: skip users with recent manual override (90 days)
CREATE OR REPLACE FUNCTION public.sync_tier_from_lifetime_points()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r              RECORD;
    v_correct_id   UUID;
    v_updated      INT := 0;
    v_backfilled   INT := 0;
    v_override_cutoff TIMESTAMPTZ := now() - interval '90 days';
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.is_employee(auth.uid()) THEN
        RAISE EXCEPTION 'permission_denied: employees only';
    END IF;

    FOR r IN
        SELECT lp.id, lp.profile_customer_id, lp.loyalty_tier_id, lp.lifetime_points, lp.manual_override_at
        FROM public.loyalty_points lp
        WHERE lp.manual_override_at IS NULL OR lp.manual_override_at < v_override_cutoff
    LOOP
        SELECT id INTO v_correct_id
        FROM public.loyalty_tiers
        WHERE is_active = true
          AND COALESCE(min_points, 0) <= COALESCE(r.lifetime_points, 0)
        ORDER BY priority_level DESC
        LIMIT 1;

        IF v_correct_id IS NOT NULL AND v_correct_id IS DISTINCT FROM r.loyalty_tier_id THEN
            UPDATE public.loyalty_points
            SET loyalty_tier_id = v_correct_id, updated_at = now()
            WHERE id = r.id;
            v_updated := v_updated + 1;
        END IF;
    END LOOP;

    INSERT INTO public.loyalty_tier_history (
        profile_customer_id, old_tier, new_tier, change_type, change_reason, changed_at
    )
    SELECT lp.profile_customer_id, 'Bronze', lt.name, 'auto',
           'System auto-evaluated tier (sync)', NOW()
    FROM public.loyalty_points lp
    JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
    WHERE lt.name IN ('Silver', 'Gold', 'Platinum')
      AND (lp.manual_override_at IS NULL OR lp.manual_override_at < v_override_cutoff)
      AND NOT EXISTS (
          SELECT 1 FROM public.loyalty_tier_history lth
          WHERE lth.profile_customer_id = lp.profile_customer_id
            AND lth.new_tier IN ('Silver', 'Gold', 'Platinum')
      );

    GET DIAGNOSTICS v_backfilled = ROW_COUNT;

    RETURN jsonb_build_object('updated_count', v_updated, 'backfilled_count', v_backfilled);
END;
$$;

NOTIFY pgrst, 'reload schema';
