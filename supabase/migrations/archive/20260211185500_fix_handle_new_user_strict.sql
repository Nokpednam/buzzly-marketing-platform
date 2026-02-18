-- Fix handle_new_user trigger to properly handle strict separation and optional fields

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
    _gender_id uuid;
BEGIN
    -- Check if it's an employee signup
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        -- Create employee record
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
            'pending', -- Pending approval
            NULL       -- Role will be assigned by Admin
        )
        RETURNING id INTO new_employee_id;

        -- Create employee profile if employee record was created
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
        -- Default customer flow (Strictly separated)
        
        -- 1. Create Core Customer Record
        INSERT INTO public.customer (id, email, full_name, plan_type)
        VALUES (
            new.id, 
            new.email, 
            COALESCE(new.raw_user_meta_data->>'full_name', new.email),
            'free'
        )
        ON CONFLICT (id) DO NOTHING;

        -- 2. Assign customer role (Legacy support)
        INSERT INTO public.user_roles (user_id, role)
        VALUES (new.id, 'customer')
        ON CONFLICT (user_id, role) DO NOTHING;

        -- 3. Safe cast for gender_id
        BEGIN
            _gender_id := (new.raw_user_meta_data->>'gender_id')::uuid;
        EXCEPTION WHEN OTHERS THEN
            _gender_id := NULL;
        END;

        -- 4. Create Profile Customers Record
        -- Wrapped in exception block to prevent blocking signup on metadata errors
        BEGIN
            INSERT INTO public.profile_customers (
                user_id, 
                first_name, 
                last_name, 
                phone,
                gender_id,
                salary_range
            )
            VALUES (
                new.id,
                new.raw_user_meta_data->>'first_name',
                new.raw_user_meta_data->>'last_name',
                new.raw_user_meta_data->>'phone',
                _gender_id,
                new.raw_user_meta_data->>'salary_range'
            )
            ON CONFLICT (user_id) DO UPDATE SET
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                phone = EXCLUDED.phone,
                gender_id = EXCLUDED.gender_id,
                salary_range = EXCLUDED.salary_range;
        EXCEPTION WHEN OTHERS THEN
            -- Allow signup to proceed even if profile creation fails (logs error to Postgres logs)
            RAISE WARNING 'Error creating profile_customers for user %: %', new.id, SQLERRM;
        END;
            
    END IF;
    
    RETURN new;
END;
$$;
