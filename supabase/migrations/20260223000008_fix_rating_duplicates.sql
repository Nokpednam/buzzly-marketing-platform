-- =======================================================================
-- Fix 1: Add UNIQUE constraint on rating.name to prevent duplicate star rows
-- Fix 2: Deduplicate existing rating rows (keep lowest id per name)
-- This resolves the FeedbackDialog showing 10 stars instead of 5
-- =======================================================================

-- Step 1: Delete duplicate ratings keeping only the one from static seed (fixed UUID starts with 470000)
DELETE FROM public.feedback
WHERE rating_id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM public.rating
  ORDER BY name, CASE WHEN id::text LIKE '470000%' THEN 0 ELSE 1 END, id
);

DELETE FROM public.rating
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM public.rating
  ORDER BY name, CASE WHEN id::text LIKE '470000%' THEN 0 ELSE 1 END, id
);

-- Step 2: Add UNIQUE constraint so seeds with ON CONFLICT DO NOTHING work correctly
ALTER TABLE public.rating
  DROP CONSTRAINT IF EXISTS rating_name_key;

ALTER TABLE public.rating
  ADD CONSTRAINT rating_name_key UNIQUE (name);

-- =======================================================================
-- Fix 3: Ensure "1 Star" exists (was missing from original static_seed_data.sql)
-- =======================================================================
INSERT INTO public.rating (id, name, descriptions, color_code)
VALUES ('47000005-0000-0000-0000-000000000005', '1 Star', 'Terrible - Extremely dissatisfied', '#EF4444')
ON CONFLICT (name) DO NOTHING;
