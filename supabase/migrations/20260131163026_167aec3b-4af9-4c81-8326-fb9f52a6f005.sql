
-- Fix remaining recursive policy on public.employees by resetting policies
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'employees'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.employees;', pol.policyname);
  END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Self: employee can read their own row
CREATE POLICY employees_select_own
ON public.employees
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Self: employee can update their own row (optional)
CREATE POLICY employees_update_own
ON public.employees
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin/Owner: full access to employees (no recursion; uses user_roles via security definer function)
CREATE POLICY employees_select_admin_owner
ON public.employees
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY employees_insert_admin_owner
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY employees_update_admin_owner
ON public.employees
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

CREATE POLICY employees_delete_admin_owner
ON public.employees
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));
