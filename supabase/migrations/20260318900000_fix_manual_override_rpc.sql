-- ============================================================================
-- Migration: Fix Manual Tier Override RPC Logic
-- Timestamp: 20260318900000
--
-- Problem:  manual_override_customer_tier previously tried to update 
--           loyalty_tier_id on the profile_customers table. That column 
--           lives on the loyalty_points table in this schema.
--
-- Fix:      Rewrite the RPC to update loyalty_points correctly and explicitly
--           insert the manual explanation into loyalty_tier_history.
-- ============================================================================

-- Must DROP first because the old version likely returned jsonb or similar,
-- and Postgres cannot CREATE OR REPLACE if the return type changes.
DROP FUNCTION IF EXISTS public.manual_override_customer_tier(UUID, UUID, TEXT);

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

    -- 2. Find the target customer and their connected loyalty_points record
    --    (target_user_id is the auth UUID, we need the internal profile_customers.id)
    SELECT pc.id, lp.id, lp.loyalty_tier_id
    INTO v_customer_id, v_loyalty_points_id, v_old_tier_id
    FROM public.profile_customers pc
    JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
    WHERE pc.user_id = target_user_id;

    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'target_user_not_found: %', target_user_id;
    END IF;

    -- 3. Resolve old and new tier names for the history log
    IF v_old_tier_id IS NOT NULL THEN
        SELECT name INTO v_old_tier_name
        FROM public.loyalty_tiers
        WHERE id = v_old_tier_id;
    END IF;

    SELECT name INTO v_new_tier_name
    FROM public.loyalty_tiers
    WHERE id = new_tier_id;

    IF v_new_tier_name IS NULL THEN
        RAISE EXCEPTION 'invalid_new_tier_id';
    END IF;

    -- 4. Apply the manual override to the actual loyalty_points table
    UPDATE public.loyalty_points
    SET loyalty_tier_id = new_tier_id,
        updated_at = now()
    WHERE id = v_loyalty_points_id;

    -- 5. Explicitly log the manual change reason into history
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

-- Reload PostgREST schema cache so the updated RPC signature/logic is available to the API
NOTIFY pgrst, 'reload schema';
