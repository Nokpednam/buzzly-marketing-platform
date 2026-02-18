-- ============================================================
-- Fix: Add UPDATE policy for workspaces table
-- Current Issue: Admins/Owners cannot update workspace status due to missing RLS policy
-- Solution: Add "Admins can update workspaces" policy
-- ============================================================

-- Drop existing policy if it exists to avoid conflicts (though it shouldn't exist)
DROP POLICY IF EXISTS "Admins can update workspaces" ON public.workspaces;

-- Create the UPDATE policy
CREATE POLICY "Admins can update workspaces"
ON public.workspaces
FOR UPDATE
TO authenticated
USING (
  (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'owner'::public.app_role))
);

-- Ensure RLS is enabled (it should be, but good practice to be explicit)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
