-- ============================================================
-- Permanent Fix: Create loyalty_points wallet for every new
--                customer immediately on signup.
--
-- Context:
--   The award_loyalty_points() RPC (20260315203000) requires a
--   loyalty_points row to exist for the user. Without it, the
--   RPC raises 'loyalty_points_not_found' and missions fail silently.
--
--   This migration updates handle_new_user() to add Section C:
--   create a loyalty_points wallet (0 pts, Bronze tier) right after
--   the profile_customers record is inserted.
--
-- Note: For any EXISTING users without a wallet, run the one-time
-- backfill query from the Supabase SQL Editor:
--
--   INSERT INTO public.loyalty_points (profile_customer_id, loyalty_tier_id, point_balance, total_points_earned)
--   SELECT pc.id,
--          (SELECT id FROM public.loyalty_tiers WHERE name = 'Bronze' AND is_active = true LIMIT 1),
--          0, 0
--   FROM public.profile_customers pc
--   WHERE NOT EXISTS (SELECT 1 FROM public.loyalty_points lp WHERE lp.profile_customer_id = pc.id)
--   ON CONFLICT DO NOTHING;
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
    _gender_id      uuid;
    _profile_id     uuid;
    _bronze_tier_id uuid;
BEGIN
    RAISE NOTICE 'handle_new_user trigger fired for user: %', new.email;

    -- ==================================================
    -- 1. Employee Signup
    -- ==================================================
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        RAISE NOTICE 'Employee signup detected for: %', new.email;

        BEGIN
            INSERT INTO public.employees (
                user_id, email, status, approval_status, role_employees_id
            )
            VALUES (
                new.id, new.email, 'active', 'pending',
                (SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'admin' LIMIT 1)
            )
            ON CONFLICT (user_id) DO UPDATE
                SET email = EXCLUDED.email, updated_at = NOW()
            RETURNING id INTO new_employee_id;

            IF new_employee_id IS NOT NULL THEN
                INSERT INTO public.employees_profile (
                    employees_id, first_name, last_name, aptitude, birthday_at
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

        -- A. Customer record
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
                SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, updated_at = NOW()
            RETURNING id INTO new_customer_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating customer record: %', SQLERRM;
        END;

        -- B. Profile Customers record (correct columns: phone_number, gender_id)
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
                    updated_at   = NOW()
            RETURNING id INTO _profile_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating profile_customers: %', SQLERRM;
        END;

        -- C. Create Loyalty Points wallet (0 pts, Bronze tier)
        --    ON CONFLICT DO NOTHING = safe to re-run / idempotent
        BEGIN
            -- If profile insert hit a conflict (ON CONFLICT DO UPDATE path),
            -- RETURNING may not populate _profile_id — look it up explicitly.
            IF _profile_id IS NULL THEN
                SELECT id INTO _profile_id
                FROM public.profile_customers
                WHERE user_id = new.id;
            END IF;

            SELECT id INTO _bronze_tier_id
            FROM public.loyalty_tiers
            WHERE name = 'Bronze' AND is_active = true
            LIMIT 1;

            IF _profile_id IS NOT NULL THEN
                INSERT INTO public.loyalty_points (
                    profile_customer_id,
                    loyalty_tier_id,
                    point_balance,
                    total_points_earned
                )
                VALUES (
                    _profile_id,
                    _bronze_tier_id,
                    0,
                    0
                )
                ON CONFLICT DO NOTHING;

                RAISE NOTICE 'Loyalty wallet created for profile_customer_id=%', _profile_id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating loyalty_points wallet: %', SQLERRM;
        END;

        -- NOTE: Workspace creation is intentionally OMITTED.
        -- Users must manually create their workspace in Onboarding Step 1.

    END IF;

    RETURN new;
END;
$$;
