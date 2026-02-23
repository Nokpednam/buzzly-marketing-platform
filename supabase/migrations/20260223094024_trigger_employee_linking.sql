-- =========================================================
-- Update Handle New User Trigger for Employee Auto-Linking
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
    _gender_id uuid;
    new_team_id uuid;
    new_customer_id uuid;
    existing_employee_id uuid;
    existing_profile_id uuid;
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'handle_new_user trigger fired for user: %', new.email;

    -- ==================================================
    -- 1. Check if this is an Employee Signup
    -- ==================================================
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        RAISE NOTICE 'Employee signup detected for: %', new.email;
        
        BEGIN
            -- Check if admin has already pre-created an employee record for this email
            SELECT id INTO existing_employee_id 
            FROM public.employees 
            WHERE email = new.email 
            LIMIT 1;

            IF existing_employee_id IS NOT NULL THEN
                -- A. Link existing Employee Record
                RAISE NOTICE 'Pre-created employee found. Linking user_id % to employee_id %', new.id, existing_employee_id;
                
                UPDATE public.employees
                SET user_id = new.id,
                    updated_at = NOW()
                WHERE id = existing_employee_id;
                
                new_employee_id := existing_employee_id;

                -- B. Link/Update existing Employee Profile
                SELECT id INTO existing_profile_id
                FROM public.employees_profile
                WHERE employees_id = new_employee_id
                LIMIT 1;

                IF existing_profile_id IS NOT NULL THEN
                    UPDATE public.employees_profile
                    SET first_name = COALESCE((new.raw_user_meta_data->>'first_name'), first_name),
                        last_name = COALESCE((new.raw_user_meta_data->>'last_name'), last_name),
                        aptitude = COALESCE((new.raw_user_meta_data->>'aptitude'), aptitude),
                        birthday_at = CASE 
                            WHEN new.raw_user_meta_data->>'birthday' IS NOT NULL AND new.raw_user_meta_data->>'birthday' != '' 
                            THEN (new.raw_user_meta_data->>'birthday')::date
                            ELSE birthday_at
                        END,
                        updated_at = NOW()
                    WHERE id = existing_profile_id;
                ELSE
                    -- Profile doesn't exist yet, insert it
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
                            WHEN new.raw_user_meta_data->>'birthday' IS NOT NULL AND new.raw_user_meta_data->>'birthday' != '' 
                            THEN (new.raw_user_meta_data->>'birthday')::date
                            ELSE NULL
                        END
                    );
                END IF;

            ELSE
                -- C. Brand new employee signup (not pre-created by admin)
                RAISE NOTICE 'No pre-created employee found. Creating new record for: %', new.email;
                
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
                    (SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'admin' LIMIT 1)
                )
                RETURNING id INTO new_employee_id;
                
                -- Create new Employee Profile
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
                            WHEN new.raw_user_meta_data->>'birthday' IS NOT NULL AND new.raw_user_meta_data->>'birthday' != '' 
                            THEN (new.raw_user_meta_data->>'birthday')::date
                            ELSE NULL
                        END
                    );
                END IF;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating/linking employee record: %', SQLERRM;
        END;
        
    ELSE
        -- ==================================================
        -- 2. Customer Signup Flow (Unchanged)
        -- ==================================================
        RAISE NOTICE 'Customer signup detected for: %', new.email;
        
        -- A. Create Customer Record (Fixed Schema)
        BEGIN
            INSERT INTO public.customer (
                id,
                email,
                full_name,
                plan_type
            )
            VALUES (
                new.id,
                new.email,
                COALESCE(
                    new.raw_user_meta_data->>'full_name',
                    (new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name'),
                    new.email
                ),
                'free'
            )
            ON CONFLICT (id) DO UPDATE
            SET email = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                updated_at = NOW()
            RETURNING id INTO new_customer_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating customer record: %', SQLERRM;
        END;
        
        -- B. Create Customer Profile
        BEGIN
            -- Safe cast for gender_id
            BEGIN
                _gender_id := (new.raw_user_meta_data->>'gender_id')::uuid;
            EXCEPTION WHEN OTHERS THEN
                _gender_id := NULL;
            END;

            INSERT INTO public.profile_customers (
                user_id,
                first_name,
                last_name,
                display_name,
                phone,
                gender_id,
                salary_range
            )
            VALUES (
                new.id,
                new.raw_user_meta_data->>'first_name',
                new.raw_user_meta_data->>'last_name',
                COALESCE(new.raw_user_meta_data->>'full_name', new.email),
                new.raw_user_meta_data->>'phone',
                _gender_id,
                new.raw_user_meta_data->>'salary_range'
            )
            ON CONFLICT (user_id) DO UPDATE
            SET first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                updated_at = NOW();
        EXCEPTION WHEN OTHERS THEN
             RAISE WARNING 'Error creating profile_customers: %', SQLERRM;
        END;

        -- C. Create Default Workspace (was Team) and Member
        BEGIN
            -- 1. Create Workspace
            INSERT INTO public.workspaces (
                name, 
                owner_id,
                description
            )
            VALUES (
                COALESCE(new.raw_user_meta_data->>'company_name', 'My Workspace'), 
                new.id,
                'Default workspace for ' || new.email
            )
            RETURNING id INTO new_team_id;

            -- 2. Add as Workspace Member (Owner)
            IF new_team_id IS NOT NULL THEN
                INSERT INTO public.workspace_members (
                    team_id,
                    user_id,
                    role,
                    status
                )
                VALUES (
                    new_team_id,
                    new.id,
                    'owner',
                    'active'
                );
                
                RAISE NOTICE 'Created default workspace % and added user % as owner', new_team_id, new.id;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating default workspace: %', SQLERRM;
        END;
            
    END IF;
    
    RETURN new;
END;
$$;
