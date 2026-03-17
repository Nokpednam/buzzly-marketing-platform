-- ============================================================================
-- Migration: Remove auto-workspace creation for Customer signup
-- Timestamp: 20260320000058
--
-- Business logic: Customers must manually create their workspace.
--                 No automatic workspace creation on signup.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
    new_customer_id uuid;
    v_profile_id uuid;
    v_bronze_tier_id uuid;
BEGIN
    RAISE NOTICE 'handle_new_user trigger fired for user: %', new.email;

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
                id, email, full_name, plan_type, acquisition_source
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
                user_id, first_name, last_name, phone_number, gender, salary_range
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
                    updated_at = NOW()
            RETURNING id INTO v_profile_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating profile_customers: %', SQLERRM;
        END;

        -- Create loyalty_points wallet (0 pts, Bronze tier) so missions can award points
        BEGIN
            IF v_profile_id IS NULL THEN
                SELECT id INTO v_profile_id FROM public.profile_customers WHERE user_id = new.id;
            END IF;
            IF v_profile_id IS NOT NULL THEN
                SELECT id INTO v_bronze_tier_id
                FROM public.loyalty_tiers
                WHERE name = 'Bronze' AND is_active = true
                LIMIT 1;
                IF v_bronze_tier_id IS NOT NULL THEN
                    INSERT INTO public.loyalty_points (
                        profile_customer_id, loyalty_tier_id, point_balance, lifetime_points
                    )
                    SELECT v_profile_id, v_bronze_tier_id, 0, 0
                    WHERE NOT EXISTS (
                        SELECT 1 FROM public.loyalty_points
                        WHERE profile_customer_id = v_profile_id
                    );
                END IF;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating loyalty_points wallet: %', SQLERRM;
        END;

        -- NOTE: Workspace is NOT auto-created for customers.
        -- Customers must manually create their workspace.
    END IF;

    RETURN new;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
    'Trigger on auth.users INSERT. Creates customer/profile_customers/loyalty_points for customers. Does NOT auto-create workspace — customers must create it manually.';

NOTIFY pgrst, 'reload schema';
