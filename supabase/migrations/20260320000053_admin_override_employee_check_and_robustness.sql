-- ============================================================================
-- Migration: admin_override_tier — add employee check + ensure robustness
-- Timestamp: 20260320000053
--
-- Problem: admin_override_tier had no is_employee check (unlike manual_override_customer_tier).
--          Also ensure manual entries always show as Support in Tier History.
--
-- Fix: Add is_employee guard at start. Recreate function with full logic.
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
BEGIN
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    IF NOT public.is_employee(v_admin_id) THEN
        RAISE EXCEPTION 'permission_denied: only employees can adjust tier';
    END IF;

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
        COALESCE(NULLIF(TRIM(v_old_tier_name), ''), 'Bronze'),
        p_new_tier_name,
        'manual',
        COALESCE(NULLIF(TRIM(p_reason), ''), 'Manual override by support'),
        v_admin_id,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.admin_override_tier(UUID, TEXT, TEXT) IS
    'Employee-only: manually override customer tier. Uses _override_changer_id + manual_override_at. Inserts change_type=manual.';

NOTIFY pgrst, 'reload schema';
