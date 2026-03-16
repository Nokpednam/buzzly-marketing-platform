-- ============================================================================
-- Reward Redemption System: user_redeemed_coupons table + updated RPC
-- Decoupled from the existing discounts system.
-- Auto-generates a random coupon code when a user redeems a reward item.
-- ============================================================================

-- 1. CREATE user_redeemed_coupons TABLE
CREATE TABLE IF NOT EXISTS public.user_redeemed_coupons (
    id                UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id           UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_item_id    UUID          NOT NULL REFERENCES public.reward_items(id) ON DELETE CASCADE,
    coupon_code       TEXT          NOT NULL UNIQUE,
    status            TEXT          NOT NULL DEFAULT 'unused',  -- 'unused' | 'used'
    redeemed_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_urc_user_id    ON public.user_redeemed_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_urc_status     ON public.user_redeemed_coupons(status);

-- 2. RLS POLICIES
ALTER TABLE public.user_redeemed_coupons ENABLE ROW LEVEL SECURITY;

-- Customers see only their own coupons
CREATE POLICY "Customers can view their own redeemed coupons"
    ON public.user_redeemed_coupons
    FOR SELECT
    USING (auth.uid() = user_id);

-- Employees can see all (for the Redemption Tracking admin table)
CREATE POLICY "Employees can view all redeemed coupons"
    ON public.user_redeemed_coupons
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            WHERE e.user_id = auth.uid()
        )
    );

-- 3. UPDATED redeem_reward RPC
-- Atomically: deducts points, logs the transaction, decrements stock,
-- and generates + stores a random coupon code in user_redeemed_coupons.
CREATE OR REPLACE FUNCTION public.redeem_reward(p_reward_item_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id            UUID;
    v_loyalty_points_id  UUID;
    v_point_balance      INTEGER;
    v_points_cost        INTEGER;
    v_stock_quantity     INTEGER;
    v_reward_name        TEXT;
    v_new_balance        INTEGER;
    v_tx_id              UUID;
    v_coupon_code        TEXT;
    v_attempt            INTEGER := 0;
BEGIN
    -- 1. Require authentication
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- 2. Fetch + lock loyalty_points row for this user
    SELECT lp.id, lp.point_balance
    INTO v_loyalty_points_id, v_point_balance
    FROM profile_customers pc
    JOIN loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = v_user_id
    FOR UPDATE;

    IF v_loyalty_points_id IS NULL THEN
        RAISE EXCEPTION 'loyalty_points_not_found';
    END IF;

    -- 3. Fetch + lock reward item row
    SELECT ri.points_cost, ri.stock_quantity, ri.name
    INTO v_points_cost, v_stock_quantity, v_reward_name
    FROM reward_items ri
    WHERE ri.id = p_reward_item_id
      AND ri.is_active = true
    FOR UPDATE;

    IF v_points_cost IS NULL THEN
        RAISE EXCEPTION 'reward_not_found';
    END IF;

    -- 4. Validate stock
    IF v_stock_quantity IS NOT NULL AND v_stock_quantity <= 0 THEN
        RAISE EXCEPTION 'out_of_stock';
    END IF;

    -- 5. Validate balance
    IF v_point_balance < v_points_cost THEN
        RAISE EXCEPTION 'insufficient_points';
    END IF;

    v_new_balance := v_point_balance - v_points_cost;

    -- 6. Deduct from loyalty_points
    UPDATE loyalty_points
    SET point_balance = v_new_balance,
        updated_at    = now()
    WHERE id = v_loyalty_points_id;

    -- 7. Log points_transaction (spend)
    INSERT INTO points_transactions (
        user_id,
        loyalty_points_id,
        transaction_type,
        points_amount,
        balance_after,
        description
    ) VALUES (
        v_user_id,
        v_loyalty_points_id,
        'spend',
        v_points_cost,
        v_new_balance,
        'Redeemed: ' || v_reward_name
    )
    RETURNING id INTO v_tx_id;

    -- 8. Also keep a record in reward_redemptions (for backwards compat with existing admin page)
    INSERT INTO reward_redemptions (
        user_id,
        reward_id,
        points_transaction_id,
        status
    ) VALUES (
        v_user_id,
        p_reward_item_id,
        v_tx_id,
        'pending'
    );

    -- 9. Decrement stock if item has limited stock
    IF v_stock_quantity IS NOT NULL THEN
        UPDATE reward_items
        SET stock_quantity = stock_quantity - 1
        WHERE id = p_reward_item_id;
    END IF;

    -- 10. Generate a unique coupon code and insert into user_redeemed_coupons
    --     Format: BUZZ-XXXX-XXXX (fully random alphanumeric, retries on collision)
    LOOP
        v_coupon_code := 'BUZZ-'
            || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4))
            || '-'
            || upper(substring(md5(random()::text || clock_timestamp()::text) from 5 for 4));

        BEGIN
            INSERT INTO user_redeemed_coupons (user_id, reward_item_id, coupon_code)
            VALUES (v_user_id, p_reward_item_id, v_coupon_code);
            EXIT; -- success, exit loop
        EXCEPTION WHEN unique_violation THEN
            v_attempt := v_attempt + 1;
            IF v_attempt >= 5 THEN
                RAISE EXCEPTION 'Failed to generate unique coupon code after 5 attempts';
            END IF;
        END;
    END LOOP;

    RETURN jsonb_build_object(
        'success',       true,
        'new_balance',   v_new_balance,
        'coupon_code',   v_coupon_code
    );
END;
$$;

-- Grant execute to authenticated (regular customers)
GRANT EXECUTE ON FUNCTION public.redeem_reward(UUID) TO authenticated;

-- ============================================================================
