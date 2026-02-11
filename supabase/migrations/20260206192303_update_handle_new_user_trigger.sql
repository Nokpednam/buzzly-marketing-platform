-- Update handle_new_user function to support employee registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
BEGIN
    -- Common profile creation for all users
    INSERT INTO public.profiles (id, email, full_name, plan_type)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'free')
    ON CONFLICT (id) DO NOTHING;

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
        -- Default customer flow (existing logic)
        INSERT INTO public.profile_customers (user_id, first_name, last_name, display_name)
        VALUES (
            new.id,
            new.raw_user_meta_data->>'first_name',
            new.raw_user_meta_data->>'last_name',
            COALESCE(new.raw_user_meta_data->>'full_name', new.email)
        );
    END IF;
    
    RETURN new;
END;
$$;
