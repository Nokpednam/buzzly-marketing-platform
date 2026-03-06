-- =======================================================================
-- Platform Discounts: Remove team_id scoping, add employee RLS policies
--
-- Context: Discounts are platform-level codes issued by Buzzly (support/owner
-- employees) that customers collect from notifications and apply at subscription
-- checkout. They are NOT scoped to any customer workspace.
-- =======================================================================

-- -----------------------------------------------------------------------
-- 1. Drop ALL existing policies that reference team_id FIRST,
--    so the column drop below succeeds without dependency errors.
-- -----------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their team discounts" ON public.discounts;
DROP POLICY IF EXISTS "Users can insert their team discounts" ON public.discounts;
DROP POLICY IF EXISTS "Users can update their team discounts" ON public.discounts;
DROP POLICY IF EXISTS "Users can delete their team discounts" ON public.discounts;
DROP POLICY IF EXISTS "Admins can manage discounts" ON public.discounts;
DROP POLICY IF EXISTS "admin_owner_manage" ON public.discounts;

-- -----------------------------------------------------------------------
-- 2. Now safe to drop team_id column
-- -----------------------------------------------------------------------
ALTER TABLE public.discounts
    DROP CONSTRAINT IF EXISTS discounts_team_id_fkey,
    DROP COLUMN IF EXISTS team_id;

-- -----------------------------------------------------------------------
-- 3. Add employee management policies using has_employee_role()
--    (Support + owner can do full CRUD; dev can read for monitoring)
-- -----------------------------------------------------------------------

-- SELECT: support, owner, dev can read all discounts (including unpublished drafts)
CREATE POLICY "Employees can view all discounts"
    ON public.discounts
    FOR SELECT
    TO authenticated
    USING (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
        OR public.has_employee_role(auth.uid(), 'dev')
    );

-- INSERT: support and owner can create discount codes
CREATE POLICY "Employees can create discounts"
    ON public.discounts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
    );

-- UPDATE: support and owner can edit/toggle/publish discounts
CREATE POLICY "Employees can update discounts"
    ON public.discounts
    FOR UPDATE
    TO authenticated
    USING (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
    )
    WITH CHECK (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
    );

-- DELETE: support and owner can remove discount codes
CREATE POLICY "Employees can delete discounts"
    ON public.discounts
    FOR DELETE
    TO authenticated
    USING (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
    );
