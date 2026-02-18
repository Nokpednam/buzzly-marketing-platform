-- ============================================================
-- Fix: Ensure Error Logs Have User IDs
-- Current Issue: Recent resets/seeds might have introduced NULL user_ids
-- Solution: Backfill any remaining NULL user_ids with random existing users
-- ============================================================

DO $$
DECLARE
  v_user_ids uuid[];
BEGIN
  -- Get all available user IDs
  SELECT ARRAY(SELECT id FROM auth.users) INTO v_user_ids;
  
  -- Only proceed if we have users to assign
  IF v_user_ids IS NOT NULL AND array_length(v_user_ids, 1) > 0 THEN
    
    -- Update only rows where user_id is missing
    UPDATE public.error_logs
    SET user_id = v_user_ids[1 + floor(random() * array_length(v_user_ids, 1))::int]
    WHERE user_id IS NULL;
    
    RAISE NOTICE 'Backfilled missing user_ids in error_logs';
  ELSE
    RAISE NOTICE 'No users found to backfill error_logs';
  END IF;
END $$;
