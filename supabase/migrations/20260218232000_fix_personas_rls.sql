
-- Fix RLS Policies for Customer Personas
-- This script updates the RLS policies to explicitly allow Workspace Owners to manage personas.

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Team admins can delete personas" ON public.customer_personas;
DROP POLICY IF EXISTS "Team members can create personas" ON public.customer_personas;
DROP POLICY IF EXISTS "Team members can update personas" ON public.customer_personas;
DROP POLICY IF EXISTS "Team members can view personas" ON public.customer_personas;

-- 2. Enable RLS
ALTER TABLE public.customer_personas ENABLE ROW LEVEL SECURITY;

-- 3. Create New Policies with Owner Check

-- SELECT
CREATE POLICY "personas_select_policy" ON public.customer_personas
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = customer_personas.team_id
    AND (
      -- Check 1: Owner
      w.owner_id = auth.uid()
      OR
      -- Check 2: Member
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- INSERT
CREATE POLICY "personas_insert_policy" ON public.customer_personas
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = customer_personas.team_id
    AND (
      w.owner_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- UPDATE
CREATE POLICY "personas_update_policy" ON public.customer_personas
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = customer_personas.team_id
    AND (
      w.owner_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- DELETE
CREATE POLICY "personas_delete_policy" ON public.customer_personas
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = customer_personas.team_id
    AND (
      w.owner_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- Grant permissions
GRANT ALL ON public.customer_personas TO authenticated;
GRANT ALL ON public.customer_personas TO service_role;
