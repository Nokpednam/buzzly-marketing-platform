-- ============================================================================
-- Migration: Fix Support Search — permission_denied: employees only
-- Timestamp: 20260320000041
--
-- Problem: Support users get "permission_denied: employees only" when searching
--          in Tier Management, even though Support is in employees table.
--
-- Fix:     1. Make is_employee() case-insensitive for status/approval_status
--          2. Make has_employee_role() case-insensitive for role_name
--          3. search_customers_for_support: use has_employee_role for support,
--             owner, dev explicitly (same roles that can access tier-management)
-- ============================================================================

-- ─── 1. is_employee: case-insensitive status/approval_status ─────────────────

CREATE OR REPLACE FUNCTION public.is_employee(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.employees
        WHERE user_id = _user_id
        AND LOWER(COALESCE(status, '')) = 'active'
        AND LOWER(COALESCE(approval_status, '')) = 'approved'
    )
$$;

-- ─── 2. has_employee_role: case-insensitive role_name ───────────────────────

CREATE OR REPLACE FUNCTION public.has_employee_role(_user_id uuid, _role_name character varying)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.employees e
        JOIN public.role_employees r ON e.role_employees_id = r.id
        WHERE e.user_id = _user_id
        AND LOWER(COALESCE(e.status, '')) = 'active'
        AND LOWER(COALESCE(e.approval_status, '')) = 'approved'
        AND LOWER(TRIM(r.role_name)) = LOWER(TRIM(_role_name))
    )
$$;

-- ─── 3. search_customers_for_support: allow support, owner, dev ──────────────

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

    -- Support, Owner, Dev (same roles that can access /support/tier-management)
    IF NOT (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
        OR public.has_employee_role(auth.uid(), 'dev')
        OR public.is_employee(auth.uid())
    ) THEN
        RAISE EXCEPTION 'permission_denied: employees only';
    END IF;

    p_query := trim(p_query);
    IF length(p_query) < 1 THEN
        RETURN;
    END IF;

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
    'Support/Owner/Dev: search customers by name, email, user_id. Uses has_employee_role for support, owner, dev.';

NOTIFY pgrst, 'reload schema';
