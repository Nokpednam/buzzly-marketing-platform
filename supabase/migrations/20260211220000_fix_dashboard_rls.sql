-- FINAL FIX: Re-Enable RLS with Correct Policies
-- This script turns Security Back ON, but uses a more robust policy logic
-- so you can still see your data.

BEGIN;

-- 1. Re-Enable RLS on tables (was disabled for debugging)
ALTER TABLE public.ad_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 2. Drop potentially broken/complex policies
DROP POLICY IF EXISTS "Team members can view ad_insights" ON public.ad_insights;
DROP POLICY IF EXISTS "Team members can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Team members can view ad_accounts" ON public.ad_accounts;

-- 3. Create NEW, Simplified Policies (Direct Subqueries = More Robust)

-- Policy: Ad Accounts
-- User can see ad accounts if they are a member of the owning team
CREATE POLICY "View Ad Accounts via Team Membership" ON public.ad_accounts
FOR SELECT TO authenticated
USING (
    team_id IN (
        SELECT team_id 
        FROM public.team_members 
        WHERE user_id = auth.uid() 
        AND status = 'active'
    )
);

-- Policy: Campaigns
-- User can see campaigns if they can see the parent ad_account
CREATE POLICY "View Campaigns via Ad Account" ON public.campaigns
FOR SELECT TO authenticated
USING (
    ad_account_id IN (
        SELECT id 
        FROM public.ad_accounts 
        -- We can just recurse the check efficiently or duplicate the logic for speed
        WHERE team_id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    )
);

-- Policy: Ad Insights
-- User can see insights if they can see the parent ad_account
CREATE POLICY "View Insights via Ad Account" ON public.ad_insights
FOR SELECT TO authenticated
USING (
    ad_account_id IN (
        SELECT id 
        FROM public.ad_accounts 
        WHERE team_id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    )
);

-- Log Success
DO $$
BEGIN
    RAISE NOTICE 'RLS has been RE-ENABLED with fixed policies. Data should remain visible.';
END $$;

COMMIT;
