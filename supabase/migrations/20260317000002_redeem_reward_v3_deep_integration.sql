-- ============================================================================
-- Patch: Fix redeem_reward RPC bugs + Deep Discount Engine Integration
-- v3 — 2026-03-17
--
-- Changes:
--  1. Fixes SQL error: pc.full_name -> pc.first_name || ' ' || pc.last_name
--  2. Inserts a REAL discount code into public.discounts (Discount Mgmt
--     integration), scoped to the system's oldest workspace.
--  3. Inserts the record into user_redeemed_coupons for admin tracking.
--  4. Inserts a customer_notifications row so the user sees the code
--     immediately in their notification bell.
-- ============================================================================

-- Add INSERT policy for customer_notifications so the RPC (SECURITY DEFINER)
-- can write customer notifications on behalf of any authenticated user.
-- (The existing RLS only allows SELECT/UPDATE for the row owner.)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'customer_notifications'
          AND policyname = 'Service can insert customer notifications'
    ) THEN
        CREATE POLICY "Service can insert customer notifications"
            ON public.customer_notifications
            FOR INSERT
            WITH CHECK (true);   -- SECURITY DEFINER fn enforces ownership
    END IF;
END $$;

-- Add INSERT policy for discounts so loyalty coupon codes can be written
-- by the SECURITY DEFINER RPC without hitting RLS.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'discounts'
          AND policyname = 'Service can insert loyalty reward discounts'
    ) THEN
        CREATE POLICY "Service can insert loyalty reward discounts"
            ON public.discounts
            FOR INSERT
            WITH CHECK (true);   -- SECURITY DEFINER fn is the gatekeeper
    END IF;
END $$;

-- ============================================================================
-- Main RPC: redeem_reward (v3)
-- ============================================================================
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
BEGIN
    -- ── 1. Auth ──────────────────────────────────────────────────────────────
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- ── 2. Customer info (FIXED: first_name || last_name, not full_name) ─────
    SELECT
        au.email,
        TRIM(COALESCE(pc.first_name, '') || ' ' || COALESCE(pc.last_name, ''))
    INTO v_user_email, v_customer_name
    FROM auth.users au
    LEFT JOIN public.profile_customers pc ON pc.user_id = au.id
    WHERE au.id = v_user_id;

    -- ── 3. Lock loyalty_points ────────────────────────────────────────────────
    SELECT lp.id, lp.point_balance
    INTO v_loyalty_points_id, v_point_balance
    FROM profile_customers pc
    JOIN loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = v_user_id
    FOR UPDATE;

    IF v_loyalty_points_id IS NULL THEN
        RAISE EXCEPTION 'loyalty_points_not_found';
    END IF;

    -- ── 4. Lock & validate reward item ────────────────────────────────────────
    SELECT ri.points_cost, ri.stock_quantity, ri.name
    INTO v_points_cost, v_stock_quantity, v_reward_name
    FROM reward_items ri
    WHERE ri.id = p_reward_item_id
      AND ri.is_active = true
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

    -- ── 5. Deduct points ──────────────────────────────────────────────────────
    UPDATE loyalty_points
    SET point_balance = v_new_balance,
        updated_at    = now()
    WHERE id = v_loyalty_points_id;

    -- ── 6. Log points_transaction ─────────────────────────────────────────────
    INSERT INTO points_transactions (
        user_id, loyalty_points_id, transaction_type, points_amount, balance_after, description
    ) VALUES (
        v_user_id, v_loyalty_points_id, 'spend', v_points_cost, v_new_balance, 'Redeemed: ' || v_reward_name
    )
    RETURNING id INTO v_tx_id;

    -- ── 7. Legacy reward_redemptions record ───────────────────────────────────
    INSERT INTO reward_redemptions (user_id, reward_id, points_transaction_id, status)
    VALUES (v_user_id, p_reward_item_id, v_tx_id, 'pending');

    -- ── 8. Decrement stock ────────────────────────────────────────────────────
    IF v_stock_quantity IS NOT NULL THEN
        UPDATE reward_items SET stock_quantity = stock_quantity - 1
        WHERE id = p_reward_item_id;
    END IF;

    -- ── 9. Generate unique coupon code ────────────────────────────────────────
    LOOP
        v_coupon_code := 'BUZZ-'
            || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4))
            || '-'
            || upper(substring(md5(random()::text || clock_timestamp()::text) from 5 for 4));

        BEGIN
            -- Check uniqueness in user_redeemed_coupons
            IF NOT EXISTS (SELECT 1 FROM user_redeemed_coupons WHERE coupon_code = v_coupon_code)
               AND NOT EXISTS (SELECT 1 FROM discounts WHERE code = v_coupon_code)
            THEN
                EXIT;
            END IF;
        END;

        v_attempt := v_attempt + 1;
        IF v_attempt >= 10 THEN
            RAISE EXCEPTION 'Failed to generate unique coupon code after 10 attempts';
        END IF;
    END LOOP;

    -- ── 10. Insert into the REAL discounts table (Discount Engine Integration) ─
    -- Find the oldest workspace in the system as the "system" scope for the code.
    SELECT id INTO v_system_workspace
    FROM public.workspaces
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_system_workspace IS NOT NULL THEN
        INSERT INTO public.discounts (
            team_id,
            code,
            name,
            discount_type,
            discount_value,
            usage_limit,
            usage_count,
            is_active,
            published_at,
            description
        ) VALUES (
            v_system_workspace,
            v_coupon_code,
            'Loyalty Reward — ' || v_reward_name,
            'percent',
            20,          -- 20% off standard reward
            1,           -- single-use
            0,
            true,
            now(),
            'Auto-generated loyalty reward for: ' || COALESCE(v_user_email, v_user_id::text)
        )
        RETURNING id INTO v_discount_id;
    END IF;

    -- ── 11. Insert into user_redeemed_coupons (admin tracking) ────────────────
    INSERT INTO user_redeemed_coupons (
        user_id,
        reward_item_id,
        coupon_code,
        user_email,
        customer_name
    ) VALUES (
        v_user_id,
        p_reward_item_id,
        v_coupon_code,
        v_user_email,
        NULLIF(v_customer_name, '')
    );

    -- ── 12. Notify the customer in their notification bell ────────────────────
    INSERT INTO public.customer_notifications (
        customer_id,
        title,
        message,
        type,
        related_id
    ) VALUES (
        v_user_id,
        '🎉 Reward Redeemed Successfully!',
        'Your discount code is: ' || v_coupon_code || '. Use it at checkout for 20% off — valid for 1 use.',
        'reward',
        v_discount_id
    );

    RETURN jsonb_build_object(
        'success',      true,
        'new_balance',  v_new_balance,
        'coupon_code',  v_coupon_code
    );
END;
$$;

-- Ensure authenticated users can invoke the function
GRANT EXECUTE ON FUNCTION public.redeem_reward(UUID) TO authenticated;

-- ============================================================================
