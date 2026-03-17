-- ============================================================================
-- Patch: Manual Tier Override RPC + Profile Customers RLS for Employees
-- Timestamp: 20260318200000
--
-- Changes:
--   1. RLS: profile_customers — allow employees to SELECT all rows
--      (needed so the tier history name join works for support staff)
--
--   2. RLS: loyalty_tier_history — allow employees to INSERT 'manual' entries
--      (required so the hook can write manual override records directly)
--
--   3. NEW RPC: manual_override_customer_tier(target_user_id, new_tier_id, override_reason)
--      Atomic operation — only callable by employees (SECURITY DEFINER + guard).
--      Writes to BOTH:
--        a. loyalty_points (updates loyalty_tier_id)
--        b. loyalty_tier_history with change_type='manual'
--
--   4. Update useManualTierOverride hook to call the new RPC (handled in React code)
-- ============================================================================


-- ============================================================================
-- 1. Extend loyalty_tier_history & profile_customers RLS
--    Add change_reason and changer_id columns to loyalty_tier_history so
--    manual overrides have the same context as the legacy tier_history table.
--    Also add employee SELECT access to profile_customers.
-- ============================================================================
ALTER TABLE public.loyalty_tier_history
    ADD COLUMN IF NOT EXISTS change_reason TEXT,
    ADD COLUMN IF NOT EXISTS changer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'profile_customers'
          AND policyname = 'Employees can view all profile customers'
    ) THEN
        CREATE POLICY "Employees can view all profile customers"
            ON public.profile_customers
            FOR SELECT
            TO authenticated
            USING (public.is_employee(auth.uid()));
    END IF;
END $$;


-- ============================================================================
-- 2. RLS: loyalty_tier_history — employees can INSERT (for manual overrides)
--    The trigger-based inserts go via SECURITY DEFINER, but the new RPC
--    also needs an INSERT policy for the 'manual' entries it writes.
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'loyalty_tier_history'
          AND policyname = 'Employees can insert tier history'
    ) THEN
        CREATE POLICY "Employees can insert tier history"
            ON public.loyalty_tier_history
            FOR INSERT
            TO authenticated
            WITH CHECK (public.is_employee(auth.uid()));
    END IF;
END $$;


-- ============================================================================
-- 3. RPC: manual_override_customer_tier
--    Callable only by authenticated employees.
--    Atomically:
--      a. Resolves old/new tier names from loyalty_tiers
--      b. Updates loyalty_points.loyalty_tier_id for the target user
--         (triggers log_loyalty_tier_change_trigger — but that writes 'auto',
--          so we suppress it by doing our own insert afterward)
--      c. Inserts a 'manual' entry into loyalty_tier_history with reason
--
--    Returns JSONB: { success: true, old_tier: "...", new_tier: "..." }
-- ============================================================================
CREATE OR REPLACE FUNCTION public.manual_override_customer_tier(
    target_user_id UUID,
    new_tier_id    UUID,
    override_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id          UUID;
    v_old_tier_id        UUID;
    v_old_tier_name      TEXT;
    v_new_tier_name      TEXT;
    v_profile_customer_id UUID;
    v_lp_id              UUID;
BEGIN
    -- 1. Require authenticated employee
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    IF NOT public.is_employee(v_caller_id) THEN
        RAISE EXCEPTION 'permission_denied: only employees can call this function';
    END IF;

    -- 2. Resolve new tier name
    SELECT name INTO v_new_tier_name
    FROM public.loyalty_tiers
    WHERE id = new_tier_id;

    IF v_new_tier_name IS NULL THEN
        RAISE EXCEPTION 'tier_not_found: %', new_tier_id;
    END IF;

    -- 3. Fetch profile_customers.id and current loyalty_tier_id from loyalty_points
    SELECT pc.id, lp.id, lp.loyalty_tier_id
    INTO v_profile_customer_id, v_lp_id, v_old_tier_id
    FROM public.profile_customers pc
    JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = target_user_id
    FOR UPDATE OF lp;          -- row-lock loyalty_points to prevent race conditions

    IF v_lp_id IS NULL THEN
        RAISE EXCEPTION 'customer_not_found: no loyalty_points row for user %', target_user_id;
    END IF;

    -- Resolve old tier name (NULL if no tier was set)
    IF v_old_tier_id IS NOT NULL THEN
        SELECT name INTO v_old_tier_name
        FROM public.loyalty_tiers
        WHERE id = v_old_tier_id;
    END IF;

    -- 4. Apply the tier change on loyalty_points
    --    NOTE: log_loyalty_tier_change_trigger fires here and writes an 'auto' row.
    --    We immediately follow with our own 'manual' insert below.
    --    The trigger insert cannot be suppressed without disabling it, so both
    --    entries are written. The UI filters by change_type to avoid showing
    --    the auto row in the Manual Overrides section.
    UPDATE public.loyalty_points
    SET loyalty_tier_id = new_tier_id,
        updated_at      = now()
    WHERE id = v_lp_id;

    -- 5. Write the definitive 'manual' log entry
    INSERT INTO public.loyalty_tier_history (
        profile_customer_id,
        old_tier,
        new_tier,
        change_type,
        change_reason,
        changer_id
    ) VALUES (
        v_profile_customer_id,
        v_old_tier_name,
        v_new_tier_name,
        'manual',
        override_reason,
        v_caller_id
    );

    -- 6. Also update the customer table's loyalty_tier_id for UI consistency
    --    (some queries read from customer.loyalty_tier_id directly)
    UPDATE public.customer
    SET loyalty_tier_id = new_tier_id
    WHERE id = target_user_id;

    -- 7. Log to tier_history (legacy table) for backwards compat with existing admin views
    BEGIN
        INSERT INTO public.tier_history (
            user_id,
            previous_tier_id,
            new_tier_id,
            change_reason,
            changed_by,
            is_manual_override
        ) VALUES (
            target_user_id,
            v_old_tier_id,
            new_tier_id,
            COALESCE(override_reason, 'Manual override by support'),
            v_caller_id,
            true
        );
    EXCEPTION WHEN others THEN
        RAISE WARNING 'tier_history insert failed (non-fatal): %', SQLERRM;
    END;

    RETURN jsonb_build_object(
        'success',   true,
        'old_tier',  COALESCE(v_old_tier_name, 'None'),
        'new_tier',  v_new_tier_name
    );
END;
$$;

-- Only authenticated users can execute this, but the function itself checks is_employee()
GRANT EXECUTE ON FUNCTION public.manual_override_customer_tier(UUID, UUID, TEXT) TO authenticated;

-- ============================================================================
-- End of migration
-- ============================================================================
