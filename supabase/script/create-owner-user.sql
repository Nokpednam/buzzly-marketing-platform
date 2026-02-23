-- Create owner user account with proper fields
-- This script creates a complete auth.users record that is compatible with Supabase Auth

DO $$
DECLARE
    existing_employee_user_id uuid := '15b96bdd-41dd-4d38-83a4-a6577b57eec3';
    target_email text := 'hachikonoluna@gmail.com';
    target_password text := 'owner123';
BEGIN
    -- Insert into auth.users with ALL required fields properly set
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at,
        is_anonymous
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        existing_employee_user_id,
        'authenticated',
        'authenticated',
        target_email,
        crypt(target_password, gen_salt('bf')),
        NOW(),
        NULL,
        '',  -- Empty string instead of NULL
        NULL,
        '',  -- Empty string instead of NULL
        NULL,
        '',  -- Empty string instead of NULL
        '',  -- Empty string instead of NULL
        NULL,
        NULL,
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"display_name":"Owner Account", "is_employee_signup": true}'::jsonb,
        false,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',  -- Empty string instead of NULL
        '',  -- Empty string instead of NULL
        NULL,
        '',  -- Empty string instead of NULL
        0,
        NULL,
        '',  -- Empty string instead of NULL
        NULL,
        false,
        NULL,
        false
    )
    ON CONFLICT (id) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = EXCLUDED.email_confirmed_at,
        confirmation_token = '',
        recovery_token = '',
        email_change_token_new = '',
        email_change = '',
        phone_change = '',
        phone_change_token = '',
        email_change_token_current = '',
        reauthentication_token = '',
        updated_at = NOW();

    -- Also create identity record for email provider (if not exists)
    IF NOT EXISTS (
        SELECT 1 FROM auth.identities 
        WHERE provider = 'email' AND user_id = existing_employee_user_id
    ) THEN
        INSERT INTO auth.identities (
            id,
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            existing_employee_user_id::text,
            existing_employee_user_id,
            jsonb_build_object(
                'sub', existing_employee_user_id::text,
                'email', target_email
            ),
            'email',
            NOW(),
            NOW(),
            NOW()
        );
    END IF;

    RAISE NOTICE 'Successfully created/updated user: %', target_email;
    RAISE NOTICE 'User ID: %', existing_employee_user_id;
    RAISE NOTICE 'Password: %', target_password;

    -- 3. Ensure Workspace exists for the owner
    -- Check if user already owns a workspace
    IF NOT EXISTS (SELECT 1 FROM public.workspaces WHERE owner_id = existing_employee_user_id) THEN
        DECLARE
            v_workspace_id uuid := gen_random_uuid();
            v_business_type_id uuid;
        BEGIN
            -- Get a random business type
            SELECT id INTO v_business_type_id FROM public.business_types LIMIT 1;
            
            INSERT INTO public.workspaces (id, name, owner_id, status, business_type_id)
            VALUES (v_workspace_id, 'My Awesome Business', existing_employee_user_id, 'active', v_business_type_id);
            
            RAISE NOTICE 'Created workspace % for %', v_workspace_id, target_email;
            
            -- Ensure owner is a member
            INSERT INTO public.workspace_members (team_id, user_id, role, status)
            VALUES (v_workspace_id, existing_employee_user_id, 'owner', 'active')
            ON CONFLICT (team_id, user_id) DO UPDATE SET status = 'active', role = 'owner';
        END;
    ELSE
        RAISE NOTICE 'Workspace already exists for %', target_email;
    END IF;
END $$;
