-- ============================================================================
-- Patch: Fix Relationship Cache & Points RPC Nullability
-- Timestamp: 20260318300000
--
-- Changes:
--   1. Fix loyalty_tier_history.changer_id FK
--      It currently references auth.users which breaks PostgREST schema cache
--      for public queries. Changed to reference profile_customers(user_id).
--   
--   2. Fix award_loyalty_points()
--      Added COALESCE to ensure NULL balances or points do not result in
--      NULL point_balances, which was preventing points from increasing.
-- ============================================================================


-- ============================================================================
-- 1. Fix Relationship for loyalty_tier_history.changer_id
-- ============================================================================
ALTER TABLE public.loyalty_tier_history 
    DROP COLUMN IF EXISTS changer_id;

ALTER TABLE public.loyalty_tier_history 
    ADD COLUMN changer_id UUID REFERENCES public.profile_customers(user_id) ON DELETE SET NULL;


-- ============================================================================
-- 2. Fix award_loyalty_points() RPC to handle NULLs safely
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
    SELECT lp.id, COALESCE(lp.point_balance, 0)
    INTO   v_lp_id, v_current_balance
    FROM   public.profile_customers pc
    JOIN   public.loyalty_points    lp ON lp.profile_customer_id = pc.id
    WHERE  pc.user_id = v_user_id
    FOR UPDATE;

    IF v_lp_id IS NULL THEN
        RAISE EXCEPTION 'loyalty_points_not_found for user %', v_user_id;
    END IF;

    -- 5. Credit points (auto_tier_update_trigger fires here automatically)
    v_new_balance := v_current_balance + COALESCE(v_points_awarded, 0);

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
        COALESCE(v_points_awarded, 0),
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
        'points_awarded', COALESCE(v_points_awarded, 0),
        'new_balance',    v_new_balance
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_loyalty_points(TEXT) TO authenticated;

-- ============================================================================
-- 3. Reload Schema Cache for PostgREST
-- ============================================================================
NOTIFY pgrst, 'reload schema';
