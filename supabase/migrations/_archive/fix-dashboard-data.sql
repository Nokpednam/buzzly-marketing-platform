-- =========================================================
-- Fix Dashboard Data & Platform Duplicates (v4 - Final)
-- Run this script in your Supabase SQL Editor
-- =========================================================

DO $$
DECLARE
    v_user_team_id uuid;
    v_fb_platform_id uuid := 'b1a00001-0000-0000-0000-000000000001'; -- Schema-aligned Facebook ID
    v_new_ad_account_id uuid := gen_random_uuid();
    v_count integer;
BEGIN
    -- 1. Find User's Team (Real Team)
    SELECT id INTO v_user_team_id 
    FROM teams 
    WHERE id::text NOT LIKE 't1000000%' 
    ORDER BY created_at DESC 
    LIMIT 1;

    IF v_user_team_id IS NULL THEN
        RAISE EXCEPTION 'No user team found. Please create a Workspace in the app first.';
    END IF;

    -- 2. Clean up Duplicates (p100... IDs)
    -- Remove dependencies first to avoid FK errors
    DELETE FROM external_api_status 
    WHERE platform_id::text LIKE 'p1000000%';

    DELETE FROM workspace_api_keys
    WHERE platform_id::text LIKE 'p1000000%';

    DELETE FROM ad_accounts
    WHERE platform_id::text LIKE 'p1000000%';

    DELETE FROM platforms 
    WHERE id::text LIKE 'p1000000%'
    AND slug IN ('facebook', 'instagram', 'tiktok', 'shopee');

    -- 3. Ensure "Good" Facebook Platform exists (just in case)
    -- It should be there from sample-data.sql

    -- 4. Create Connected Ad Account for User
    -- We create a link for the Sample Data to live under
    INSERT INTO ad_accounts (id, team_id, platform_id, account_name, is_active)
    VALUES (v_new_ad_account_id, v_user_team_id, v_fb_platform_id, 'Buzzly Sample Ads', true)
    ON CONFLICT (id) DO NOTHING; -- Should not conflict as it is random UUID

    -- 5. Create API Key (so Dashboard shows "Connected")
    INSERT INTO workspace_api_keys (team_id, platform_id, access_token, is_active, created_at)
    VALUES (v_user_team_id, v_fb_platform_id, 'sample-token-123', true, now())
    ON CONFLICT DO NOTHING;

    -- 6. Link Orphaned Insights to this New Account
    -- This makes the data visible to the User via RLS
    UPDATE ad_insights
    SET ad_account_id = v_new_ad_account_id
    WHERE ad_account_id IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;

    RAISE NOTICE '---------------------------------------------------';
    RAISE NOTICE 'SUCCESS: Fixed Dashboard Data.';
    RAISE NOTICE '1. Cleaned up duplicate platforms.';
    RAISE NOTICE '2. Created sample Ad Account linked to your team (ID: %).', v_user_team_id;
    RAISE NOTICE '3. Linked % insight records to this account.', v_count;
    RAISE NOTICE 'Please refresh your Dashboard.';
    RAISE NOTICE '---------------------------------------------------';

END $$;
