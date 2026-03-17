-- ============================================================================
-- Migration: Fix Duplicate Tier History on Manual Override
-- Timestamp: 20260320000025
--
-- Problem:  When Adjust Tier (manual override) is used, Tier History shows
--           5+ duplicate entries because:
--           1. Multiple triggers on loyalty_points each insert 'auto' rows
--           2. RPC also inserts a 'manual' row
--           3. Result: several auto + 1 manual = duplicates
--
-- Fix:      1. Drop ALL tier-logging triggers on loyalty_points
--           2. Create ONE trigger that SKIPS when app.manual_tier_override=true
--           3. Update manual_override_customer_tier to set that session var
--              before updating loyalty_points, so only the explicit 'manual'
--              insert is written — no duplicate auto rows
-- ============================================================================

-- 1. NUCLEAR DROP: Remove every possible tier-logging trigger
DROP TRIGGER IF EXISTS trg_bulletproof_tier_change       ON public.loyalty_points;
DROP TRIGGER IF EXISTS trg_profile_customer_tier_change ON public.profile_customers;
DROP TRIGGER IF EXISTS trg_log_auto_tier_change          ON public.loyalty_points;
DROP TRIGGER IF EXISTS trg_log_auto_tier_change_v3      ON public.loyalty_points;
DROP TRIGGER IF EXISTS trg_log_tier_change              ON public.loyalty_points;
DROP TRIGGER IF EXISTS trg_log_tier_change_final       ON public.loyalty_points;
DROP TRIGGER IF EXISTS log_tier_change_trigger          ON public.loyalty_points;
DROP TRIGGER IF EXISTS log_loyalty_tier_change_trigger  ON public.loyalty_points;
DROP TRIGGER IF EXISTS loyalty_tier_history_trigger     ON public.loyalty_points;

-- 2. Trigger function: log ONLY when NOT a manual override
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
    -- Skip when manual_override_customer_tier is running (avoids duplicate logs)
    IF current_setting('app.manual_tier_override', true) = 'true' THEN
        RETURN NEW;
    END IF;

    -- Only log when tier ID actually changed
    IF (TG_OP = 'UPDATE' AND OLD.loyalty_tier_id IS NOT DISTINCT FROM NEW.loyalty_tier_id) THEN
        RETURN NEW;
    END IF;

    -- Resolve old tier name (Updates only)
    IF TG_OP = 'UPDATE' AND OLD.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_old_tier_name
        FROM public.loyalty_tiers
        WHERE id = OLD.loyalty_tier_id;
    END IF;

    v_old_tier_name := COALESCE(v_old_tier_name, 'None');

    -- Resolve new tier name
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

-- 3. Single trigger for auto tier changes
CREATE TRIGGER trg_log_auto_tier_change
    AFTER INSERT OR UPDATE OF loyalty_tier_id ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.log_auto_tier_change();

-- 4. Update manual_override_customer_tier: set session var so trigger skips
--    (DROP required because return type changes from void to JSONB)
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

    SELECT name INTO v_new_tier_name
    FROM public.loyalty_tiers
    WHERE id = new_tier_id;

    IF v_new_tier_name IS NULL THEN
        RAISE EXCEPTION 'tier_not_found: %', new_tier_id;
    END IF;

    SELECT pc.id, lp.id, lp.loyalty_tier_id
    INTO v_profile_customer_id, v_lp_id, v_old_tier_id
    FROM public.profile_customers pc
    JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = target_user_id
    FOR UPDATE OF lp;

    IF v_lp_id IS NULL THEN
        -- New user: create loyalty_points row
        SELECT id INTO v_profile_customer_id
        FROM public.profile_customers
        WHERE user_id = target_user_id;

        IF v_profile_customer_id IS NULL THEN
            RAISE EXCEPTION 'customer_not_found: no profile for user %', target_user_id;
        END IF;

        -- Suppress trigger so we get only 1 manual log (no duplicate)
        PERFORM set_config('app.manual_tier_override', 'true', true);

        INSERT INTO public.loyalty_points (
            profile_customer_id,
            point_balance,
            loyalty_tier_id
        ) VALUES (
            v_profile_customer_id,
            0,
            new_tier_id
        ) RETURNING id INTO v_lp_id;

        PERFORM set_config('app.manual_tier_override', 'false', true);

        -- For new users, old_tier is None
        v_old_tier_name := 'None';
    ELSE
        IF v_old_tier_id IS NOT NULL THEN
            SELECT name INTO v_old_tier_name
            FROM public.loyalty_tiers
            WHERE id = v_old_tier_id;
        END IF;
        v_old_tier_name := COALESCE(v_old_tier_name, 'None');

        -- Suppress trigger so we get only 1 manual log (no duplicate auto rows)
        PERFORM set_config('app.manual_tier_override', 'true', true);

        UPDATE public.loyalty_points
        SET loyalty_tier_id = new_tier_id,
            updated_at      = now()
        WHERE id = v_lp_id;

        PERFORM set_config('app.manual_tier_override', 'false', true);
    END IF;

    -- Single definitive manual log entry
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

    -- Sync customer table for UI consistency
    UPDATE public.customer
    SET loyalty_tier_id = new_tier_id
    WHERE id = target_user_id;

    -- Legacy tier_history for backwards compat (optional, non-fatal)
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

NOTIFY pgrst, 'reload schema';
