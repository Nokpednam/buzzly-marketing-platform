-- ============================================================
-- Fix: Employee Signup Auto-Linking by Email
-- Timestamp: 20260318000001
--
-- Root cause:
--   Migration 20260315000000_fix_handle_new_user_no_workspace.sql
--   overwrote handle_new_user() with a broken version that ALWAYS
--   INSERTs a brand-new employee row on signup (Section 1), ignoring
--   the pre-created record added by an admin. This means:
--     - Admin adds employee (email X, user_id=NULL, approved).
--     - Employee signs up with email X.
--     - Trigger creates a SECOND employees row with the same email
--       but a new user_id, while the original approved record is orphaned.
--     - RLS hides the new duplicate row from the Dev dashboard because
--       it belongs to a different user_id context.
--
-- Fix:
--   Restore the email-matching logic from 20260223094024_trigger_employee_linking.sql,
--   superseding the 20260315 version:
--     A. On employee signup, check for an existing employees row with
--        matching email FIRST (the admin pre-created record).
--     B. If found → UPDATE user_id on that row (link), and set status
--        to 'active' if the record is already approved.
--     C. If not found → INSERT a new row with status='inactive',
--        approval_status='pending' (manual approval required).
--
--   Customer signup section retains correct column names from 20260315:
--     phone_number (not phone), no display_name, no Section C workspace.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id     uuid;
    new_customer_id     uuid;
    _gender_id          uuid;
    existing_employee   RECORD;
    existing_profile_id uuid;
BEGIN
    RAISE NOTICE 'handle_new_user trigger fired for user: %', new.email;

    -- ==================================================
    -- 1. Employee Signup
    -- ==================================================
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        RAISE NOTICE 'Employee signup detected for: %', new.email;

        BEGIN
            -- A. Try to find a pre-created employee record for this email
            SELECT id, approval_status, status
            INTO existing_employee
            FROM public.employees
            WHERE email = new.email
            LIMIT 1;

            IF existing_employee.id IS NOT NULL THEN
                -- Found an existing record → link and optionally activate
                RAISE NOTICE 'Pre-created employee found (id: %). Linking user_id: %', existing_employee.id, new.id;

                UPDATE public.employees
                SET
                    user_id    = new.id,
                    -- Set status to active only if already approved; otherwise leave as-is
                    status     = CASE
                                   WHEN existing_employee.approval_status = 'approved' THEN 'active'
                                   ELSE existing_employee.status
                                 END,
                    updated_at = NOW()
                WHERE id = existing_employee.id;

                new_employee_id := existing_employee.id;

                -- Update or create the profile
                SELECT id INTO existing_profile_id
                FROM public.employees_profile
                WHERE employees_id = new_employee_id
                LIMIT 1;

                IF existing_profile_id IS NOT NULL THEN
                    UPDATE public.employees_profile
                    SET
                        first_name = COALESCE(new.raw_user_meta_data->>'first_name', first_name),
                        last_name  = COALESCE(new.raw_user_meta_data->>'last_name', last_name),
                        aptitude   = COALESCE(new.raw_user_meta_data->>'aptitude', aptitude),
                        birthday_at = CASE
                            WHEN new.raw_user_meta_data->>'birthday' IS NOT NULL
                             AND new.raw_user_meta_data->>'birthday' != ''
                            THEN (new.raw_user_meta_data->>'birthday')::date
                            ELSE birthday_at
                        END,
                        updated_at = NOW()
                    WHERE id = existing_profile_id;
                ELSE
                    INSERT INTO public.employees_profile (
                        employees_id, first_name, last_name, aptitude, birthday_at
                    ) VALUES (
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
                -- B. No pre-created record → brand-new signup, requires manual approval
                RAISE NOTICE 'No pre-created employee found. Creating new pending record for: %', new.email;

                INSERT INTO public.employees (
                    user_id, email, status, approval_status, role_employees_id
                ) VALUES (
                    new.id,
                    new.email,
                    'inactive',
                    'pending',
                    (SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'dev' LIMIT 1)
                )
                RETURNING id INTO new_employee_id;

                IF new_employee_id IS NOT NULL THEN
                    INSERT INTO public.employees_profile (
                        employees_id, first_name, last_name, aptitude, birthday_at
                    ) VALUES (
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
            END IF;

        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating/linking employee record: %', SQLERRM;
        END;

    -- ==================================================
    -- 2. Customer Signup
    -- ==================================================
    ELSE
        RAISE NOTICE 'Customer signup detected for: %', new.email;

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

        BEGIN
            BEGIN
                _gender_id := (new.raw_user_meta_data->>'gender_id')::uuid;
            EXCEPTION WHEN OTHERS THEN
                _gender_id := NULL;
            END;

            INSERT INTO public.profile_customers (
                user_id, first_name, last_name, phone_number, gender_id, salary_range
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

    END IF;

    RETURN new;
END;
$$;
