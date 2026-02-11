-- "Genesis" Script: Generate Fresh Sample Data
-- This script ensures you have data to see by CREATING it from scratch.

DO $$
DECLARE
    v_user_id uuid;
    v_team_id uuid;
    v_ad_account_id uuid;
    v_campaign_id uuid;
    v_platform_id uuid;
    i integer;
BEGIN
    -- 1. Identify User (Try 'Nokpednam' or Fallback)
    SELECT user_id INTO v_user_id FROM public.profile_customers 
    WHERE first_name ILIKE '%Nokpednam%' OR last_name ILIKE '%Nokpednam%' LIMIT 1;
    
    -- Fallback 1: Check team members
    IF v_user_id IS NULL THEN
        SELECT user_id INTO v_user_id FROM public.team_members LIMIT 1;
    END IF;

    -- Fallback 2: Check auth.users (if running in context where auth.uid() works)
    IF v_user_id IS NULL THEN
        v_user_id := auth.uid();
    END IF;
    
    IF v_user_id IS NULL THEN
        RAISE WARNING 'No user found! Cannot seed data. Please sign up or check your database.';
        RETURN;
    END IF;

    RAISE NOTICE 'Seeding data for User: %', v_user_id;

    -- 2. Ensure Team & Membership
    SELECT team_id INTO v_team_id FROM public.team_members WHERE user_id = v_user_id LIMIT 1;
    
    IF v_team_id IS NULL THEN
        -- Create a new team if they have none
        INSERT INTO public.teams (name, owner_id) VALUES ('Growth Team', v_user_id) RETURNING id INTO v_team_id;
        
        -- Add them to the team
        INSERT INTO public.team_members (team_id, user_id, role, status) 
        VALUES (v_team_id, v_user_id, 'owner', 'active')
        ON CONFLICT (team_id, user_id) DO UPDATE SET status = 'active'; -- Ensure active
        
        RAISE NOTICE 'Created new Team: %', v_team_id;
    ELSE
        -- Ensure active status for existing team
        UPDATE public.team_members SET status = 'active' WHERE team_id = v_team_id AND user_id = v_user_id;
        RAISE NOTICE 'Using existing Team: %', v_team_id;
    END IF;

    -- 3. Ensure Facebook Platform & Ad Account
    SELECT id INTO v_platform_id FROM public.platforms WHERE slug = 'facebook' LIMIT 1;
    IF v_platform_id IS NULL THEN SELECT id INTO v_platform_id FROM public.platforms LIMIT 1; END IF;

    SELECT id INTO v_ad_account_id FROM public.ad_accounts WHERE team_id = v_team_id LIMIT 1;
    
    IF v_ad_account_id IS NULL THEN
        INSERT INTO public.ad_accounts (team_id, platform_id, account_name, is_active)
        VALUES (v_team_id, v_platform_id, 'Growth Ad Account', true)
        RETURNING id INTO v_ad_account_id;
        RAISE NOTICE 'Created new Ad Account: %', v_ad_account_id;
    ELSE
        UPDATE public.ad_accounts SET is_active = true WHERE id = v_ad_account_id;
        RAISE NOTICE 'Using existing Ad Account: %', v_ad_account_id;
    END IF;

    -- 4. Create a Sample Campaign
    INSERT INTO public.campaigns (ad_account_id, name, status, budget_amount, start_date)
    VALUES (v_ad_account_id, 'Summer Refresh Campaign', 'ACTIVE', 5000.00, NOW())
    RETURNING id INTO v_campaign_id;

    -- 5. Insert 30 Days of Insights (The "Genesis" Data)
    -- We DELETE existing insights for this specific account to ensure the graph looks clean
    DELETE FROM public.ad_insights WHERE ad_account_id = v_ad_account_id;

    FOR i IN 0..29 LOOP
        INSERT INTO public.ad_insights (
            ad_account_id, campaign_id, date, 
            impressions, clicks, spend, conversions, 
            roas, cpc, cpm, ctr
        )
        VALUES (
            v_ad_account_id,
            v_campaign_id,
            CURRENT_DATE - i,
            -- Random realistic data
            1000 + (floor(random() * 500))::int,      -- Impressions: 1000-1500
            50 + (floor(random() * 20))::int,         -- Clicks: 50-70
            100 + (floor(random() * 50))::numeric,    -- Spend: $100-$150
            5 + (floor(random() * 5))::int,           -- Conversions: 5-10
            2.5 + (random() * 1.5)::numeric,          -- ROAS: 2.5-4.0
            0.50,                                     -- CPC
            10.00,                                    -- CPM
            0.05                                      -- CTR
        );
    END LOOP;

    RAISE NOTICE 'SUCCESS: Generated fresh sample data for the last 30 days!';
END $$;
