
-- Fix RLS policies for workspace_api_keys

-- Drop existing restricted policies if they exist (to be safe and recreate generally permissive team-based policies)
DROP POLICY IF EXISTS "Team members can view their API keys" ON public.workspace_api_keys;
DROP POLICY IF EXISTS "Team managers can manage API keys" ON public.workspace_api_keys;

-- Create comprehensive policies

-- 1. VIEW: Team members can see their team's keys
CREATE POLICY "Team members can view API keys"
ON public.workspace_api_keys FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.team_id = workspace_api_keys.team_id
    AND workspace_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE workspaces.id = workspace_api_keys.team_id
    AND workspaces.owner_id = auth.uid()
  )
);

-- 2. INSERT: Team members can add new keys (needed for "Connect")
CREATE POLICY "Team members can insert API keys"
ON public.workspace_api_keys FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.team_id = workspace_api_keys.team_id
    AND workspace_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE workspaces.id = workspace_api_keys.team_id
    AND workspaces.owner_id = auth.uid()
  )
);

-- 3. UPDATE: Team members can update keys (needed for "Reconnect/Update")
CREATE POLICY "Team members can update API keys"
ON public.workspace_api_keys FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.team_id = workspace_api_keys.team_id
    AND workspace_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE workspaces.id = workspace_api_keys.team_id
    AND workspaces.owner_id = auth.uid()
  )
);

-- 4. DELETE: Team members can remove keys
CREATE POLICY "Team members can delete API keys"
ON public.workspace_api_keys FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_members.team_id = workspace_api_keys.team_id
    AND workspace_members.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE workspaces.id = workspace_api_keys.team_id
    AND workspaces.owner_id = auth.uid()
  )
);
