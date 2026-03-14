-- 1. Add team_id to ad_groups
ALTER TABLE public.ad_groups 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.workspaces(id);

-- 2. Add team_id to ads
ALTER TABLE public.ads
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.workspaces(id);

-- 3. Update existing Ad Groups and Ads (Optional: link to the first workspace or leave null)
-- We will leave them null, but we'll disable RLS temporarily or just apply new policies

-- 4. Drop all existing restrictive policies for ad_groups
DROP POLICY IF EXISTS "Admins can manage ad_groups" ON public.ad_groups;
DROP POLICY IF EXISTS "Authenticated users can view ad_groups" ON public.ad_groups;
DROP POLICY IF EXISTS "admin_owner_only" ON public.ad_groups;

-- 5. Drop all existing restrictive policies for ads
DROP POLICY IF EXISTS "Admins can manage ads" ON public.ads;
DROP POLICY IF EXISTS "Authenticated users can view ads" ON public.ads;
DROP POLICY IF EXISTS "admin_owner_only" ON public.ads;

-- 6. Ensure RLS is enabled
ALTER TABLE public.ad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- 7. Add workspace-aware policies for ad_groups
CREATE POLICY "Users can view ad_groups if team member" ON public.ad_groups
FOR SELECT TO authenticated
USING (
  public.is_team_member(auth.uid(), team_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Users can insert ad_groups if team member" ON public.ad_groups
FOR INSERT TO authenticated
WITH CHECK (
  public.is_team_member(auth.uid(), team_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Users can update ad_groups if team member" ON public.ad_groups
FOR UPDATE TO authenticated
USING (
  public.is_team_member(auth.uid(), team_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
) WITH CHECK (
  public.is_team_member(auth.uid(), team_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Users can delete ad_groups if team member" ON public.ad_groups
FOR DELETE TO authenticated
USING (
  public.is_team_member(auth.uid(), team_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 8. Add workspace-aware policies for ads
CREATE POLICY "Users can view ads if team member" ON public.ads
FOR SELECT TO authenticated
USING (
  public.is_team_member(auth.uid(), team_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Users can insert ads if team member" ON public.ads
FOR INSERT TO authenticated
WITH CHECK (
  public.is_team_member(auth.uid(), team_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Users can update ads if team member" ON public.ads
FOR UPDATE TO authenticated
USING (
  public.is_team_member(auth.uid(), team_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
) WITH CHECK (
  public.is_team_member(auth.uid(), team_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Users can delete ads if team member" ON public.ads
FOR DELETE TO authenticated
USING (
  public.is_team_member(auth.uid(), team_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)
);
