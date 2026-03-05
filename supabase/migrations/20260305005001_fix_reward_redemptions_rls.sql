-- Fix RLS policies on reward_redemptions to allow support employees to:
-- 1. SELECT all redemption records (currently missing 'support' in employee policy)
-- 2. UPDATE records (fulfill / reject flow)

-- Add SELECT policy for support employees to view all redemptions
CREATE POLICY "Support employees can view all redemptions"
    ON public.reward_redemptions FOR SELECT
    USING (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
        OR public.has_employee_role(auth.uid(), 'dev')
    );

-- Add UPDATE policy for support employees (fulfill / reject)
CREATE POLICY "Support employees can update redemptions"
    ON public.reward_redemptions FOR UPDATE
    USING (
        public.has_employee_role(auth.uid(), 'support')
        OR public.has_employee_role(auth.uid(), 'owner')
        OR public.has_employee_role(auth.uid(), 'dev')
    );
