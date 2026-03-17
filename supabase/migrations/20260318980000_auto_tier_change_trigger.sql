-- ============================================================================
-- Migration: Add Real-Time Auto-Log Trigger for Tier Changes
-- Timestamp: 20260318980000
--
-- Problem:  loyalty_tier_history is missing real-time logs for new users
--           or when the tier system organically levels someone up.
--
-- Fix:      Create a dedicated trigger specifically tracking AFTER UPDATE OF
--           loyalty_tier_id to insert an 'auto' record into history.
-- ============================================================================

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
    -- Only act when tier actually changes
    IF OLD.loyalty_tier_id IS NOT DISTINCT FROM NEW.loyalty_tier_id THEN
        RETURN NEW;
    END IF;

    -- Fetch the old tier name (handle NULLs safely)
    IF OLD.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_old_tier_name
        FROM public.loyalty_tiers
        WHERE id = OLD.loyalty_tier_id;
    END IF;

    -- Default to 'None' if they didn't have a tier previously
    v_old_tier_name := COALESCE(v_old_tier_name, 'None');

    -- Fetch the new tier name
    IF NEW.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_new_tier_name
        FROM public.loyalty_tiers
        WHERE id = NEW.loyalty_tier_id;
    END IF;

    -- Insert the auto-log into history
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

-- Drop existing if it exists
DROP TRIGGER IF EXISTS trg_log_auto_tier_change ON public.loyalty_points;

-- Recreate trigger
CREATE TRIGGER trg_log_auto_tier_change
    AFTER UPDATE OF loyalty_tier_id ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.log_auto_tier_change();

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
