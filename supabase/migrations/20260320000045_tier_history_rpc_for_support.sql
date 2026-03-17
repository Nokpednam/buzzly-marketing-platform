-- ============================================================================
-- Migration: Tier History RPC for Support — bulletproof read path
-- Timestamp: 20260320000045
--
-- Problem: Tier History tab doesn't show data after Adjust or auto tier change.
--          Direct SELECT from loyalty_tier_history can fail due to RLS, FK joins,
--          or PostgREST schema cache issues.
--
-- Fix: Create RPC get_tier_history_for_support(p_limit, p_offset) that:
--      1. Checks is_employee(auth.uid()) — employee-only
--      2. SELECTs from loyalty_tier_history JOIN profile_customers (pure SQL)
--      3. Returns flat rows — no RLS, no PostgREST joins
--      4. Frontend uses this RPC exclusively for Tier History tab
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_tier_history_for_support(
    p_limit  integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id                  uuid,
    profile_customer_id  uuid,
    old_tier            text,
    new_tier            text,
    changed_at          timestamptz,
    change_type         text,
    change_reason       text,
    changer_id          uuid,
    customer_first_name text,
    customer_last_name  text,
    customer_user_id    uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'not_authenticated';
    END IF;

    IF NOT public.is_employee(auth.uid()) THEN
        RAISE EXCEPTION 'permission_denied: only employees can view tier history';
    END IF;

    RETURN QUERY
    SELECT
        lth.id,
        lth.profile_customer_id,
        lth.old_tier,
        lth.new_tier,
        lth.changed_at,
        COALESCE(lth.change_type, 'auto')::text,
        lth.change_reason,
        lth.changer_id,
        pc.first_name AS customer_first_name,
        pc.last_name  AS customer_last_name,
        pc.user_id    AS customer_user_id
    FROM public.loyalty_tier_history lth
    LEFT JOIN public.profile_customers pc ON pc.id = lth.profile_customer_id
    ORDER BY lth.changed_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tier_history_for_support(integer, integer) TO authenticated;

COMMENT ON FUNCTION public.get_tier_history_for_support(integer, integer) IS
    'Employee-only: returns tier history for Support Tier Management. Bypasses RLS.';

NOTIFY pgrst, 'reload schema';
