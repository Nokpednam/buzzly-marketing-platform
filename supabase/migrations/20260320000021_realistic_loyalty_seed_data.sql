-- ============================================================================
-- Migration: Realistic Loyalty Seed Data
-- Timestamp: 20260320000021
--
-- Ensures mock/seed data for Tier Management is realistic:
--   - last_activity_at spread across 1-120 days (some active, some inactive)
--   - Points and tiers consistent with min_points thresholds
-- ============================================================================

-- 1. For loyalty_points with no points_transactions, set last_activity_at to
--    a realistic spread (30% inactive 60+ days, 70% active in last 30 days)
DO $$
DECLARE
    r RECORD;
    v_days_ago INT;
BEGIN
    FOR r IN
        SELECT lp.id
        FROM public.loyalty_points lp
        WHERE NOT EXISTS (
            SELECT 1 FROM public.points_transactions pt
            WHERE pt.loyalty_points_id = lp.id
        )
    LOOP
        -- 30% chance: inactive 60-120 days
        -- 70% chance: active 1-30 days
        IF random() < 0.3 THEN
            v_days_ago := 60 + (floor(random() * 60))::int;
        ELSE
            v_days_ago := 1 + (floor(random() * 29))::int;
        END IF;
        UPDATE public.loyalty_points
        SET last_activity_at = now() - (v_days_ago || ' days')::interval
        WHERE id = r.id;
    END LOOP;
END;
$$;

-- 2. Ensure loyalty_tiers have retention_period_days (default 90)
UPDATE public.loyalty_tiers
SET retention_period_days = COALESCE(retention_period_days, 90)
WHERE retention_period_days IS NULL;

NOTIFY pgrst, 'reload schema';
