-- Migration: Cleanup Employee Roles
-- Description: Keep only 3 roles (all lowercase): owner, admin, dev
-- Fixes: 23503 foreign key violation by reassigning employees before deletion

-- Step 1: Ensure the 3 primary roles exist
INSERT INTO role_employees (role_name, description)
SELECT 'owner', 'Owner - Full system access and business management'
WHERE NOT EXISTS (SELECT 1 FROM role_employees WHERE role_name = 'owner');

INSERT INTO role_employees (role_name, description)
SELECT 'admin', 'Administrator - Staff management and operational access'
WHERE NOT EXISTS (SELECT 1 FROM role_employees WHERE role_name = 'admin');

INSERT INTO role_employees (role_name, description)
SELECT 'dev', 'Developer - API access, system development'
WHERE NOT EXISTS (SELECT 1 FROM role_employees WHERE role_name = 'dev' OR role_name = 'developer');

-- Step 2: Rename 'developer' to 'dev' if it exists
UPDATE role_employees 
SET role_name = 'dev',
    description = 'Developer - API access, system development'
WHERE role_name = 'developer';

-- Step 3: Reassign employees with other roles to 'admin'
-- This prevents foreign key violations when deleting unused roles
UPDATE employees
SET role_employees_id = (SELECT id FROM role_employees WHERE role_name = 'admin')
WHERE role_employees_id IN (
    SELECT id FROM role_employees 
    WHERE role_name NOT IN ('owner', 'admin', 'dev')
);

-- Step 4: Delete all unused roles (keep only owner, admin, dev)
DELETE FROM role_employees 
WHERE role_name NOT IN ('owner', 'admin', 'dev');

-- Step 5: Verify the cleanup
SELECT 
    role_name, 
    description,
    COUNT(e.id) as employee_count
FROM role_employees r
LEFT JOIN employees e ON e.role_employees_id = r.id
GROUP BY r.role_name, r.description
ORDER BY r.role_name;
