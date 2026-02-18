-- Add RLS policies for workspaces (team_id scoped) and workspace_members (user_id scoped)

-- workspaces (scoped via team_id - team members can access their team's workspace)
CREATE POLICY "team_member_select" ON public.workspaces FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "team_member_insert" ON public.workspaces FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "team_member_update" ON public.workspaces FOR UPDATE TO authenticated USING (public.is_team_member(auth.uid(), team_id)) WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "team_admin_delete" ON public.workspaces FOR DELETE TO authenticated USING (public.can_manage_team(auth.uid(), team_id));
CREATE POLICY "admin_owner_all" ON public.workspaces FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- workspace_members (user_id scoped - members can see own + workspace team members via workspace -> team)
CREATE POLICY "member_self_select" ON public.workspace_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "team_member_select" ON public.workspace_members FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND public.is_team_member(auth.uid(), w.team_id)));
CREATE POLICY "team_member_insert" ON public.workspace_members FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND public.is_team_member(auth.uid(), w.team_id)));
CREATE POLICY "team_member_update" ON public.workspace_members FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND public.is_team_member(auth.uid(), w.team_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND public.is_team_member(auth.uid(), w.team_id)));
CREATE POLICY "team_admin_delete" ON public.workspace_members FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = workspace_members.workspace_id AND public.can_manage_team(auth.uid(), w.team_id)));
CREATE POLICY "admin_owner_all" ON public.workspace_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));