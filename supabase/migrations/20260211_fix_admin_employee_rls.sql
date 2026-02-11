-- =========================================================
-- Fix RLS Policies & Add Helper: Allow Admins/Owners to View All Employees
-- =========================================================

-- 0. Ensure Helper Function exists (FIXED: Ambiguous column reference)
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.role_employees re
    JOIN public.employees e ON e.role_employees_id = re.id
    WHERE e.user_id = _user_id
    AND re.role_name = _role
  );
END;
$$;


-- 1. Policies for 'public.employees' table
DROP POLICY IF EXISTS "Admins can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can update employees" ON public.employees;
DROP POLICY IF EXISTS "Admins can delete employees" ON public.employees;

-- Create View Policy (Admins + Owners + Own Record)
CREATE POLICY "Admins can view all employees"
ON public.employees FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'owner')
    OR auth.uid() = user_id
);

-- Create Update Policy (Admins + Owners + Own Record)
CREATE POLICY "Admins can update employees"
ON public.employees FOR UPDATE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'owner')
    OR auth.uid() = user_id
);

-- Create Delete Policy (Admins + Owners ONLY)
CREATE POLICY "Admins can delete employees"
ON public.employees FOR DELETE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'owner')
);


-- 2. Policies for 'public.employees_profile' table
DROP POLICY IF EXISTS "Admins can view all employee profiles" ON public.employees_profile;
DROP POLICY IF EXISTS "Admins can update employee profiles" ON public.employees_profile;
DROP POLICY IF EXISTS "Admins can delete employee profiles" ON public.employees_profile;

-- Create View Policy (Admins + Owners + Own Record)
CREATE POLICY "Admins can view all employee profiles"
ON public.employees_profile FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'owner')
    OR EXISTS ( -- Own profile linked via employees table
        SELECT 1 FROM public.employees e 
        WHERE e.id = employees_id 
        AND e.user_id = auth.uid()
    )
);

-- Create Update Policy (Admins + Owners + Own Record)
CREATE POLICY "Admins can update employee profiles"
ON public.employees_profile FOR UPDATE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'owner')
    OR EXISTS ( -- Own profile
        SELECT 1 FROM public.employees e 
        WHERE e.id = employees_id 
        AND e.user_id = auth.uid()
    )
);

-- Create Delete Policy (Admins + Owners ONLY)
CREATE POLICY "Admins can delete employee profiles"
ON public.employees_profile FOR DELETE
TO authenticated
USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'owner')
);
