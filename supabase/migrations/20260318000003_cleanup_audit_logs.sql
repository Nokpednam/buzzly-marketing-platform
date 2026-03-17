-- ============================================================
-- Cleanup: Reduce Audit Logs to Realistic Levels
-- Timestamp: 20260318000003
--
-- Problem:
--   Seeded audit logs are too numerous (thousands), especially
--   the 'feature' category, making the dashboard look cluttered.
--
-- Fix:
--   Delete older 'feature' logs to bring the count down to the tens.
-- ============================================================

-- Cleanup 'feature' logs: Keep only the 50 most recent records
DELETE FROM public.audit_logs_enhanced
WHERE id IN (
  SELECT id
  FROM public.audit_logs_enhanced
  WHERE category = 'feature'
  ORDER BY created_at DESC
  OFFSET 50
);

-- Optional: Cleanup friction/failed logs if they are too many
DELETE FROM public.audit_logs_enhanced
WHERE id IN (
  SELECT id
  FROM public.audit_logs_enhanced
  WHERE status IN ('failed', 'error')
  ORDER BY created_at DESC
  OFFSET 50
);
