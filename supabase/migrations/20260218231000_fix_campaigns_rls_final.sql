
-- Final Fix for Campaign RLS
-- This script abandons the helper function approach and writes the logic directly into the policy
-- to ensure maximum reliability for Workspace Owners.

-- 1. Drop EVERYTHING related to campaign policies
DROP POLICY IF EXISTS "RLS_Campaigns_V3" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_delete_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_insert_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_select_policy" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_update_policy" ON public.campaigns;

-- 2. Make sure RLS is on
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 3. Create policies that check:
--    a) Is the user a member of the team? (via workspace_members)
--    OR
--    b) Is the user the OWNER of the workspace? (via workspaces.owner_id)

-- SELECT
CREATE POLICY "campaigns_select_policy" ON public.campaigns
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    JOIN public.workspaces w ON w.id = aa.team_id
    WHERE aa.id = campaigns.ad_account_id
    AND (
      -- Check 1: Owner
      w.owner_id = auth.uid()
      OR
      -- Check 2: Member
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- INSERT
CREATE POLICY "campaigns_insert_policy" ON public.campaigns
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    JOIN public.workspaces w ON w.id = aa.team_id
    WHERE aa.id = campaigns.ad_account_id
    AND (
      w.owner_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- UPDATE
CREATE POLICY "campaigns_update_policy" ON public.campaigns
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    JOIN public.workspaces w ON w.id = aa.team_id
    WHERE aa.id = campaigns.ad_account_id
    AND (
      w.owner_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- DELETE
CREATE POLICY "campaigns_delete_policy" ON public.campaigns
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    JOIN public.workspaces w ON w.id = aa.team_id
    WHERE aa.id = campaigns.ad_account_id
    AND (
      w.owner_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);
