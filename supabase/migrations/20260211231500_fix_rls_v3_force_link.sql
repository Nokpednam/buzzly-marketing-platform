-- FINAL FIX V3: Force Link User & Standard Policies
-- The issue is likely that "Nokpednam" in the database has a different USER ID than YOU (the logged in user).
-- This script grabs the Team containing the data and FORCES you into it.

BEGIN;

-- 1. Force Link Current User to the Data's Team
DO $$
DECLARE
    v_target_team_id uuid;
    v_data_count integer;
BEGIN
    -- Find a team that has Ad Accounts (The one we seeded or fixed)
    SELECT team_id INTO v_target_team_id 
    FROM public.ad_accounts 
    WHERE is_active = true 
    LIMIT 1;

    IF v_target_team_id IS NOT NULL THEN
        RAISE NOTICE 'Found Data-Owning Team: %', v_target_team_id;

        -- Force Insert/Update Current User into this Team
        -- auth.uid() is the user running this script (YOU)
        IF auth.uid() IS NOT NULL THEN
            INSERT INTO public.team_members (team_id, user_id, role, status)
            VALUES (v_target_team_id, auth.uid(), 'owner', 'active')
            ON CONFLICT (team_id, user_id) 
            DO UPDATE SET status = 'active', role = 'owner';
            
            RAISE NOTICE 'SUCCESS: Linked User % to Team %', auth.uid(), v_target_team_id;
        ELSE
            RAISE WARNING 'Cannot link user: auth.uid() is NULL. Are you running this in the SQL Editor?';
        END IF;
    ELSE
        RAISE WARNING 'No active ad accounts found. Skipping team link.';
    END IF;
END $$;

-- 2. Reset RLS Policies to Standard/Robust Logic (No fancy functions, just working SQL)
-- We use a direct check against team_members. 
-- To avoid recursion, we query team_members directly, assuming team_members itself allows the user to see their own row.

-- Enable RLS
ALTER TABLE public.ad_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;

-- Drop Old Policies
DROP POLICY IF EXISTS "View Ad Accounts via Team Membership" ON public.ad_accounts;
DROP POLICY IF EXISTS "View Campaigns via Ad Account" ON public.campaigns;
DROP POLICY IF EXISTS "View Insights via Ad Account" ON public.ad_insights;

-- Create Standard Policies

-- Ad Accounts: Visible if you are in the team
CREATE POLICY "RLS_AdAccounts_V3" ON public.ad_accounts
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE team_id = ad_accounts.team_id 
        AND user_id = auth.uid() 
        AND status = 'active'
    )
);

-- Campaigns: Visible if parent ad_account is visible (via simplified team check to avoid expensive joins)
CREATE POLICY "RLS_Campaigns_V3" ON public.campaigns
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.ad_accounts aa
        JOIN public.team_members tm ON aa.team_id = tm.team_id
        WHERE aa.id = campaigns.ad_account_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
);

-- Insights: Visible if parent ad_account is visible
CREATE POLICY "RLS_Insights_V3" ON public.ad_insights
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.ad_accounts aa
        JOIN public.team_members tm ON aa.team_id = tm.team_id
        WHERE aa.id = ad_insights.ad_account_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    )
);

DO $$
BEGIN
    RAISE NOTICE 'V3 Fix Applied: User Linked & Policies Reset.';
END $$;

COMMIT;
