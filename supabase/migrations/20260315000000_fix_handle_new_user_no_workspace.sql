-- ============================================================
-- Fix: Remove auto-workspace creation from handle_new_user()
--
-- Context:
--   20260305190000_fix_trigger_profile_customers_columns.sql added
--   Section C which auto-creates a workspace + workspace_member row
--   on every new customer signup — causing Onboarding Step 1 to appear
--   as "Complete" immediately after registration.
--
--   20260306193000_disable_auto_workspace_creation.sql attempted to
--   fix this but contained wrong profile_customers column names
--   ('display_name', 'phone') that no longer exist, causing the
--   function replacement to silently fail on a clean DB reset and
--   leaving the 20260305 version (with Section C) as the active body.
--
--   This migration supersedes both with a clean, correct version:
--     - Section C (workspace auto-creation) is intentionally REMOVED.
--     - profile_customers insert uses correct column names:
--         phone_number (not phone), gender_id (not display_name).
--
-- Team safety:
--   This is a NEW migration file. Do NOT edit the existing migration
--   files listed above — doing so causes checksum conflicts for
--   teammates who have already applied those migrations.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
    new_customer_id uuid;
    _gender_id uuid;
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
                SET email      = EXCLUDED.email,
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
                        last_name  = EXCLUDED.last_name,
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

        -- A. Create Customer record
        BEGIN
            INSERT INTO public.customer (id, email, full_name, plan_type)
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
                SET email      = EXCLUDED.email,
                    full_name  = EXCLUDED.full_name,
                    updated_at = NOW()
            RETURNING id INTO new_customer_id;

        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating customer record: %', SQLERRM;
        END;

        -- B. Create Profile Customers record
        --    Correct column names: phone_number (not phone), gender_id (uuid cast).
        --    No display_name column — that column does not exist in this schema.
        BEGIN
            BEGIN
                _gender_id := (new.raw_user_meta_data->>'gender_id')::uuid;
            EXCEPTION WHEN OTHERS THEN
                _gender_id := NULL;
            END;

            INSERT INTO public.profile_customers (
                user_id,
                first_name,
                last_name,
                phone_number,
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
            ON CONFLICT (user_id) DO UPDATE
                SET first_name   = EXCLUDED.first_name,
                    last_name    = EXCLUDED.last_name,
                    phone_number = EXCLUDED.phone_number,
                    gender_id    = EXCLUDED.gender_id,
                    updated_at   = NOW();

        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating profile_customers: %', SQLERRM;
        END;

        -- NOTE: Section C (auto-workspace creation) is intentionally OMITTED.
        -- Users must manually create their workspace during Onboarding Step 1.
        -- The handle_new_user trigger must NEVER auto-create a workspace.

    END IF;

    RETURN new;
END;
$$;
