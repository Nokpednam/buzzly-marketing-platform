-- Migration: Clean Up Employee Roles - Keep Only 3 Roles
-- Keep: owner, dev, admin
-- Remove: All other roles (Employee, Developer, Analyst, Marketing, Support, etc.)

-- 1. Get the IDs of the roles we want to keep
DO $$
DECLARE
    v_owner_id uuid;
    v_dev_id uuid;
    v_admin_id uuid;
    v_default_role_id uuid;
BEGIN
    -- Find the roles to keep
    SELECT id INTO v_owner_id FROM role_employees WHERE LOWER(role_name) = 'owner' LIMIT 1;
    SELECT id INTO v_dev_id FROM role_employees WHERE LOWER(role_name) = 'dev' LIMIT 1;
    SELECT id INTO v_admin_id FROM role_employees WHERE LOWER(role_name) = 'admin' LIMIT 1;
    
    -- Use admin as default role for employees
    v_default_role_id := v_admin_id;
    
    IF v_owner_id IS NULL OR v_dev_id IS NULL OR v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Required roles (owner, dev, admin) not found!';
    END IF;
    
    -- 2. Update all employees using other roles to use admin instead
    UPDATE employees 
    SET role_employees_id = v_default_role_id
    WHERE role_employees_id NOT IN (v_owner_id, v_dev_id, v_admin_id)
    OR role_employees_id IS NULL;
    
    -- 3. Delete all other roles except owner, dev, admin
    DELETE FROM role_employees 
    WHERE id NOT IN (v_owner_id, v_dev_id, v_admin_id);
    
    RAISE NOTICE '✅ Cleaned up employee roles. Kept only: owner, dev, admin';
    
END $$;

-- 4. Ensure the 3 required roles exist with proper descriptions
INSERT INTO role_employees (role_name, description, is_active)
VALUES 
    ('owner', 'System Owner - Full Access', true),
    ('dev', 'Developer - Technical Access', true),
    ('admin', 'Administrator - Management Access', true)
ON CONFLICT (role_name) 
DO UPDATE SET 
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- 5. Verify final state
SELECT 
    'Final Role Count' as check_name,
    COUNT(*) as total_roles,
    CASE WHEN COUNT(*) = 3 THEN '✅ CORRECT' ELSE '❌ WRONG' END as status
FROM role_employees;

-- 6. Show the remaining roles
SELECT 
    role_name,
    description,
    is_active,
    created_at
FROM role_employees
ORDER BY 
    CASE role_name
        WHEN 'owner' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'dev' THEN 3
        ELSE 4
    END;
