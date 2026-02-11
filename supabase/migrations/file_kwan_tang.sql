-- Migration to remove duplicate platforms and add unique constraint to slug column

-- 1. Identify platforms to keep (Oldest created_at for each slug)
CREATE TEMP TABLE keep_platforms AS
SELECT DISTINCT ON (slug) id, slug
FROM public.platforms
WHERE slug IS NOT NULL
ORDER BY slug, created_at ASC;

-- 2. Handle workspace_api_keys conflicts
-- Case A: Team has connection to BOTH kept platform and duplicate platform.
-- Action: Delete the connection to the duplicate platform (preferring the one to the kept platform).
DELETE FROM public.workspace_api_keys wak
USING public.platforms p, keep_platforms kp
WHERE wak.platform_id = p.id
AND p.slug = kp.slug
AND p.id != kp.id -- Connection is to a duplicate
AND EXISTS (
    -- Check if connection to kept platform exists
    SELECT 1 FROM public.workspace_api_keys existing
    WHERE existing.team_id = wak.team_id
    AND existing.platform_id = kp.id
);

-- Case B: Team has connection ONLY to duplicate platform.
-- Action: Update connection to point to kept platform.
UPDATE public.workspace_api_keys wak
SET platform_id = kp.id
FROM public.platforms p, keep_platforms kp
WHERE wak.platform_id = p.id
AND p.slug = kp.slug
AND p.id != kp.id;

-- 3. Handle other tables referencing platforms
-- We need to update references in other tables as well to point to the kept platform
-- Tables referencing platforms(id):
-- public.platform_mapping_events
-- public.platform_standard_mappings
-- public.ad_accounts
-- public.external_api_status
-- public.social_posts

-- Update ad_accounts
UPDATE public.ad_accounts aa
SET platform_id = kp.id
FROM public.platforms p, keep_platforms kp
WHERE aa.platform_id = p.id
AND p.slug = kp.slug
AND p.id != kp.id;

-- Update social_posts
UPDATE public.social_posts sp
SET platform_id = kp.id
FROM public.platforms p, keep_platforms kp
WHERE sp.platform_id = p.id
AND p.slug = kp.slug
AND p.id != kp.id;

-- Update external_api_status
UPDATE public.external_api_status eas
SET platform_id = kp.id
FROM public.platforms p, keep_platforms kp
WHERE eas.platform_id = p.id
AND p.slug = kp.slug
AND p.id != kp.id;

-- Update platform_mapping_events
UPDATE public.platform_mapping_events pme
SET platform_id = kp.id
FROM public.platforms p, keep_platforms kp
WHERE pme.platform_id = p.id
AND p.slug = kp.slug
AND p.id != kp.id;

-- Update platform_standard_mappings
UPDATE public.platform_standard_mappings psm
SET platform_id = kp.id
FROM public.platforms p, keep_platforms kp
WHERE psm.platform_id = p.id
AND p.slug = kp.slug
AND p.id != kp.id;

-- 4. Delete duplicate platforms
DELETE FROM public.platforms p
USING keep_platforms kp
WHERE p.slug = kp.slug
AND p.id != kp.id;

-- 5. Add UNIQUE constraint
ALTER TABLE public.platforms
ADD CONSTRAINT platforms_slug_key UNIQUE (slug);

-- 6. Cleanup
DROP TABLE keep_platforms;
