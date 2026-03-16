-- Hero Persona Card: store custom avatar, title, bio per workspace.
-- When user first connects API, we display auto-generated persona from top ad data.
-- User can right-click to add image or edit name/details; overrides are stored here.
CREATE TABLE IF NOT EXISTS public.workspace_ad_persona (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  avatar_url text,
  custom_title text,
  custom_bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

ALTER TABLE public.workspace_ad_persona ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view workspace_ad_persona"
  ON public.workspace_ad_persona FOR SELECT
  USING (public.is_team_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can insert workspace_ad_persona"
  ON public.workspace_ad_persona FOR INSERT
  WITH CHECK (public.is_team_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members can update workspace_ad_persona"
  ON public.workspace_ad_persona FOR UPDATE
  USING (public.is_team_member(auth.uid(), workspace_id));

CREATE INDEX IF NOT EXISTS idx_workspace_ad_persona_workspace_id
  ON public.workspace_ad_persona(workspace_id);

COMMENT ON TABLE public.workspace_ad_persona IS
  'Custom Hero Persona overrides per workspace. Auto-generated from top ad audience data on first API connect.';
