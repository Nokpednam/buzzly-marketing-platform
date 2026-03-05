-- ============================================================
-- Migration: Clean up duplicate/obsolete roles in role_employees
-- ============================================================
-- Keep only: owner, dev, support
-- Remove: developer (duplicate of dev), admin (renamed to dev), employee, etc.
-- ============================================================

-- Step 0: Add 'support' to app_role enum (must run OUTSIDE transaction)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'support'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
    ) THEN
        ALTER TYPE public.app_role ADD VALUE 'support';
    END IF;
END $$;

BEGIN;

-- Step 1: Ensure 'support' role exists
INSERT INTO public.role_employees (role_name, description, is_active)
VALUES ('support', 'Support - จัดการ Workspaces, Tiers, Rewards, Redemptions', true)
ON CONFLICT DO NOTHING;

-- Step 2: Reassign employees with 'developer' role → 'dev' role
UPDATE public.employees
SET role_employees_id = (
    SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'dev' LIMIT 1
)
WHERE role_employees_id IN (
    SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'developer'
);

-- Step 3: Reassign employees with any remaining 'admin' role → 'dev' role
UPDATE public.employees
SET role_employees_id = (
    SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'dev' LIMIT 1
)
WHERE role_employees_id IN (
    SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'admin'
);

-- Step 4: Reassign employees with 'employee' role → 'dev' role (fallback)
UPDATE public.employees
SET role_employees_id = (
    SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'dev' LIMIT 1
)
WHERE role_employees_id IN (
    SELECT id FROM public.role_employees
    WHERE LOWER(role_name) NOT IN ('owner', 'dev', 'support')
);

-- Step 5: Delete all obsolete roles (keep only owner, dev, support)
DELETE FROM public.role_employees
WHERE LOWER(role_name) NOT IN ('owner', 'dev', 'support');

-- Step 6: Update user_roles table — remove any references to obsolete roles
DELETE FROM public.user_roles
WHERE role::text NOT IN ('owner', 'dev', 'support', 'customer');

-- Step 7: Add RLS policies for support role access
DROP POLICY IF EXISTS "Support or Owner can manage workspaces" ON public.workspaces;
CREATE POLICY "Support or Owner can manage workspaces"
ON public.workspaces FOR ALL TO authenticated
USING (
    public.has_employee_role(auth.uid(), 'support')
    OR public.has_employee_role(auth.uid(), 'owner')
);

-- Log result
DO $$
DECLARE
    role_list text;
BEGIN
    SELECT string_agg(role_name, ', ' ORDER BY role_name) INTO role_list
    FROM public.role_employees;
    RAISE NOTICE '✅ role_employees now contains: %', role_list;
END $$;

COMMIT;
