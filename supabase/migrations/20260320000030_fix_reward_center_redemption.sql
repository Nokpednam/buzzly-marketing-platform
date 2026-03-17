-- ============================================================================
-- Fix: Reward Center — Customer cannot redeem rewards
-- Timestamp: 20260320000030
--
-- Root causes:
--   1. handle_new_user (20260320000004) no longer creates loyalty_points wallet
--      for new customers — they get loyalty_points_not_found when redeeming
--   2. reward_redemptions + points_transactions have user_id FK to customer(id)
--      — if customer row is missing, INSERT fails with FK violation
--
-- Fixes:
--   1. Backfill: Create customer for profile_customers whose user_id has no customer
--   2. Backfill: Create loyalty_points for profile_customers missing a wallet
--   3. Restore loyalty_points creation in handle_new_user for new signups
--   4. Update redeem_reward to auto-create loyalty_points + ensure customer exists
-- ============================================================================

-- ── 1. Backfill: Ensure customer exists for all profile_customers ──────────
INSERT INTO public.customer (id, email, full_name, plan_type)
SELECT
    pc.user_id,
    COALESCE(au.email, 'unknown@buzzly.local'),
    COALESCE(NULLIF(TRIM(pc.first_name || ' ' || pc.last_name), ''), au.email, 'Customer'),
    'free'
FROM public.profile_customers pc
JOIN auth.users au ON au.id = pc.user_id
WHERE NOT EXISTS (SELECT 1 FROM public.customer c WHERE c.id = pc.user_id)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Backfill: Create loyalty_points for profile_customers without wallet ───
INSERT INTO public.loyalty_points (
    profile_customer_id,
    loyalty_tier_id,
    point_balance,
    total_points_earned,
    lifetime_points,
    last_activity_at
)
SELECT
    pc.id,
    (SELECT id FROM public.loyalty_tiers WHERE name = 'Bronze' AND is_active = true LIMIT 1),
    0,
    0,
    0,
    now()
FROM public.profile_customers pc
WHERE NOT EXISTS (
    SELECT 1 FROM public.loyalty_points lp WHERE lp.profile_customer_id = pc.id
)
ON CONFLICT (profile_customer_id) DO NOTHING;

-- ── 3. Restore loyalty_points creation in handle_new_user ───────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
    new_customer_id uuid;
    _profile_id     uuid;
    _bronze_tier_id uuid;
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
                updated_at = NOW()
            RETURNING id INTO _profile_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating profile_customers: %', SQLERRM;
        END;

        -- C. Create loyalty_points wallet (0 pts, Bronze tier) for Reward Center
        BEGIN
            IF _profile_id IS NULL THEN
                SELECT id INTO _profile_id
                FROM public.profile_customers
                WHERE user_id = new.id;
            END IF;

            SELECT id INTO _bronze_tier_id
            FROM public.loyalty_tiers
            WHERE name = 'Bronze' AND is_active = true
            LIMIT 1;

            IF _profile_id IS NOT NULL AND _bronze_tier_id IS NOT NULL THEN
                INSERT INTO public.loyalty_points (
                    profile_customer_id,
                    loyalty_tier_id,
                    point_balance,
                    total_points_earned,
                    last_activity_at
                )
                VALUES (
                    _profile_id,
                    _bronze_tier_id,
                    0,
                    0,
                    now()
                )
                ON CONFLICT (profile_customer_id) DO NOTHING;

                RAISE NOTICE 'Loyalty wallet created for profile_customer_id=%', _profile_id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating loyalty_points wallet: %', SQLERRM;
        END;

        -- NOTE: Workspace creation is intentionally OMITTED.
    END IF;

    RETURN new;
END;
$$;

