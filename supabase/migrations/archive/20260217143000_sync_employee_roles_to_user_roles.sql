-- Migration: Sync Employee Roles to User Roles for RLS
-- Description: Ensures that the 'user_roles' table (used by RLS) is kept in sync with the 'employees' table.

-- 1. Ensure 'dev' exists in app_role enum
-- Note: ALTER TYPE ... ADD VALUE cannot be executed in a transaction block in some versions of Postgres.
-- If this fails, it might need to be run outside a transaction.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dev';

-- 2. Create the sync function
CREATE OR REPLACE FUNCTION public.sync_employee_to_user_roles()
RETURNS TRIGGER AS $$
DECLARE
    v_role_name text;
    v_app_role app_role;
BEGIN
    -- Get the role name from role_employees
    SELECT LOWER(role_name) INTO v_role_name
    FROM public.role_employees
    WHERE id = NEW.role_employees_id;

    -- Map 'developer' or 'dev' to 'dev' app_role
    -- Map 'admin' to 'admin' app_role
    -- Map 'owner' to 'owner' app_role
    -- Others defaults to null (no user_role entry)
    IF v_role_name IN ('owner', 'admin', 'dev') THEN
        v_app_role := v_role_name::app_role;
        
        -- Upsert into user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.user_id, v_app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Optional: Remove other roles if we want strict 1:1 mapping
        -- DELETE FROM public.user_roles WHERE user_id = NEW.user_id AND role != v_app_role;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS tr_sync_employee_to_user_roles ON public.employees;
CREATE TRIGGER tr_sync_employee_to_user_roles
    AFTER INSERT OR UPDATE OF role_employees_id
    ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_employee_to_user_roles();

-- 4. Initial Sync for existing data
-- This ensures all current employees have entries in user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
    e.user_id, 
    LOWER(r.role_name)::app_role
FROM public.employees e
JOIN public.role_employees r ON e.role_employees_id = r.id
JOIN auth.users u ON e.user_id = u.id  -- CRITICAL: Only sync users who exist in auth.users
WHERE LOWER(r.role_name) IN ('owner', 'admin', 'dev')
AND e.user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Special Sync for the current owner user (if not caught)
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'hachikonoluna@gmail.com';
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'owner'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;
