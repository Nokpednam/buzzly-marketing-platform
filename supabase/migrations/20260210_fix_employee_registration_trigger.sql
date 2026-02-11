-- ==================================================
-- Fix Employee Registration Trigger
-- This script updates the handle_new_user function to properly
-- create employee records when users sign up via /admin/signup
-- ==================================================

-- Drop the existing function first to ensure clean replacement
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
BEGIN
    -- Common customer profile creation for all users
    INSERT INTO public.customer (id, email, full_name, plan_type)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'free')
    ON CONFLICT (id) DO NOTHING;

    -- Check if this is an employee signup
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        -- Create employee record with pending approval status
        INSERT INTO public.employees (
            user_id, 
            email, 
            status, 
            approval_status,
            role_employees_id
        )
        VALUES (
            new.id, 
            new.email, 
            'active', 
            'pending',
            NULL
        )
        RETURNING id INTO new_employee_id;

        -- Create employee profile with provided metadata
        IF new_employee_id IS NOT NULL THEN
            INSERT INTO public.employees_profile (
                employees_id,
                first_name,
                last_name,
                aptitude,
                birthday_at
            )
            VALUES (
                new_employee_id,
                new.raw_user_meta_data->>'first_name',
                new.raw_user_meta_data->>'last_name',
                new.raw_user_meta_data->>'aptitude',
                CASE 
                    WHEN new.raw_user_meta_data->>'birthday' IS NOT NULL 
                    AND new.raw_user_meta_data->>'birthday' != '' 
                    THEN (new.raw_user_meta_data->>'birthday')::date
                    ELSE NULL
                END
            );
        END IF;

    ELSE
        -- Default customer signup flow
        INSERT INTO public.profile_customers (user_id, first_name, last_name)
        VALUES (
            new.id,
            new.raw_user_meta_data->>'first_name',
            new.raw_user_meta_data->>'last_name'
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN new;
END;
$$;

-- Recreate the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the function was created
SELECT 
    proname as function_name,
    prosrc as source
FROM pg_proc 
WHERE proname = 'handle_new_user';
