-- =========================================================
-- Fix Owner Role for hachikonoluna@gmail.com
-- Run this script in your Supabase SQL Editor
-- =========================================================

DO $$
DECLARE
    v_user_id uuid;
    v_owner_role_id uuid;
    v_employee_id uuid;
BEGIN
    -- 1. Get User ID from auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'hachikonoluna@gmail.com';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User hachikonoluna@gmail.com not found in auth.users';
    END IF;

    -- 2. Get Owner Role ID
    SELECT id INTO v_owner_role_id
    FROM public.role_employees
    WHERE role_name = 'owner';

    IF v_owner_role_id IS NULL THEN
        RAISE EXCEPTION 'Role "owner" not found in public.role_employees';
    END IF;

    -- 3. Upsert into employees table
    -- Check if employee record exists
    SELECT id INTO v_employee_id
    FROM public.employees
    WHERE user_id = v_user_id;

    IF v_employee_id IS NOT NULL THEN
        -- Update existing employee
        UPDATE public.employees
        SET 
            role_employees_id = v_owner_role_id,
            status = 'active',
            approval_status = 'approved',
            updated_at = now()
        WHERE id = v_employee_id;
        
        RAISE NOTICE 'Updated existing employee record for user %', v_user_id;
    ELSE
        -- Insert new employee
        INSERT INTO public.employees (
            user_id, 
            email, 
            role_employees_id, 
            status, 
            approval_status, 
            created_at, 
            updated_at
        )
        VALUES (
            v_user_id, 
            'hachikonoluna@gmail.com', 
            v_owner_role_id, 
            'active', 
            'approved', 
            now(), 
            now()
        );
        
        RAISE NOTICE 'Created new employee record for user %', v_user_id;
    END IF;

    -- 4. Clean up legacy user_roles if needed (optional, but good for consistency)
    -- We won't delete, but we'll ensure they have an entry if your app still uses it as fallback
    -- However, Auth.tsx prefers 'employees' table now.

    RAISE NOTICE 'SUCCESS: User hachikonoluna@gmail.com is now an Owner.';
    RAISE NOTICE 'Please log out and log back in to test the redirect.';

END $$;
