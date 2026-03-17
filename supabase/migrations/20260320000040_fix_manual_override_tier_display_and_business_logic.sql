-- ============================================================================
-- Migration: Fix Manual Override Tier Display + Ensure Downgrade Logic
-- Timestamp: 20260320000040
--
-- 1. manual_override_customer_tier:
--    - Use tier name from the ACTUAL row we just updated (not from param)
--    - Ensures Tier History always shows correct new_tier (Bronze→Silver)
--
-- 2. Business logic (already correct, adding safeguard):
--    - Tier UPGRADE: only when lifetime_points increase (trigger)
--    - Tier DOWNGRADE: ONLY when inactive for retention_period_days (evaluate_inactivity_tier_downgrades)
--    - Spending points (redeem) does NOT downgrade — redeem only touches point_balance + last_activity_at
--    - Explicitly ensure no point_balance trigger recalculates tier (already replaced by lifetime_points)
-- ============================================================================

-- ─── 1. Fix manual_override: use tier from actual row after UPDATE ──────────

DROP FUNCTION IF EXISTS public.manual_override_customer_tier(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.manual_override_customer_tier(
    target_user_id UUID,
    new_tier_id UUID,
    override_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id          UUID;
    v_profile_customer_id UUID;
    v_lp_id              UUID;
    v_old_tier_id        UUID;
    v_old_tier_name      TEXT;
    v_new_tier_name      TEXT;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    IF NOT public.is_employee(v_caller_id) THEN
        RAISE EXCEPTION 'permission_denied: only employees can call this function';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.loyalty_tiers WHERE id = new_tier_id) THEN
        RAISE EXCEPTION 'tier_not_found: %', new_tier_id;
    END IF;

    SELECT pc.id, lp.id, lp.loyalty_tier_id
    INTO v_profile_customer_id, v_lp_id, v_old_tier_id
    FROM public.profile_customers pc
    LEFT JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = target_user_id
    FOR UPDATE;

    IF v_profile_customer_id IS NULL THEN
        RAISE EXCEPTION 'customer_not_found: no profile for user %', target_user_id;
    END IF;

    IF v_lp_id IS NULL THEN
        -- New user: create loyalty_points row
        INSERT INTO public.loyalty_points (
            profile_customer_id,
            point_balance,
            lifetime_points,
            loyalty_tier_id,
            _override_changer_id
        ) VALUES (
            v_profile_customer_id,
            0,
            0,
            new_tier_id,
            v_caller_id
        ) RETURNING id INTO v_lp_id;

        UPDATE public.loyalty_points
        SET _override_changer_id = NULL
        WHERE id = v_lp_id;

        v_old_tier_name := 'Bronze';
        SELECT name INTO v_new_tier_name
        FROM public.loyalty_tiers
        WHERE id = new_tier_id;
    ELSE
        IF v_old_tier_id IS NOT NULL THEN
            SELECT name INTO v_old_tier_name
            FROM public.loyalty_tiers
            WHERE id = v_old_tier_id;
        END IF;
        v_old_tier_name := COALESCE(v_old_tier_name, 'Bronze');

        -- Update tier (marker prevents trigger from logging)
        UPDATE public.loyalty_points
        SET loyalty_tier_id = new_tier_id,
            updated_at      = now(),
            _override_changer_id = v_caller_id
        WHERE id = v_lp_id;

        UPDATE public.loyalty_points
        SET _override_changer_id = NULL
        WHERE id = v_lp_id;

        -- CRITICAL: Get new_tier name from the ROW we just updated (not from param)
        -- Ensures Tier History displays the actual tier written to DB
        SELECT lt.name INTO v_new_tier_name
        FROM public.loyalty_points lp
        JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
        WHERE lp.id = v_lp_id;
    END IF;

    -- Fallback if join returned null (should not happen)
    v_new_tier_name := COALESCE(v_new_tier_name, (
        SELECT name FROM public.loyalty_tiers WHERE id = new_tier_id
    ), 'Unknown');

    INSERT INTO public.loyalty_tier_history (
        profile_customer_id,
        old_tier,
        new_tier,
        change_type,
        change_reason,
        changer_id
    ) VALUES (
        v_profile_customer_id,
        v_old_tier_name,
        v_new_tier_name,
        'manual',
        COALESCE(override_reason, 'Manual override by support'),
        v_caller_id
    );

    BEGIN
        INSERT INTO public.tier_history (
            user_id,
            previous_tier_id,
            new_tier_id,
            change_reason,
            changed_by,
            is_manual_override
        ) VALUES (
            target_user_id,
            v_old_tier_id,
            new_tier_id,
            COALESCE(override_reason, 'Manual override by support'),
            v_caller_id,
            true
        );
    EXCEPTION WHEN others THEN
        RAISE WARNING 'tier_history insert failed (non-fatal): %', SQLERRM;
    END;

    RETURN jsonb_build_object(
        'success',  true,
        'old_tier', v_old_tier_name,
        'new_tier', v_new_tier_name
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.manual_override_customer_tier(UUID, UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION public.manual_override_customer_tier(UUID, UUID, TEXT) IS
    'Employee-only: manually override customer tier. Uses tier from actual row after UPDATE to ensure Tier History displays correct new_tier.';

-- ─── 2. Safeguard: ensure no point_balance trigger downgrades tier ─────────
-- (trg_auto_evaluate_loyalty_tier was already changed to lifetime_points in 20260318970000)
DROP TRIGGER IF EXISTS trg_auto_evaluate_loyalty_tier ON public.loyalty_points;

CREATE TRIGGER trg_auto_evaluate_loyalty_tier
    BEFORE UPDATE OF lifetime_points ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_evaluate_loyalty_tier();

COMMENT ON TRIGGER trg_auto_evaluate_loyalty_tier ON public.loyalty_points IS
    'Tier UPGRADE only when lifetime_points increase. Spending points (point_balance) does NOT downgrade. Downgrade only via evaluate_inactivity_tier_downgrades.';

NOTIFY pgrst, 'reload schema';
