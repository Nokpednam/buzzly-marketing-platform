-- Fix RLS policies on reward_items to allow support employees to:
-- 1. SELECT all records (not just active ones)
-- 2. UPDATE records (toggle status, change points_cost and stock_quantity)

-- Add SELECT policy for employees (support, owner, dev, admin) to see ALL reward items
CREATE POLICY "Employees can view all reward items"
    ON public.reward_items FOR SELECT
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

-- Add UPDATE policy for support employees (they need to toggle status and update points/stock)
CREATE POLICY "Support employees can update reward items"
    ON public.reward_items FOR UPDATE
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
