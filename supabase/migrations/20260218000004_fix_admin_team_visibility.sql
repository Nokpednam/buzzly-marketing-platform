-- Migration: Fix Admin Visibility for Team Members and Teams
-- Description: Allows users with 'admin' or 'owner' system roles to view all teams and team members.

-- 1. Policies for public.teams
-- Drop existing policy if it conflicts or just add a new one. 
-- Usually RLS policies are OR-ed together, so adding a new one is safe.

CREATE POLICY "Admins can view all teams"
ON public.teams FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

-- 2. Policies for public.team_members
CREATE POLICY "Admins can view all team members"
ON public.team_members FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);
