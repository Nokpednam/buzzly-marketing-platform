-- =========================================================
-- Fix RLS Policies for Employee Registration
-- Run this script in your Supabase SQL Editor
-- =========================================================

-- 1. Ensure RLS is enabled
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees_profile ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow employee self-registration" ON public.employees;
DROP POLICY IF EXISTS "Allow employee profile creation" ON public.employees_profile;
DROP POLICY IF EXISTS "Users can update own employee" ON public.employees;

-- 3. Re-create policies with explicit permissions

-- Allow authenticated users to insert their own employee record
CREATE POLICY "Allow employee self-registration"
ON public.employees FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Allow users to update their own employee record
CREATE POLICY "Users can update own employee"
ON public.employees FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
);

-- Allow authenticated users to create their profile
-- (Must be linked to an employee record they own)
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

-- 4. Verify policies
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename IN ('employees', 'employees_profile');
