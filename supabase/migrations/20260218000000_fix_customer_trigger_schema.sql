-- Migration: Fix Customer Trigger Schema Mismatch
-- Issue: handle_new_user() tries to insert first_name/last_name into customer table which expects full_name/email/id
-- Solution: Update the function to map data correctly

-- 1. Drop and recreate the trigger function
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
    
    -- Get the default 'admin' role ID
    SELECT id INTO default_employee_role_id
    FROM public.role_employees
    WHERE LOWER(role_name) = 'admin'
    LIMIT 1;
    
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
                'pending',
                default_employee_role_id
            )
            ON CONFLICT (user_id) DO UPDATE
            SET email = EXCLUDED.email,
                updated_at = NOW()
            RETURNING id INTO new_employee_id;
            
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
                    updated_at = NOW();
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
            RAISE WARNING 'Error creating employee record: %', v_error_message;
        END;
        
        RETURN new;
    END IF;
    
    -- ==================================================
    -- 2. Otherwise, this is a Customer Signup
    -- ==================================================
    RAISE NOTICE 'Customer signup detected for: %', new.email;
    
    BEGIN
        -- A. Create Customer Record (Fixed Schema)
        BEGIN
            INSERT INTO public.customer (
                id,
                email,
                full_name
            )
            VALUES (
                new.id,
                new.email,
                COALESCE(
                    new.raw_user_meta_data->>'full_name',
                    (new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name'),
                    new.email
                )
            )
            ON CONFLICT (id) DO UPDATE
            SET email = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                updated_at = NOW();
            
            RAISE NOTICE 'Customer record updated/created for user: %', new.email;
        EXCEPTION WHEN undefined_table THEN
            RAISE NOTICE 'Customer table does not exist, skipping';
        END;
        
        -- B. Create Customer Profile (Keep existing logic)
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
        ON CONFLICT (user_id) DO UPDATE
        SET first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            updated_at = NOW();
            
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        RAISE WARNING 'Error creating customer record: %', v_error_message;
    END;
    
    RETURN new;
END;
$$;
