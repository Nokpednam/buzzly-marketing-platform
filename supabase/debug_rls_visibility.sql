-- DIAGNOSTIC SCRIPT: RLS Visibility Report
-- Run this to understand WHY data is hidden.

DO $$
DECLARE
    v_user_id uuid := auth.uid();
    v_team_id uuid;
    v_is_member boolean;
    v_total_insights integer;
    v_visible_insights integer;
    v_hidden_insights integer;
    v_ad_accounts_visible integer;
BEGIN
    RAISE NOTICE '--- DIAGNOSTICS START ---';
    RAISE NOTICE 'Current User ID: %', v_user_id;

    -- 1. Check Team Membership
    SELECT team_id INTO v_team_id FROM public.team_members WHERE user_id = v_user_id LIMIT 1;
    
    IF v_team_id IS NULL THEN
        RAISE WARNING 'CRITICAL: User is NOT in any team_members table!';
    ELSE
        RAISE NOTICE 'User is in Team ID: %', v_team_id;
        
        -- Check is_team_member function result
        SELECT public.is_team_member(v_user_id, v_team_id) INTO v_is_member;
        RAISE NOTICE 'is_team_member(%, %) returned: %', v_user_id, v_team_id, v_is_member;
    END IF;

    -- 2. Check Visible Ad Accounts
    SELECT count(*) INTO v_ad_accounts_visible FROM public.ad_accounts; 
    -- Note: Simple count follows RLS. If 0, RLS is blocking or no data.
    RAISE NOTICE 'Visible Ad Accounts (via RLS): %', v_ad_accounts_visible;

    -- 3. Check Insights Visibility
    SELECT count(*) INTO v_visible_insights FROM public.ad_insights;
    RAISE NOTICE 'Visible Ad Insights (via RLS): %', v_visible_insights;

    -- 4. Check HIDDEN Insights (System Level Check)
    -- We can't easily query "hidden" rows directly in a DO block running as user, 
    -- but we can verify if the ad_account_id exists in the system.
    
    RAISE NOTICE '--- RECOMMENDATION ---';
    IF v_visible_insights = 0 THEN
        IF v_ad_accounts_visible = 0 THEN
             RAISE WARNING 'User cannot see ANY ad accounts. Issue is likely Team linking or is_team_member.';
        ELSE
             RAISE WARNING 'User sees Ad Accounts but NO Insights. Issue is likely ad_insights.ad_account_id mismatch or NULLs.';
        END IF;
    ELSE
        RAISE NOTICE 'Data IS visible. Check your Date Filters in the Dashboard.';
    END IF;
    
    RAISE NOTICE '--- DIAGNOSTICS END ---';
END $$;
