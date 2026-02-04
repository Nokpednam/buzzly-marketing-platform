
-- Drop existing policies on employees table to fix infinite recursion
DROP POLICY IF EXISTS "Employees can view own record" ON public.employees;
DROP POLICY IF EXISTS "Admins can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Employees can read their own record" ON public.employees;
DROP POLICY IF EXISTS "Admins can manage all employees" ON public.employees;
DROP POLICY IF EXISTS "employees_select_own" ON public.employees;
DROP POLICY IF EXISTS "employees_select_admin" ON public.employees;

-- Create simple, non-recursive policies
-- Allow users to read their own employee record using auth.uid() directly
CREATE POLICY "employees_read_own"
ON public.employees
FOR SELECT
USING (auth.uid() = user_id);

-- Allow admins/owners to read all employees using user_roles table (not employees table)
CREATE POLICY "employees_read_all_for_admins"
ON public.employees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'owner')
  )
);

-- Allow admins/owners to insert employees
CREATE POLICY "employees_insert_for_admins"
ON public.employees
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'owner')
  )
);

-- Allow admins/owners to update employees
CREATE POLICY "employees_update_for_admins"
ON public.employees
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'owner')
  )
);

-- Allow admins/owners to delete employees
CREATE POLICY "employees_delete_for_admins"
ON public.employees
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'owner')
  )
);
