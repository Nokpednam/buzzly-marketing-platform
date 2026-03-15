-- ============================================================
-- MASTER LOYALTY SYSTEM FIX
-- Timestamp: 20260315220000
--
-- What this migration does:
--   1. Drops misspelled 'royalty_points' table if it was ever created
--   2. Ensures the correct 'loyalty_points' table exists with all columns
--      (uses IF NOT EXISTS — safe to re-run if table already exists)
--   3. Ensures all required RLS policies exist on loyalty_points
--   4. Backfills ANY existing profile_customers that are missing a
--      loyalty_points wallet (with 0 pts, Bronze tier — not random)
--   5. Patches handle_new_user() to auto-create a Bronze wallet on signup
--
-- Safe to apply even if earlier individual migrations were already run.
-- All statements use IF NOT EXISTS / ON CONFLICT DO NOTHING / CREATE OR REPLACE
-- so the migration is fully idempotent.
-- ============================================================


-- ── Step 1: Drop misspelled table (defensive — may not exist) ───────────────
DROP TABLE IF EXISTS public.royalty_points CASCADE;


-- ── Step 2: Ensure loyalty_points table is correct ──────────────────────────
CREATE TABLE IF NOT EXISTS public.loyalty_points (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_customer_id UUID REFERENCES public.profile_customers(id) ON DELETE CASCADE,
    loyalty_tier_id     UUID REFERENCES public.loyalty_tiers(id),
    point_balance       INTEGER     DEFAULT 0,
    total_points_earned INTEGER     DEFAULT 0,
    status              VARCHAR(50) DEFAULT 'active', -- active | inactive | banned
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_customer_id)
);

-- Ensure RLS is on (safe to re-run)
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

-- Policies (DROP + recreate is idempotent via IF NOT EXISTS equivalent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'loyalty_points'
          AND policyname = 'Users can view own loyalty points'
    ) THEN
        CREATE POLICY "Users can view own loyalty points" ON public.loyalty_points
            FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.profile_customers pc
                    WHERE pc.id = loyalty_points.profile_customer_id
                      AND pc.user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'loyalty_points'
          AND policyname = 'Admins can manage loyalty_points'
    ) THEN
        CREATE POLICY "Admins can manage loyalty_points" ON public.loyalty_points
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.employees e
                    JOIN public.role_employees r ON e.role_employees_id = r.id
                    WHERE e.user_id = auth.uid()
                      AND r.role_name IN ('owner', 'admin')
                )
            );
    END IF;
END $$;


-- ── Step 3: Backfill — create wallets for existing users (0 pts, Bronze) ────
-- Unlike the old migration (which gave random points), new test users should
-- start at 0 so mission progress is meaningful.
INSERT INTO public.loyalty_points (
    profile_customer_id,
    loyalty_tier_id,
    point_balance,
    total_points_earned,
    status
)
SELECT
    pc.id,
    (SELECT id FROM public.loyalty_tiers
     WHERE name = 'Bronze' AND is_active = true
     ORDER BY min_points ASC LIMIT 1),
    0,
    0,
    'active'
FROM public.profile_customers pc
WHERE NOT EXISTS (
    SELECT 1 FROM public.loyalty_points lp
    WHERE lp.profile_customer_id = pc.id
)
ON CONFLICT (profile_customer_id) DO NOTHING;

-- Verify: this SELECT should return 0 rows after the migration runs
-- SELECT pc.user_id FROM public.profile_customers pc
-- WHERE NOT EXISTS (
--     SELECT 1 FROM public.loyalty_points lp WHERE lp.profile_customer_id = pc.id
-- );


-- ── Step 4: Update handle_new_user() to auto-create loyalty wallet ───────────
-- Supersedes 20260315210000_add_loyalty_wallet_to_new_user.sql.
-- The function is identical — CREATE OR REPLACE makes it safe to re-apply.
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

        -- A. customer record
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

        -- B. profile_customers record
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
            RAISE WARNING 'Error creating profile_customers record: %', SQLERRM;
        END;

        -- C. Create Loyalty Points wallet (0 pts, Bronze tier) — idempotent
        BEGIN
            -- ON CONFLICT path of the INSERT above does NOT populate RETURNING,
            -- so look it up explicitly when _profile_id is null.
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
                    total_points_earned,
                    status
                )
                VALUES (
                    _profile_id,
                    _bronze_tier_id,
                    0,
                    0,
                    'active'
                )
                ON CONFLICT (profile_customer_id) DO NOTHING;

                RAISE NOTICE 'Loyalty wallet created for profile_customer_id=%', _profile_id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating loyalty_points wallet: %', SQLERRM;
        END;

        -- NOTE: Workspace creation is intentionally OMITTED.
        -- Users must manually create their workspace during Onboarding Step 1.

    END IF;

    RETURN new;
END;
$$;
