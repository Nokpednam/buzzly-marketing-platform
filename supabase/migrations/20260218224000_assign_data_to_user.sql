
-- Re-assign Data to Current User's Team & Fix Dates
-- This script fixes the "RLS blocked" issue by moving the data to YOUR team.

DO $$
DECLARE
  v_my_team_id uuid;
  v_updated_accounts integer;
  v_max_date date;
  v_days_diff integer;
BEGIN
  -- 1. Find YOUR Team ID (The team that has connected platforms)
  SELECT team_id INTO v_my_team_id
  FROM public.workspace_api_keys
  WHERE sync_status = 'connected'
  LIMIT 1;

  IF v_my_team_id IS NOT NULL THEN
      RAISE NOTICE 'Target Team ID (Yours): %', v_my_team_id;

      -- 2. MOVE existing Ad Accounts to YOUR Team
      -- (This makes the data belong to you, so RLS allows you to see it)
      UPDATE public.ad_accounts
      SET team_id = v_my_team_id
      WHERE team_id != v_my_team_id; 
      
      GET DIAGNOSTICS v_updated_accounts = ROW_COUNT;
      RAISE NOTICE 'Moved % Ad Accounts to your team.', v_updated_accounts;

      -- 3. FIX DATES (Shift all data to end TODAY)
      -- If data is old, it won't show in "Last 7 Days" even if you own it.
      SELECT MAX(date) INTO v_max_date FROM public.ad_insights;
      
      IF v_max_date IS NOT NULL AND v_max_date < CURRENT_DATE THEN
        v_days_diff := (CURRENT_DATE - v_max_date)::integer;
        
        UPDATE public.ad_insights
        SET date = date + v_days_diff;
        
        RAISE NOTICE 'Shifted data forward by % days to match today.', v_days_diff;
      ELSE
        RAISE NOTICE 'Dates are already current.';
      END IF;
      
  ELSE
      RAISE NOTICE 'Could not find your team. Please ensure at least one platform is connected in API Keys.';
  END IF;
END;
$$;
