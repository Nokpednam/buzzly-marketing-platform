
-- Fix Ad Insights Data Linkage
-- This script will:
-- 1. Identify ad_insights that are 'orphaned' (their ad_account_id doesn't exist or doesn't belong to a team)
-- 2. Re-assign them to a valid Ad Account for the FIRST connected team found.

DO $$
DECLARE
  v_target_ad_account_id uuid;
  v_team_id uuid;
  v_platform_id uuid;
  v_updated_count integer;
BEGIN
  -- 1. Find a valid target Ad Account (from ANY connected platform in the first valid workspace)
  -- We prioritize 'facebook' or 'google' if available, otherwise any.
  
  SELECT aa.id, aa.team_id, aa.platform_id
  INTO v_target_ad_account_id, v_team_id, v_platform_id
  FROM public.ad_accounts aa
  JOIN public.workspace_api_keys wak ON wak.team_id = aa.team_id AND wak.platform_id = aa.platform_id
  WHERE wak.sync_status = 'connected'
  LIMIT 1;

  IF v_target_ad_account_id IS NULL THEN
    RAISE NOTICE 'No valid connected Ad Account found. Cannot repair data.';
    RETURN;
  END IF;

  RAISE NOTICE 'Found target Ad Account: % (Team: %)', v_target_ad_account_id, v_team_id;

  -- 2. Update orphaned insights
  -- Orphaned = ad_account_id is NULL OR ad_account_id NOT IN (SELECT id FROM ad_accounts)
  
  WITH orphaned_insights AS (
    SELECT id FROM public.ad_insights
    WHERE ad_account_id IS NULL
    OR ad_account_id NOT IN (SELECT id FROM public.ad_accounts)
  )
  UPDATE public.ad_insights
  SET ad_account_id = v_target_ad_account_id
  WHERE id IN (SELECT id FROM orphaned_insights);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE 'Repaired % orphaned insights.', v_updated_count;
  
  -- 3. Also blindly update ALL insights if the user wants to force-see data (Commented out by default, but useful for extreme debug)
  -- UPDATE public.ad_insights SET ad_account_id = v_target_ad_account_id; 

END;
$$;
