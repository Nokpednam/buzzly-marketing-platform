-- ============================================================
-- Add has_permission() for granular team permission enforcement
-- ============================================================
-- Enforces the same permissions shown in Team Management UI:
-- view_dashboard, view_campaigns, edit_campaigns, delete_campaigns,
-- view_prospects, edit_prospects, delete_prospects, view_analytics,
-- export_data, manage_team, manage_settings
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id uuid,
  _team_id uuid,
  _permission text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _role text;
  _custom jsonb;
  _val jsonb;
BEGIN
  -- Workspace owner always has all permissions
  IF EXISTS (SELECT 1 FROM public.workspaces WHERE id = _team_id AND owner_id = _user_id) THEN
    RETURN true;
  END IF;

  -- Get member's role and custom_permissions
  SELECT role::text, custom_permissions INTO _role, _custom
  FROM public.workspace_members
  WHERE user_id = _user_id AND team_id = _team_id AND status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- If custom_permissions has the key, use it
  IF _custom IS NOT NULL AND _custom ? _permission THEN
    _val := _custom -> _permission;
    IF jsonb_typeof(_val) = 'boolean' THEN
      RETURN (_val)::boolean;
    END IF;
  END IF;

  -- Default permissions by role (must match frontend defaultRolePermissions)
  RETURN CASE _permission
    WHEN 'view_dashboard' THEN true
    WHEN 'view_campaigns' THEN true
    WHEN 'edit_campaigns' THEN _role IN ('owner','admin','editor')
    WHEN 'delete_campaigns' THEN _role IN ('owner','admin')
    WHEN 'view_prospects' THEN true
    WHEN 'edit_prospects' THEN _role IN ('owner','admin','editor')
    WHEN 'delete_prospects' THEN _role IN ('owner','admin')
    WHEN 'view_analytics' THEN true
    WHEN 'export_data' THEN _role IN ('owner','admin')
    WHEN 'manage_team' THEN _role IN ('owner','admin')
    WHEN 'manage_settings' THEN _role = 'owner'
    ELSE false
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_permission(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, uuid, text) TO service_role;

-- ============================================================
-- Campaigns: enforce edit_campaigns for INSERT/UPDATE, delete_campaigns for DELETE
-- ============================================================

DROP POLICY IF EXISTS "campaigns_insert_policy" ON public.campaigns;
CREATE POLICY "campaigns_insert_policy" ON public.campaigns
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.has_permission(auth.uid(), aa.team_id, 'edit_campaigns')
  )
);

DROP POLICY IF EXISTS "campaigns_update_policy" ON public.campaigns;
CREATE POLICY "campaigns_update_policy" ON public.campaigns
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.has_permission(auth.uid(), aa.team_id, 'edit_campaigns')
  )
);

DROP POLICY IF EXISTS "campaigns_delete_policy" ON public.campaigns;
CREATE POLICY "campaigns_delete_policy" ON public.campaigns
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ad_accounts aa
    WHERE aa.id = campaigns.ad_account_id
    AND public.has_permission(auth.uid(), aa.team_id, 'delete_campaigns')
  )
);

-- ============================================================
-- Customer personas: enforce edit_prospects for INSERT/UPDATE, delete_prospects for DELETE
-- ============================================================

DROP POLICY IF EXISTS "Team members can create personas" ON public.customer_personas;
CREATE POLICY "Team members can create personas" ON public.customer_personas
FOR INSERT TO authenticated
WITH CHECK (public.has_permission(auth.uid(), team_id, 'edit_prospects'));

DROP POLICY IF EXISTS "Team members can update personas" ON public.customer_personas;
CREATE POLICY "Team members can update personas" ON public.customer_personas
FOR UPDATE TO authenticated
USING (public.has_permission(auth.uid(), team_id, 'edit_prospects'));

DROP POLICY IF EXISTS "Team admins can delete personas" ON public.customer_personas;
CREATE POLICY "Team admins can delete personas" ON public.customer_personas
FOR DELETE TO authenticated
USING (public.has_permission(auth.uid(), team_id, 'delete_prospects'));
