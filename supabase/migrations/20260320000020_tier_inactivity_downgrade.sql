-- ============================================================================
-- Migration: Tier Inactivity-Based Downgrade
-- Timestamp: 20260320000020
--
-- Rules:
--   1. Tier UPGRADE: when lifetime_points increase (existing trigger)
--   2. Tier DOWNGRADE: ONLY when inactive for retention_period_days (e.g. 90)
--   3. Active users: even if points decrease (redeem), tier NEVER downgrades
--
-- Changes:
--   1. Add last_activity_at to loyalty_points
--   2. Set retention_period_days = 90 for all loyalty_tiers (3 months)
--   3. Update award_loyalty_points + redeem_reward to touch last_activity_at
--   4. Create RPC evaluate_inactivity_tier_downgrades (run via cron or manual)
-- ============================================================================

-- 1. Add last_activity_at column
ALTER TABLE public.loyalty_points
    ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

-- 2. Backfill from points_transactions (most recent tx per user)
UPDATE public.loyalty_points lp
SET last_activity_at = COALESCE(
    (SELECT MAX(pt.created_at)
     FROM public.points_transactions pt
     WHERE pt.loyalty_points_id = lp.id),
    lp.updated_at,
    lp.created_at,
    now()
)
WHERE last_activity_at IS NULL OR last_activity_at < lp.created_at;

-- 3. Set retention_period_days = 90 (3 months) for all tiers
UPDATE public.loyalty_tiers
SET retention_period_days = 90
WHERE retention_period_days IS NULL;

