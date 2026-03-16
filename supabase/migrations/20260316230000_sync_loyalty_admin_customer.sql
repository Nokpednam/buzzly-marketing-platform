-- ============================================================
-- Sync: Loyalty Admin ↔ Customer Integration
-- Timestamp: 20260316230000
--
-- What this migration does:
--   1. Creates loyalty_activity_codes  — admin-managed mission catalogue
--   2. Creates loyalty_tier_history    — simple denormalized tier change log
--   3. Creates AFTER UPDATE trigger on loyalty_points to auto-log tier changes
--   4. Seeds 5 default activity codes
--   5. Adds RLS policies for both tables
--
-- Does NOT touch:
--   - loyalty_missions           (existing RPC table — kept intact)
--   - tier_history               (existing complex history table — kept intact)
--   - award_loyalty_points() RPC (unchanged)
-- ============================================================


-- ============================================================
-- 1. Table: loyalty_activity_codes
--    Admin-managed catalogue of activities customers can earn points from.
--    action_code maps 1-to-1 with loyalty_missions.action_type so the
--    existing award_loyalty_points() RPC continues to work unchanged.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.loyalty_activity_codes (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    action_code   text        NOT NULL UNIQUE,   -- e.g. 'connect_line_oa'
    name          text        NOT NULL,           -- Human-readable label for UI
    description   text,                           -- Optional longer description
    reward_points integer     NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
    usage_limit   integer,                        -- NULL = unlimited
    is_active     boolean     NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_activity_codes OWNER TO postgres;

COMMENT ON TABLE public.loyalty_activity_codes IS
    'Admin-managed catalogue of loyalty activities. '
    'action_code mirrors loyalty_missions.action_type so the award_loyalty_points() RPC '
    'can still validate missions. Customers see only is_active=true rows.';

COMMENT ON COLUMN public.loyalty_activity_codes.action_code IS
    'Programmatic key. Must match loyalty_missions.action_type to award points via RPC.';

COMMENT ON COLUMN public.loyalty_activity_codes.usage_limit IS
    'Max number of times ANY user can redeem this code. NULL = unlimited.';


-- ============================================================
-- 2. Table: loyalty_tier_history
--    Simple denormalized log of tier changes, written by the trigger below.
--    Separate from the existing tier_history table (which has complex FKs).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.loyalty_tier_history (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_customer_id uuid        NOT NULL REFERENCES public.profile_customers(id) ON DELETE CASCADE,
    old_tier            text,                    -- Tier name before change (NULL if first assignment)
    new_tier            text        NOT NULL,    -- Tier name after change
    changed_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_tier_history OWNER TO postgres;

COMMENT ON TABLE public.loyalty_tier_history IS
    'Denormalized log of loyalty tier changes. Written automatically by '
    'log_loyalty_tier_change_trigger whenever loyalty_points.loyalty_tier_id changes. '
    'Separate from tier_history which tracks manual overrides with FK joins.';


-- ============================================================
-- 3. Trigger function: log_loyalty_tier_change()
--    Fires AFTER UPDATE on loyalty_points when loyalty_tier_id changes.
--    Resolves tier names from loyalty_tiers and inserts into loyalty_tier_history.
-- ============================================================
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
    -- Only act when tier actually changes (handles NULL → first tier assignment)
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

    -- Insert the log row (profile_customer_id is directly on loyalty_points)
    INSERT INTO public.loyalty_tier_history (
        profile_customer_id,
        old_tier,
        new_tier
    ) VALUES (
        NEW.profile_customer_id,
        v_old_tier_name,
        v_new_tier_name
    );

    RETURN NEW;
END;
$$;

-- Drop existing trigger (if any) then recreate — idempotent
DROP TRIGGER IF EXISTS log_loyalty_tier_change_trigger ON public.loyalty_points;

CREATE TRIGGER log_loyalty_tier_change_trigger
    AFTER UPDATE OF loyalty_tier_id ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.log_loyalty_tier_change();


-- ============================================================
-- 4. Seed: 4 real missions matching the Customer Mission Board
--    Total available points: 50 + 50 + 100 + 300 = 500 pts
--    ON CONFLICT DO UPDATE so this migration is safely re-runnable.
-- ============================================================

-- First, deactivate any codes from the old seed that no longer exist
-- in the canonical mission list (keeps legacy data but hides it from customers).
UPDATE public.loyalty_activity_codes
SET is_active = false
WHERE action_code IN (
    'connect_line_oa', 'survey_completion', 'referral_signup', 'yearly_sub_bonus'
);

-- Upsert the 4 canonical missions
INSERT INTO public.loyalty_activity_codes
    (action_code, name, description, reward_points, usage_limit, is_active)
VALUES
    (
        'create_workspace',
        'Create Your Workspace',
        'Set up your first Buzzly workspace to unlock campaigns, analytics, and team features.',
        50,
        NULL,  -- Each user can only complete this once (enforced by mission_completions)
        true
    ),
    (
        'first_campaign',
        'Launch Your First Campaign',
        'Create and activate your first marketing campaign in Buzzly to earn bonus points.',
        50,
        NULL,
        true
    ),
    (
        'connect_ad_api',
        'Connect an Ad Platform API',
        'Link your external ad platform (e.g. Meta Ads, Google Ads) via API to unlock advanced analytics.',
        100,
        NULL,
        true
    ),
    (
        'pro_upgrade',
        'Upgrade to Pro/Team Plan',
        'Unlock the full power of Buzzly by upgrading to a Pro or Team subscription plan.',
        300,
        NULL,
        true
    )
ON CONFLICT (action_code) DO UPDATE
    SET name          = EXCLUDED.name,
        description   = EXCLUDED.description,
        reward_points = EXCLUDED.reward_points,
        is_active     = EXCLUDED.is_active;



-- ============================================================
-- 5. RLS: loyalty_activity_codes
-- ============================================================
ALTER TABLE public.loyalty_activity_codes ENABLE ROW LEVEL SECURITY;

-- Authenticated customers: read active codes only
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'loyalty_activity_codes'
          AND policyname = 'Customers can view active activity codes'
    ) THEN
        CREATE POLICY "Customers can view active activity codes"
            ON public.loyalty_activity_codes
            FOR SELECT
            TO authenticated
            USING (is_active = true);
    END IF;
END $$;

-- Employees (support/admin/owner): full management
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'loyalty_activity_codes'
          AND policyname = 'Employees can manage activity codes'
    ) THEN
        CREATE POLICY "Employees can manage activity codes"
            ON public.loyalty_activity_codes
            FOR ALL
            TO authenticated
            USING (public.is_employee(auth.uid()))
            WITH CHECK (public.is_employee(auth.uid()));
    END IF;
END $$;


-- ============================================================
-- 5b. RLS: loyalty_tier_history
-- ============================================================
ALTER TABLE public.loyalty_tier_history ENABLE ROW LEVEL SECURITY;

-- Customers: view their own tier history only
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'loyalty_tier_history'
          AND policyname = 'Customers can view own tier history'
    ) THEN
        CREATE POLICY "Customers can view own tier history"
            ON public.loyalty_tier_history
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.profile_customers pc
                    WHERE pc.id      = loyalty_tier_history.profile_customer_id
                      AND pc.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Employees: view all tier history
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'loyalty_tier_history'
          AND policyname = 'Employees can view all tier history'
    ) THEN
        CREATE POLICY "Employees can view all tier history"
            ON public.loyalty_tier_history
            FOR SELECT
            TO authenticated
            USING (public.is_employee(auth.uid()));
    END IF;
END $$;

-- Trigger function inserts via SECURITY DEFINER — no INSERT policy needed for users.
-- Grant trigger function execute to postgres (already owner).
