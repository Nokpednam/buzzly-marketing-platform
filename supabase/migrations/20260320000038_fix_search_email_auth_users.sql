-- ============================================================================
-- Migration: Fix search by email — use auth.users when customer.email is null
-- Timestamp: 20260320000038
--
-- Problem: search_customers_for_support only searches customer.email.
--          profile_customers without customer row (or customer.email null)
--          cannot be found by email.
--
-- Fix: Join auth.users and use COALESCE(c.email, au.email) for search + display.
--      Also reduce min length from 2 to 1 for single-char search.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_customers_for_support(p_query text)
RETURNS TABLE (
    id uuid,
    full_name text,
    email text,
    created_at timestamptz,
    loyalty_tier text,
    loyalty_points_balance integer
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
        RAISE EXCEPTION 'permission_denied: employees only';
    END IF;

    p_query := trim(p_query);
    IF length(p_query) < 1 THEN
        RETURN;
    END IF;

    -- Escape ilike special chars: % _ \ → treat as literal
    p_query := replace(replace(replace(p_query, '\', '\\'), '%', '\%'), '_', '\_');
    p_query := '%' || p_query || '%';

    RETURN QUERY
    SELECT
        pc.user_id AS id,
        NULLIF(trim(coalesce(pc.first_name, '') || ' ' || coalesce(pc.last_name, '')), '') AS full_name,
        COALESCE(c.email, au.email) AS email,
        pc.created_at,
        lt.name AS loyalty_tier,
        coalesce(lp.point_balance, 0)::integer AS loyalty_points_balance
    FROM public.profile_customers pc
    LEFT JOIN auth.users au ON au.id = pc.user_id
    LEFT JOIN public.customer c ON c.id = pc.user_id
    LEFT JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
    LEFT JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
    WHERE
        pc.first_name ILIKE p_query
        OR pc.last_name ILIKE p_query
        OR (COALESCE(c.email, au.email) IS NOT NULL AND COALESCE(c.email, au.email) ILIKE p_query)
        OR (pc.user_id::text ILIKE p_query)
    ORDER BY pc.first_name, pc.last_name
    LIMIT 15;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_customers_for_support(text) TO authenticated;

COMMENT ON FUNCTION public.search_customers_for_support(text) IS
    'Employee-only search. Searches first_name, last_name, email (customer or auth.users), user_id.';

NOTIFY pgrst, 'reload schema';
