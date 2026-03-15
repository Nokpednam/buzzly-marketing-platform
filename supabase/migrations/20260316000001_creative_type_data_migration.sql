-- Step 1: Add the new text column with CHECK constraint
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS creative_type text
  CHECK (creative_type IN ('image', 'video', 'carousel', 'text'));

-- Step 2: Backfill from creative_type_id
-- The creative_types table was dropped in 20260218000003 (CASCADE removed FK).
-- Existing values are either random UUIDs from seeders or NULL.
-- Since there is no mapping table to resolve UUIDs, we default non-null
-- values to 'image' (matches AdsList.tsx default behavior).
UPDATE public.ads
  SET creative_type = 'image'
  WHERE creative_type_id IS NOT NULL
    AND creative_type IS NULL;

-- Step 3: Drop the orphaned UUID column
-- The FK constraint was already dropped by CASCADE in 20260218000003.
-- Use IF EXISTS defensively in case it was manually removed.
ALTER TABLE public.ads
  DROP CONSTRAINT IF EXISTS ads_creative_type_id_fkey;

ALTER TABLE public.ads
  DROP COLUMN IF EXISTS creative_type_id;
