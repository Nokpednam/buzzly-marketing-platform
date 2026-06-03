-- ============================================================
-- Migration: Create Support User: riwjinza55@gmail.com
-- ============================================================

DO $$
DECLARE
    v_support_role_id uuid;
    v_user_id uuid;
    v_employee_id uuid;
    v_email text := 'riwjinza55@gmail.com';
    v_password text := '12345678';
BEGIN
    -- 1. Ensure the 'support' role exists and get its ID
    SELECT id INTO v_support_role_id 
    FROM public.role_employees 
    WHERE role_name = 'support'
    LIMIT 1;

    IF v_support_role_id IS NULL THEN
        RAISE EXCEPTION 'Support role not found in role_employees';
    END IF;

    -- 2. Check if user already exists in auth.users
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_email 
    LIMIT 1;

    -- 3. If user doesn't exist, create them in auth.users
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
        ) VALUES (
            v_user_id, '00000000-0000-0000-0000-000000000000', v_email, '$2a$10$yH8MRQcH22VpeCO6Ok03VePxV88viLo2..JgByGVj3l9pr8vWAenK',
            NOW(), NOW(), NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{}'::jsonb,
            'authenticated', 'authenticated'
        );
        RAISE NOTICE 'Created auth.user for %', v_email;
    ELSE
        -- Update password and confirm email just in case
        UPDATE auth.users 
        SET encrypted_password = '$2a$10$yH8MRQcH22VpeCO6Ok03VePxV88viLo2..JgByGVj3l9pr8vWAenK',
            email_confirmed_at = COALESCE(email_confirmed_at, NOW())
        WHERE id = v_user_id;
        RAISE NOTICE 'Updated password for existing auth.user %', v_email;
    END IF;

    -- 4. Insert identities for Supabase Auth to allow email login properly
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id AND provider = 'email') THEN
        INSERT INTO auth.identities (
            id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_user_id, v_user_id::text, v_user_id, format('{"sub":"%s","email":"%s"}', v_user_id, v_email)::jsonb, 'email', NOW(), NOW(), NOW()
        );
    END IF;

    -- 5. Check if employee record already exists
    SELECT id INTO v_employee_id 
    FROM public.employees 
    WHERE email = v_email 
    LIMIT 1;

    IF v_employee_id IS NOT NULL THEN
        -- Update existing employee to be support and active
        UPDATE public.employees
        SET 
            approval_status = 'approved',
            status = 'active',
            role_employees_id = v_support_role_id,
            user_id = v_user_id
        WHERE id = v_employee_id;
        
        RAISE NOTICE 'Updated existing employee % to support', v_email;
    ELSE
        -- Insert new employee
        INSERT INTO public.employees (
            user_id, email, status, approval_status, role_employees_id
        ) VALUES (
            v_user_id, v_email, 'active', 'approved', v_support_role_id
        ) RETURNING id INTO v_employee_id;

        -- Create basic profile
        INSERT INTO public.employees_profile (employees_id, first_name, last_name, aptitude)
        VALUES (v_employee_id, 'Riwjinza55', 'Support', 'Customer Support Specialist');
        
        RAISE NOTICE 'Created new employee % as support', v_email;
    END IF;

    -- 6. Update user_roles if applicable
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_user_id) THEN
        UPDATE public.user_roles SET role = 'support'::public.app_role WHERE user_id = v_user_id;
    ELSE
        BEGIN
            INSERT INTO public.user_roles (user_id, role)
            VALUES (v_user_id, 'support'::public.app_role);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not insert into user_roles: %', SQLERRM;
        END;
    END IF;

END $$;
