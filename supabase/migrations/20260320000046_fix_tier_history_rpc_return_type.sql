-- ============================================================================
-- Migration: Fix get_tier_history_for_support return type mismatch
-- Timestamp: 20260320000046
--
-- Problem: "structure of query does not match function result type"
--          PostgreSQL is strict about column types in RETURNS TABLE.
--
-- Fix: Explicitly cast every column to match the declared return type.
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
        lth.id::uuid,
        lth.profile_customer_id::uuid,
        lth.old_tier::text,
        lth.new_tier::text,
        lth.changed_at::timestamptz,
        COALESCE(lth.change_type, 'auto')::text,
        lth.change_reason::text,
        lth.changer_id::uuid,
        pc.first_name::text,
        pc.last_name::text,
        pc.user_id::uuid
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
