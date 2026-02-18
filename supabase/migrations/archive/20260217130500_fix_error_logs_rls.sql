-- Migration: Fix Error Logs RLS Policies
-- Description: Allow all users (authenticated and anonymous) to insert error logs
-- This is necessary for the error logging system to work properly

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Users can insert their own error logs" ON error_logs;
DROP POLICY IF EXISTS "Anyone can insert error logs" ON error_logs;

-- Create new INSERT policy that allows both authenticated and anonymous users
CREATE POLICY "Anyone can insert error logs"
ON error_logs
FOR INSERT
TO public
WITH CHECK (true);

-- Keep existing SELECT policy for employees
-- (This policy already exists and should remain unchanged)

-- Verify policies
SELECT 
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'error_logs'
ORDER BY cmd, policyname;
