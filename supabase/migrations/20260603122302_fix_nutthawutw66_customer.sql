-- ============================================================
-- Migration: Fix and Create Customer: nutthawutw66@nu.ac.th
-- ============================================================

DO $$
DECLARE
    v_user_id uuid;
    v_email text := 'nutthawutw66@nu.ac.th';
BEGIN
    -- 1. Check if user already exists in auth.users
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = v_email 
    LIMIT 1;

    -- 2. If user doesn't exist, create them in auth.users
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
        ) VALUES (
            v_user_id, '00000000-0000-0000-0000-000000000000', v_email, '$2a$10$yH8MRQcH22VpeCO6Ok03VePxV88viLo2..JgByGVj3l9pr8vWAenK',
            NOW(), NOW(), NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            '{"full_name":"Nutthawut W","first_name":"Nutthawut","last_name":"W"}'::jsonb,
            'authenticated', 'authenticated'
        );
        RAISE NOTICE 'Created auth.user for %', v_email;
    ELSE
        -- Ensure email confirmed
        UPDATE auth.users 
        SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
        WHERE id = v_user_id;
        RAISE NOTICE 'Updated existing auth.user %', v_email;
    END IF;

    -- 3. Insert identities for Supabase Auth to allow email login properly
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id AND provider = 'email') THEN
        INSERT INTO auth.identities (
            id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
        ) VALUES (
            v_user_id, v_user_id::text, v_user_id, format('{"sub":"%s","email":"%s"}', v_user_id, v_email)::jsonb, 'email', NOW(), NOW(), NOW()
        );
    END IF;

    -- 4. Create Core Customer Record
    INSERT INTO public.customer (id, email, full_name, plan_type)
    VALUES (
        v_user_id, 
        v_email, 
        'Nutthawut W',
        'free'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 5. Assign customer role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'customer'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- 6. Create Profile Customers Record
    INSERT INTO public.profile_customers (
        user_id, 
        first_name, 
        last_name
    )
    VALUES (
        v_user_id,
        'Nutthawut',
        'W'
    )
    ON CONFLICT (user_id) DO NOTHING;

    RAISE NOTICE 'Fixed customer records for %', v_email;
END $$;
