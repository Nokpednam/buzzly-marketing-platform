-- Atomic reward redemption RPC
-- Runs as SECURITY DEFINER so it can bypass RLS on sensitive tables
-- (loyalty_points UPDATE, points_transactions INSERT, reward_items UPDATE)
-- while still enforcing all business logic checks internally.

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

    -- 8. Create reward_redemption record
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

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- Grant execute to authenticated (regular customers)
GRANT EXECUTE ON FUNCTION public.redeem_reward(UUID) TO authenticated;
