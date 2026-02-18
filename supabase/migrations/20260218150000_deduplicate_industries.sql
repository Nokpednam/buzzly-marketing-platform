-- Migration: Deduplicate Industries
-- Description: Removes duplicate industry entries (keeping the oldest) and adds a UNIQUE constraint.
-- Updates referencing tables (teams) to point to the kept industry_id.

DO $$
DECLARE
    r RECORD;
    primary_id UUID;
BEGIN
    -- Loop through industries that have duplicates (same name, case-insensitive)
    FOR r IN 
        SELECT lower(name) as lower_name, COUNT(*) 
        FROM public.industries 
        GROUP BY lower(name) 
        HAVING COUNT(*) > 1
    LOOP
        -- 1. Identify the "Primary" ID
        -- Preference: Uppercase first (E-Commerce vs e-commerce), then oldest.
        SELECT id INTO primary_id
        FROM public.industries
        WHERE lower(name) = r.lower_name
        ORDER BY name ASC, created_at ASC
        LIMIT 1;

        RAISE NOTICE 'Processing duplicate industry for "%": Keeping ID %', r.lower_name, primary_id;

        -- 2. Update references in 'teams' table
        UPDATE public.teams
        SET industries_id = primary_id
        WHERE industries_id IN (
            SELECT id FROM public.industries 
            WHERE lower(name) = r.lower_name AND id != primary_id
        );

        -- 3. Delete the duplicates
        DELETE FROM public.industries
        WHERE lower(name) = r.lower_name AND id != primary_id;
        
    END LOOP;
END $$;

-- 4. Add Unique Constraint to prevent future duplicates (Safely)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'industries_name_key') THEN
        ALTER TABLE public.industries
        ADD CONSTRAINT industries_name_key UNIQUE (name);
    END IF;
END $$;

-- 5. Verification (Optional - select count to confirm no duplicates)
SELECT name, count(*) FROM public.industries GROUP BY name HAVING count(*) > 1;
