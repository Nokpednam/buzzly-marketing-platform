
-- COMPREHENSIVE FIX: Linkage & Date Range

DO $$
DECLARE
  v_team_id uuid;
  v_connected_platform_id uuid;
  v_ad_account_id uuid;
  v_max_date date;
  v_orphans_count integer;
BEGIN
  -- 1. IDENTIFY TEAM (Pick the first team found)
  SELECT id INTO v_team_id FROM public.workspaces LIMIT 1;
  IF v_team_id IS NULL THEN
    RAISE NOTICE 'No teams found. Cannot fix data.';
    RETURN;
  END IF;

  -- 2. IDENTIFY PLATFORM (Pick a platform that is connected, or just any platform)
  SELECT platform_id INTO v_connected_platform_id 
  FROM public.workspace_api_keys 
  WHERE team_id = v_team_id AND sync_status = 'connected' 
  LIMIT 1;

  IF v_connected_platform_id IS NULL THEN
    -- Fallback: Pick any platform
    SELECT id INTO v_connected_platform_id FROM public.platforms LIMIT 1;
  END IF;

  -- 3. ENSURE AD ACCOUNT EXISTS
  SELECT id INTO v_ad_account_id 
  FROM public.ad_accounts 
  WHERE team_id = v_team_id 
  LIMIT 1;

  IF v_ad_account_id IS NULL THEN
    INSERT INTO public.ad_accounts (team_id, platform_id, account_name)
    VALUES (v_team_id, v_connected_platform_id, 'Repaired Data Account')
    RETURNING id INTO v_ad_account_id;
    RAISE NOTICE 'Created new Ad Account: %', v_ad_account_id;
  ELSE
    RAISE NOTICE 'Using existing Ad Account: %', v_ad_account_id;
  END IF;

  -- 4. REPAIR LINKAGE (Link orphaned insights to this account)
  WITH orphans AS (
    SELECT id FROM public.ad_insights
    WHERE ad_account_id IS NULL
       OR ad_account_id NOT IN (SELECT id FROM public.ad_accounts)
  )
  UPDATE public.ad_insights
  SET ad_account_id = v_ad_account_id
  WHERE id IN (SELECT id FROM orphans);
  
  GET DIAGNOSTICS v_orphans_count = ROW_COUNT;
  RAISE NOTICE 'Linked % orphaned insights to valid account.', v_orphans_count;

  -- 5. REPAIR DATES (Shift data to end Today)
  SELECT MAX(date) INTO v_max_date FROM public.ad_insights;
  
  IF v_max_date IS NOT NULL AND v_max_date < CURRENT_DATE THEN
    RAISE NOTICE 'Data is old (Max Date: %). Shifting to Today...', v_max_date;
    
    UPDATE public.ad_insights
    SET date = date + (CURRENT_DATE - v_max_date)::integer;
    
    RAISE NOTICE 'Dates shifted successfully.';
  ELSE
    RAISE NOTICE 'Data is already up to date (or empty). Max Date: %', v_max_date;
  END IF;

END;
$$;
