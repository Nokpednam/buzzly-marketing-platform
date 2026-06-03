-- ============================================================
-- Migration: Make godtead@gmail.com a dev
-- ============================================================

DO $$
DECLARE
    v_dev_role_id uuid;
    v_user_id uuid;
    v_employee_id uuid;
BEGIN
    -- 1. Get the ID for the 'dev' role (fallback to 'admin' if 'dev' is not found)
    SELECT id INTO v_dev_role_id 
    FROM public.role_employees 
    WHERE role_name IN ('dev', 'admin') 
    ORDER BY CASE WHEN role_name = 'dev' THEN 1 ELSE 2 END 
    LIMIT 1;

    IF v_dev_role_id IS NULL THEN
        RAISE EXCEPTION 'Dev role not found';
    END IF;

    -- 2. Check if user exists in auth.users
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'godtead@gmail.com' 
    LIMIT 1;

    -- 3. Check if employee record already exists
    SELECT id INTO v_employee_id 
    FROM public.employees 
    WHERE email = 'godtead@gmail.com' 
    LIMIT 1;

    IF v_employee_id IS NOT NULL THEN
        -- Update existing employee
        UPDATE public.employees
        SET 
            approval_status = 'approved',
            status = 'active',
            role_employees_id = v_dev_role_id,
            user_id = COALESCE(user_id, v_user_id) -- Link if not already linked
        WHERE id = v_employee_id;
        
        RAISE NOTICE 'Updated existing employee % to dev', 'godtead@gmail.com';
    ELSE
        -- Insert new employee
        INSERT INTO public.employees (
            user_id,
            email, 
            status, 
            approval_status, 
            role_employees_id
        ) VALUES (
            v_user_id,
            'godtead@gmail.com',
            CASE WHEN v_user_id IS NOT NULL THEN 'active' ELSE 'inactive' END,
            'approved',
            v_dev_role_id
        ) RETURNING id INTO v_employee_id;

        -- Create basic profile
        INSERT INTO public.employees_profile (employees_id, first_name, last_name, aptitude)
        VALUES (v_employee_id, 'Godtead', 'Dev', 'System Administrator');
        
        RAISE NOTICE 'Created new employee % as dev', 'godtead@gmail.com';
    END IF;

    -- 4. Also update user_roles if applicable
    IF v_user_id IS NOT NULL THEN
        -- Check if user_roles entry exists
        IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_user_id) THEN
            UPDATE public.user_roles
            SET role = 'dev'::public.app_role
            WHERE user_id = v_user_id;
        ELSE
            BEGIN
                INSERT INTO public.user_roles (user_id, role)
                VALUES (v_user_id, 'dev'::public.app_role);
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not insert into user_roles: %', SQLERRM;
            END;
        END IF;
    END IF;

END $$;
