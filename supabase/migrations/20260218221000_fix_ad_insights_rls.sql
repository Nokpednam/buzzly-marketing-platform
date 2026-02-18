
-- Ensure RLS policies for ad_insights and ad_accounts are correct to allow data visibility

-- 1. ad_accounts: Ensure team members can view
DROP POLICY IF EXISTS "Team members can view ad accounts" ON public.ad_accounts;
CREATE POLICY "Team members can view ad accounts"
ON public.ad_accounts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.team_id = ad_accounts.team_id
    AND workspace_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE workspaces.id = ad_accounts.team_id
    AND workspaces.owner_id = auth.uid()
  )
);

-- 2. ad_accounts: Ensure team members can insert (if they sync data)
DROP POLICY IF EXISTS "Team members can insert ad accounts" ON public.ad_accounts;
CREATE POLICY "Team members can insert ad accounts"
ON public.ad_accounts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.team_id = ad_accounts.team_id
    AND workspace_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE workspaces.id = ad_accounts.team_id
    AND workspaces.owner_id = auth.uid()
  )
);

-- 3. ad_insights: Ensure team members can view
DROP POLICY IF EXISTS "Team members can view ad insights" ON public.ad_insights;
CREATE POLICY "Team members can view ad insights"
ON public.ad_insights FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    JOIN public.workspace_members wm ON wm.team_id = aa.team_id
    WHERE aa.id = ad_insights.ad_account_id
    AND wm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    JOIN public.workspaces w ON w.id = aa.team_id
    WHERE aa.id = ad_insights.ad_account_id
    AND w.owner_id = auth.uid()
  )
);

-- 4. ad_insights: Ensure team members can insert
DROP POLICY IF EXISTS "Team members can insert ad insights" ON public.ad_insights;
CREATE POLICY "Team members can insert ad insights"
ON public.ad_insights FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    JOIN public.workspace_members wm ON wm.team_id = aa.team_id
    WHERE aa.id = ad_insights.ad_account_id
    AND wm.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    JOIN public.workspaces w ON w.id = aa.team_id
    WHERE aa.id = ad_insights.ad_account_id
    AND w.owner_id = auth.uid()
  )
);
