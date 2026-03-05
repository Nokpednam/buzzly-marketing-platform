-- Fix RLS policies on point_earning_rules to allow support employees to:
-- 1. SELECT all records (not just active ones)
-- 2. UPDATE records (toggle status, change points_reward)

-- Add SELECT policy for employees (support, owner, dev, admin) to see ALL rules
CREATE POLICY "Employees can view all point earning rules"
    ON public.point_earning_rules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND e.status = 'active'
            AND e.approval_status = 'approved'
            AND re.role_name IN ('support', 'admin', 'owner', 'dev')
        )
    );

-- Add UPDATE policy for support employees (they need to toggle status and update reward points)
CREATE POLICY "Support employees can update point earning rules"
    ON public.point_earning_rules FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND e.status = 'active'
            AND e.approval_status = 'approved'
            AND re.role_name IN ('support', 'admin', 'owner', 'dev')
        )
    );
