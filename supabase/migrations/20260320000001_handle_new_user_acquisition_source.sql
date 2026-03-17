-- Update handle_new_user to persist acquisition_source from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
    new_team_id uuid;
    new_customer_id uuid;
BEGIN
    RAISE NOTICE 'handle_new_user trigger fired for user: %', new.email;

    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        RAISE NOTICE 'Employee signup detected for: %', new.email;
        
        BEGIN
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
            ON CONFLICT (user_id) DO UPDATE
            SET email = EXCLUDED.email,
                updated_at = NOW()
            RETURNING id INTO new_employee_id;
            
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
            RAISE WARNING 'Error creating employee record: %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE 'Customer signup detected for: %', new.email;
        
        BEGIN
            INSERT INTO public.customer (
                id,
                email,
                full_name,
                plan_type,
                acquisition_source
            )
            VALUES (
                new.id,
                new.email,
                COALESCE(
                    new.raw_user_meta_data->>'full_name',
                    (new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name'),
                    new.email
                ),
                'free',
                new.raw_user_meta_data->>'acquisition_source'
            )
            ON CONFLICT (id) DO UPDATE
            SET email = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                acquisition_source = COALESCE(EXCLUDED.acquisition_source, customer.acquisition_source),
                updated_at = NOW()
            RETURNING id INTO new_customer_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating customer record: %', SQLERRM;
        END;
        
        BEGIN
            INSERT INTO public.profile_customers (
                user_id,
                first_name,
                last_name,
                phone_number,
                gender,
                salary_range
            )
            VALUES (
                new.id,
                new.raw_user_meta_data->>'first_name',
                new.raw_user_meta_data->>'last_name',
                new.raw_user_meta_data->>'phone',
                new.raw_user_meta_data->>'gender',
                new.raw_user_meta_data->>'salary_range'
            )
            ON CONFLICT (user_id) DO UPDATE
            SET first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                phone_number = EXCLUDED.phone_number,
                gender = EXCLUDED.gender,
                salary_range = EXCLUDED.salary_range,
                updated_at = NOW();
        EXCEPTION WHEN OTHERS THEN
             RAISE WARNING 'Error creating profile_customers: %', SQLERRM;
        END;

        BEGIN
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
