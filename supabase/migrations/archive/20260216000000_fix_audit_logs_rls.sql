-- Fix Audit Logs RLS Policies
-- Problem: Old policies use has_role() which checks user_roles table (old system)
-- Solution: Update to check employees table and allow INSERT for logging

-- Drop old policies
DROP POLICY IF EXISTS "admin_owner_only" ON public.audit_logs_enhanced;
DROP POLICY IF EXISTS "Admins can view audit_logs_enhanced" ON public.audit_logs_enhanced;
DROP POLICY IF EXISTS "Admins can manage audit_logs_enhanced" ON public.audit_logs_enhanced;

-- Policy 1: Allow all authenticated users to INSERT audit logs
-- This is critical - anyone should be able to log their own actions
CREATE POLICY "Anyone can insert audit logs"
ON public.audit_logs_enhanced
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 2: Only approved admins/owners can SELECT (view) audit logs
CREATE POLICY "Approved admins can view audit logs"
ON public.audit_logs_enhanced
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.employees e
    INNER JOIN public.role_employees r ON e.role_employees_id = r.id
    WHERE e.user_id = auth.uid()
      AND e.status = 'active'
      AND e.approval_status = 'approved'
      AND r.role_name IN ('admin', 'owner', 'Admin', 'Owner')
  )
);

-- Policy 3: Audit logs are immutable - NO updates or deletes
-- Don't create UPDATE/DELETE policies - audit logs should never be modified

-- Verify RLS is enabled
ALTER TABLE public.audit_logs_enhanced ENABLE ROW LEVEL SECURITY;

-- Test query (run this separately to verify)
-- SELECT COUNT(*) FROM audit_logs_enhanced; -- Should work for admins only
