-- =========================================================
-- Backfill user_id and request_id for existing error_logs
-- =========================================================

DO $$
DECLARE
    v_user_id uuid;
    v_sample_user_ids uuid[];
    v_random_user uuid;
BEGIN
    -- Get all user IDs from auth.users for sampling
    SELECT ARRAY_AGG(id) INTO v_sample_user_ids FROM auth.users LIMIT 10;
    
    -- Update error_logs: Add request_id (UUID) to all rows that don't have one
    UPDATE public.error_logs
    SET request_id = gen_random_uuid()::text
    WHERE request_id IS NULL;
    
    -- Update error_logs: Assign user_id to ~60% of logs (simulating some errors that have user context)
    UPDATE public.error_logs
    SET user_id = (
        SELECT id FROM auth.users 
        ORDER BY random() 
        LIMIT 1
    )
    WHERE user_id IS NULL 
    AND random() < 0.6;  -- 60% chance to get a user_id
    
END $$;
