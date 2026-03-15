-- ============================================================
-- FINAL LOYALTY SYSTEM FIX
-- Timestamp: 20260315223000
--
-- ROOT CAUSE OF BUGS:
--   The original award_loyalty_points() RPC (20260315203000) raised
--   an EXCEPTION ('loyalty_points_not_found') when no loyalty_points
--   row existed for the user, instead of creating one automatically.
--   This caused SILENT failures in the frontend (missionResult = null)
--   and blank checkmarks in the Mission Board.
--
-- What this migration fixes:
--   1. Defensive DROP of misspelled 'royalty_points' table (if any)
--   2. Ensures loyalty_points table exists (idempotent CREATE IF NOT EXISTS)
--   3. Backfills 0-pt Bronze wallets for ALL existing profile_customers
--      that are missing a loyalty_points row
--   4. Replaces award_loyalty_points() with a SELF-HEALING version:
--      → If the user has no loyalty_points row, it is auto-created
--        (Bronze tier, 0 pts) BEFORE awarding the mission points.
--      → ON CONFLICT DO NOTHING on loyalty_mission_completions prevents
--        any error if called twice concurrently.
--
-- Safe to re-apply (fully idempotent).
-- ============================================================


-- ── 1. Drop misspelled table if it somehow exists ─────────────────────────
DROP TABLE IF EXISTS public.royalty_points CASCADE;


-- ── 2. Ensure correct loyalty_points table exists ─────────────────────────
CREATE TABLE IF NOT EXISTS public.loyalty_points (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_customer_id UUID        REFERENCES public.profile_customers(id) ON DELETE CASCADE,
    loyalty_tier_id     UUID        REFERENCES public.loyalty_tiers(id),
    point_balance       INTEGER     NOT NULL DEFAULT 0,
    total_points_earned INTEGER     NOT NULL DEFAULT 0,
    status              VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (profile_customer_id)
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

-- Policies (only create if missing — safe to re-run)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'loyalty_points'
          AND policyname = 'Users can view own loyalty points'
    ) THEN
        CREATE POLICY "Users can view own loyalty points" ON public.loyalty_points
            FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.profile_customers pc
                    WHERE pc.id = loyalty_points.profile_customer_id
                      AND pc.user_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'loyalty_points'
          AND policyname = 'Admins can manage loyalty_points'
    ) THEN
        CREATE POLICY "Admins can manage loyalty_points" ON public.loyalty_points
            FOR ALL TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.employees e
                    JOIN public.role_employees r ON e.role_employees_id = r.id
                    WHERE e.user_id = auth.uid()
                      AND r.role_name IN ('owner', 'admin')
                )
            );
    END IF;
END $$;


-- ── 3. Backfill: create 0-pt Bronze wallets for existing users ────────────
INSERT INTO public.loyalty_points (
    profile_customer_id,
    loyalty_tier_id,
    point_balance,
    total_points_earned,
    status
)
SELECT
    pc.id,
    (SELECT id FROM public.loyalty_tiers
     WHERE name = 'Bronze' AND is_active = true
     ORDER BY min_points ASC LIMIT 1),
    0,
    0,
    'active'
FROM public.profile_customers pc
WHERE NOT EXISTS (
    SELECT 1 FROM public.loyalty_points lp
    WHERE lp.profile_customer_id = pc.id
)
ON CONFLICT (profile_customer_id) DO NOTHING;


-- ── 4. Replace award_loyalty_points() with self-healing version ───────────
--
-- KEY CHANGE vs original (20260315203000):
--   OLD step 4: SELECT … FOR UPDATE → RAISE EXCEPTION if not found
--   NEW step 4: INSERT … ON CONFLICT DO NOTHING (auto-creates wallet)
--              Then SELECT … FOR UPDATE (now guaranteed to exist)
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.award_loyalty_points(p_action_type TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id         UUID;
    v_profile_id      UUID;
    v_bronze_tier_id  UUID;
    v_mission         RECORD;
    v_lp_id           UUID;
    v_current_balance INTEGER;
    v_new_balance     INTEGER;
BEGIN
    -- ── 1. Require authentication ─────────────────────────────────────────
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- ── 2. Resolve profile_customer_id ────────────────────────────────────
    SELECT id INTO v_profile_id
    FROM public.profile_customers
    WHERE user_id = v_user_id;

    -- ── 3. Auto-create loyalty wallet if missing (SELF-HEALING) ──────────
    --    This replaces the old RAISE EXCEPTION 'loyalty_points_not_found'.
    --    ON CONFLICT DO NOTHING = safe if another concurrent call beats us.
    IF v_profile_id IS NOT NULL THEN
        SELECT id INTO v_bronze_tier_id
        FROM public.loyalty_tiers
        WHERE name = 'Bronze' AND is_active = true
        LIMIT 1;

        INSERT INTO public.loyalty_points (
            profile_customer_id,
            loyalty_tier_id,
            point_balance,
            total_points_earned,
            status
        )
        VALUES (
            v_profile_id,
            v_bronze_tier_id,
            0,
            0,
            'active'
        )
        ON CONFLICT (profile_customer_id) DO NOTHING;
    END IF;

    -- ── 4. Fetch mission definition ───────────────────────────────────────
    SELECT *
    INTO v_mission
    FROM public.loyalty_missions
    WHERE action_type = p_action_type
      AND is_active   = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'mission_not_found: %', p_action_type;
    END IF;

    -- ── 5. Idempotency: has this one-time mission already been claimed? ───
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

    -- ── 6. Row-lock the loyalty_points record ─────────────────────────────
    --    Now guaranteed to exist due to step 3.
    SELECT lp.id, lp.point_balance
    INTO   v_lp_id, v_current_balance
    FROM   public.profile_customers pc
    JOIN   public.loyalty_points    lp ON lp.profile_customer_id = pc.id
    WHERE  pc.user_id = v_user_id
    FOR UPDATE;

    IF v_lp_id IS NULL THEN
        -- Should only happen if profile_customers row is also missing
        RAISE EXCEPTION 'profile_not_found for user %', v_user_id;
    END IF;

    -- ── 7. Credit points ──────────────────────────────────────────────────
    --    The handle_auto_tier_update BEFORE UPDATE trigger fires here
    --    and automatically advances loyalty_tier_id when thresholds are crossed.
    v_new_balance := v_current_balance + v_mission.points_awarded;

    UPDATE public.loyalty_points
    SET    point_balance = v_new_balance,
           updated_at    = now()
    WHERE  id = v_lp_id;

    -- ── 8. Log earn transaction ───────────────────────────────────────────
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
        'earn',                              -- frontend checks === 'earn' for green display
        v_mission.points_awarded,
        v_new_balance,
        'Mission: ' || v_mission.label
    );

    -- ── 9. Record mission completion ──────────────────────────────────────
    --    ON CONFLICT DO NOTHING is the hard idempotency guard.
    --    Even if a parallel request slipped past step 5, this prevents
    --    a unique constraint error from surfacing to the user.
    INSERT INTO public.loyalty_mission_completions (user_id, action_type)
    VALUES (v_user_id, p_action_type)
    ON CONFLICT (user_id, action_type) DO NOTHING;

    -- ── 10. Return success payload ────────────────────────────────────────
    RETURN jsonb_build_object(
        'success',        true,
        'points_awarded', v_mission.points_awarded,
        'new_balance',    v_new_balance
    );
END;
$$;

-- Ensure authenticated users can call the RPC
GRANT EXECUTE ON FUNCTION public.award_loyalty_points(TEXT) TO authenticated;
