-- Migration: Deduplicate Business Types
-- Description: Removes duplicate business type entries (keeping the oldest) and adds a UNIQUE constraint.
-- Updates referencing tables (teams) to point to the kept business_type_id.

DO $$
DECLARE
    r RECORD;
    primary_id UUID;
BEGIN
    -- Loop through business types that have duplicates (same name, case-insensitive)
    FOR r IN 
        SELECT lower(name) as lower_name, COUNT(*) 
        FROM public.business_types 
        GROUP BY lower(name) 
        HAVING COUNT(*) > 1
    LOOP
        -- 1. Identify the "Primary" ID
        -- Preference: Pick the one that starts with an uppercase letter, or just the oldest.
        -- We'll pick the one created first as the 'canonical' one, but if we encounter 'E-Commerce' vs 'E-commerce', 
        -- we might want the capitalized one if it exists. 
        -- Query picks the one with the 'max' name (ASCII value 'a' > 'A', so 'E-commerce' > 'E-Commerce' ??? No. 'e' > 'E'. 
        -- So 'SaaS' < 'saas'. We want 'SaaS'. We want MIN(name) if we want uppercase? 'E' < 'e'. Yes.
        SELECT id INTO primary_id
        FROM public.business_types
        WHERE lower(name) = r.lower_name
        ORDER BY name ASC, created_at ASC -- 'E-Commerce' comes before 'E-commerce'. 'SaaS' comes before 'saas'.
        LIMIT 1;

        RAISE NOTICE 'Processing duplicate business type for "%": Keeping ID %', r.lower_name, primary_id;

        -- 2. Update references in 'teams' table
        UPDATE public.teams
        SET business_type_id = primary_id
        WHERE business_type_id IN (
            SELECT id FROM public.business_types 
            WHERE lower(name) = r.lower_name AND id != primary_id
        );

        -- 3. Delete the duplicates
        DELETE FROM public.business_types
        WHERE lower(name) = r.lower_name AND id != primary_id;
        
    END LOOP;
END $$;

-- 4. Add Unique Constraint to prevent future duplicates (Safely)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_types_name_key') THEN
        ALTER TABLE public.business_types
        ADD CONSTRAINT business_types_name_key UNIQUE (name);
    END IF;
END $$;

-- 5. Verification
SELECT name, count(*) FROM public.business_types GROUP BY name HAVING count(*) > 1;
