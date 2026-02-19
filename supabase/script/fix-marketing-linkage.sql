-- Step 5.6: Fix Marketing Data Linkage (runs AFTER step 5.5 seed)
-- Links ad_insights to the correct workspace via ad_accounts
-- so RLS allows each customer to see their own data.

DO $$
DECLARE
  v_aa_id     uuid;
  v_max_date  date;
  v_days_diff integer;
  v_count     integer;
BEGIN
  -- 1. Shift all ad_insights dates to be current
  --    (so "Last 7 days" / "Last 30 days" filters return data)
  SELECT MAX(date) INTO v_max_date FROM public.ad_insights;
  IF v_max_date IS NOT NULL AND v_max_date < CURRENT_DATE THEN
    v_days_diff := (CURRENT_DATE - v_max_date)::integer;
    UPDATE public.ad_insights SET date = date + v_days_diff;
    RAISE NOTICE 'Shifted ad_insights dates forward by % days.', v_days_diff;
  ELSE
    RAISE NOTICE 'ad_insights dates are already current. Skipped.';
  END IF;

  -- 2. Fix orphaned insights (no valid ad_account_id)
  --    Re-assign them to the first ad_account that has a team_id
  SELECT id INTO v_aa_id
  FROM public.ad_accounts
  WHERE team_id IS NOT NULL
  LIMIT 1;

  IF v_aa_id IS NOT NULL THEN
    UPDATE public.ad_insights
    SET ad_account_id = v_aa_id
    WHERE ad_account_id IS NULL
       OR ad_account_id NOT IN (SELECT id FROM public.ad_accounts);
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Fixed % orphaned ad_insights -> ad_account: %', v_count, v_aa_id;
  ELSE
    RAISE NOTICE 'No ad_accounts with team_id found. Skipping orphan fix.';
  END IF;

  RAISE NOTICE 'step56 marketing data linkage complete.';
END;
$$;
