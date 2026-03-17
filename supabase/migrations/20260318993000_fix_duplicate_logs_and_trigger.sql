-- ============================================================================
-- Migration: "Triple-Log Killer" - Fix Duplicate Logs & Consolidate Trigger
-- Timestamp: 20260318993000
-- ============================================================================

-- 1. DROP ALL POTENTIAL DUPLICATE TRIGGERS
DROP TRIGGER IF EXISTS trg_log_auto_tier_change  ON public.loyalty_points;
DROP TRIGGER IF EXISTS trg_log_tier_change       ON public.loyalty_points;
DROP TRIGGER IF EXISTS log_tier_change_trigger   ON public.loyalty_points;
DROP TRIGGER IF EXISTS trg_log_tier_change_final ON public.loyalty_points;

-- 2. REFINE THE TRIGGER FUNCTION
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
    -- Strict check: ONLY log if it's an UPDATE where the tier ID actually changed.
    IF (TG_OP = 'UPDATE' AND OLD.loyalty_tier_id IS NOT DISTINCT FROM NEW.loyalty_tier_id) THEN
        RETURN NEW;
    END IF;

    -- Resolve Old Tier (Updates only)
    IF TG_OP = 'UPDATE' AND OLD.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_old_tier_name
        FROM public.loyalty_tiers
        WHERE id = OLD.loyalty_tier_id;
    END IF;

    -- Default to 'None' for new signups or missing historical tiers
    v_old_tier_name := COALESCE(v_old_tier_name, 'None');

    -- Resolve New Tier
    IF NEW.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_new_tier_name
        FROM public.loyalty_tiers
        WHERE id = NEW.loyalty_tier_id;
    END IF;

    -- Log the change if a new tier is assigned
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

-- 3. RE-ATTACH: ONE FINAL TRIGGER
CREATE TRIGGER trg_log_tier_change_final
    AFTER INSERT OR UPDATE OF loyalty_tier_id ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.log_auto_tier_change();

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
