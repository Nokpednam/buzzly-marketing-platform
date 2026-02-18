-- =========================================================
-- Secure RLS Fix for error_logs
-- Restrict access to Active Employees only (Excludes Customers)
-- =========================================================

-- 1. Drop existing strict policies
DROP POLICY IF EXISTS "Admins can view error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.error_logs; -- In case previous script was run

-- 2. Create new policy: Active Employees Only
CREATE POLICY "Employees can view error logs"
ON public.error_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.employees e 
    WHERE e.user_id = auth.uid() 
    AND e.status = 'active'
    -- AND e.approval_status = 'approved' -- Optional: Uncomment if strict approval check is desired
  )
);

-- Note: This ensures that "Customers" (who are not in the employees table) cannot see these logs.
-- It unblocks you because we know you have an employee record (which allowed you into the admin panel).
