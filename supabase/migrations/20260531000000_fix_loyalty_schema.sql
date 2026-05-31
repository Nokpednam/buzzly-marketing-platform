-- ============================================================================
-- Migration: Fix Loyalty System Schema Mismatch
-- Timestamp: 20260531000000
-- ============================================================================

-- 1. Create loyalty_missions if not exists
CREATE TABLE IF NOT EXISTS public.loyalty_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    is_one_time BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default missions
INSERT INTO public.loyalty_missions (action_type, label, points_awarded, is_one_time, is_active)
VALUES
    ('create_workspace', 'Create Your Workspace', 50, true, true),
    ('connect_api', 'Connect an Ad Platform API', 100, true, true),
    ('create_campaign', 'Launch Your First Campaign', 50, true, true)
ON CONFLICT (action_type) DO NOTHING;

-- 2. Fix award_loyalty_points RPC to join on pc.loyalty_point_id instead of lp.profile_customer_id
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
    v_resolved_code   TEXT;
    v_lp_id           UUID;
    v_current_balance INTEGER;
    v_new_balance     INTEGER;
    v_pc_id           UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    v_resolved_code := CASE p_action_type
        WHEN 'create_campaign' THEN 'first_campaign'
        WHEN 'connect_api'     THEN 'connect_ad_api'
        WHEN 'upgrade_plan'   THEN 'pro_upgrade'
        ELSE p_action_type
    END;

    -- Look up in loyalty_activity_codes
    SELECT name, reward_points, true
    INTO v_mission_label, v_points_awarded, v_is_one_time
    FROM public.loyalty_activity_codes
    WHERE (action_code = v_resolved_code OR action_code = p_action_type)
      AND is_active = true
    LIMIT 1;

    -- Fallback to loyalty_missions
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

    -- Idempotency
    IF v_is_one_time THEN
        IF EXISTS (
            SELECT 1 FROM public.loyalty_mission_completions
            WHERE user_id = v_user_id
              AND (action_type = v_resolved_code OR action_type = p_action_type)
        ) THEN
            RETURN jsonb_build_object('success', false, 'reason', 'already_claimed');
        END IF;
    END IF;

    -- Record completion
    INSERT INTO public.loyalty_mission_completions (user_id, action_type)
    VALUES (v_user_id, v_resolved_code);

    -- Get or create loyalty_points using the CORRECT relation direction
    SELECT lp.id, COALESCE(lp.point_balance, 0)
    INTO v_lp_id, v_current_balance
    FROM public.profile_customers pc
    JOIN public.loyalty_points lp ON lp.id = pc.loyalty_point_id
    WHERE pc.user_id = v_user_id
    FOR UPDATE OF lp;

    IF v_lp_id IS NULL THEN
        SELECT id INTO v_pc_id FROM public.profile_customers WHERE user_id = v_user_id;
        IF v_pc_id IS NULL THEN
            RAISE EXCEPTION 'profile_customers_not_found for user %', v_user_id;
        END IF;
        
        -- Insert new wallet
        INSERT INTO public.loyalty_points (point_balance, lifetime_points, last_activity_at)
        VALUES (0, 0, now())
        RETURNING id INTO v_lp_id;
        
        -- Update the profile_customer to point to the new wallet
        UPDATE public.profile_customers SET loyalty_point_id = v_lp_id WHERE id = v_pc_id;
        
        v_current_balance := 0;
    END IF;

    v_new_balance := v_current_balance + COALESCE(v_points_awarded, 0);

    UPDATE public.loyalty_points
    SET point_balance    = v_new_balance,
        lifetime_points = COALESCE(lifetime_points, 0) + COALESCE(v_points_awarded, 0),
        last_activity_at = now(),
        updated_at       = now()
    WHERE id = v_lp_id;

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

-- 3. Update handle_new_user trigger to ensure wallet is created for new customers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_lp_id uuid;
BEGIN
  IF NEW.raw_user_meta_data->>'is_employee_signup' = 'true' THEN
    INSERT INTO public.profile_employees (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  ELSE
    -- Create loyalty wallet first
    INSERT INTO public.loyalty_points (point_balance, lifetime_points, last_activity_at)
    VALUES (0, 0, now())
    RETURNING id INTO new_lp_id;

    -- Create customer profile pointing to the new wallet
    INSERT INTO public.profile_customers (user_id, email, full_name, loyalty_point_id)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name', new_lp_id);
  END IF;
  
  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
