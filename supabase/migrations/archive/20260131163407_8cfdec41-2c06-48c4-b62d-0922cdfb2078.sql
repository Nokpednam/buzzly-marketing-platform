
-- COMPLETELY reset employees table policies
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Allow employee self-registration" ON public.employees;
DROP POLICY IF EXISTS "Employees can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update own employee" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_for_admins" ON public.employees;
DROP POLICY IF EXISTS "employees_insert_for_admins" ON public.employees;
DROP POLICY IF EXISTS "employees_read_all_for_admins" ON public.employees;
DROP POLICY IF EXISTS "employees_read_own" ON public.employees;
DROP POLICY IF EXISTS "employees_update_for_admins" ON public.employees;
DROP POLICY IF EXISTS "employees_select_own" ON public.employees;
DROP POLICY IF EXISTS "employees_update_own" ON public.employees;
DROP POLICY IF EXISTS "employees_select_admin_owner" ON public.employees;
DROP POLICY IF EXISTS "employees_insert_admin_owner" ON public.employees;
DROP POLICY IF EXISTS "employees_update_admin_owner" ON public.employees;
DROP POLICY IF EXISTS "employees_delete_admin_owner" ON public.employees;

-- Ensure RLS is enabled
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create CLEAN policies without any recursion
-- Employee can read their own record
CREATE POLICY "emp_select_self"
ON public.employees FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admin/Owner can read all employees (using has_role function which is SECURITY DEFINER)
CREATE POLICY "emp_select_admin"
ON public.employees FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- Admin/Owner can insert employees
CREATE POLICY "emp_insert_admin"
ON public.employees FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- Admin/Owner can update all employees
CREATE POLICY "emp_update_admin"
ON public.employees FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));

-- Employee can update their own record
CREATE POLICY "emp_update_self"
ON public.employees FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admin/Owner can delete employees
CREATE POLICY "emp_delete_admin"
ON public.employees FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'owner'));
