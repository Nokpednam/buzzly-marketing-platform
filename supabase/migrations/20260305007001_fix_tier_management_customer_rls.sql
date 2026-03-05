-- ============================================================
-- Fix RLS for /support/tier-management page
-- Employees (support/dev/owner) need access to the customer table:
--   1. SELECT — for customer search and displaying tier info
--   2. UPDATE — for manual tier override (updating loyalty_tier_id)
-- ============================================================

-- customer: employee SELECT
CREATE POLICY "Employees can view all customers"
    ON public.customer FOR SELECT
    USING (public.is_employee(auth.uid()));

-- customer: employee UPDATE (for manual tier override)
CREATE POLICY "Employees can update customer tier"
    ON public.customer FOR UPDATE
    USING (public.is_employee(auth.uid()));

-- tier_history: employee INSERT
-- (existing "Employees can manage tier history" uses USING only; for INSERT
--  PostgREST needs WITH CHECK — add an explicit INSERT policy to be safe)
CREATE POLICY "Employees can insert tier history"
    ON public.tier_history FOR INSERT
    WITH CHECK (public.is_employee(auth.uid()));
