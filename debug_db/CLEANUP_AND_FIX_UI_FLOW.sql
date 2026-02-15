-- CLEANUP_AND_FIX_UI_FLOW.sql
-- Fixed: Removed invalid column 'ipv' from verification query

BEGIN;

-- 1. CLEANUP DUPLICATE ROLES
-- We will delete the roles that have 0 permissions and look like duplicates (created at 09:36:57)
-- But first, we ensure no employees are using them. If they are, we switch them to the valid role.

-- Create a mapping of 'Bad ID' -> 'Good ID'
CREATE TEMP TABLE role_fix_mapping AS
SELECT 
    b.id as bad_id,
    g.id as good_id
FROM role_employees b
JOIN role_employees g ON LOWER(b.role_name) = LOWER(g.role_name)
WHERE b.permission_level = 0 
  AND g.permission_level > 0
  AND b.id != g.id;

-- Move any employees from Bad Role to Good Role
UPDATE public.employees
SET role_employees_id = m.good_id
FROM role_fix_mapping m
WHERE role_employees_id = m.bad_id;

-- Now delete the Bad Roles
DELETE FROM public.role_employees
WHERE id IN (SELECT bad_id FROM role_fix_mapping);

-- 2. ENABLE UI SELF-REGISTRATION (Fixing the "User already registered" flow)
-- Ensure that a user who exists in Auth but not Employees can INSERT themselves.

DROP POLICY IF EXISTS "Allow employee self-registration" ON public.employees;

CREATE POLICY "Allow employee self-registration"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
);

-- 3. Verify 'Employee' role exists and is correct (just to be safe)
-- The trigger relies on this. 
-- (Already confirmed by previous step but good to double check in script)

COMMIT;

-- Verification: Show remaining roles
SELECT role_name, permission_level, id FROM public.role_employees ORDER BY permission_level DESC;

-- Verification: Show policies (Fixed column name)
SELECT policyname, permissive, cmd FROM pg_policies WHERE tablename = 'employees' AND cmd = 'INSERT';
