-- ============================================================================
-- Migration: Add Real-Time Auto-Log Trigger for Tier Changes (INSERT & UPDATE)
-- Timestamp: 20260318990000
--
-- Problem:  The previous trigger only fired on UPDATE, completely missing
--           new users (INSERT) who are assigned a tier upon creation.
--
-- Fix:      Update log_auto_tier_change() to handle BOTH TG_OP = 'INSERT'
--           and TG_OP = 'UPDATE' events correctly.
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
    -- 1. Handle UPDATE logic: skip if tier didn't actually change
    IF TG_OP = 'UPDATE' THEN
        IF OLD.loyalty_tier_id IS NOT DISTINCT FROM NEW.loyalty_tier_id THEN
            RETURN NEW;
        END IF;

        -- Fetch old tier name if possible
        IF OLD.loyalty_tier_id IS NOT NULL THEN
            SELECT name INTO v_old_tier_name
            FROM public.loyalty_tiers
            WHERE id = OLD.loyalty_tier_id;
        END IF;
    END IF;

    -- 2. Handle INSERT logic (or missing old tier on UPDATE)
    --    Default old tier name to 'None' for new signups
    v_old_tier_name := COALESCE(v_old_tier_name, 'None');

    -- 3. Fetch the new tier name
    IF NEW.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_new_tier_name
        FROM public.loyalty_tiers
        WHERE id = NEW.loyalty_tier_id;
    END IF;

    -- 4. Insert the log into history if a tier was assigned
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

-- Drop the old UPDATE-only trigger
DROP TRIGGER IF EXISTS trg_log_auto_tier_change ON public.loyalty_points;

-- Create the new INSERT or UPDATE trigger
CREATE TRIGGER trg_log_auto_tier_change
    AFTER INSERT OR UPDATE OF loyalty_tier_id ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.log_auto_tier_change();

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
