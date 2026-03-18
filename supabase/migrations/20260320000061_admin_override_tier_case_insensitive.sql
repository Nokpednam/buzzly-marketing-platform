-- ============================================================================
-- Migration: admin_override_tier — case-insensitive tier name matching
-- Timestamp: 20260320000061
--
-- Fix: Use LOWER(TRIM()) for tier name lookup so "Silver", "silver", " SILVER "
--      all match correctly.
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
        WHERE LOWER(TRIM(name)) = 'bronze' AND is_active = true
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

        UPDATE public.profile_customers
        SET loyalty_point_id = v_loyalty_points_id, updated_at = now()
        WHERE id = v_profile_customer_id;

        v_old_tier_name := 'Bronze';
    END IF;

    v_old_tier_name := COALESCE(NULLIF(TRIM(v_old_tier_name), ''), 'Bronze');

    -- Case-insensitive tier name lookup
    SELECT id INTO v_new_tier_id
    FROM public.loyalty_tiers
    WHERE LOWER(TRIM(name)) = LOWER(TRIM(p_new_tier_name))
      AND is_active = true
    LIMIT 1;

    IF v_new_tier_id IS NULL THEN
        RAISE EXCEPTION 'New tier not found: %', p_new_tier_name;
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
        (SELECT name FROM public.loyalty_tiers WHERE id = v_new_tier_id),
        'manual',
        COALESCE(NULLIF(TRIM(p_reason), ''), 'Manual override by support'),
        v_admin_id,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
