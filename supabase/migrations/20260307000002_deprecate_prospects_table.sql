-- Migration: Deprecate prospects table (rename to preserve data)
-- Date: 2026-03-07
-- Purpose: The /prospects route now redirects to /personas (customer_personas).
--          The old prospects table is renamed to avoid confusion but data is preserved.

-- Check if there is any real data first (run SELECT before ALTER):
-- SELECT COUNT(*) FROM public.prospects;

-- Rename table to indicate deprecated status
-- (Safe: preserves all data, only renames)
ALTER TABLE IF EXISTS public.prospects RENAME TO _deprecated_prospects;

-- Drop RLS policies on old table if any exist
DROP POLICY IF EXISTS "prospects_select" ON public._deprecated_prospects;
DROP POLICY IF EXISTS "prospects_insert" ON public._deprecated_prospects;
DROP POLICY IF EXISTS "prospects_update" ON public._deprecated_prospects;
DROP POLICY IF EXISTS "prospects_delete" ON public._deprecated_prospects;

-- Add comment explaining status
COMMENT ON TABLE public._deprecated_prospects IS 
  'DEPRECATED: Renamed from prospects on 2026-03-07. The /prospects route redirects to /personas (customer_personas). This table was unused by any frontend feature. May be dropped in a future migration after confirming no data is needed.';
