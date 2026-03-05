-- ============================================================
-- Fix: handle_new_user trigger - profile_customers column names
-- Bug: trigger used non-existent columns 'display_name' and 'phone'
--      (correct column is 'phone_number'; 'display_name' does not exist)
-- This caused profile_customers rows to never be created on sign-up.
-- ============================================================

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

    -- ==================================================
    -- 1. Employee Signup
    -- ==================================================
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

    -- ==================================================
    -- 2. Customer Signup
    -- ==================================================
    ELSE
        RAISE NOTICE 'Customer signup detected for: %', new.email;

        -- A. Create Customer Record
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
                    NULLIF(TRIM(
                        COALESCE(new.raw_user_meta_data->>'first_name', '') || ' ' ||
                        COALESCE(new.raw_user_meta_data->>'last_name', '')
                    ), ''),
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

        -- B. Create Profile Customers Record
        --    FIXED: removed non-existent 'display_name' column;
        --           renamed 'phone' -> 'phone_number'
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
            SET first_name    = EXCLUDED.first_name,
                last_name     = EXCLUDED.last_name,
                phone_number  = EXCLUDED.phone_number,
                gender        = EXCLUDED.gender,
                updated_at    = NOW();

        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating profile_customers: %', SQLERRM;
        END;

        -- C. Create Default Workspace and Membership
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

                RAISE NOTICE 'Created default workspace % for user %', new_team_id, new.id;
            END IF;

        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating default workspace: %', SQLERRM;
        END;

    END IF;

    RETURN new;
END;
$$;
