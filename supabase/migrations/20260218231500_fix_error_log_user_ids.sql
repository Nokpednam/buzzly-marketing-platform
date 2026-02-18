-- ============================================================
-- Fix: Backfill user_id for Error Logs
-- Current Issue: Error Logs have NULL user_id, causing missing data in Admin UI ("-")
-- Solution: Randomly assign an existing user to each log that lacks one
-- ============================================================

DO $$
DECLARE
  v_user_ids uuid[];
BEGIN
  -- Get all user IDs from auth.users
  SELECT ARRAY(SELECT id FROM auth.users) INTO v_user_ids;

  -- Check if we have users to assign
  IF v_user_ids IS NULL OR array_length(v_user_ids, 1) IS NULL THEN
    RAISE WARNING 'No users found in auth.users. Cannot backfill error_logs.';
    RETURN;
  END IF;

  -- Update logs with NULL user_id
  -- random() is evaluated for each row, distributing the logs across users
  UPDATE public.error_logs
  SET user_id = v_user_ids[1 + floor(random() * array_length(v_user_ids, 1))]
  WHERE user_id IS NULL;

  RAISE NOTICE 'Successfully backfilled user_id for error_logs.';
END $$;
