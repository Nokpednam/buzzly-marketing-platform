-- ==============================================================================
-- Migration: Deduplicate External API Status
-- Description: Removes duplicate entries for the same platform_id, keeping the
--              most recently updated one. Adds a constraint to prevent recurrence.
-- ==============================================================================

-- 1. Delete duplicates, keeping the most recently updated one
DELETE FROM public.external_api_status
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY platform_id ORDER BY created_at DESC) as rnum
    FROM public.external_api_status
    WHERE platform_id IS NOT NULL
  ) t
  WHERE t.rnum > 1
);

-- 2. Add unique constraint to prevent future duplicates
-- Using DO block to check if constraint exists first (idempotency)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'external_api_status_platform_id_key'
    ) THEN
        ALTER TABLE public.external_api_status
        ADD CONSTRAINT external_api_status_platform_id_key UNIQUE (platform_id);
    END IF;
END $$;
