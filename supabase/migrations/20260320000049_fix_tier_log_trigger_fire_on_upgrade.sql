-- ============================================================================
-- Migration: Fix tier history not logging Bronze→Silver when upgraded by points
-- Timestamp: 20260320000049
--
-- Problem: log_auto_tier_change uses "UPDATE OF loyalty_tier_id" — PostgreSQL
--          only fires when that column is in the UPDATE's SET clause. When
--          auto_evaluate (BEFORE UPDATE of lifetime_points) modifies
--          loyalty_tier_id, the UPDATE statement only SET lifetime_points,
--          so the log trigger never fires. Bronze→Silver never gets logged.
--
-- Fix: Use "AFTER UPDATE" with WHEN (OLD.loyalty_tier_id IS DISTINCT FROM NEW)
--      so we fire when tier actually changes, regardless of which column
--      caused it (direct update or via BEFORE trigger).
-- ============================================================================

DROP TRIGGER IF EXISTS trg_log_auto_tier_change ON public.loyalty_points;

-- WHEN clause cannot use TG_OP (only OLD/NEW columns). Filtering is done
-- inside log_auto_tier_change() via TG_OP and OLD/NEW.loyalty_tier_id.
CREATE TRIGGER trg_log_auto_tier_change
    AFTER INSERT OR UPDATE ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.log_auto_tier_change();
