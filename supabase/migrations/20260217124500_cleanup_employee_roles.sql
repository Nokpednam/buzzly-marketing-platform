-- Migration: Cleanup Employee Roles
-- Description: Keep only 3 roles (all lowercase): owner, admin, dev
-- Remove duplicate and unused roles

-- Step 1: Rename 'developer' to 'dev'
UPDATE role_employees 
SET role_name = 'dev',
    description = 'Developer - API access, system development'
WHERE role_name = 'developer';

-- Step 2: Delete all unused roles (keep only owner, admin, dev)
DELETE FROM role_employees 
WHERE role_name NOT IN ('owner', 'admin', 'dev');

-- Step 3: Verify the cleanup
SELECT 
    role_name, 
    description,
    COUNT(e.id) as employee_count
FROM role_employees r
LEFT JOIN employees e ON e.role_employees_id = r.id
GROUP BY r.role_name, r.description
ORDER BY r.role_name;
