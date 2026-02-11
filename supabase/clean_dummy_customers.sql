-- =========================================================
-- CLEAN UP SCRIPT (DATA ONLY)
-- Removes dummy customer rows but KEEPS the table structure
-- =========================================================

DO $$
BEGIN
    -- 1. Delete rows from public.customer 
    -- (This only deletes data, columns remain untouched)
    DELETE FROM public.customer 
    WHERE id >= 'c1000000-0000-0000-0000-000000000001'::uuid 
      AND id <= 'c1000000-0000-0000-0000-000000000030'::uuid;

    -- 2. Delete corresponding rows from auth.users
    DELETE FROM auth.users 
    WHERE id >= 'c1000000-0000-0000-0000-000000000001'::uuid 
      AND id <= 'c1000000-0000-0000-0000-000000000030'::uuid;

    RAISE NOTICE 'Clean up complete. Table structure is safe, only dummy data was removed.';
END $$;
