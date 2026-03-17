-- ============================================================================
-- Migration: Fix admin_override_tier — handle customers without loyalty_points
-- Timestamp: 20260320000057
--
-- Problem: When a customer registers via SignUp page, the client-side fallback
--          creates customer + profile_customers but NOT loyalty_points.
--          admin_override_tier uses JOIN with loyalty_points → "Customer not found"
--          when Support tries to adjust tier.
--
-- Fix: Update admin_override_tier to:
--   1. Get profile_customer_id first (no JOIN with loyalty_points)
--   2. If loyalty_points doesn't exist, create it (Bronze, 0 pts) then proceed
--   3. Proceed with tier override as before
-- ============================================================================

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

    -- Step 1: Get profile_customer_id (no JOIN — profile_customers always exists for valid customer)
    SELECT pc.id INTO v_profile_customer_id
    FROM public.profile_customers pc
    WHERE pc.user_id = p_user_id
    LIMIT 1;

    IF v_profile_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer not found';
    END IF;

    -- Step 2: Get or create loyalty_points (SignUp fallback may not create it)
    SELECT lp.id, lt.name
    INTO v_loyalty_points_id, v_old_tier_name
    FROM public.loyalty_points lp
    LEFT JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
    WHERE lp.profile_customer_id = v_profile_customer_id
    LIMIT 1;

    IF v_loyalty_points_id IS NULL THEN
        -- Customer has profile but no loyalty_points (e.g. SignUp fallback path)
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

        v_old_tier_name := 'Bronze';
    END IF;

    v_old_tier_name := COALESCE(NULLIF(TRIM(v_old_tier_name), ''), 'Bronze');

    -- Step 3: Resolve new tier by name
    SELECT id INTO v_new_tier_id
    FROM public.loyalty_tiers
    WHERE name = p_new_tier_name
    LIMIT 1;

    IF v_new_tier_id IS NULL THEN
        RAISE EXCEPTION 'New tier not found';
    END IF;

    -- Reject if tier unchanged
    IF (SELECT loyalty_tier_id FROM public.loyalty_points WHERE id = v_loyalty_points_id) IS NOT DISTINCT FROM v_new_tier_id THEN
        RAISE EXCEPTION 'tier_unchanged: select a different tier';
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

COMMENT ON FUNCTION public.admin_override_tier(UUID, TEXT, TEXT) IS
    'Employee-only: manually override customer tier. Handles customers without loyalty_points (creates wallet on the fly). Uses _override_changer_id + manual_override_at.';

-- ─── ensure_loyalty_wallet: for SignUp fallback ─────────────────────────────
-- Called by customer after signup to create loyalty_points if trigger didn't.
-- Idempotent: no-op if wallet already exists.
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
        RETURN; -- No profile yet, trigger will handle
    END IF;

    IF EXISTS (SELECT 1 FROM public.loyalty_points WHERE profile_customer_id = v_profile_id) THEN
        RETURN; -- Already has wallet
    END IF;

    SELECT id INTO v_bronze_id
    FROM public.loyalty_tiers
    WHERE name = 'Bronze' AND is_active = true
    LIMIT 1;

    IF v_bronze_id IS NOT NULL THEN
        INSERT INTO public.loyalty_points (
            profile_customer_id, loyalty_tier_id, point_balance, lifetime_points
        ) VALUES (v_profile_id, v_bronze_id, 0, 0);
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_loyalty_wallet() TO authenticated;

COMMENT ON FUNCTION public.ensure_loyalty_wallet() IS
    'Customer self-call: ensure loyalty_points wallet exists (for SignUp fallback when trigger fails). Idempotent.';

NOTIFY pgrst, 'reload schema';
