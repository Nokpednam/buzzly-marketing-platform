-- Fix Employee Registration: Assign Default Role
-- Root cause: New employees get role_employees_id = NULL
-- Solution: Set default role to 'Employee' during registration

-- Update the handle_new_user trigger to assign default role
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
    
    -- Get the default 'Employee' role ID
    SELECT id INTO default_employee_role_id
    FROM public.role_employees
    WHERE LOWER(role_name) = 'employee'
    LIMIT 1;
    
    -- If no Employee role exists, log warning but continue
    IF default_employee_role_id IS NULL THEN
        RAISE WARNING 'No default Employee role found in role_employees table';
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
        -- A. Create Customer Record
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
        
        -- B. Create Customer Profile
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
            
        RAISE NOTICE 'Customer profile created for user: %', new.email;
        
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        RAISE WARNING 'Error creating customer record: %', v_error_message;
        RETURN new;
    END;
    
    RETURN new;
END;
$$;

-- Verify the default role exists
SELECT 
    id,
    role_name,
    description
FROM role_employees
WHERE LOWER(role_name) = 'employee';

-- If no Employee role exists, create it
INSERT INTO role_employees (role_name, description)
SELECT 'Employee', 'Default role for new employee registrations'
WHERE NOT EXISTS (
    SELECT 1 FROM role_employees WHERE LOWER(role_name) = 'employee'
);
