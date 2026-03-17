-- 1. Create or Replace the RPC for Manual Tier Override
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

    -- Update loyalty_points table
    UPDATE public.loyalty_points
    SET loyalty_tier_id = v_new_tier_id
    WHERE id = v_loyalty_points_id;

    -- Force INSERT INTO loyalty_tier_history
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
        COALESCE(v_old_tier_name, 'None'),
        p_new_tier_name,
        'manual',
        p_reason,
        v_admin_id,
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix the Trigger Bug ("None" Bug)
DROP TRIGGER IF EXISTS trg_log_auto_tier_change_v3 ON public.loyalty_points;
DROP TRIGGER IF EXISTS log_loyalty_tier_change_trigger ON public.loyalty_points;

CREATE OR REPLACE FUNCTION public.fn_log_auto_tier_change()
RETURNS TRIGGER AS $$
DECLARE
    v_old_tier_name TEXT;
    v_new_tier_name TEXT;
    v_recent_manual_count INT;
BEGIN
    -- Only act if the tier ID actually changed
    IF OLD.loyalty_tier_id IS DISTINCT FROM NEW.loyalty_tier_id THEN
        
        -- Resolve Old Tier Name safely
        IF OLD.loyalty_tier_id IS NOT NULL THEN
            SELECT name INTO v_old_tier_name FROM public.loyalty_tiers WHERE id = OLD.loyalty_tier_id;
        END IF;
        
        -- Resolve New Tier Name
        IF NEW.loyalty_tier_id IS NOT NULL THEN
            SELECT name INTO v_new_tier_name FROM public.loyalty_tiers WHERE id = NEW.loyalty_tier_id;
        END IF;

        -- Prevent duplicate auto-logging if a manual override JUST happened in the same second/transaction
        -- We check if there's a 'manual' entry in the last 2 seconds for this same tier change
        SELECT COUNT(*)
        INTO v_recent_manual_count
        FROM public.loyalty_tier_history
        WHERE profile_customer_id = NEW.profile_customer_id
          AND change_type = 'manual'
          AND new_tier = v_new_tier_name
          AND changed_at >= NOW() - INTERVAL '2 seconds';

        IF v_recent_manual_count = 0 THEN
            -- Only insert auto log if we didn't just do a manual override
            INSERT INTO public.loyalty_tier_history (
                profile_customer_id,
                old_tier,
                new_tier,
                change_type,
                changed_at
            ) VALUES (
                NEW.profile_customer_id,
                COALESCE(v_old_tier_name, 'None'),
                COALESCE(v_new_tier_name, 'None'),
                'auto',
                NOW()
            );
        END IF;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_auto_tier_change_v3
AFTER UPDATE OF loyalty_tier_id ON public.loyalty_points
FOR EACH ROW
EXECUTE FUNCTION public.fn_log_auto_tier_change();
