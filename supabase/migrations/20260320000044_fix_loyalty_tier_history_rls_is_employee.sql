-- ============================================================================
-- Migration: Fix loyalty_tier_history RLS — use is_employee() like profile_customers
-- Timestamp: 20260320000044
--
-- Problem: employees_can_read_tier_history uses employees_profile join.
--          Support users without employees_profile cannot read tier history.
--          Result: RPC inserts succeed, but SELECT returns empty → tier changes
--          don't appear in the UI.
--
-- Fix: Replace with is_employee() policy (same as profile_customers 20260320000036).
-- ============================================================================

DROP POLICY IF EXISTS "employees_can_read_tier_history" ON public.loyalty_tier_history;
DROP POLICY IF EXISTS "Employees can view all tier history" ON public.loyalty_tier_history;

CREATE POLICY "employees_can_read_tier_history"
ON public.loyalty_tier_history
FOR SELECT
TO authenticated
USING (public.is_employee(auth.uid()));

COMMENT ON POLICY "employees_can_read_tier_history" ON public.loyalty_tier_history IS
  'Support/dev/owner can read all tier history for Tier Management page. Uses is_employee() (employees table only).';

NOTIFY pgrst, 'reload schema';
