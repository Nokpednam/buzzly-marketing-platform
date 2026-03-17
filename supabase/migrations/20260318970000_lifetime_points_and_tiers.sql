-- ============================================================================
-- Migration: Loyalty Tiers based on Lifetime Points
-- Timestamp: 20260318970000
--
-- Problem:  Redeeming a reward deducts from point_balance, which caused the
--           auto_evaluate_loyalty_tier trigger to demote users to lower tiers.
--
-- Fix:      1. Add `lifetime_points` column to `loyalty_points`.
--           2. Back-fill `lifetime_points` with current `point_balance`.
--           3. Update `award_loyalty_points` to increment BOTH balances.
--           4. Update `auto_evaluate_loyalty_tier` to trigger ONLY on
--              updates to `lifetime_points` and evaluate the tier against it.
-- ============================================================================

-- 1. Add lifetime_points column
ALTER TABLE public.loyalty_points
    ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0;

-- 2. Back-fill lifetime_points for existing records
UPDATE public.loyalty_points
  SET lifetime_points = COALESCE(point_balance, 0)
  WHERE lifetime_points = 0;


-- 3. Update the earn RPC to increment BOTH balances
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
    -- 1. Require authentication
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- 2. Look up mission definition
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

    -- 3. Idempotency check 
    IF v_is_one_time THEN
        IF EXISTS (
            SELECT 1 FROM public.loyalty_mission_completions
            WHERE user_id = v_user_id AND action_type = p_action_type
        ) THEN
            RETURN jsonb_build_object('success', false, 'reason', 'already_claimed');
        END IF;
    END IF;

    -- *** FORCEFUL COMPLETION INSERT ***
    INSERT INTO public.loyalty_mission_completions (user_id, action_type)
    VALUES (v_user_id, p_action_type);

    -- 4. Credit points
    -- Attempt to fetch the existing loyalty wallet and lock it for update
    SELECT lp.id, COALESCE(lp.point_balance, 0)
    INTO   v_lp_id, v_current_balance
    FROM   public.profile_customers pc
    JOIN   public.loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE  pc.user_id = v_user_id
    FOR UPDATE OF lp;

    IF v_lp_id IS NULL THEN
        -- Retrieve the profile_customer_id for this user
        SELECT id INTO v_pc_id FROM public.profile_customers WHERE user_id = v_user_id;
        
        IF v_pc_id IS NULL THEN
            RAISE EXCEPTION 'profile_customers_not_found for user %', v_user_id;
        END IF;

        -- Create the wallet automatically for the new user, defaulting balances to 0
        INSERT INTO public.loyalty_points (profile_customer_id, point_balance, lifetime_points)
        VALUES (v_pc_id, 0, 0)
        RETURNING id INTO v_lp_id;
        
        v_current_balance := 0;
    END IF;

    v_new_balance := v_current_balance + COALESCE(v_points_awarded, 0);

    UPDATE public.loyalty_points
    SET    point_balance   = v_new_balance,
           lifetime_points = COALESCE(lifetime_points, 0) + COALESCE(v_points_awarded, 0),
           updated_at      = now()
    WHERE  id = v_lp_id;

    -- 5. Log the earn transaction
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
        COALESCE(v_points_awarded, 0),
        v_new_balance,
        'Mission: ' || v_mission_label
    );

    RETURN jsonb_build_object(
        'success',        true,
        'points_awarded', COALESCE(v_points_awarded, 0),
        'new_balance',    v_new_balance
    );
END;
$$;


-- 4. Update the trigger function to evaluate against NEW.lifetime_points
CREATE OR REPLACE FUNCTION public.auto_evaluate_loyalty_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_tier_id UUID;
BEGIN
    -- Only evaluate when lifetime points increase
    IF NEW.lifetime_points IS NOT DISTINCT FROM OLD.lifetime_points THEN
        RETURN NEW;
    END IF;

    -- Find the highest tier the user now qualifies for based on LIFETIME points.
    SELECT id
    INTO   v_new_tier_id
    FROM   public.loyalty_tiers
    WHERE  is_active = true
      AND  COALESCE(min_points, 0) <= NEW.lifetime_points
    ORDER  BY priority_level DESC
    LIMIT  1;

    -- Touch loyalty_tier_id if we resolved a tier AND it's different
    IF v_new_tier_id IS NOT NULL THEN
        NEW.loyalty_tier_id := v_new_tier_id;
    END IF;

    RETURN NEW;
END;
$$;


-- 5. Re-attach the trigger to watch `lifetime_points` instead of `point_balance`
DROP TRIGGER IF EXISTS trg_auto_evaluate_loyalty_tier ON public.loyalty_points;

CREATE TRIGGER trg_auto_evaluate_loyalty_tier
    BEFORE UPDATE OF lifetime_points ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_evaluate_loyalty_tier();


-- 6. Back-fill again using the newly populated lifetime_points
DO $$
DECLARE
    r RECORD;
    v_correct_tier_id UUID;
BEGIN
    FOR r IN SELECT id, lifetime_points, loyalty_tier_id FROM public.loyalty_points LOOP
        -- Resolve the correct tier for LIFETIME balance
        SELECT id
        INTO   v_correct_tier_id
        FROM   public.loyalty_tiers
        WHERE  is_active = true
          AND  COALESCE(min_points, 0) <= COALESCE(r.lifetime_points, 0)
        ORDER  BY priority_level DESC
        LIMIT  1;

        -- Apply fix
        IF v_correct_tier_id IS NOT NULL 
           AND (r.loyalty_tier_id IS DISTINCT FROM v_correct_tier_id) 
        THEN
            UPDATE public.loyalty_points
            SET    loyalty_tier_id = v_correct_tier_id,
                   updated_at      = now()
            WHERE  id = r.id;
        END IF;
    END LOOP;
END;
$$;

-- 7. Reload postgREST schema cache
NOTIFY pgrst, 'reload schema';
