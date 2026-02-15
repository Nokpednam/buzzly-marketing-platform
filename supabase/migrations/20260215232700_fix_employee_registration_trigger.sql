-- =============================================
-- FIX: Employee Registration Trigger
-- This migration recreates the handle_new_user trigger with:
-- - Better error handling
-- - Explicit logging
-- - Fail-safe logic
-- =============================================

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate function with improved error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
    v_error_message text;
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'handle_new_user trigger fired for user: %', new.email;
    
    -- ==================================================
    -- 1. Check if this is an Employee Signup
    -- ==================================================
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        RAISE NOTICE 'Employee signup detected for: %', new.email;
        
        BEGIN
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
            ON CONFLICT (user_id) DO UPDATE
            SET email = EXCLUDED.email,
                updated_at = NOW()
            RETURNING id INTO new_employee_id;
            
            RAISE NOTICE 'Employee record created with ID: %', new_employee_id;
            
            -- B. Create Employee Profile
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
                )
                ON CONFLICT (employees_id) DO UPDATE
                SET first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    aptitude = EXCLUDED.aptitude,
                    birthday_at = EXCLUDED.birthday_at,
                    updated_at = NOW();
                
                RAISE NOTICE 'Employee profile created for employee_id: %', new_employee_id;
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
                RAISE WARNING 'Error creating employee record for %: %', new.email, v_error_message;
                -- Don't fail the entire transaction, just log the error
        END;

    -- ==================================================
    -- 2. Customer Signup Flow (Standard /signup)
    -- ==================================================
    ELSE
        RAISE NOTICE 'Customer signup detected for: %', new.email;
        
        BEGIN
            -- A. Create Customer Record
            INSERT INTO public.customer (id, email, full_name, plan_type)
            VALUES (
                new.id, 
                new.email, 
                COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
                'free'
            )
            ON CONFLICT (id) DO UPDATE
            SET email = EXCLUDED.email,
                full_name = EXCLUDED.full_name;

            -- B. Create Profile Customers Record
            INSERT INTO public.profile_customers (user_id, first_name, last_name)
            VALUES (
                new.id,
                new.raw_user_meta_data->>'first_name',
                new.raw_user_meta_data->>'last_name'
            )
            ON CONFLICT (user_id) DO UPDATE
            SET first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name;
                
            RAISE NOTICE 'Customer record created for: %', new.email;
            
        EXCEPTION
            WHEN OTHERS THEN
                GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
                RAISE WARNING 'Error creating customer record for %: %', new.email, v_error_message;
        END;
    END IF;
    
    RETURN new;
END;
$$;

-- Re-attach trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger was created
SELECT 
    'Trigger created successfully!' as status,
    proname as function_name,
    tgname as trigger_name
FROM pg_proc p
JOIN pg_trigger t ON t.tgfoid = p.oid
WHERE p.proname = 'handle_new_user'
    AND t.tgname = 'on_auth_user_created';
