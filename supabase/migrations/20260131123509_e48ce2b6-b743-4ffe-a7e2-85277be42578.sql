-- Create enum for team member roles
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- Create enum for invitation status
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Create enum for member status
CREATE TYPE public.member_status AS ENUM ('active', 'suspended', 'removed');

-- Teams table - workspaces/stores
CREATE TABLE public.teams (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE public.team_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role team_role NOT NULL DEFAULT 'viewer',
    status member_status NOT NULL DEFAULT 'active',
    -- Custom permissions override (null means use default role permissions)
    custom_permissions JSONB,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TABLE public.team_invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role team_role NOT NULL DEFAULT 'viewer',
    custom_permissions JSONB,
    invited_by UUID NOT NULL,
    status invitation_status NOT NULL DEFAULT 'pending',
    token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Member activity logs
CREATE TABLE public.team_activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID,
    action TEXT NOT NULL,
    target_user_id UUID,
    target_email TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Default role permissions configuration
CREATE TABLE public.team_role_permissions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    role team_role NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{
        "view_dashboard": true,
        "view_campaigns": true,
        "edit_campaigns": false,
        "delete_campaigns": false,
        "view_prospects": true,
        "edit_prospects": false,
        "delete_prospects": false,
        "view_analytics": true,
        "export_data": false,
        "manage_team": false,
        "manage_settings": false
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(team_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_role_permissions ENABLE ROW LEVEL SECURITY;

-- Helper function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.team_members
        WHERE user_id = _user_id 
        AND team_id = _team_id 
        AND status = 'active'
    )
$$;

-- Helper function to check team role
CREATE OR REPLACE FUNCTION public.get_team_role(_user_id UUID, _team_id UUID)
RETURNS team_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.team_members
    WHERE user_id = _user_id 
    AND team_id = _team_id 
    AND status = 'active'
$$;

-- Helper function to check if user can manage team
CREATE OR REPLACE FUNCTION public.can_manage_team(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.team_members
        WHERE user_id = _user_id 
        AND team_id = _team_id 
        AND status = 'active'
        AND role IN ('owner', 'admin')
    ) OR EXISTS (
        SELECT 1 FROM public.teams
        WHERE id = _team_id AND owner_id = _user_id
    )
$$;

-- RLS Policies for teams
CREATE POLICY "Team members can view their teams"
ON public.teams FOR SELECT
USING (
    owner_id = auth.uid() OR 
    is_team_member(auth.uid(), id)
);

CREATE POLICY "Users can create teams"
ON public.teams FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners and admins can update teams"
ON public.teams FOR UPDATE
USING (can_manage_team(auth.uid(), id));

CREATE POLICY "Only team owners can delete teams"
ON public.teams FOR DELETE
USING (owner_id = auth.uid());

-- RLS Policies for team_members
CREATE POLICY "Team members can view their team members"
ON public.team_members FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team managers can insert members"
ON public.team_members FOR INSERT
WITH CHECK (can_manage_team(auth.uid(), team_id));

CREATE POLICY "Team managers can update members"
ON public.team_members FOR UPDATE
USING (can_manage_team(auth.uid(), team_id));

CREATE POLICY "Team managers can delete members"
ON public.team_members FOR DELETE
USING (can_manage_team(auth.uid(), team_id));

-- RLS Policies for team_invitations
CREATE POLICY "Team members can view invitations"
ON public.team_invitations FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team managers can create invitations"
ON public.team_invitations FOR INSERT
WITH CHECK (can_manage_team(auth.uid(), team_id));

CREATE POLICY "Team managers can update invitations"
ON public.team_invitations FOR UPDATE
USING (can_manage_team(auth.uid(), team_id));

CREATE POLICY "Team managers can delete invitations"
ON public.team_invitations FOR DELETE
USING (can_manage_team(auth.uid(), team_id));

-- RLS Policies for team_activity_logs
CREATE POLICY "Team members can view activity logs"
ON public.team_activity_logs FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "System can insert activity logs"
ON public.team_activity_logs FOR INSERT
WITH CHECK (is_team_member(auth.uid(), team_id));

-- RLS Policies for team_role_permissions
CREATE POLICY "Team members can view role permissions"
ON public.team_role_permissions FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team managers can manage role permissions"
ON public.team_role_permissions FOR ALL
USING (can_manage_team(auth.uid(), team_id));

-- Triggers for updated_at
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_invitations_updated_at
BEFORE UPDATE ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_role_permissions_updated_at
BEFORE UPDATE ON public.team_role_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();