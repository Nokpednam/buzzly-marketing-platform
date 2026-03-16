-- ============================================================
-- Seed: Specific Employee Profiles & Last Active
-- ============================================================

DO $$
DECLARE
    v_owner_user_id uuid := '15b96bdd-41dd-4d38-83a4-a6577b57eec3'; -- hachikonoluna@gmail.com
    v_dev_user_id uuid := 'd0000000-0000-0000-0000-000000000000';   -- dev@buzzly.co
    v_support_user_id uuid := 'e0000000-0000-0000-0000-000000000000'; -- support@buzzly.co

    v_role_owner_id uuid;
    v_role_dev_id uuid;
    v_role_support_id uuid;

    v_emp_owner_id uuid;
    v_emp_dev_id uuid;
    v_emp_support_id uuid;
BEGIN
    -- 1. Get Role IDs
    SELECT id INTO v_role_owner_id FROM public.role_employees WHERE role_name = 'owner';
    SELECT id INTO v_role_dev_id FROM public.role_employees WHERE role_name = 'dev';
    SELECT id INTO v_role_support_id FROM public.role_employees WHERE role_name = 'support';

    -- 2. Ensure Employees exist (Basic linkage)
    -- hachikonoluna@gmail.com
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_owner_user_id) THEN
        INSERT INTO public.employees (user_id, email, status, approval_status, role_employees_id)
        VALUES (v_owner_user_id, 'hachikonoluna@gmail.com', 'active', 'approved', v_role_owner_id)
        ON CONFLICT (user_id) DO UPDATE SET 
            email = EXCLUDED.email,
            role_employees_id = v_role_owner_id,
            status = 'active',
            approval_status = 'approved'
        RETURNING id INTO v_emp_owner_id;
    END IF;

    -- dev@buzzly.co
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_dev_user_id) THEN
        INSERT INTO public.employees (user_id, email, status, approval_status, role_employees_id)
        VALUES (v_dev_user_id, 'dev@buzzly.co', 'active', 'approved', v_role_dev_id)
        ON CONFLICT (user_id) DO UPDATE SET 
            email = EXCLUDED.email,
            role_employees_id = v_role_dev_id,
            status = 'active',
            approval_status = 'approved'
        RETURNING id INTO v_emp_dev_id;
    END IF;

    -- support@buzzly.co
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_support_user_id) THEN
        INSERT INTO public.employees (user_id, email, status, approval_status, role_employees_id)
        VALUES (v_support_user_id, 'support@buzzly.co', 'active', 'approved', v_role_support_id)
        ON CONFLICT (user_id) DO UPDATE SET 
            email = EXCLUDED.email,
            role_employees_id = v_role_support_id,
            status = 'active',
            approval_status = 'approved'
        RETURNING id INTO v_emp_support_id;
    END IF;

    -- 3. Cleanup existing profiles for these 3 (since no unique constraint on employees_id)
    IF v_emp_owner_id IS NOT NULL OR v_emp_dev_id IS NOT NULL OR v_emp_support_id IS NOT NULL THEN
        DELETE FROM public.employees_profile 
        WHERE employees_id IN (
            COALESCE(v_emp_owner_id, '00000000-0000-0000-0000-000000000000'),
            COALESCE(v_emp_dev_id, '00000000-0000-0000-0000-000000000000'),
            COALESCE(v_emp_support_id, '00000000-0000-0000-0000-000000000000')
        );
    END IF;

    -- 4. Insert Profiles
    -- Owner Profile
    IF v_emp_owner_id IS NOT NULL THEN
        INSERT INTO public.employees_profile (employees_id, first_name, last_name, aptitude, last_active, role_employees_id)
        VALUES (v_emp_owner_id, 'hachikonoluna', '@gmail.com', 'ไม่ระบุ', NOW() - INTERVAL '1 hour', v_role_owner_id);
    END IF;

    -- Dev Profile
    IF v_emp_dev_id IS NOT NULL THEN
        INSERT INTO public.employees_profile (employees_id, first_name, last_name, aptitude, last_active, role_employees_id)
        VALUES (v_emp_dev_id, 'dev', 'buzzly.co', 'ไม่ระบุ', NOW() - INTERVAL '2 hours', v_role_dev_id);
    END IF;

    -- Support Profile
    IF v_emp_support_id IS NOT NULL THEN
        INSERT INTO public.employees_profile (employees_id, first_name, last_name, aptitude, last_active, role_employees_id)
        VALUES (v_emp_support_id, 'support', 'No1.', 'ไม่ระบุ', NOW() - INTERVAL '4 hours', v_role_support_id);
    END IF;

END $$;
