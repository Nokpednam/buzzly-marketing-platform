
-- Fix is_team_member function to include Owner check
-- Previously, this function might have only checked workspace_members, excluding the owner.

CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if user is in workspace_members OR is the owner of the workspace
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) TO anon;
