-- ============================================================
-- Fix: can_manage_team now also accepts workspace owners
-- ============================================================
-- Previously the function only checked workspace_members, so a 
-- fresh workspace owner (who has no workspace_members row yet)
-- couldn't write to workspace_api_keys (RLS denied the upsert).
-- This migration adds an OR-branch that treats workspaces.owner_id
-- as a manager as well.
-- ============================================================

CREATE OR REPLACE FUNCTION public.can_manage_team(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- 1. Workspace owner always has manage access
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = _team_id AND owner_id = _user_id
  )
  OR
  -- 2. Active member with owner/admin role
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id
      AND team_id = _team_id
      AND status = 'active'
      AND role IN ('owner', 'admin')
  );
$$;
