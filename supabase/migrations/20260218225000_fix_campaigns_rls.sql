
-- Fix RLS Policies for Campaigns
-- This script replaces all RLS policies for the campaigns table with a robust set.

-- 1. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "RLS_Campaigns_V3" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_delete_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_insert_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_select_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_update_policy" ON public.campaigns;

-- 2. Enable RLS (just in case)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 3. Create helper function for team check if not exists (usually exists, but being safe)
-- We rely on public.is_team_member() which should already exist. 
-- If not, we will query directly. Let's assume is_team_member works as per previous files.

-- 4. Create New Policies

-- SELECT: Can view campaigns if they belong to an ad account in your team
CREATE POLICY "campaigns_select_policy" ON public.campaigns
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.is_team_member(auth.uid(), aa.team_id)
  )
);

-- INSERT: Can create campaigns for ad accounts in your team
CREATE POLICY "campaigns_insert_policy" ON public.campaigns
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.is_team_member(auth.uid(), aa.team_id)
  )
);

-- UPDATE: Can update campaigns if they belong to an ad account in your team
CREATE POLICY "campaigns_update_policy" ON public.campaigns
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.is_team_member(auth.uid(), aa.team_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.is_team_member(auth.uid(), aa.team_id)
  )
);

-- DELETE: Can delete campaigns if they belong to an ad account in your team
CREATE POLICY "campaigns_delete_policy" ON public.campaigns
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.is_team_member(auth.uid(), aa.team_id)
  )
);

-- Grant permissions just to be safe
GRANT ALL ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
