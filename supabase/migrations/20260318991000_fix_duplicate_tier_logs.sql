-- ============================================================================
-- Migration: Fix Duplicate Logs in Auto-Tier History
-- Timestamp: 20260318991000
--
-- Problem:  trg_log_auto_tier_change fires too often because Postgres fires
--           `FOR EACH ROW` on `UPDATE OF loyalty_tier_id` regardless of whether
--           the value actually changed or not.
--
-- Fix:      Add a strict block inside the trigger checking:
--           IF TG_OP = 'UPDATE' AND OLD.loyalty_tier_id IS NOT DISTINCT FROM NEW.loyalty_tier_id THEN
--               RETURN NEW;
--           END IF;
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
    -- 1. Strict skip on UPDATE if no actual tier change occurred
    IF TG_OP = 'UPDATE' AND OLD.loyalty_tier_id IS NOT DISTINCT FROM NEW.loyalty_tier_id THEN
        RETURN NEW;
    END IF;

    -- 2. Resolve Old Tier (Updates only)
    IF TG_OP = 'UPDATE' AND OLD.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_old_tier_name
        FROM public.loyalty_tiers
        WHERE id = OLD.loyalty_tier_id;
    END IF;

    -- Default to 'None' for new signups or missing historical tiers
    v_old_tier_name := COALESCE(v_old_tier_name, 'None');

    -- 3. Resolve New Tier
    IF NEW.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_new_tier_name
        FROM public.loyalty_tiers
        WHERE id = NEW.loyalty_tier_id;
    END IF;

    -- 4. Log the actual change
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

-- Drop the trigger to safely recreate it
DROP TRIGGER IF EXISTS trg_log_auto_tier_change ON public.loyalty_points;

-- Recreate trigger tracking ONLY loyalty_tier_id columns
CREATE TRIGGER trg_log_auto_tier_change
    AFTER INSERT OR UPDATE OF loyalty_tier_id ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.log_auto_tier_change();

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