-- ── 4. Update redeem_reward: ensure customer + loyalty_points exist ──────────
CREATE OR REPLACE FUNCTION public.redeem_reward(p_reward_item_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id            UUID;
    v_user_email         TEXT;
    v_customer_name      TEXT;
    v_loyalty_points_id  UUID;
    v_point_balance      INTEGER;
    v_points_cost        INTEGER;
    v_stock_quantity     INTEGER;
    v_reward_name        TEXT;
    v_new_balance        INTEGER;
    v_tx_id              UUID;
    v_coupon_code        TEXT;
    v_attempt            INTEGER := 0;
    v_system_workspace   UUID;
    v_discount_id        UUID;
    v_pc_id              UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- Ensure customer exists (FK for reward_redemptions + points_transactions)
    INSERT INTO public.customer (id, email, full_name, plan_type)
    SELECT
        au.id,
        COALESCE(au.email, 'unknown@buzzly.local'),
        COALESCE(
            NULLIF(TRIM(COALESCE(pc.first_name, '') || ' ' || COALESCE(pc.last_name, '')), ''),
            au.email,
            'Customer'
        ),
        'free'
    FROM auth.users au
    LEFT JOIN public.profile_customers pc ON pc.user_id = au.id
    WHERE au.id = v_user_id
    ON CONFLICT (id) DO NOTHING;

    SELECT au.email, TRIM(COALESCE(pc.first_name, '') || ' ' || COALESCE(pc.last_name, ''))
    INTO v_user_email, v_customer_name
    FROM auth.users au
    LEFT JOIN public.profile_customers pc ON pc.user_id = au.id
    WHERE au.id = v_user_id;

    -- Fetch or auto-create loyalty_points (like award_loyalty_points)
    SELECT lp.id, lp.point_balance
    INTO v_loyalty_points_id, v_point_balance
    FROM profile_customers pc
    JOIN loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = v_user_id
    FOR UPDATE OF lp;

    IF v_loyalty_points_id IS NULL THEN
        SELECT id INTO v_pc_id FROM public.profile_customers WHERE user_id = v_user_id;
        IF v_pc_id IS NULL THEN
            RAISE EXCEPTION 'loyalty_points_not_found';
        END IF;
        INSERT INTO public.loyalty_points (
            profile_customer_id,
            point_balance,
            lifetime_points,
            last_activity_at
        )
        VALUES (
            v_pc_id,
            0,
            0,
            now()
        )
        ON CONFLICT (profile_customer_id) DO NOTHING;

        SELECT id INTO v_loyalty_points_id
        FROM public.loyalty_points
        WHERE profile_customer_id = v_pc_id;

        v_point_balance := 0;
    END IF;

    IF v_loyalty_points_id IS NULL THEN
        RAISE EXCEPTION 'loyalty_points_not_found';
    END IF;

    SELECT ri.points_cost, ri.stock_quantity, ri.name
    INTO v_points_cost, v_stock_quantity, v_reward_name
    FROM reward_items ri
    WHERE ri.id = p_reward_item_id AND ri.is_active = true
    FOR UPDATE;

    IF v_points_cost IS NULL THEN
        RAISE EXCEPTION 'reward_not_found';
    END IF;
    IF v_stock_quantity IS NOT NULL AND v_stock_quantity <= 0 THEN
        RAISE EXCEPTION 'out_of_stock';
    END IF;
    IF v_point_balance < v_points_cost THEN
        RAISE EXCEPTION 'insufficient_points';
    END IF;

    v_new_balance := v_point_balance - v_points_cost;

    UPDATE loyalty_points
    SET point_balance = v_new_balance,
        last_activity_at = now(),
        updated_at = now()
    WHERE id = v_loyalty_points_id;

    INSERT INTO points_transactions (
        user_id, loyalty_points_id, transaction_type, points_amount, balance_after, description
    ) VALUES (
        v_user_id, v_loyalty_points_id, 'spend', v_points_cost, v_new_balance,
        'Redeemed: ' || v_reward_name
    )
    RETURNING id INTO v_tx_id;

    INSERT INTO reward_redemptions (user_id, reward_id, points_transaction_id, status)
    VALUES (v_user_id, p_reward_item_id, v_tx_id, 'pending');

    IF v_stock_quantity IS NOT NULL THEN
        UPDATE reward_items SET stock_quantity = stock_quantity - 1
        WHERE id = p_reward_item_id;
    END IF;

    LOOP
        v_coupon_code := 'BUZZ-'
            || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4))
            || '-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 5 for 4));
        IF NOT EXISTS (SELECT 1 FROM user_redeemed_coupons WHERE coupon_code = v_coupon_code)
           AND NOT EXISTS (SELECT 1 FROM discounts WHERE code = v_coupon_code)
        THEN EXIT; END IF;
        v_attempt := v_attempt + 1;
        IF v_attempt >= 10 THEN
            RAISE EXCEPTION 'Failed to generate unique coupon code after 10 attempts';
        END IF;
    END LOOP;

    SELECT id INTO v_system_workspace FROM public.workspaces ORDER BY created_at ASC LIMIT 1;
    IF v_system_workspace IS NOT NULL THEN
        INSERT INTO public.discounts (
            team_id, code, name, discount_type, discount_value, usage_limit, usage_count,
            is_active, published_at, description
        ) VALUES (
            v_system_workspace, v_coupon_code, 'Loyalty Reward — ' || v_reward_name,
            'percent', 20, 1, 0, true, now(),
            'Auto-generated loyalty reward for: ' || COALESCE(v_user_email, v_user_id::text)
        )
        RETURNING id INTO v_discount_id;
    END IF;

    INSERT INTO user_redeemed_coupons (user_id, reward_item_id, coupon_code, user_email, customer_name)
    VALUES (v_user_id, p_reward_item_id, v_coupon_code, v_user_email, NULLIF(v_customer_name, ''));

    INSERT INTO public.customer_notifications (customer_id, title, message, type, related_id)
    VALUES (
        v_user_id, '🎉 Reward Redeemed Successfully!',
        'Your discount code is: ' || v_coupon_code || '. Use it at checkout for 20% off — valid for 1 use.',
        'reward', v_discount_id
    );

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'coupon_code', v_coupon_code);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_reward(UUID) TO authenticated;
