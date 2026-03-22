-- ============================================================================
-- Migration: Add Email to Tier History RPC
-- Timestamp: 20260321160600
-- ============================================================================

-- Drop the existing function first so we can change its return type
DROP FUNCTION IF EXISTS public.get_tier_history_for_support(integer, integer);

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
        pc.user_id    AS customer_user_id,
        c.email       AS customer_email
    FROM public.loyalty_tier_history lth
    LEFT JOIN public.profile_customers pc ON pc.id = lth.profile_customer_id
    LEFT JOIN public.customer c ON c.id = pc.user_id
    ORDER BY lth.changed_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
