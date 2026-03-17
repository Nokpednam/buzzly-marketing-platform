-- ============================================================================
-- Migration: Fix manual_override FOR UPDATE + New Tier display for new users
-- Timestamp: 20260320000042
--
-- Bug 1: "FOR UPDATE cannot be applied to the nullable side of an outer join"
--   - The query used LEFT JOIN loyalty_points + FOR UPDATE (no OF clause)
--   - When lp is NULL (new user), PostgreSQL rejects FOR UPDATE on outer join
--   - Fix: Use FOR UPDATE OF pc — lock only profile_customers (always exists)
--
-- Bug 2: New users show "Bronze" instead of actual tier name (e.g. "Bronze New Tier")
--   - v_old_tier_name was hardcoded as 'Bronze' for new users
--   - v_new_tier_name: ensure we always use actual name from loyalty_tiers
--   - For old_tier when no previous: use "None" or fetch default tier name
--   - The new_tier is already fetched from loyalty_tiers — ensure no fallback to 'Bronze'
-- ============================================================================

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

    -- Resolve new_tier name from loyalty_tiers (actual DB value, e.g. "Bronze New Tier")
    SELECT name INTO v_new_tier_name
    FROM public.loyalty_tiers
    WHERE id = new_tier_id;

    -- Lock ONLY profile_customers (pc) — never use FOR UPDATE on lp when LEFT JOIN
    -- because lp can be NULL for new users → "FOR UPDATE cannot be applied to nullable side"
    SELECT pc.id, lp.id, lp.loyalty_tier_id
    INTO v_profile_customer_id, v_lp_id, v_old_tier_id
    FROM public.profile_customers pc
    LEFT JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = target_user_id
    FOR UPDATE OF pc;

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

        -- New user: no previous tier — use "None" (or first tier name if preferred)
        v_old_tier_name := 'None';
        -- v_new_tier_name already set from loyalty_tiers above (actual name, e.g. "Bronze New Tier")
    ELSE
        IF v_old_tier_id IS NOT NULL THEN
            SELECT name INTO v_old_tier_name
            FROM public.loyalty_tiers
            WHERE id = v_old_tier_id;
        END IF;
        v_old_tier_name := COALESCE(v_old_tier_name, 'None');

        -- Update tier (marker prevents trigger from logging)
        UPDATE public.loyalty_points
        SET loyalty_tier_id = new_tier_id,
            updated_at      = now(),
            _override_changer_id = v_caller_id
        WHERE id = v_lp_id;

        UPDATE public.loyalty_points
        SET _override_changer_id = NULL
        WHERE id = v_lp_id;

        -- Re-fetch new_tier name from actual row (in case of any edge case)
        SELECT lt.name INTO v_new_tier_name
        FROM public.loyalty_points lp
        JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
        WHERE lp.id = v_lp_id;
    END IF;

    -- Fallback: use param tier name if join returned null
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
    'Employee-only: manually override customer tier. FOR UPDATE OF pc only (fixes outer join error). Uses actual tier names from loyalty_tiers.';

-- Update log_auto_tier_change: for new users (INSERT), use actual new_tier name from loyalty_tiers
-- and use "None" for old_tier when no previous (instead of hardcoded "Bronze")
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

    -- For new users / first assignment: use "None" (no previous tier)
    -- Do NOT hardcode "Bronze" — tier names come from loyalty_tiers
    v_old_tier_name := COALESCE(v_old_tier_name, 'None');

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

NOTIFY pgrst, 'reload schema';
