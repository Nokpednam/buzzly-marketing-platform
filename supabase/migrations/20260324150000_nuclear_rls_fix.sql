
-- Nuclear cleanup of all campaigns and ads policies to avoid conflicts
-- This ensures ONLY our robust policies are active.

DO $$
DECLARE
    pol record;
BEGIN
    -- 1. Drop ALL policies on campaigns
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'campaigns' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.campaigns', pol.policyname);
    END LOOP;

    -- 2. Drop ALL policies on ads
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'ads' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.ads', pol.policyname);
    END LOOP;

    -- 3. Drop ALL policies on ad_groups
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'ad_groups' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.ad_groups', pol.policyname);
    END LOOP;

    -- 4. Drop ALL policies on campaign_ads/tags
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'campaign_ads' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.campaign_ads', pol.policyname);
    END LOOP;
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'campaign_tags' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.campaign_tags', pol.policyname);
    END LOOP;
END $$;

-- NOW RE-APPLY THE ROBUST POLICIES CLEANLY

-- Campaign Policies
CREATE POLICY "permissive_campaigns_select" ON public.campaigns FOR SELECT TO authenticated
USING (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid())
  OR ad_account_id IN (SELECT id FROM public.ad_accounts WHERE team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()))
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
);

CREATE POLICY "permissive_campaigns_insert" ON public.campaigns FOR INSERT TO authenticated
WITH CHECK (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid() AND status = 'active')
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
);

CREATE POLICY "permissive_campaigns_update" ON public.campaigns FOR UPDATE TO authenticated
USING (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid() AND status = 'active')
  OR public.can_manage_team(auth.uid(), team_id)
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
);

CREATE POLICY "permissive_campaigns_delete" ON public.campaigns FOR DELETE TO authenticated
USING (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid() AND status = 'active')
  OR public.can_manage_team(auth.uid(), team_id)
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
);

-- Ads Policies
CREATE POLICY "permissive_ads_all" ON public.ads FOR ALL TO authenticated
USING (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
)
WITH CHECK (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'dev'::public.app_role)
);

-- Campaign Ads Policies
CREATE POLICY "permissive_campaign_ads_all" ON public.campaign_ads FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND (
    team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'owner'::public.app_role)
  ))
);

-- Ad Groups Policies
CREATE POLICY "permissive_ad_groups_all" ON public.ad_groups FOR ALL TO authenticated
USING (
  team_id IN (SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'owner'::public.app_role)
);
