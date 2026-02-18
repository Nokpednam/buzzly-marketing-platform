
-- Function to debug dashboard data visibility
-- Returns a text report of what it finds

CREATE OR REPLACE FUNCTION public.debug_dashboard_visibility()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as Owner, bypassing RLS
AS $$
DECLARE
  report text := '';
  v_user_id uuid;
  v_team_count integer;
  v_ad_account_count integer;
  v_insight_count integer;
  v_orphan_insights integer;
  v_visible_insights integer;
BEGIN
  -- 1. Check current user (this will be NULL if called by Anon, but we want to simulate or check generally)
  -- Since we call this via Anon API, 'auth.uid()' will be null. 
  -- We need to pass a user_id or just report global stats to see if data exists at all.
  
  -- Let's just report GLOBAL stats first to confirm data integrity.
  report := report || '--- GLOBAL DATA STATS (Bypassing RLS) ---' || E'\n';
  
  SELECT count(*) INTO v_team_count FROM public.workspaces;
  report := report || 'Workspaces: ' || v_team_count || E'\n';
  
  SELECT count(*) INTO v_ad_account_count FROM public.ad_accounts;
  report := report || 'Ad Accounts: ' || v_ad_account_count || E'\n';
  
  SELECT count(*) INTO v_insight_count FROM public.ad_insights;
  report := report || 'Ad Insights (Total): ' || v_insight_count || E'\n';

  -- 2. Check for Orphaned Insights (ad_account_id not in ad_accounts)
  SELECT count(*) INTO v_orphan_insights 
  FROM public.ad_insights ai
  LEFT JOIN public.ad_accounts aa ON ai.ad_account_id = aa.id
  WHERE aa.id IS NULL;
  
  report := report || 'Orphaned Insights (Invalid ad_account_id): ' || v_orphan_insights || E'\n';
  
  -- 3. Check for Accounts without Team
  DECLARE
    v_orphan_accounts integer;
  BEGIN
    SELECT count(*) INTO v_orphan_accounts
    FROM public.ad_accounts
    WHERE team_id IS NULL;
    report := report || 'Orphaned Accounts (No team_id): ' || v_orphan_accounts || E'\n';
  END;

  -- 4. Sample Data check
  IF v_insight_count > 0 THEN
      DECLARE
        r record;
      BEGIN
        report := report || E'\n--- LATEST 3 INSIGHTS ---' || E'\n';
        FOR r IN SELECT date, ad_account_id, impressions, spend FROM public.ad_insights ORDER BY date DESC LIMIT 3 LOOP
           report := report || 'Date: ' || r.date || ', AccID: ' || r.ad_account_id || ', Impr: ' || r.impressions || E'\n';
           
           -- Check if this Acc exists
           DECLARE
             v_acc_name text;
             v_team_id uuid;
           BEGIN
             SELECT account_name, team_id INTO v_acc_name, v_team_id FROM public.ad_accounts WHERE id = r.ad_account_id;
             IF FOUND THEN
                report := report || '  -> Linked Account: ' || v_acc_name || ' (Team: ' || v_team_id || ')' || E'\n';
             ELSE
                report := report || '  -> Linked Account: NOT FOUND' || E'\n';
             END IF;
           END;
        END LOOP;
      END;
  END IF;

  RETURN report;
END;
$$;

-- Grant execute to anon so we can call it via curl/fetch
GRANT EXECUTE ON FUNCTION public.debug_dashboard_visibility() TO anon;
GRANT EXECUTE ON FUNCTION public.debug_dashboard_visibility() TO service_role;
GRANT EXECUTE ON FUNCTION public.debug_dashboard_visibility() TO authenticated;
