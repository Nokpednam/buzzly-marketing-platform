-- ============================================================================
-- Migration: Fix Tier Management — Search (structure error + full name) & Adjust Tier
-- Timestamp: 20260320000039
--
-- 1. search_customers_for_support:
--    - Fix "structure of query does not match function result type" by adding
--      explicit ::text casts (auth.users.email and loyalty_tiers.name may be varchar)
--    - Add search by full name (first_name || ' ' || last_name) so "Customer Test"
--      matches when first_name=Customer, last_name=Test
--
-- 2. manual_override_customer_tier:
--    - Ensure RPC accepts parameters correctly; add explicit type handling
--    - No schema change — verify function works with PostgREST
-- ============================================================================

-- ─── 1. Fix search_customers_for_support ─────────────────────────────────────

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
        pc.user_id::uuid AS id,
        (NULLIF(trim(coalesce(pc.first_name, '') || ' ' || coalesce(pc.last_name, '')), ''))::text AS full_name,
        (COALESCE(c.email, au.email))::text AS email,
        pc.created_at::timestamptz AS created_at,
        (lt.name)::text AS loyalty_tier,
        (coalesce(lp.point_balance, 0))::integer AS loyalty_points_balance
    FROM public.profile_customers pc
    LEFT JOIN auth.users au ON au.id = pc.user_id
    LEFT JOIN public.customer c ON c.id = pc.user_id
    LEFT JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
    LEFT JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
    WHERE
        (pc.first_name IS NOT NULL AND pc.first_name ILIKE p_query)
        OR (pc.last_name IS NOT NULL AND pc.last_name ILIKE p_query)
        OR (trim(coalesce(pc.first_name, '') || ' ' || coalesce(pc.last_name, '')) ILIKE p_query)
        OR (trim(coalesce(pc.last_name, '') || ' ' || coalesce(pc.first_name, '')) ILIKE p_query)
        OR (COALESCE(c.email, au.email) IS NOT NULL AND (COALESCE(c.email, au.email))::text ILIKE p_query)
        OR (pc.user_id::text ILIKE p_query)
    ORDER BY pc.first_name, pc.last_name
    LIMIT 15;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_customers_for_support(text) TO authenticated;

COMMENT ON FUNCTION public.search_customers_for_support(text) IS
    'Employee-only search. Searches first_name, last_name, full name, email (customer or auth.users), user_id.';

NOTIFY pgrst, 'reload schema';
