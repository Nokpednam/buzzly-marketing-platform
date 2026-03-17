-- ============================================================================
-- Migration: Fix Tier Management — No "None", Bronze as start; No duplicate entries
-- Timestamp: 20260320000047
--
-- 1. admin_override_tier (used by Support Adjust Tier):
--    - Set _override_changer_id before UPDATE so trigger skips → no duplicate System entry
--    - Use "Bronze" instead of "None" for old_tier when null (Bronze = starting tier)
--
-- 2. log_auto_tier_change trigger:
--    - Use "Bronze" instead of "None" for old_tier when null
-- ============================================================================

-- 1. Update admin_override_tier: set _override_changer_id so trigger skips; use Bronze not None
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

    -- Get profile_customer_id, loyalty_points_id, and TRUE old_tier name
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

    -- Get the new tier ID
    SELECT id INTO v_new_tier_id
    FROM public.loyalty_tiers
    WHERE name = p_new_tier_name
    LIMIT 1;

    IF v_new_tier_id IS NULL THEN
        RAISE EXCEPTION 'New tier not found';
    END IF;

    -- Update loyalty_points: set _override_changer_id so trigger skips (no duplicate System entry)
    UPDATE public.loyalty_points
    SET loyalty_tier_id = v_new_tier_id,
        _override_changer_id = v_admin_id
    WHERE id = v_loyalty_points_id;

    -- Clear marker (trigger fires but tier unchanged → skips)
    UPDATE public.loyalty_points
    SET _override_changer_id = NULL
    WHERE id = v_loyalty_points_id;

    -- Insert manual entry only (trigger did not insert auto because of marker)
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

-- 2. Update log_auto_tier_change: skip first-assignment (null→Bronze), use Bronze for old when null on real upgrades
CREATE OR REPLACE FUNCTION public.log_auto_tier_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_old_tier_name TEXT;
    v_new_tier_name TEXT;
BEGIN
    IF NEW._override_changer_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    IF current_setting('app.manual_tier_override', true) = 'true' THEN
        RETURN NEW;
    END IF;

    IF (TG_OP = 'UPDATE' AND OLD.loyalty_tier_id IS NOT DISTINCT FROM NEW.loyalty_tier_id) THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_old_tier_name
        FROM public.loyalty_tiers
        WHERE id = OLD.loyalty_tier_id;
    END IF;

    -- Keep null for first assignment (UI shows "—"); use Bronze when old tier exists but empty
    v_old_tier_name := CASE
        WHEN TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.loyalty_tier_id IS NULL) THEN NULL
        ELSE COALESCE(NULLIF(TRIM(v_old_tier_name), ''), 'Bronze')
    END;

    IF NEW.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_new_tier_name
        FROM public.loyalty_tiers
        WHERE id = NEW.loyalty_tier_id;
    END IF;

    IF v_new_tier_name IS NOT NULL THEN
        INSERT INTO public.loyalty_tier_history (
            profile_customer_id,
            old_tier,
            new_tier,
            change_type,
            change_reason
        ) VALUES (
            NEW.profile_customer_id,
            v_old_tier_name,
            v_new_tier_name,
            'auto',
            'System auto-evaluated tier'
        );
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.admin_override_tier(UUID, TEXT, TEXT) IS
    'Employee-only: manually override customer tier by name. Uses _override_changer_id to prevent duplicate System entry. Bronze = starting tier.';

NOTIFY pgrst, 'reload schema';
