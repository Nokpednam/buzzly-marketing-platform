-- COMPREHENSIVE DIAGNOSTIC
-- Run this to see EXACTLY what's wrong

DO $$
DECLARE
    v_rls_enabled_insights boolean;
    v_rls_enabled_campaigns boolean;
    v_rls_enabled_accounts boolean;
    v_total_insights integer;
    v_total_campaigns integer;
    v_total_accounts integer;
    v_user_id uuid := auth.uid();
    v_user_teams text;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DASHBOARD DIAGNOSTIC REPORT';
    RAISE NOTICE '========================================';
    
    -- 1. Check Current User
    RAISE NOTICE '1. CURRENT USER';
    RAISE NOTICE '   User ID: %', v_user_id;
    
    -- 2. Check User Teams
    SELECT string_agg(team_id::text, ', ') INTO v_user_teams
    FROM public.team_members 
    WHERE user_id = v_user_id;
    
    IF v_user_teams IS NULL THEN
        RAISE WARNING '   ⚠️  User has NO teams!';
    ELSE
        RAISE NOTICE '   Teams: %', v_user_teams;
    END IF;
    
    -- 3. Check RLS Status
    RAISE NOTICE '';
    RAISE NOTICE '2. RLS STATUS';
    
    SELECT relrowsecurity INTO v_rls_enabled_insights
    FROM pg_class WHERE relname = 'ad_insights';
    
    SELECT relrowsecurity INTO v_rls_enabled_campaigns
    FROM pg_class WHERE relname = 'campaigns';
    
    SELECT relrowsecurity INTO v_rls_enabled_accounts
    FROM pg_class WHERE relname = 'ad_accounts';
    
    RAISE NOTICE '   ad_insights RLS: %', CASE WHEN v_rls_enabled_insights THEN 'ENABLED ⚠️' ELSE 'DISABLED ✓' END;
    RAISE NOTICE '   campaigns RLS: %', CASE WHEN v_rls_enabled_campaigns THEN 'ENABLED ⚠️' ELSE 'DISABLED ✓' END;
    RAISE NOTICE '   ad_accounts RLS: %', CASE WHEN v_rls_enabled_accounts THEN 'ENABLED ⚠️' ELSE 'DISABLED ✓' END;
    
    -- 4. Check Data Existence (System-level count)
    RAISE NOTICE '';
    RAISE NOTICE '3. DATA IN DATABASE';
    
    -- Use SECURITY DEFINER context to bypass RLS for counting
    EXECUTE 'SELECT COUNT(*) FROM public.ad_insights' INTO v_total_insights;
    EXECUTE 'SELECT COUNT(*) FROM public.campaigns' INTO v_total_campaigns;
    EXECUTE 'SELECT COUNT(*) FROM public.ad_accounts' INTO v_total_accounts;
    
    RAISE NOTICE '   Total Insights: %', v_total_insights;
    RAISE NOTICE '   Total Campaigns: %', v_total_campaigns;
    RAISE NOTICE '   Total Ad Accounts: %', v_total_accounts;
    
    -- 5. Diagnosis
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DIAGNOSIS';
    RAISE NOTICE '========================================';
    
    IF v_total_insights = 0 THEN
        RAISE WARNING '❌ NO DATA EXISTS! You need to run the Genesis script.';
        RAISE NOTICE '   → Run: 20260211210000_reseed_dashboard_data.sql';
    ELSIF v_rls_enabled_insights THEN
        RAISE WARNING '❌ RLS IS ENABLED! Data exists but is hidden by security rules.';
        RAISE NOTICE '   → Run: 20260211213000_disable_rls_debug.sql';
    ELSE
        RAISE NOTICE '✅ Data exists and RLS is DISABLED.';
        IF v_user_teams IS NULL THEN
            RAISE WARNING '⚠️  But you are not in any team. Frontend might filter this out.';
        ELSE
            RAISE NOTICE '✅ Everything looks good! Check your frontend date filter.';
        END IF;
    END IF;
    
    RAISE NOTICE '========================================';
END $$;
