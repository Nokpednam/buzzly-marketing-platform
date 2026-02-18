-- Fix RLS policies for campaigns table
-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "team_member_select" ON public.campaigns;
DROP POLICY IF EXISTS "team_member_insert" ON public.campaigns;
DROP POLICY IF EXISTS "team_member_update" ON public.campaigns;
DROP POLICY IF EXISTS "team_admin_delete" ON public.campaigns;
DROP POLICY IF EXISTS "Team members can view campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;

-- Enable RLS (just in case)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Team members can view campaigns if they belong to the team owning the ad account
CREATE POLICY "campaigns_select_policy" ON public.campaigns
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.is_team_member(auth.uid(), aa.team_id)
  )
  OR
  public.has_role(auth.uid(), 'admin'::app_role) 
  OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

-- 2. INSERT: Team members can create campaigns for ad accounts they have access to
CREATE POLICY "campaigns_insert_policy" ON public.campaigns
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = ad_account_id  -- Uses the NEW row's ad_account_id
    AND public.is_team_member(auth.uid(), aa.team_id)
  )
  OR
  public.has_role(auth.uid(), 'admin'::app_role) 
  OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

-- 3. UPDATE: Team members can update campaigns they have access to
CREATE POLICY "campaigns_update_policy" ON public.campaigns
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.is_team_member(auth.uid(), aa.team_id)
  )
  OR
  public.has_role(auth.uid(), 'admin'::app_role) 
  OR 
  public.has_role(auth.uid(), 'owner'::app_role)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = ad_account_id
    AND public.is_team_member(auth.uid(), aa.team_id)
  )
  OR
  public.has_role(auth.uid(), 'admin'::app_role) 
  OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

-- 4. DELETE: Only Team Admins/Owners or App Admins can delete
CREATE POLICY "campaigns_delete_policy" ON public.campaigns
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.can_manage_team(auth.uid(), aa.team_id)
  )
  OR
  public.has_role(auth.uid(), 'admin'::app_role) 
  OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);
