-- ============================================================================
-- Fix: 4 Critical Loyalty & Support Console Sync Issues
-- Timestamp: 20260318100000
--
-- Changes:
--   1. Add change_type ('auto'|'manual') to loyalty_tier_history
--      + Update log_loyalty_tier_change trigger to always set 'auto'
--
--   2. Add discount_id FK to user_redeemed_coupons
--      + Update redeem_reward() to store the discount_id
--
--   3. RLS: Allow employees to SELECT all rows from points_transactions
--
--   4. Fix award_loyalty_points() RPC to also handle loyalty_activity_codes
--      (action_code) in addition to loyalty_missions (action_type), so that
--      missions defined in either table are correctly logged as completions.
-- ============================================================================


-- ============================================================================
-- 1a. Add change_type column to loyalty_tier_history
-- ============================================================================
ALTER TABLE public.loyalty_tier_history
    ADD COLUMN IF NOT EXISTS change_type TEXT NOT NULL DEFAULT 'auto'
    CHECK (change_type IN ('auto', 'manual'));

COMMENT ON COLUMN public.loyalty_tier_history.change_type IS
    'auto = written by system trigger on loyalty_points update; '
    'manual = written by an employee using the Admin Override tool.';


-- ============================================================================
-- 1b. Update log_loyalty_tier_change() to explicitly set change_type = 'auto'
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_loyalty_tier_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_old_tier_name text;
    v_new_tier_name text;
BEGIN
    -- Only act when tier actually changes
    IF (OLD.loyalty_tier_id IS NOT DISTINCT FROM NEW.loyalty_tier_id) THEN
        RETURN NEW;
    END IF;

    -- Resolve tier names
    IF OLD.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_old_tier_name
        FROM public.loyalty_tiers
        WHERE id = OLD.loyalty_tier_id;
    END IF;

    SELECT name INTO v_new_tier_name
    FROM public.loyalty_tiers
    WHERE id = NEW.loyalty_tier_id;

    -- Insert the log row — always 'auto' since this fires from the trigger
    INSERT INTO public.loyalty_tier_history (
        profile_customer_id,
        old_tier,
        new_tier,
        change_type
    ) VALUES (
        NEW.profile_customer_id,
        v_old_tier_name,
        v_new_tier_name,
        'auto'
    );

    RETURN NEW;
END;
$$;

-- Recreate trigger (idempotent)
DROP TRIGGER IF EXISTS log_loyalty_tier_change_trigger ON public.loyalty_points;
CREATE TRIGGER log_loyalty_tier_change_trigger
    AFTER UPDATE OF loyalty_tier_id ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.log_loyalty_tier_change();


