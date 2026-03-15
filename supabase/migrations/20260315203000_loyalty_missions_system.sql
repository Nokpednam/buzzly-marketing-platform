-- ============================================================
-- Loyalty Missions System
--
-- Creates:
--   1. loyalty_missions       — mission catalogue (what actions exist + point values)
--   2. loyalty_mission_completions — per-user completion log (idempotency key)
--   3. Seed data for 4 MVP missions
--   4. RLS policies for both tables
--   5. award_loyalty_points() RPC
--
-- Relies on existing infrastructure (do NOT recreate):
--   - loyalty_tiers, loyalty_points, points_transactions tables
--   - handle_auto_tier_update() BEFORE UPDATE trigger on loyalty_points
--     (automatically advances tier_id when total_points_earned crosses min_points)
-- ============================================================


-- ============================================================
-- 1. Table: loyalty_missions (mission catalogue)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.loyalty_missions (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action_type     text NOT NULL UNIQUE,   -- programmatic key used by the RPC
    label           text NOT NULL,          -- human-readable label for UI
    points_awarded  integer NOT NULL CHECK (points_awarded > 0),
    is_one_time     boolean DEFAULT true,   -- false = repeatable (reserved for future)
    is_active       boolean DEFAULT true,
    created_at      timestamptz DEFAULT now()
);

ALTER TABLE public.loyalty_missions OWNER TO postgres;
COMMENT ON TABLE public.loyalty_missions IS
    'Loyalty mission catalogue. Each row defines an action users can complete to earn points.';
COMMENT ON COLUMN public.loyalty_missions.action_type IS
    'Programmatic key used by award_loyalty_points() RPC and frontend call sites.';
COMMENT ON COLUMN public.loyalty_missions.is_one_time IS
    'If true, each user may only claim this mission once (enforced via loyalty_mission_completions UNIQUE constraint).';


-- ============================================================
-- 2. Table: loyalty_mission_completions (per-user audit log)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.loyalty_mission_completions (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type     text NOT NULL,
    completed_at    timestamptz DEFAULT now(),

    -- Hard idempotency key: one row per (user, action) — prevents double-claiming
    UNIQUE (user_id, action_type)
);

ALTER TABLE public.loyalty_mission_completions OWNER TO postgres;
COMMENT ON TABLE public.loyalty_mission_completions IS
    'Records which one-time loyalty missions each user has completed. '
    'The UNIQUE(user_id, action_type) constraint is the hard idempotency guard.';


-- ============================================================
-- 3. Seed: 4 MVP missions
--    Total = 500 pts → exactly enough to reach Silver tier
-- ============================================================
INSERT INTO public.loyalty_missions (action_type, label, points_awarded, is_one_time, is_active)
VALUES
    ('create_workspace', 'Create Your Workspace',        50,  true, true),
    ('connect_api',      'Connect an Ad Platform API',  100,  true, true),
    ('upgrade_plan',     'Upgrade to Pro/Team Plan',    300,  true, true),
    ('create_campaign',  'Launch Your First Campaign',   50,  true, true)
ON CONFLICT (action_type) DO UPDATE
    SET label          = EXCLUDED.label,
        points_awarded = EXCLUDED.points_awarded,
        is_active      = EXCLUDED.is_active;


-- ============================================================
-- 4. RLS: loyalty_missions
-- ============================================================
ALTER TABLE public.loyalty_missions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view the mission catalogue
CREATE POLICY "authenticated_can_view_missions"
    ON public.loyalty_missions
    FOR SELECT
    TO authenticated
    USING (true);

-- Only service role / admin can modify the catalogue
CREATE POLICY "admin_can_manage_missions"
    ON public.loyalty_missions
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));


-- ============================================================
-- 4b. RLS: loyalty_mission_completions
-- ============================================================
ALTER TABLE public.loyalty_mission_completions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own completions
CREATE POLICY "users_can_view_own_completions"
    ON public.loyalty_mission_completions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can insert their own completions (RPC also operates as SECURITY DEFINER,
-- but this policy allows direct reads from the frontend to check mission status)
CREATE POLICY "users_can_insert_own_completions"
    ON public.loyalty_mission_completions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- No UPDATE or DELETE allowed for regular users — completions are permanent


-- ============================================================
-- 5. RPC: award_loyalty_points(p_action_type TEXT)
--
-- Call from frontend: supabase.rpc('award_loyalty_points', { p_action_type: 'create_workspace' })
--
-- Returns JSONB:
--   { success: true,  points_awarded: 50, new_balance: 50 }   — on success
--   { success: false, reason: 'already_claimed' }             — duplicate one-time mission
-- Raises EXCEPTION (caught as Supabase error) for:
--   'not_authenticated', 'mission_not_found', 'loyalty_points_not_found'
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_loyalty_points(p_action_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id         UUID;
    v_mission         RECORD;
    v_lp_id           UUID;
    v_current_balance INTEGER;
    v_new_balance     INTEGER;
BEGIN
    -- 1. Require authentication (caller cannot spoof user_id)
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- 2. Fetch mission definition — validates action_type exists and is active
    SELECT *
    INTO v_mission
    FROM public.loyalty_missions
    WHERE action_type = p_action_type
      AND is_active   = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'mission_not_found: %', p_action_type;
    END IF;

    -- 3. Idempotency check for one-time missions
    --    Soft check here; UNIQUE constraint on loyalty_mission_completions is the hard stop.
    IF v_mission.is_one_time THEN
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

    -- 4. Fetch + row-lock the user's loyalty_points record to prevent race conditions
    SELECT lp.id, lp.point_balance
    INTO   v_lp_id, v_current_balance
    FROM   public.profile_customers pc
    JOIN   public.loyalty_points    lp ON lp.profile_customer_id = pc.id
    WHERE  pc.user_id = v_user_id
    FOR UPDATE;

    IF v_lp_id IS NULL THEN
        RAISE EXCEPTION 'loyalty_points_not_found for user %', v_user_id;
    END IF;

    -- 5. Credit points
    --    NOTE: The existing `auto_tier_update_trigger` (BEFORE UPDATE on loyalty_points)
    --    fires automatically here, updating loyalty_tier_id and total_points_earned.
    --    No tier logic is needed in this function.
    v_new_balance := v_current_balance + v_mission.points_awarded;

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
        v_mission.points_awarded,
        v_new_balance,
        'Mission: ' || v_mission.label
    );

    -- 7. Record mission completion
    --    ON CONFLICT DO NOTHING = defence-in-depth if a parallel request slipped past step 3
    INSERT INTO public.loyalty_mission_completions (user_id, action_type)
    VALUES (v_user_id, p_action_type)
    ON CONFLICT (user_id, action_type) DO NOTHING;

    -- 8. Return success payload
    RETURN jsonb_build_object(
        'success',        true,
        'points_awarded', v_mission.points_awarded,
        'new_balance',    v_new_balance
    );
END;
$$;

-- Grant execute to authenticated users (regular customers)
GRANT EXECUTE ON FUNCTION public.award_loyalty_points(TEXT) TO authenticated;
