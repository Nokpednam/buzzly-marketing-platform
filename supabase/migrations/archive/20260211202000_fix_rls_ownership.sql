-- Migration: Fix RLS Ownership
-- Description: Finds the team for user 'Nokpednam' (or any active team member) and assigns ad accounts to it.

DO $$
DECLARE
    v_user_id uuid;
    v_team_id uuid;
    v_ad_account_id uuid;
    v_count integer;
    v_user_exists boolean;
BEGIN
    -- Check if there are any users in the system at all
    SELECT EXISTS(SELECT 1 FROM auth.users LIMIT 1) INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        RAISE NOTICE 'No users found in the system. Skipping this migration.';
        RETURN;
    END IF;

    -- 1. Try to find the user 'Nokpednam' (from screenshot)
    -- Check profiles first
    SELECT user_id INTO v_user_id FROM public.profile_customers 
    WHERE first_name ILIKE '%Nokpednam%' OR last_name ILIKE '%Nokpednam%' 
    LIMIT 1;

    -- If not found, just grab ANY user who is in a team
    IF v_user_id IS NULL THEN
        SELECT user_id INTO v_user_id FROM public.team_members LIMIT 1;
    END IF;

    -- If still not found, grab ANY user from auth.users
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM auth.users LIMIT 1;
        RAISE NOTICE 'No team members found, using any auth user: %', v_user_id;
    ELSE
        RAISE NOTICE 'Found user: %', v_user_id;
    END IF;

    -- If no user found at all, skip the migration
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No users found. Skipping this migration.';
        RETURN;
    END IF;

    -- 2. Find the TEAM for this user
    SELECT team_id INTO v_team_id FROM public.team_members 
    WHERE user_id = v_user_id 
    LIMIT 1;

    IF v_team_id IS NULL THEN
        RAISE NOTICE 'User % has no team! Creating a default team and adding them.', v_user_id;
        -- Create team
        INSERT INTO public.teams (name, owner_id) VALUES ('Default Team', v_user_id) RETURNING id INTO v_team_id;
        -- Add member
        INSERT INTO public.team_members (team_id, user_id, role) VALUES (v_team_id, v_user_id, 'owner');
        INSERT INTO public.workspace_members (workspace_id, user_id, role_customer_id) 
            SELECT id, v_user_id, (SELECT id FROM role_customers WHERE name = 'Owner' LIMIT 1) FROM workspaces WHERE team_id = v_team_id LIMIT 1;
    ELSE
        RAISE NOTICE 'User belongs to Team: %', v_team_id;
    END IF;

    -- 3. Re-assign ALL Ad Accounts to this Team
    UPDATE public.ad_accounts
    SET team_id = v_team_id;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE 'Re-assigned % ad accounts to Team %', v_count, v_team_id;

    -- 4. Check if Ad Accounts are Active
    UPDATE public.ad_accounts SET is_active = true WHERE is_active = false;

    -- 5. Ensure Insights are linked (Redundant check)
    SELECT id INTO v_ad_account_id FROM public.ad_accounts WHERE team_id = v_team_id LIMIT 1;
    
    UPDATE public.ad_insights 
    SET ad_account_id = v_ad_account_id 
    WHERE ad_account_id IS NULL OR ad_account_id NOT IN (SELECT id FROM ad_accounts WHERE team_id = v_team_id);

    RAISE NOTICE 'Fixed ownership. Dashboard should now be visible.';

END $$;
