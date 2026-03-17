-- ============================================================================
-- Migration: Fix mission points not awarding + tier/reward not updating
-- Timestamp: 20260320000054
--
-- Problem: Customer points don't increase from missions. Tier and rewards don't update.
--   - Frontend passes create_campaign, connect_api (loyalty_missions)
--   - loyalty_activity_codes has first_campaign, connect_ad_api
--   - award_loyalty_points must accept BOTH and map legacy→canonical
--
-- Fix: Update award_loyalty_points to:
--   1. Check loyalty_activity_codes FIRST (canonical)
--   2. Map legacy action types: create_campaign→first_campaign, connect_api→connect_ad_api, upgrade_plan→pro_upgrade
--   3. Fallback to loyalty_missions for backward compat
--   4. Ensure loyalty_points + lifetime_points are updated (triggers tier upgrade)
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
    v_resolved_code   TEXT;  -- canonical action_code for idempotency check
    v_lp_id           UUID;
    v_current_balance INTEGER;
    v_new_balance     INTEGER;
    v_pc_id           UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- Map legacy frontend codes to loyalty_activity_codes.action_code
    v_resolved_code := CASE p_action_type
        WHEN 'create_campaign' THEN 'first_campaign'
        WHEN 'connect_api'     THEN 'connect_ad_api'
        WHEN 'upgrade_plan'   THEN 'pro_upgrade'
        ELSE p_action_type
    END;

    -- 1. Look up in loyalty_activity_codes FIRST (canonical admin-managed)
    SELECT name, reward_points, true
    INTO v_mission_label, v_points_awarded, v_is_one_time
    FROM public.loyalty_activity_codes
    WHERE (action_code = v_resolved_code OR action_code = p_action_type)
      AND is_active = true
    LIMIT 1;

    -- 2. Fallback to loyalty_missions (legacy)
    IF v_mission_label IS NULL THEN
        SELECT label, points_awarded, COALESCE(is_one_time, true)
        INTO v_mission_label, v_points_awarded, v_is_one_time
        FROM public.loyalty_missions
        WHERE action_type = p_action_type AND is_active = true
        LIMIT 1;
        v_resolved_code := p_action_type;
    END IF;

    IF v_mission_label IS NULL THEN
        RAISE EXCEPTION 'mission_not_found: %', p_action_type;
    END IF;

    -- 3. Idempotency: check both resolved_code and original (for legacy completions)
    IF v_is_one_time THEN
        IF EXISTS (
            SELECT 1 FROM public.loyalty_mission_completions
            WHERE user_id = v_user_id
              AND (action_type = v_resolved_code OR action_type = p_action_type)
        ) THEN
            RETURN jsonb_build_object('success', false, 'reason', 'already_claimed');
        END IF;
    END IF;

    -- 4. Record completion (use resolved_code for consistency with loyalty_activity_codes)
    INSERT INTO public.loyalty_mission_completions (user_id, action_type)
    VALUES (v_user_id, v_resolved_code);

    -- 5. Get or create loyalty_points
    SELECT lp.id, COALESCE(lp.point_balance, 0)
    INTO v_lp_id, v_current_balance
    FROM public.profile_customers pc
    JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = v_user_id
    FOR UPDATE OF lp;

    IF v_lp_id IS NULL THEN
        SELECT id INTO v_pc_id FROM public.profile_customers WHERE user_id = v_user_id;
        IF v_pc_id IS NULL THEN
            RAISE EXCEPTION 'profile_customers_not_found for user %', v_user_id;
        END IF;
        INSERT INTO public.loyalty_points (
            profile_customer_id, point_balance, lifetime_points, last_activity_at
        )
        VALUES (v_pc_id, 0, 0, now())
        RETURNING id INTO v_lp_id;
        v_current_balance := 0;
    END IF;

    v_new_balance := v_current_balance + COALESCE(v_points_awarded, 0);

    -- 6. Update BOTH point_balance and lifetime_points (lifetime_points triggers tier upgrade)
    UPDATE public.loyalty_points
    SET point_balance    = v_new_balance,
        lifetime_points = COALESCE(lifetime_points, 0) + COALESCE(v_points_awarded, 0),
        last_activity_at = now(),
        updated_at       = now()
    WHERE id = v_lp_id;

    -- 7. Log transaction
    INSERT INTO public.points_transactions (
        user_id, loyalty_points_id, transaction_type, points_amount, balance_after, description
    ) VALUES (
        v_user_id, v_lp_id, 'earn', COALESCE(v_points_awarded, 0), v_new_balance,
        'Mission: ' || v_mission_label
    );

    RETURN jsonb_build_object(
        'success', true,
        'points_awarded', COALESCE(v_points_awarded, 0),
        'new_balance', v_new_balance
    );
END;
$$;

-- Sync loyalty_missions with loyalty_activity_codes so both have consistent data
INSERT INTO public.loyalty_missions (action_type, label, points_awarded, is_one_time, is_active)
VALUES
    ('create_workspace', 'Create Your Workspace', 50, true, true),
    ('first_campaign',   'Launch Your First Campaign', 50, true, true),
    ('connect_ad_api',   'Connect an Ad Platform API', 100, true, true),
    ('connect_api',      'Connect an Ad Platform API', 100, true, true),
    ('create_campaign',  'Launch Your First Campaign', 50, true, true),
    ('pro_upgrade',      'Upgrade to Pro/Team Plan', 300, true, true),
    ('upgrade_plan',     'Upgrade to Pro/Team Plan', 300, true, true)
ON CONFLICT (action_type) DO UPDATE
SET label = EXCLUDED.label,
    points_awarded = EXCLUDED.points_awarded,
    is_active = EXCLUDED.is_active;

COMMENT ON FUNCTION public.award_loyalty_points(TEXT) IS
    'Award points for mission completion. Maps create_campaign→first_campaign, connect_api→connect_ad_api. Updates lifetime_points to trigger tier upgrade.';

NOTIFY pgrst, 'reload schema';
