-- ==================================================
-- Strict Separation of Employee and Customer Signups
-- ==================================================

-- Drop function to replace it cleanly
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate function with branched logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
BEGIN
    -- ==================================================
    -- 1. Check if this is an Employee Signup (via /admin/signup)
    -- ==================================================
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        
        -- A. Create Employee Record
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
            'pending', -- Requires admin approval
            NULL
        )
        RETURNING id INTO new_employee_id;

        -- B. Create Employee Profile (if employee check passed)
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

    -- ==================================================
    -- 2. Customer Signup Flow (Standard /signup)
    -- ==================================================
    ELSE
        -- A. Create Customer Record (formerly 'profiles')
        -- This logic is now EXCLUSIVE to non-employee signups
        INSERT INTO public.customer (id, email, full_name, plan_type)
        VALUES (
            new.id, 
            new.email, 
            COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
            'free'
        )
        ON CONFLICT (id) DO NOTHING;

        -- B. Create Profile Customers Record (Additional customer details)
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

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
