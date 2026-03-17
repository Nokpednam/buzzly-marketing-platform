-- ============================================================================
-- Migration: Fix Manual Tier Override for New Users (Upsert Wallet)
-- Timestamp: 20260318950000
--
-- Problem:  manual_override_customer_tier fails if the user has no row
--           in loyalty_points, which occurs for brand new signups.
--
-- Fix:      Rewrite the RPC to use an UPSERT (INSERT ... ON CONFLICT) or
--           explicit check to create the loyalty_points row with the
--           overridden tier if it does not exist.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.manual_override_customer_tier(
    target_user_id UUID,
    new_tier_id UUID,
    override_reason TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_customer_id UUID;
    v_loyalty_points_id UUID;
    v_old_tier_id UUID;
    v_old_tier_name TEXT;
    v_new_tier_name TEXT;
    v_changer_id UUID;
BEGIN
    -- 1. Get the admin's user_id
    v_changer_id := auth.uid();
    IF v_changer_id IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    -- 2. Find the target customer's profile ID
    SELECT pc.id
    INTO v_customer_id
    FROM public.profile_customers pc
    WHERE pc.user_id = target_user_id;

    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'target_user_not_found: %', target_user_id;
    END IF;

    -- 3. Resolve old tier details (if wallet exists)
    SELECT lp.id, lp.loyalty_tier_id
    INTO v_loyalty_points_id, v_old_tier_id
    FROM public.loyalty_points lp
    WHERE lp.profile_customer_id = v_customer_id;

    -- 4. Resolve tier names for the history log
    IF v_old_tier_id IS NOT NULL THEN
        SELECT name INTO v_old_tier_name
        FROM public.loyalty_tiers
        WHERE id = v_old_tier_id;
    END IF;

    SELECT name INTO v_new_tier_name
    FROM public.loyalty_tiers
    WHERE id = new_tier_id;

    IF v_new_tier_name IS NULL THEN
        RAISE EXCEPTION 'invalid_new_tier_id: %', new_tier_id;
    END IF;

    -- 5. UPSERT the wallet with the new tier
    IF v_loyalty_points_id IS NULL THEN
        -- Missing wallet: create one and assign the tier
        INSERT INTO public.loyalty_points (
            profile_customer_id,
            point_balance,
            loyalty_tier_id
        ) VALUES (
            v_customer_id,
            0,
            new_tier_id
        ) RETURNING id INTO v_loyalty_points_id;
    ELSE
        -- Existing wallet: update the tier
        UPDATE public.loyalty_points
        SET loyalty_tier_id = new_tier_id,
            updated_at = now()
        WHERE id = v_loyalty_points_id;
    END IF;

    -- 6. Explicitly log the manual change reason into history
    INSERT INTO public.loyalty_tier_history (
        profile_customer_id,
        changer_id,
        old_tier,
        new_tier,
        change_type,
        change_reason
    ) VALUES (
        v_customer_id,
        v_changer_id,
        COALESCE(v_old_tier_name, 'None'),
        v_new_tier_name,
        'manual',
        override_reason
    );

END;
$$;

-- Reload PostgREST schema cache so the updated RPC logic is available to the API
NOTIFY pgrst, 'reload schema';
