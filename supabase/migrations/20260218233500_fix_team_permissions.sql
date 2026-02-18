
-- Update is_team_member to include owners
-- NOTE: Using _user_id and _team_id to match existing signature to avoid "cannot change name of input parameter" error
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.user_id = _user_id
      AND wm.team_id = _team_id
  ) OR EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = _team_id
      AND w.owner_id = _user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update can_manage_team to include owners
CREATE OR REPLACE FUNCTION public.can_manage_team(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.user_id = _user_id
      AND wm.team_id = _team_id
      AND wm.role IN ('admin', 'owner')
  ) OR EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = _team_id
      AND w.owner_id = _user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
