-- Migration: Fix Marketing Data Assignment
-- Fixes marketing data (campaigns, ad_insights) not showing after API key connection.
--
-- Root causes fixed:
-- 1. Mock ad_accounts have no team_id → RLS blocks all data
-- 2. No unique constraint on ad_accounts(team_id, platform_id) → needed for upsert
-- 3. ad_insights dates may be old → shift to current date range
--
-- This script:
-- A. Adds unique constraint on ad_accounts(team_id, platform_id) if missing
-- B. Creates ad_account rows for every connected platform (idempotent)
-- C. Assigns all ad_accounts with no team_id to the first connected team
-- D. Links campaigns without a valid ad_account to the first valid one
-- E. Shifts ad_insights dates to today

DO $$
DECLARE
  v_team_id       uuid;
  v_ad_account_id uuid;
  v_platform_id   uuid;
  v_max_date      date;
  v_days_diff     integer;
  v_count         integer;
BEGIN

  -- ====================================================================
  -- STEP A: Add unique constraint on ad_accounts(team_id, platform_id)
  -- ====================================================================
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ad_accounts_team_id_platform_id_key'
  ) THEN
    ALTER TABLE public.ad_accounts
      ADD CONSTRAINT ad_accounts_team_id_platform_id_key UNIQUE (team_id, platform_id);
    RAISE NOTICE 'STEP A: Added unique constraint on ad_accounts(team_id, platform_id).';
  ELSE
    RAISE NOTICE 'STEP A: Unique constraint already exists. Skipped.';
  END IF;

  -- ====================================================================
  -- STEP B: Find the first connected team from workspace_api_keys
  -- ====================================================================
  SELECT team_id INTO v_team_id
  FROM public.workspace_api_keys
  WHERE sync_status = 'connected'
     OR is_active = true
  LIMIT 1;

  IF v_team_id IS NULL THEN
    RAISE NOTICE 'STEP B: No connected platform found. Skipping data assignment.';
    RETURN;
  END IF;

  RAISE NOTICE 'STEP B: Found connected team_id = %', v_team_id;

  -- ====================================================================
  -- STEP C: Create ad_account rows for every connected platform
  --         (one per platform per team, idempotent via ON CONFLICT)
  -- ====================================================================
  FOR v_platform_id IN
    SELECT DISTINCT wak.platform_id
    FROM public.workspace_api_keys wak
    WHERE wak.team_id = v_team_id
      AND (wak.sync_status = 'connected' OR wak.is_active = true)
  LOOP
    INSERT INTO public.ad_accounts (team_id, platform_id, account_name, is_active)
    VALUES (
      v_team_id,
      v_platform_id,
      (SELECT name FROM public.platforms WHERE id = v_platform_id LIMIT 1) || ' Account',
      true
    )
    ON CONFLICT (team_id, platform_id)
    DO UPDATE SET is_active = true;
  END LOOP;

  RAISE NOTICE 'STEP C: Ensured ad_account rows exist for all connected platforms.';

  -- ====================================================================
  -- STEP D: Pick the first valid ad_account for this team (for bulk reassign)
  -- ====================================================================
  SELECT id INTO v_ad_account_id
  FROM public.ad_accounts
  WHERE team_id = v_team_id
  LIMIT 1;

  IF v_ad_account_id IS NULL THEN
    RAISE NOTICE 'STEP D: No ad_account found for team. Stopping.';
    RETURN;
  END IF;

  -- ====================================================================
  -- STEP E: Assign all ad_accounts with NULL team_id to this team
  -- ====================================================================
  UPDATE public.ad_accounts
  SET team_id = v_team_id
  WHERE team_id IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'STEP E: Reassigned % orphaned ad_accounts to team %.', v_count, v_team_id;

  -- ====================================================================
  -- STEP F: Fix orphaned campaigns (no valid ad_account_id)
  -- ====================================================================
  UPDATE public.campaigns
  SET ad_account_id = v_ad_account_id
  WHERE ad_account_id IS NULL
     OR ad_account_id NOT IN (SELECT id FROM public.ad_accounts);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'STEP F: Fixed % campaigns with invalid ad_account_id.', v_count;

  -- ====================================================================
  -- STEP G: Fix orphaned ad_insights (no valid ad_account_id)
  -- ====================================================================
  UPDATE public.ad_insights
  SET ad_account_id = v_ad_account_id
  WHERE ad_account_id IS NULL
     OR ad_account_id NOT IN (SELECT id FROM public.ad_accounts);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'STEP G: Fixed % ad_insights with invalid ad_account_id.', v_count;

  -- ====================================================================
  -- STEP H: Shift ad_insights dates so they end on TODAY
  --         (prevents "Last 7/30 days" filter from returning nothing)
  -- ====================================================================
  SELECT MAX(date) INTO v_max_date FROM public.ad_insights;

  IF v_max_date IS NOT NULL AND v_max_date < CURRENT_DATE THEN
    v_days_diff := (CURRENT_DATE - v_max_date)::integer;

    UPDATE public.ad_insights
    SET date = date + v_days_diff;

    RAISE NOTICE 'STEP H: Shifted ad_insights dates forward by % days to align with today.', v_days_diff;
  ELSE
    RAISE NOTICE 'STEP H: ad_insights dates are already current. Skipped.';
  END IF;

  RAISE NOTICE '✅ Marketing data assignment complete. Team: %', v_team_id;

END;
$$;