-- ============================================================================
-- 2a. Add discount_id FK to user_redeemed_coupons
--     NULL = coupon was created before this migration or discounts insert failed
-- ============================================================================
ALTER TABLE public.user_redeemed_coupons
    ADD COLUMN IF NOT EXISTS discount_id UUID
    REFERENCES public.discounts(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.user_redeemed_coupons.discount_id IS
    'Foreign key to the discounts row created by redeem_reward(). '
    'Used to look up the live coupon status (is_active, times_used) from the '
    'discounts table so both the customer-facing and admin-facing UIs agree.';

CREATE INDEX IF NOT EXISTS idx_urc_discount_id ON public.user_redeemed_coupons(discount_id);


-- ============================================================================
-- 2b. Update redeem_reward() to store discount_id in user_redeemed_coupons
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

    -- 2. Grab email and name from auth.users + profile_customers
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

    -- 12. Insert into discounts table — store the generated ID for cross-referencing
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
        v_discount_id := NULL;
    END;

    -- 13. Insert into user_redeemed_coupons — now includes discount_id for live status sync
    INSERT INTO user_redeemed_coupons (
        user_id,
        reward_item_id,
        coupon_code,
        user_email,
        customer_name,
        discount_id
    ) VALUES (
        v_user_id,
        p_reward_item_id,
        v_coupon_code,
        v_user_email,
        NULLIF(v_customer_name, ''),
        v_discount_id
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
-- 3. RLS: Allow employees to SELECT all rows from points_transactions
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'points_transactions'
          AND policyname = 'Employees can view all points transactions'
    ) THEN
        CREATE POLICY "Employees can view all points transactions"
            ON public.points_transactions
            FOR SELECT
            TO authenticated
            USING (public.is_employee(auth.uid()));
    END IF;
END $$;


-- ============================================================================
-- 4. Fix award_loyalty_points() to handle both loyalty_missions AND
--    loyalty_activity_codes action codes.
--
--    Strategy:
--      a. Try to find the mission in loyalty_missions (existing path)
--      b. If not found there, try loyalty_activity_codes
--      c. In both cases, insert into loyalty_mission_completions on success
--         so the Mission Board UI (which cross-checks completions by action_code)
--         reflects the completed state correctly.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.award_loyalty_points(p_action_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id         UUID;
    -- Mission fields resolved from whichever table has the code
    v_mission_label   TEXT;
    v_points_awarded  INTEGER;
    v_is_one_time     BOOLEAN;
    v_found_in        TEXT;  -- 'loyalty_missions' or 'loyalty_activity_codes'
    -- Points wallet
    v_lp_id           UUID;
    v_current_balance INTEGER;
    v_new_balance     INTEGER;
BEGIN
    -- 1. Require authentication
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- 2. Look up mission definition — check loyalty_missions first (authoritative)
    SELECT label, points_awarded, is_one_time, 'loyalty_missions'
    INTO v_mission_label, v_points_awarded, v_is_one_time, v_found_in
    FROM public.loyalty_missions
    WHERE action_type = p_action_type
      AND is_active   = true;

    -- 2b. If not found in loyalty_missions, try loyalty_activity_codes
    --     (action_code is the equivalent field there)
    IF v_mission_label IS NULL THEN
        SELECT name, reward_points, true, 'loyalty_activity_codes'
        INTO v_mission_label, v_points_awarded, v_is_one_time, v_found_in
        FROM public.loyalty_activity_codes
        WHERE action_code = p_action_type
          AND is_active   = true;
    END IF;

    IF v_mission_label IS NULL THEN
        RAISE EXCEPTION 'mission_not_found: %', p_action_type;
    END IF;

    -- 3. Idempotency check for one-time missions
    IF v_is_one_time THEN
        IF EXISTS (
            SELECT 1
            FROM public.loyalty_mission_completions
            WHERE user_id    = v_user_id
              AND action_type = p_action_type
        ) THEN
            RETURN jsonb_build_object(
                'success', false,
                'reason',  'already_claimed'
            );
        END IF;
    END IF;

    -- 4. Fetch + row-lock the user's loyalty_points record
    SELECT lp.id, lp.point_balance
    INTO   v_lp_id, v_current_balance
    FROM   public.profile_customers pc
    JOIN   public.loyalty_points    lp ON lp.profile_customer_id = pc.id
    WHERE  pc.user_id = v_user_id
    FOR UPDATE;

    IF v_lp_id IS NULL THEN
        RAISE EXCEPTION 'loyalty_points_not_found for user %', v_user_id;
    END IF;

    -- 5. Credit points (auto_tier_update_trigger fires here automatically)
    v_new_balance := v_current_balance + v_points_awarded;

    UPDATE public.loyalty_points
    SET    point_balance = v_new_balance,
           updated_at    = now()
    WHERE  id = v_lp_id;

    -- 6. Log the earn transaction
    INSERT INTO public.points_transactions (
        user_id,
        loyalty_points_id,
        transaction_type,
        points_amount,
        balance_after,
        description
    ) VALUES (
        v_user_id,
        v_lp_id,
        'earn',
        v_points_awarded,
        v_new_balance,
        'Mission: ' || v_mission_label
    );

    -- 7. Record mission completion (idempotent — UNIQUE constraint is the hard stop)
    INSERT INTO public.loyalty_mission_completions (user_id, action_type)
    VALUES (v_user_id, p_action_type)
    ON CONFLICT (user_id, action_type) DO NOTHING;

    -- 8. Return success payload
    RETURN jsonb_build_object(
        'success',        true,
        'points_awarded', v_points_awarded,
        'new_balance',    v_new_balance
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_loyalty_points(TEXT) TO authenticated;

-- ============================================================================
-- End of migration
-- ============================================================================
