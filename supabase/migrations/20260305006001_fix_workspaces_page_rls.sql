-- ============================================================
-- Fix RLS for /support/workspaces page
-- Employees (support/owner/dev) need access to:
--   1. workspace_members — SELECT (for stats and detail view)
--   2. ad_accounts — SELECT (for stats and detail view)
--   3. ad_accounts — UPDATE (for toggle is_active)
-- ============================================================

-- workspace_members: employee SELECT
CREATE POLICY "Employees can view all workspace members"
    ON public.workspace_members FOR SELECT
    USING (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
        OR public.has_employee_role(auth.uid(), 'dev')
    );

-- ad_accounts: employee SELECT
-- (The old "Admins can view all ad accounts" policy uses has_role(..., 'admin')
--  which is broken since admin was renamed to dev. Adding a correct employee policy.)
CREATE POLICY "Employees can view all ad accounts"
    ON public.ad_accounts FOR SELECT
    USING (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
        OR public.has_employee_role(auth.uid(), 'dev')
    );

-- ad_accounts: employee UPDATE (for toggling is_active)
CREATE POLICY "Support employees can update ad accounts"
    ON public.ad_accounts FOR UPDATE
    USING (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
        OR public.has_employee_role(auth.uid(), 'dev')
    );
