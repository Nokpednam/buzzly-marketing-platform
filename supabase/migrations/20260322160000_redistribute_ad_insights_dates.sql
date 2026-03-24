-- ============================================================================
-- Migration: Redistribute ad_insights Mock Data Dates
-- Timestamp:  20260322160000
-- Purpose:    Spreads clustered mock dates (mid-Feb to Mar 13) evenly across
--             the past 365 days so all Dashboard date-range filters return
--             distinct, non-identical results.
-- Strategy:
--   80% of rows -> spread across full year (CURRENT_DATE - 365 .. CURRENT_DATE)
--   20% of rows -> clustered in last 30 days (simulates recent activity)
-- ============================================================================

-- Step 1: Spread 80% of rows across the full past 365 days
UPDATE public.ad_insights
SET date = CURRENT_DATE - (random() * 365)::int
WHERE id IN (
  SELECT id
  FROM public.ad_insights
  ORDER BY random()
  LIMIT (SELECT CEIL(COUNT(*) * 0.80)::int FROM public.ad_insights)
);

-- Step 2: Cluster remaining 20% in the most recent 30 days
UPDATE public.ad_insights
SET date = CURRENT_DATE - (random() * 30)::int
WHERE id IN (
  SELECT id
  FROM public.ad_insights
  ORDER BY random()
  LIMIT (SELECT CEIL(COUNT(*) * 0.20)::int FROM public.ad_insights)
);
