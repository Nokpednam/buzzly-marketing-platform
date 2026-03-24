
-- Alignment script to fix data access after setup-full.sh reset
-- This assigns all campaigns, ads, and ad groups to the owner's primary workspace

DO $$
DECLARE
    v_owner_workspace_id uuid;
BEGIN
    -- 1. Get the workspace for hachikonoluna@gmail.com
    SELECT team_id INTO v_owner_workspace_id 
    FROM public.workspace_members 
    WHERE user_id = (SELECT id FROM auth.users WHERE email = 'hachikonoluna@gmail.com')
    LIMIT 1;

    IF v_owner_workspace_id IS NULL THEN
        RAISE NOTICE 'No workspace found for hachikonoluna@gmail.com. Creating one...';
        -- Optional: create workspace if missing, but setup-full.sh should have created it.
        RETURN;
    END IF;

    RAISE NOTICE 'Aligning data to workspace: %', v_owner_workspace_id;

    -- 2. Update Ad Accounts
    UPDATE public.ad_accounts SET team_id = v_owner_workspace_id WHERE team_id IS NULL OR team_id != v_owner_workspace_id;

    -- 3. Update Campaigns
    UPDATE public.campaigns SET team_id = v_owner_workspace_id WHERE team_id IS NULL OR team_id != v_owner_workspace_id;

    -- 4. Update Ad Groups
    UPDATE public.ad_groups SET team_id = v_owner_workspace_id WHERE team_id IS NULL OR team_id != v_owner_workspace_id;

    -- 5. Update Ads
    UPDATE public.ads SET team_id = v_owner_workspace_id WHERE team_id IS NULL OR team_id != v_owner_workspace_id;

    -- 6. Update Budgets
    UPDATE public.budgets SET team_id = v_owner_workspace_id WHERE team_id IS NULL OR team_id != v_owner_workspace_id;

    RAISE NOTICE 'Data alignment complete.';
END $$;
