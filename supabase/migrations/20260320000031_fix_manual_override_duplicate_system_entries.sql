-- ============================================================================
-- Migration: Fix Manual Override Showing Duplicate "System" in Tier History
-- Timestamp: 20260320000031
--
-- Problem:  When Support Adjusts tier (manual override), Tier History shows
--           3-4 duplicate "System (Auto)" entries instead of "Admin (Manual)".
--           Session variable app.manual_tier_override may not persist in
--           Supabase connection pooling.
--
-- Fix:      Use a column marker _override_changer_id on loyalty_points.
--           RPC sets it before UPDATE; trigger skips when it's NOT NULL.
--           Then RPC clears it (second UPDATE fires trigger but tier unchanged → skip).
-- ============================================================================

-- 1. Add marker column (internal use only, not exposed to API)
ALTER TABLE public.loyalty_points
    ADD COLUMN IF NOT EXISTS _override_changer_id uuid;

COMMENT ON COLUMN public.loyalty_points._override_changer_id IS
    'Set during manual_override_customer_tier RPC so trigger skips auto-log. Cleared after.';

-- 2. Update trigger: skip when marker is set (more reliable than session var)
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
    -- Skip when manual override is in progress (column marker is more reliable than session var)
    IF NEW._override_changer_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Fallback: session var (for backwards compat if column not yet set)
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

-- 3. Update RPC: set _override_changer_id before UPDATE, clear after
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
        -- New user: create loyalty_points row (trigger will skip if we set marker)
        SELECT id INTO v_profile_customer_id
        FROM public.profile_customers
        WHERE user_id = target_user_id;

        IF v_profile_customer_id IS NULL THEN
            RAISE EXCEPTION 'customer_not_found: no profile for user %', target_user_id;
        END IF;

        INSERT INTO public.loyalty_points (
            profile_customer_id,
            point_balance,
            loyalty_tier_id,
            _override_changer_id
        ) VALUES (
            v_profile_customer_id,
            0,
            new_tier_id,
            v_caller_id
        ) RETURNING id INTO v_lp_id;

        -- Clear marker (trigger will skip: tier unchanged in this UPDATE)
        UPDATE public.loyalty_points
        SET _override_changer_id = NULL
        WHERE id = v_lp_id;

        v_old_tier_name := 'None';
    ELSE
        IF v_old_tier_id IS NOT NULL THEN
            SELECT name INTO v_old_tier_name
            FROM public.loyalty_tiers
            WHERE id = v_old_tier_id;
        END IF;
        v_old_tier_name := COALESCE(v_old_tier_name, 'None');

        -- Set marker so trigger skips; update tier
        UPDATE public.loyalty_points
        SET loyalty_tier_id = new_tier_id,
            updated_at      = now(),
            _override_changer_id = v_caller_id
        WHERE id = v_lp_id;

        -- Clear marker (trigger fires but tier unchanged → skips)
        UPDATE public.loyalty_points
        SET _override_changer_id = NULL
        WHERE id = v_lp_id;
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
