-- ============================================================================
-- Patch: Auto-create wallet in award_loyalty_points
-- Timestamp: 20260318500000
--
-- Changes:
--   1. Replace the "RAISE EXCEPTION 'loyalty_points_not_found'" block with
--      an automatic INSERT INTO loyalty_points. This guarantees missions
--      can be completed and points earned even if the user hasn't touched
--      loyalty features before.
-- ============================================================================

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

        -- Create the wallet automatically for the new user, defaulting balance to 0
        INSERT INTO public.loyalty_points (profile_customer_id, point_balance)
        VALUES (v_pc_id, 0)
        RETURNING id INTO v_lp_id;
        
        v_current_balance := 0;
    END IF;

    v_new_balance := v_current_balance + COALESCE(v_points_awarded, 0);

    UPDATE public.loyalty_points
    SET    point_balance = v_new_balance,
           updated_at    = now()
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

GRANT EXECUTE ON FUNCTION public.award_loyalty_points(TEXT) TO authenticated;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