-- 4. Update award_loyalty_points to set last_activity_at
CREATE OR REPLACE FUNCTION public.award_loyalty_points(p_action_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id         UUID;
    v_mission_label   TEXT;
    v_points_awarded  INTEGER;
    v_is_one_time     BOOLEAN;
    v_found_in        TEXT;
    v_lp_id           UUID;
    v_current_balance INTEGER;
    v_new_balance     INTEGER;
    v_pc_id           UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    SELECT label, points_awarded, is_one_time, 'loyalty_missions'
    INTO v_mission_label, v_points_awarded, v_is_one_time, v_found_in
    FROM public.loyalty_missions
    WHERE action_type = p_action_type AND is_active = true;

    IF v_mission_label IS NULL THEN
        SELECT name, reward_points, true, 'loyalty_activity_codes'
        INTO v_mission_label, v_points_awarded, v_is_one_time, v_found_in
        FROM public.loyalty_activity_codes
        WHERE action_code = p_action_type AND is_active = true;
    END IF;

    IF v_mission_label IS NULL THEN
        RAISE EXCEPTION 'mission_not_found: %', p_action_type;
    END IF;

    IF v_is_one_time THEN
        IF EXISTS (
            SELECT 1 FROM public.loyalty_mission_completions
            WHERE user_id = v_user_id AND action_type = p_action_type
        ) THEN
            RETURN jsonb_build_object('success', false, 'reason', 'already_claimed');
        END IF;
    END IF;

    INSERT INTO public.loyalty_mission_completions (user_id, action_type)
    VALUES (v_user_id, p_action_type);

    SELECT lp.id, COALESCE(lp.point_balance, 0)
    INTO   v_lp_id, v_current_balance
    FROM   public.profile_customers pc
    JOIN   public.loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE  pc.user_id = v_user_id
    FOR UPDATE OF lp;

    IF v_lp_id IS NULL THEN
        SELECT id INTO v_pc_id FROM public.profile_customers WHERE user_id = v_user_id;
        IF v_pc_id IS NULL THEN
            RAISE EXCEPTION 'profile_customers_not_found for user %', v_user_id;
        END IF;
        INSERT INTO public.loyalty_points (profile_customer_id, point_balance, lifetime_points, last_activity_at)
        VALUES (v_pc_id, 0, 0, now())
        RETURNING id INTO v_lp_id;
        v_current_balance := 0;
    END IF;

    v_new_balance := v_current_balance + COALESCE(v_points_awarded, 0);

    UPDATE public.loyalty_points
    SET    point_balance    = v_new_balance,
           lifetime_points  = COALESCE(lifetime_points, 0) + COALESCE(v_points_awarded, 0),
           last_activity_at = now(),
           updated_at       = now()
    WHERE  id = v_lp_id;

    INSERT INTO public.points_transactions (
        user_id, loyalty_points_id, transaction_type, points_amount, balance_after, description
    ) VALUES (
        v_user_id, v_lp_id, 'earn', COALESCE(v_points_awarded, 0), v_new_balance,
        'Mission: ' || v_mission_label
    );

    RETURN jsonb_build_object(
        'success', true, 'points_awarded', COALESCE(v_points_awarded, 0), 'new_balance', v_new_balance
    );
END;
$$;

-- 5. Update redeem_reward to set last_activity_at
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
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    SELECT au.email, TRIM(COALESCE(pc.first_name, '') || ' ' || COALESCE(pc.last_name, ''))
    INTO v_user_email, v_customer_name
    FROM auth.users au
    LEFT JOIN public.profile_customers pc ON pc.user_id = au.id
    WHERE au.id = v_user_id;

    SELECT lp.id, lp.point_balance
    INTO v_loyalty_points_id, v_point_balance
    FROM profile_customers pc
    JOIN loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = v_user_id
    FOR UPDATE;

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

    -- Deduct points AND touch last_activity_at (user is active — no downgrade)
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

-- 6. RPC: Evaluate inactivity-based tier downgrades
-- Call via pg_cron daily, or manually from Support UI (employee only)
CREATE OR REPLACE FUNCTION public.evaluate_inactivity_tier_downgrades()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r              RECORD;
    v_tier         RECORD;
    v_qualified_id  UUID;
    v_downgraded   INT := 0;
    v_cutoff       TIMESTAMPTZ;
BEGIN
    -- When called by authenticated user, require employee role
    IF auth.uid() IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.employees WHERE user_id = auth.uid()) THEN
        RAISE EXCEPTION 'employees_only';
    END IF;

    FOR v_tier IN
        SELECT id, name, COALESCE(retention_period_days, 90) AS days
        FROM public.loyalty_tiers
        WHERE is_active = true AND retention_period_days IS NOT NULL
    LOOP
        v_cutoff := now() - (v_tier.days || ' days')::interval;

        FOR r IN
            SELECT lp.id, lp.profile_customer_id, lp.loyalty_tier_id, lp.lifetime_points
            FROM public.loyalty_points lp
            WHERE lp.loyalty_tier_id = v_tier.id
              AND COALESCE(lp.last_activity_at, lp.updated_at, lp.created_at) < v_cutoff
        LOOP
            -- Find tier user qualifies for by lifetime_points (may be lower)
            SELECT id INTO v_qualified_id
            FROM public.loyalty_tiers
            WHERE is_active = true
              AND COALESCE(min_points, 0) <= COALESCE(r.lifetime_points, 0)
            ORDER BY priority_level DESC
            LIMIT 1;

            IF v_qualified_id IS NOT NULL AND v_qualified_id IS DISTINCT FROM r.loyalty_tier_id THEN
                UPDATE public.loyalty_points
                SET loyalty_tier_id = v_qualified_id, updated_at = now()
                WHERE id = r.id;
                v_downgraded := v_downgraded + 1;
            END IF;
        END LOOP;
    END LOOP;

    RETURN jsonb_build_object('downgraded_count', v_downgraded);
END;
$$;

GRANT EXECUTE ON FUNCTION public.evaluate_inactivity_tier_downgrades() TO authenticated;
GRANT EXECUTE ON FUNCTION public.evaluate_inactivity_tier_downgrades() TO service_role;

-- 7. RPC: Update tier retention period (employee-only)
CREATE OR REPLACE FUNCTION public.update_tier_retention_period(
    p_tier_id UUID,
    p_retention_days INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.employees WHERE user_id = auth.uid()) THEN
        RAISE EXCEPTION 'employees_only';
    END IF;
    IF p_retention_days IS NOT NULL AND (p_retention_days < 30 OR p_retention_days > 365) THEN
        RAISE EXCEPTION 'retention_days must be between 30 and 365';
    END IF;
    UPDATE public.loyalty_tiers
    SET retention_period_days = p_retention_days, updated_at = now()
    WHERE id = p_tier_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'tier_not_found';
    END IF;
    RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_tier_retention_period(UUID, INTEGER) TO authenticated;

NOTIFY pgrst, 'reload schema';
