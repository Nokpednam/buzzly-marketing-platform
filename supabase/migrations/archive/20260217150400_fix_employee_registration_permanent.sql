-- Migration: Permanently Fix Employee Registration Trigger
-- Issue: handle_new_user() conflicts with profile_customers.user_id unique constraint
-- Solution: Recreate function with proper ON CONFLICT handling

-- 1. Drop and recreate the trigger function with proper conflict handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;

-- 2. Create the fixed handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
    default_employee_role_id uuid;
    v_error_message text;
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'handle_new_user trigger fired for user: %', new.email;
    
    -- Get the default 'admin' role ID (changed from 'employee')
    SELECT id INTO default_employee_role_id
    FROM public.role_employees
    WHERE LOWER(role_name) = 'admin'
    LIMIT 1;
    
    -- If no Admin role exists, log warning but continue
    IF default_employee_role_id IS NULL THEN
        RAISE WARNING 'No default Admin role found in role_employees table';
    END IF;
    
    -- ==================================================
    -- 1. Check if this is an Employee Signup
    -- ==================================================
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        RAISE NOTICE 'Employee signup detected for: %', new.email;
        
        BEGIN
            -- A. Create Employee Record with DEFAULT ROLE
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
                default_employee_role_id -- Assign default Employee role
            )
            ON CONFLICT (user_id) DO UPDATE
            SET email = EXCLUDED.email,
                role_employees_id = COALESCE(employees.role_employees_id, EXCLUDED.role_employees_id),
                updated_at = NOW()
            RETURNING id INTO new_employee_id;
            
            RAISE NOTICE 'Employee record created with ID: % and role: %', new_employee_id, default_employee_role_id;
            
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
                    
                RAISE NOTICE 'Employee profile created for employee: %', new_employee_id;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
            RAISE WARNING 'Error creating employee record: %', v_error_message;
            RETURN new; -- Continue despite error
        END;
        
        RETURN new;
    END IF;
    
    -- ==================================================
    -- 2. Otherwise, this is a Customer Signup
    -- ==================================================
    RAISE NOTICE 'Customer signup detected for: %', new.email;
    
    BEGIN
        -- A. Create Customer Record (if customer table exists)
        BEGIN
            INSERT INTO public.customer (
                user_id,
                email,
                first_name,
                last_name
            )
            VALUES (
                new.id,
                new.email,
                new.raw_user_meta_data->>'first_name',
                new.raw_user_meta_data->>'last_name'
            )
            ON CONFLICT (user_id) DO UPDATE
            SET email = EXCLUDED.email,
                updated_at = NOW();
            
            RAISE NOTICE 'Customer record created for user: %', new.email;
        EXCEPTION WHEN undefined_table THEN
            RAISE NOTICE 'Customer table does not exist, skipping customer record creation';
        END;
        
        -- B. Create Customer Profile
        -- ✅ FIX: Use ON CONFLICT (user_id) instead of (id)
        INSERT INTO public.profile_customers (
            user_id,
            first_name,
            last_name
        )
        VALUES (
            new.id,
            new.raw_user_meta_data->>'first_name',
            new.raw_user_meta_data->>'last_name'
        )
        ON CONFLICT (user_id) DO UPDATE  -- ✅ Handle unique constraint properly
        SET first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            updated_at = NOW();
            
        RAISE NOTICE 'Customer profile created for user: %', new.email;
        
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        RAISE WARNING 'Error creating customer record: %', v_error_message;
        RETURN new;
    END;
    
    RETURN new;
END;
$$;

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Verify the trigger is active
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5. Log success message
DO $$
BEGIN
    RAISE NOTICE '✅ Employee registration trigger fixed permanently!';
END $$;
