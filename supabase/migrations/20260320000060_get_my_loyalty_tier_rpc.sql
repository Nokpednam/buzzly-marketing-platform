-- ============================================================================
-- Migration: get_my_loyalty_tier RPC — bulletproof tier for customer display
-- Timestamp: 20260320000060
--
-- Problem: Customer tier does not update after Support adjusts. Direct table
--          queries may be affected by RLS, embed relationships, or caching.
--
-- Fix: RPC get_my_loyalty_tier() — SECURITY DEFINER, bypasses RLS.
--      Returns tier + point_balance for current user. Frontend uses as primary.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_my_loyalty_tier()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_result jsonb;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('tier', null, 'point_balance', 0);
    END IF;

    SELECT jsonb_build_object(
        'tier', to_jsonb(lt.*),
        'point_balance', COALESCE(lp.point_balance, 0)
    ) INTO v_result
    FROM public.profile_customers pc
    JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
    LEFT JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
    WHERE pc.user_id = v_user_id
    LIMIT 1;

    IF v_result IS NULL THEN
        -- No loyalty_points: return Bronze as default
        SELECT jsonb_build_object(
            'tier', to_jsonb(lt.*),
            'point_balance', 0
        ) INTO v_result
        FROM public.loyalty_tiers lt
        WHERE lt.name = 'Bronze' AND lt.is_active = true
        LIMIT 1;
    END IF;

    RETURN COALESCE(v_result, jsonb_build_object('tier', null, 'point_balance', 0));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_loyalty_tier() TO authenticated;

COMMENT ON FUNCTION public.get_my_loyalty_tier() IS
    'Returns current user tier + point_balance. SECURITY DEFINER, bypasses RLS. Use for customer tier display.';

NOTIFY pgrst, 'reload schema';
