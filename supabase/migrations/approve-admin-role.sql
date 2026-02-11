-- =========================================================
-- Approve Employee and Assign Admin Role
-- Run this script in your Supabase SQL Editor
-- =========================================================

DO $$
DECLARE
    v_user_email text := 'kittikornt01@gmail.com';
    v_admin_role_id uuid;
    v_employee_id uuid;
BEGIN
    -- 1. Get Admin Role ID
    SELECT id INTO v_admin_role_id
    FROM public.role_employees
    WHERE role_name = 'admin';

    IF v_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Role "admin" not found in public.role_employees';
    END IF;

    -- 2. Find the Pending Employee
    SELECT id INTO v_employee_id
    FROM public.employees
    WHERE email = v_user_email;

    IF v_employee_id IS NULL THEN
        RAISE EXCEPTION 'Employee with email % not found', v_user_email;
    END IF;

    -- 3. Update Status and Role
    UPDATE public.employees
    SET 
        status = 'active',
        approval_status = 'approved',
        role_employees_id = v_admin_role_id,
        approved_at = now(),
        updated_at = now()
    WHERE id = v_employee_id;

    RAISE NOTICE 'SUCCESS: User % has been approved as Admin.', v_user_email;

END $$;
