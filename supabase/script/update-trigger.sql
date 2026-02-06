-- =========================================================
-- Update handle_new_user Trigger for Employee Registration
-- Run this script in your Supabase SQL Editor
-- =========================================================

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
        
        -- Check if employee already exists (e.g. invited by Admin)
        SELECT id INTO new_employee_id
        FROM public.employees 
        WHERE email = new.email
        LIMIT 1;

        IF new_employee_id IS NOT NULL THEN
            -- UPDATE existing employee record
            UPDATE public.employees
            SET 
                user_id = new.id,
                status = 'active', 
                approval_status = COALESCE(approval_status, 'pending'),
                updated_at = now()
            WHERE id = new_employee_id;
            
            -- Update profile if exists or insert if missing
            IF EXISTS (SELECT 1 FROM public.employees_profile WHERE employees_id = new_employee_id) THEN
                UPDATE public.employees_profile
                SET
                    first_name = COALESCE(first_name, new.raw_user_meta_data->>'first_name'),
                    last_name = COALESCE(last_name, new.raw_user_meta_data->>'last_name'),
                    aptitude = COALESCE(aptitude, new.raw_user_meta_data->>'aptitude'),
                    birthday_at = CASE 
                        WHEN birthday_at IS NULL AND new.raw_user_meta_data->>'birthday' IS NOT NULL AND new.raw_user_meta_data->>'birthday' != '' 
                        THEN (new.raw_user_meta_data->>'birthday')::date
                        ELSE birthday_at
                    END
                WHERE employees_id = new_employee_id;
            ELSE
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
            -- CREATE new employee record
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

            -- Create employee profile
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

-- Verify it was updated
SELECT probin FROM pg_proc WHERE proname = 'handle_new_user';
