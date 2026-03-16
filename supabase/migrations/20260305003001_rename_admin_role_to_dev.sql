-- ============================================================
-- Migration: Rename 'admin' role to 'dev' in role_employees
-- ============================================================
-- This migration renames the 'admin' employee role to 'dev'.
-- The frontend /admin/* routes now redirect to /dev/*.
-- Existing employees with admin role are updated to dev.
-- ============================================================

BEGIN;

-- Step 1: Rename the role_employees entry from 'admin' to 'dev'
-- (Only if 'dev' doesn't already exist to avoid conflicts)
DO $$
BEGIN
    -- If 'dev' role already exists, just delete the old 'admin' one
    IF EXISTS (SELECT 1 FROM public.role_employees WHERE LOWER(role_name) = 'dev') THEN
        -- Reassign employees who have admin role → dev role
        UPDATE public.employees
        SET role_employees_id = (
            SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'dev' LIMIT 1
        )
        WHERE role_employees_id IN (
            SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'admin'
        );

        -- Then delete old admin role row
        DELETE FROM public.role_employees WHERE LOWER(role_name) = 'admin';
    ELSE
        -- Rename admin → dev directly
        UPDATE public.role_employees
        SET role_name = 'dev',
            description = COALESCE(description, 'Dev - จัดการระบบ, Workspaces, Users, Settings')
        WHERE LOWER(role_name) = 'admin';
    END IF;
END $$;

-- Step 2: Update user_roles table (legacy) — change role 'admin' → 'dev' in app_role enum values
-- Note: app_role enum already has 'dev' from previous migration.
-- Update any user_roles entries that have role = 'admin' to role = 'dev'
UPDATE public.user_roles
SET role = 'dev'::public.app_role
WHERE role = 'admin'::public.app_role;

-- Step 3: Replace the assign_admin_role_on_approval() function
-- so new employee approvals get 'dev' role instead of 'admin'
CREATE OR REPLACE FUNCTION public.assign_admin_role_on_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_dev_role_id UUID;
BEGIN
    -- Check if approval_status changed to 'approved' AND role is not already set
    IF NEW.approval_status = 'approved' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
        -- Only assign default dev role if NO role is currently assigned
        IF NEW.role_employees_id IS NULL THEN
            -- Get the Dev role ID (case-insensitive, fallback to admin for backward compat)
            SELECT id INTO v_dev_role_id
            FROM public.role_employees
            WHERE LOWER(role_name) IN ('dev', 'admin')
            ORDER BY CASE WHEN LOWER(role_name) = 'dev' THEN 0 ELSE 1 END
            LIMIT 1;

            -- If dev role exists, assign it
            IF v_dev_role_id IS NOT NULL THEN
                NEW.role_employees_id := v_dev_role_id;
                RAISE NOTICE 'Dev role (%) assigned to employee: %', v_dev_role_id, NEW.email;
            ELSE
                RAISE WARNING 'Dev role not found in role_employees table';
            END IF;
        END IF;

        -- Ensure status is active only if user is already linked (signed up)
        IF NEW.user_id IS NOT NULL THEN
            NEW.status := 'active';
        ELSE
            NEW.status := 'inactive';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Step 4: Update RLS policies that reference 'admin' employee role
-- These policies use has_employee_role() or has_role() with 'admin' string.
-- Since the role is now 'dev' in role_employees, we need to update the checks.
-- The has_role() function uses LOWER(re.role_name) = LOWER(_role), so RLS policies
-- calling has_role(user_id, 'admin') will no longer work. We update them to use 'dev'.

-- Drop and recreate policies that hardcode 'admin' string
-- (These use has_employee_role() with 'admin' OR 'owner')

-- Employees table policies
DROP POLICY IF EXISTS "Employees can view own record" ON public.employees;
DROP POLICY IF EXISTS "Dev can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Admin can manage employees" ON public.employees;

CREATE POLICY "Dev or Owner can manage employees"
ON public.employees FOR ALL TO authenticated
USING (
    public.has_employee_role(auth.uid(), 'dev')
    OR public.has_employee_role(auth.uid(), 'owner')
);

-- Employees profile table policies
DROP POLICY IF EXISTS "Dev can manage employees_profile" ON public.employees_profile;
DROP POLICY IF EXISTS "Admin can manage employees_profile" ON public.employees_profile;

-- Error logs policies  
DROP POLICY IF EXISTS "Admin can view all error logs" ON public.error_logs;

CREATE POLICY "Dev or Owner can view all error logs"
ON public.error_logs FOR SELECT TO authenticated
USING (
    public.has_employee_role(auth.uid(), 'dev')
    OR public.has_employee_role(auth.uid(), 'owner')
);

-- Audit logs policies
DROP POLICY IF EXISTS "Admin can view audit logs" ON public.audit_logs_enhanced;

CREATE POLICY "Dev or Owner can view audit logs"
ON public.audit_logs_enhanced FOR SELECT TO authenticated
USING (
    public.has_employee_role(auth.uid(), 'dev')
    OR public.has_employee_role(auth.uid(), 'owner')
);

COMMIT;
