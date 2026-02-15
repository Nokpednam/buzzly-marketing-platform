-- VERIFY_CLEANUP.sql

-- 1. Check Roles - Should only see ONE of each unique role (and valid permission level > 0)
SELECT id, role_name, permission_level, created_at 
FROM role_employees 
ORDER BY permission_level DESC;

-- 2. Check Policies - Should see 'Allow employee self-registration' with INSERT command
SELECT policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'employees' AND cmd = 'INSERT';

-- 3. Check Pending Employees (Before you try adding one)
SELECT id, email, approval_status 
FROM employees 
WHERE approval_status = 'pending';
