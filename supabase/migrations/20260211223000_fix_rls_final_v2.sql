-- FINAL FIX V2: RLS with SECURITY DEFINER
-- Previous policies failed because checking "team_members" restricted by RLS is circular.
-- Solution: Use a "Trusted Function" (SECURITY DEFINER) to get user's teams.

BEGIN;

-- 1. Create a Trusted Function (Bypasses RLS on team_members)
CREATE OR REPLACE FUNCTION public.get_my_team_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER -- <--- CRITICAL: Runs with system privileges
SET search_path = public
STABLE
AS $$
    SELECT team_id 
    FROM public.team_members 
    WHERE user_id = auth.uid() 
    AND status = 'active';
$$;

-- 2. Update Policies to use the Trusted Function

-- Ad Accounts
DROP POLICY IF EXISTS "View Ad Accounts via Team Membership" ON public.ad_accounts;
CREATE POLICY "View Ad Accounts via Team Membership" ON public.ad_accounts
FOR SELECT TO authenticated
USING (
    team_id IN (SELECT get_my_team_ids())
);

-- Campaigns
DROP POLICY IF EXISTS "View Campaigns via Ad Account" ON public.campaigns;
CREATE POLICY "View Campaigns via Ad Account" ON public.campaigns
FOR SELECT TO authenticated
USING (
    ad_account_id IN (
        SELECT id FROM public.ad_accounts WHERE team_id IN (SELECT get_my_team_ids())
    )
);

-- Ad Insights
DROP POLICY IF EXISTS "View Insights via Ad Account" ON public.ad_insights;
CREATE POLICY "View Insights via Ad Account" ON public.ad_insights
FOR SELECT TO authenticated
USING (
    ad_account_id IN (
        SELECT id FROM public.ad_accounts WHERE team_id IN (SELECT get_my_team_ids())
    )
);

DO $$
BEGIN
    RAISE NOTICE 'Applied V2 RLS Fix using SECURITY DEFINER function.';
END $$;

COMMIT;
