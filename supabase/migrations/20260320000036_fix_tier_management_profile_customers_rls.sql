-- ============================================================================
-- Migration: Fix profile_customers RLS for Tier Management (Search + Adjust)
-- Timestamp: 20260320000036
--
-- Problem: employees_can_read_all_profile_customers uses employees_profile join.
--          Support users might not have employees_profile → direct query fails.
--          Search and Adjust Tier both need to read profile_customers.
--
-- Fix: Add policy using is_employee() (checks employees table only).
--      Drop the old employees_profile-based policy if it blocks.
-- ============================================================================

-- Add policy: any employee (per is_employee) can SELECT all profile_customers
DROP POLICY IF EXISTS "employees_can_read_all_profile_customers" ON public.profile_customers;

CREATE POLICY "employees_can_read_all_profile_customers"
ON public.profile_customers
FOR SELECT
TO authenticated
USING (public.is_employee(auth.uid()));

COMMENT ON POLICY "employees_can_read_all_profile_customers" ON public.profile_customers IS
  'Support/dev/owner can read all customers for Tier Management search and Adjust Tier dropdown.';

NOTIFY pgrst, 'reload schema';
