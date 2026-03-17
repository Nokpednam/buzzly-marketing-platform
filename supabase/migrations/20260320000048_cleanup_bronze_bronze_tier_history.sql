-- ============================================================================
-- Migration: Clean up Bronze→Bronze rows from tier history (keep null→Bronze)
-- Timestamp: 20260320000048
--
-- Remove only rows where old_tier and new_tier are BOTH Bronze (redundant).
-- Keep null/None→Bronze (first assignment) — UI shows as "— → Bronze".
-- ============================================================================

DELETE FROM public.loyalty_tier_history
WHERE old_tier IS NOT NULL
  AND old_tier != 'None'
  AND TRIM(old_tier) != ''
  AND COALESCE(NULLIF(TRIM(old_tier), ''), '') = COALESCE(NULLIF(TRIM(new_tier), ''), '');
