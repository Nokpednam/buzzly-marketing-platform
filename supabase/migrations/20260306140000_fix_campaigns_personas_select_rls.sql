-- ============================================================
-- Fix: Restore team-scoped SELECT RLS for campaigns and customer_personas
-- Reason: 20260305000003 set USING (true) on both tables which allows
--         any authenticated user to read ALL rows across all workspaces.
--         This migration re-scopes SELECT to the user's own workspace only.
-- ============================================================

-- ---- CAMPAIGNS ----
DROP POLICY IF EXISTS "campaigns_select_policy" ON public.campaigns;

CREATE POLICY "campaigns_select_policy" ON public.campaigns
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    JOIN public.workspaces w ON w.id = aa.team_id
    WHERE aa.id = campaigns.ad_account_id
    AND (
      w.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- ---- CUSTOMER PERSONAS ----
DROP POLICY IF EXISTS "personas_select_policy" ON public.customer_personas;

CREATE POLICY "personas_select_policy" ON public.customer_personas
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = customer_personas.team_id
    AND (
      w.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);
