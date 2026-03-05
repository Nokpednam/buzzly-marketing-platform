-- Fix missing INSERT and DELETE RLS policies for support employees on:
--   1. point_earning_rules (Activity Codes)
--   2. reward_items (Rewards Catalog)
--
-- Previous migrations (20260305000000 and 20260305002001) only added
-- SELECT and UPDATE policies, leaving support employees unable to create
-- or delete records.

-- ============================================================
-- point_earning_rules: INSERT + DELETE for support employees
-- ============================================================

CREATE POLICY "Support employees can insert point earning rules"
    ON public.point_earning_rules FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND e.status = 'active'
            AND e.approval_status = 'approved'
            AND re.role_name IN ('support', 'dev', 'owner')
        )
    );

CREATE POLICY "Support employees can delete point earning rules"
    ON public.point_earning_rules FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND e.status = 'active'
            AND e.approval_status = 'approved'
            AND re.role_name IN ('support', 'dev', 'owner')
        )
    );

-- ============================================================
-- reward_items: INSERT + DELETE for support employees
-- ============================================================

CREATE POLICY "Support employees can insert reward items"
    ON public.reward_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND e.status = 'active'
            AND e.approval_status = 'approved'
            AND re.role_name IN ('support', 'dev', 'owner')
        )
    );

CREATE POLICY "Support employees can delete reward items"
    ON public.reward_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND e.status = 'active'
            AND e.approval_status = 'approved'
            AND re.role_name IN ('support', 'dev', 'owner')
        )
    );
