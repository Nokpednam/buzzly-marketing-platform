-- ============================================================================
-- Migration: Fix get_tier_history_for_support type mismatch regression
-- Timestamp: 20260324120000
--
-- Problem: "structure of query does not match function result type"
--          This error recurred because the previous migration (20260322000000)
--          redefined the function but omitted the explicit casts required
--          by PostgreSQL for strict RETURNS TABLE matching.
--
-- Fix: Re-add explicit casts to all columns in the RETURN QUERY SELECT.
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
    customer_user_id    uuid,
    customer_email      text
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
        pc.first_name::text AS customer_first_name,
        pc.last_name::text  AS customer_last_name,
        pc.user_id::uuid    AS customer_user_id,
        c.email::text       AS customer_email
    FROM public.loyalty_tier_history lth
    LEFT JOIN public.profile_customers pc ON pc.id = lth.profile_customer_id
    LEFT JOIN public.customer c ON c.id = pc.user_id
    ORDER BY lth.changed_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
