-- =========================================================
-- Fix RLS Policies for Employee Registration
-- =========================================================

-- 1. Ensure RLS is enabled
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees_profile ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies to allow clean creation
-- We drop policies that might prevent self-registration
DROP POLICY IF EXISTS "Allow employee self-registration" ON public.employees;
DROP POLICY IF EXISTS "Users can update own employee" ON public.employees;
DROP POLICY IF EXISTS "emp_select_self" ON public.employees;
DROP POLICY IF EXISTS "emp_update_self" ON public.employees;

-- 3. Create policies

-- Allow authenticated users to insert their own employee record
-- This is critical for the "Sign Up as Employee" flow
CREATE POLICY "Allow employee self-registration"
ON public.employees FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Allow users to read their own employee record
-- (Re-creating this ensures it exists if we dropped 'emp_select_self')
DROP POLICY IF EXISTS "emp_select_self" ON public.employees;

CREATE POLICY "emp_select_self"
ON public.employees FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own employee record
CREATE POLICY "Users can update own employee"
ON public.employees FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
);

-- Allow authenticated users to create their profile
-- (Must be linked to an employee record they own)
DROP POLICY IF EXISTS "Allow employee profile creation" ON public.employees_profile;

CREATE POLICY "Allow employee profile creation"
ON public.employees_profile FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees e 
        WHERE e.id = employees_id 
        AND e.user_id = auth.uid()
    )
);
