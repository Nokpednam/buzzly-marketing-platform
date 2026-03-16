-- ============================================================================
-- Patch: Fix "pc.full_name does not exist" and reinstate deep integration
-- This generation completely overwrites the redeem_reward RPC to properly map
-- first_name & last_name to a single string, while also ensuring it inserts
-- into both the legacy discounts table (without team_id) and user_redeemed_coupons.
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
    v_discount_id        UUID;
BEGIN
    -- 1. Require authentication
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- 2. Grab email from auth.users and mapped name from profile_customers
    SELECT
        au.email,
        TRIM(COALESCE(pc.first_name, '') || ' ' || COALESCE(pc.last_name, ''))
    INTO v_user_email, v_customer_name
    FROM auth.users au
    LEFT JOIN public.profile_customers pc ON pc.user_id = au.id
    WHERE au.id = v_user_id;

    -- 3. Fetch + lock loyalty_points row for this user
    SELECT lp.id, lp.point_balance
    INTO v_loyalty_points_id, v_point_balance
    FROM profile_customers pc
    JOIN loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = v_user_id
    FOR UPDATE;

    IF v_loyalty_points_id IS NULL THEN
        RAISE EXCEPTION 'loyalty_points_not_found';
    END IF;

    -- 4. Fetch + lock reward item row
    SELECT ri.points_cost, ri.stock_quantity, ri.name
    INTO v_points_cost, v_stock_quantity, v_reward_name
    FROM reward_items ri
    WHERE ri.id = p_reward_item_id
      AND ri.is_active = true
    FOR UPDATE;

    IF v_points_cost IS NULL THEN
        RAISE EXCEPTION 'reward_not_found';
    END IF;

    -- 5. Validate stock
    IF v_stock_quantity IS NOT NULL AND v_stock_quantity <= 0 THEN
        RAISE EXCEPTION 'out_of_stock';
    END IF;

    -- 6. Validate balance
    IF v_point_balance < v_points_cost THEN
        RAISE EXCEPTION 'insufficient_points';
    END IF;

    v_new_balance := v_point_balance - v_points_cost;

    -- 7. Deduct from loyalty_points
    UPDATE loyalty_points
    SET point_balance = v_new_balance,
        updated_at    = now()
    WHERE id = v_loyalty_points_id;

    -- 8. Log points_transaction (spend)
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

    -- 9. Legacy reward_redemptions record (backwards compat)
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

    -- 10. Decrement stock if item has limited stock
    IF v_stock_quantity IS NOT NULL THEN
        UPDATE reward_items
        SET stock_quantity = stock_quantity - 1
        WHERE id = p_reward_item_id;
    END IF;

    -- 11. Generate unique coupon code
    LOOP
        v_coupon_code := 'BUZZ-'
            || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 4))
            || '-'
            || upper(substring(md5(random()::text || clock_timestamp()::text) from 5 for 4));

        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM user_redeemed_coupons WHERE coupon_code = v_coupon_code
        );

        v_attempt := v_attempt + 1;
        IF v_attempt >= 10 THEN
            RAISE EXCEPTION 'Failed to generate unique coupon code after 10 attempts';
        END IF;
    END LOOP;

    -- 12. Insert into discounts table (NO team_id)
    BEGIN
        INSERT INTO public.discounts (
            code,
            name,
            discount_type,
            discount_value,
            usage_limit,
            is_active,
            published_at,
            description
        ) VALUES (
            v_coupon_code,
            'Loyalty Reward — ' || v_reward_name,
            'percent',
            20,
            1,
            true,
            now(),
            'Auto-generated loyalty reward for: ' || COALESCE(v_user_email, v_user_id::text)
        )
        RETURNING id INTO v_discount_id;
    EXCEPTION WHEN others THEN
        RAISE WARNING 'Could not insert into discounts table: %', SQLERRM;
    END;

    -- 13. Insert into user_redeemed_coupons
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

    -- 14. Customer Notification
    BEGIN
        INSERT INTO public.customer_notifications (
            customer_id,
            title,
            message,
            type,
            related_id
        ) VALUES (
            v_user_id,
            '🎉 Reward Redeemed Successfully!',
            'Your discount code is: ' || v_coupon_code || '. Valid for 20% off — single use.',
            'reward',
            v_discount_id
        );
    EXCEPTION WHEN others THEN
        RAISE WARNING 'Could not insert customer notification: %', SQLERRM;
    END;

    RETURN jsonb_build_object(
        'success',      true,
        'new_balance',  v_new_balance,
        'coupon_code',  v_coupon_code
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_reward(UUID) TO authenticated;

-- ============================================================================
