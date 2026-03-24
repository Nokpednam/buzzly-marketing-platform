
-- Fix Campaign RLS to be more robust and include all management roles
-- This replaces the previous restrictive policies

-- 1. Campaign Policies
DROP POLICY IF EXISTS "Users can view campaigns if team/ad_account member" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update campaigns if team/ad_account member" ON public.campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns if team/ad_account member" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete campaigns if team/ad_account member" ON public.campaigns;

-- SELECT
CREATE POLICY "Users can view campaigns if team/ad_account member" ON public.campaigns
FOR SELECT TO authenticated
USING (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid())
  OR ad_account_id IN (SELECT id FROM public.ad_accounts WHERE team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()))
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
);

-- INSERT
CREATE POLICY "Users can insert campaigns if team member" ON public.campaigns
FOR INSERT TO authenticated
WITH CHECK (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'admin'))
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
);

-- UPDATE
CREATE POLICY "Users can update campaigns if team member" ON public.campaigns
FOR UPDATE TO authenticated
USING (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'admin'))
  OR public.can_manage_team(auth.uid(), team_id) -- Uses the robust check
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
);

-- DELETE
CREATE POLICY "Users can delete campaigns if team member" ON public.campaigns
FOR DELETE TO authenticated
USING (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'admin'))
  OR public.can_manage_team(auth.uid(), team_id)
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
);

-- 2. Junction Tables Policies (campaign_ads)
DROP POLICY IF EXISTS "Users can manage campaign_ads if team/ad_account member" ON public.campaign_ads;

CREATE POLICY "Users can manage campaign_ads" ON public.campaign_ads
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_ads.campaign_id
    AND (
      public.can_manage_team(auth.uid(), c.team_id)
      OR public.has_role(auth.uid(), 'owner'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'dev'::public.app_role)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_ads.campaign_id
    AND (
      public.can_manage_team(auth.uid(), c.team_id)
      OR public.has_role(auth.uid(), 'owner'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'dev'::public.app_role)
    )
  )
);

-- 3. Junction Tables Policies (campaign_tags)
DROP POLICY IF EXISTS "Users can manage campaign_tags if team/ad_account member" ON public.campaign_tags;

CREATE POLICY "Users can manage campaign_tags" ON public.campaign_tags
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_tags.campaign_id
    AND (
      public.can_manage_team(auth.uid(), c.team_id)
      OR public.has_role(auth.uid(), 'owner'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'dev'::public.app_role)
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_tags.campaign_id
    AND (
      public.can_manage_team(auth.uid(), c.team_id)
      OR public.has_role(auth.uid(), 'owner'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'dev'::public.app_role)
    )
  )
);

-- 4. Ads Policies (Just in case they are restricted)
DROP POLICY IF EXISTS "Users can view ads if team member" ON public.ads;
DROP POLICY IF EXISTS "Users can insert ads if team member" ON public.ads;
DROP POLICY IF EXISTS "Users can update ads if team member" ON public.ads;
DROP POLICY IF EXISTS "Users can delete ads if team member" ON public.ads;

CREATE POLICY "Users can manage ads" ON public.ads
FOR ALL TO authenticated
USING (
  public.is_team_member(auth.uid(), team_id)
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
)
WITH CHECK (
  public.is_team_member(auth.uid(), team_id)
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
);
