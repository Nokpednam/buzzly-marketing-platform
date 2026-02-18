-- Migration: Force Fix Duplicate Industries & Business Types
-- Description: Aggressively cleans up duplicates using TRIM() and LOWER() to catch "E-Commerce" vs "E-commerce ".
-- Consolidated script for both tables.

DO $$
DECLARE
    r RECORD;
    primary_id UUID;
    total_deleted INT := 0;
BEGIN
    -- ==========================================
    -- 1. BUSINESS TYPES CLEANUP
    -- ==========================================
    RAISE NOTICE 'Starting Business Types Cleanup...';
    
    FOR r IN 
        SELECT trim(lower(name)) as clean_name, COUNT(*) 
        FROM public.business_types 
        GROUP BY trim(lower(name)) 
        HAVING COUNT(*) > 1
    LOOP
        -- Identify Primary (Prefer Uppercase/Capitalized first, then oldest)
        SELECT id INTO primary_id
        FROM public.business_types
        WHERE trim(lower(name)) = r.clean_name
        ORDER BY name ASC, created_at ASC
        LIMIT 1;

        RAISE NOTICE 'Processing duplicate business type "%" (Keeping ID: %)', r.clean_name, primary_id;

        -- Update references in 'teams'
        UPDATE public.teams
        SET business_type_id = primary_id
        WHERE business_type_id IN (
            SELECT id FROM public.business_types 
            WHERE trim(lower(name)) = r.clean_name AND id != primary_id
        );

        -- Update references in 'workspaces' (NEW)
        UPDATE public.workspaces
        SET business_type_id = primary_id
        WHERE business_type_id IN (
            SELECT id FROM public.business_types 
            WHERE trim(lower(name)) = r.clean_name AND id != primary_id
        );

        -- Delete duplicates
        DELETE FROM public.business_types
        WHERE trim(lower(name)) = r.clean_name AND id != primary_id;
        
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        RAISE NOTICE 'Deleted % duplicates for business type "%"', total_deleted, r.clean_name;
    END LOOP;

    -- Safely add constraint if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_types_name_key') THEN
        BEGIN
            ALTER TABLE public.business_types
            ADD CONSTRAINT business_types_name_key UNIQUE (name);
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not add unique constraint to business_types (might still have duplicates?): %', SQLERRM;
        END;
    END IF;

    -- ==========================================
    -- 2. INDUSTRIES CLEANUP
    -- ==========================================
    RAISE NOTICE 'Starting Industries Cleanup...';

    FOR r IN 
        SELECT trim(lower(name)) as clean_name, COUNT(*) 
        FROM public.industries 
        GROUP BY trim(lower(name)) 
        HAVING COUNT(*) > 1
    LOOP
        -- Identify Primary
        SELECT id INTO primary_id
        FROM public.industries
        WHERE trim(lower(name)) = r.clean_name
        ORDER BY name ASC, created_at ASC
        LIMIT 1;

        RAISE NOTICE 'Processing duplicate industry "%" (Keeping ID: %)', r.clean_name, primary_id;

        -- Update references in 'teams'
        UPDATE public.teams
        SET industries_id = primary_id
        WHERE industries_id IN (
            SELECT id FROM public.industries 
            WHERE trim(lower(name)) = r.clean_name AND id != primary_id
        );

        -- Update references in 'workspaces' (NEW)
        UPDATE public.workspaces
        SET industries_id = primary_id
        WHERE industries_id IN (
            SELECT id FROM public.industries 
            WHERE trim(lower(name)) = r.clean_name AND id != primary_id
        );

        -- Delete duplicates
        DELETE FROM public.industries
        WHERE trim(lower(name)) = r.clean_name AND id != primary_id;
        
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        RAISE NOTICE 'Deleted % duplicates for industry "%"', total_deleted, r.clean_name;
    END LOOP;

    -- Safely add constraint if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'industries_name_key') THEN
        BEGIN
            ALTER TABLE public.industries
            ADD CONSTRAINT industries_name_key UNIQUE (name);
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not add unique constraint to industries: %', SQLERRM;
        END;
    END IF;

END $$;
