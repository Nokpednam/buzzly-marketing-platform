-- ============================================================================
-- Patch: Bulletproof Loyalty Triggers
-- Timestamp: 20260318400000
--
-- Changes:
--   1. Trigger on loyalty_points to forcefully append to loyalty_tier_history
--   2. Forceful insert check in award_loyalty_points to guarantee
--      loyalty_mission_completions recording before returning.
-- ============================================================================

-- ============================================================================
-- 1. Bulletproof Tier History Trigger 
--    (Note: loyalty_tier_id lives on loyalty_points in this schema)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_bulletproof_tier_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_old_tier_name TEXT;
    v_new_tier_name TEXT;
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

    IF NEW.loyalty_tier_id IS NOT NULL THEN
        SELECT name INTO v_new_tier_name
        FROM public.loyalty_tiers
        WHERE id = NEW.loyalty_tier_id;
    END IF;

    -- Insert the log row into loyalty_tier_history
    INSERT INTO public.loyalty_tier_history (
        profile_customer_id,
        old_tier,
        new_tier,
        change_type
    ) VALUES (
        NEW.profile_customer_id,
        COALESCE(v_old_tier_name, 'None'),
        COALESCE(v_new_tier_name, 'None'),
        'auto' -- default to auto if triggered natively
    );

    RETURN NEW;
END;
$$;

-- Apply to loyalty_points (where loyalty_tier_id is actually tracked)
DROP TRIGGER IF EXISTS trg_bulletproof_tier_change ON public.loyalty_points;
CREATE TRIGGER trg_bulletproof_tier_change
    BEFORE UPDATE OF loyalty_tier_id ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.log_bulletproof_tier_change();

-- If loyalty_tier_id also exists on profile_customers conceptually, we add a mirror trigger
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profile_customers' AND column_name='loyalty_tier_id'
    ) THEN
        EXECUTE '
        DROP TRIGGER IF EXISTS trg_profile_customer_tier_change ON public.profile_customers;
        CREATE TRIGGER trg_profile_customer_tier_change
            AFTER UPDATE OF loyalty_tier_id ON public.profile_customers
            FOR EACH ROW
            EXECUTE FUNCTION public.log_bulletproof_tier_change();
        ';
    END IF;
END
$$;

-- ============================================================================
-- 2. Forceful Points Log (loyalty_mission_completions)
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
    -- No DO NOTHING here. We strictly try to write. If unique constraint fails, it throws naturally.
    INSERT INTO public.loyalty_mission_completions (user_id, action_type)
    VALUES (v_user_id, p_action_type);

    -- 4. Credit points
    SELECT lp.id, COALESCE(lp.point_balance, 0)
    INTO   v_lp_id, v_current_balance
    FROM   public.profile_customers pc
    JOIN   public.loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE  pc.user_id = v_user_id
    FOR UPDATE;

    IF v_lp_id IS NULL THEN
        RAISE EXCEPTION 'loyalty_points_not_found for user %', v_user_id;
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
