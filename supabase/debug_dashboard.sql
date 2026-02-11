-- DEBUG SCRIPT: Check Dashboard Data Visibility
-- Run this in the SQL Editor to diagnose why data is missing.

DO $$
DECLARE
    v_user_id uuid := auth.uid(); -- This might be null in SQL Editor, so we rely on counting rows directly first
    v_account_count integer;
    v_active_account_count integer;
    v_insight_count integer;
    v_insight_with_account_count integer;
    v_recent_insight_count integer;
BEGIN
    -- 1. Check Ad Accounts
    SELECT COUNT(*) INTO v_account_count FROM public.ad_accounts;
    SELECT COUNT(*) INTO v_active_account_count FROM public.ad_accounts WHERE is_active = true;
    
    RAISE NOTICE 'Total Ad Accounts: %, Active: %', v_account_count, v_active_account_count;

    -- 2. Check Ad Insights
    SELECT COUNT(*) INTO v_insight_count FROM public.ad_insights;
    SELECT COUNT(*) INTO v_insight_with_account_count FROM public.ad_insights WHERE ad_account_id IS NOT NULL;
    SELECT COUNT(*) INTO v_recent_insight_count FROM public.ad_insights WHERE date >= (CURRENT_DATE - INTERVAL '30 days');

    RAISE NOTICE 'Total Insights: %, With Account: %, Recent (Last 30d): %', v_insight_count, v_insight_with_account_count, v_recent_insight_count;

    -- 3. Check specific orphaned rows
    IF v_insight_count > 0 AND v_insight_with_account_count = 0 THEN
         RAISE WARNING 'CRITICAL: Insights exist but NONE are linked to an ad account.';
    END IF;

    -- 4. Check Date Range of Insights
    FOR v_recent_insight_count IN SELECT count(*) FROM public.ad_insights WHERE date < '2025-01-01' LOOP
        IF v_recent_insight_count > 0 THEN
            RAISE NOTICE 'Found % OLD insight records (before 2025). Data might be too old for default view.', v_recent_insight_count;
        END IF;
    END LOOP;

END $$;

-- 5. Force update all insights to TODAY if they are old (OPTIONAL FIX)
-- Uncomment the below line if you want to force-move data to today for testing
-- UPDATE public.ad_insights SET date = CURRENT_DATE WHERE date < '2026-01-01'; 
