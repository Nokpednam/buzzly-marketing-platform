-- ============================================================
-- Fix: Employee Signup RLS Policies
-- Timestamp: 20260316150000
--
-- Problem:
--   The `rename_admin_role_to_dev` migration (20260305003001) dropped
--   "Admin can manage employees_profile" and "Dev can manage
--   employees_profile" but did NOT add a replacement ALL-permissions
--   policy. This leaves a gap where:
--     1. `employees` INSERT works via "Allow employee self-registration"
--        policy, but only when auth.uid() = user_id.
--     2. `employees_profile` INSERT works via "Allow employee profile
--        creation" policy, but only when the employees row already
--        exists AND e.user_id = auth.uid().
--
--   These are structurally correct for the SECURITY DEFINER trigger
--   path (which runs as postgres and bypasses RLS entirely). However,
--   if the trigger's EXCEPTION block silently swallows errors and the
--   client never gets a profile row, there is no client-side fallback
--   because RLS blocks any re-insertion attempt.
--
--   This migration:
--     1. Idempotently recreates the employees self-registration INSERT
--        policy (guards against any prior drop).
--     2. Idempotently recreates the employees_profile self-insert
--        policy using the correct linkage condition.
--     3. Adds a new broad "Dev or Owner can manage employees_profile"
--        ALL policy (equivalent to the one that was dropped in
--        20260305003001) so dev/owner employees can manage profiles.
-- ============================================================

-- ── 1. employees — ensure self-registration INSERT policy exists ──────────
DROP POLICY IF EXISTS "Allow employee self-registration" ON public.employees;

CREATE POLICY "Allow employee self-registration"
  ON public.employees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── 2. employees_profile — recreate INSERT policy ────────────────────────
DROP POLICY IF EXISTS "Allow employee profile creation" ON public.employees_profile;

CREATE POLICY "Allow employee profile creation"
  ON public.employees_profile FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.employees e
      WHERE e.id = employees_profile.employees_id
        AND e.user_id = auth.uid()
    )
  );

-- ── 3. employees_profile — restore missing Dev/Owner ALL-manage policy ────
--   This was dropped in 20260305003001 but never recreated.
DROP POLICY IF EXISTS "Dev or Owner can manage employees_profile" ON public.employees_profile;

CREATE POLICY "Dev or Owner can manage employees_profile"
  ON public.employees_profile FOR ALL
  TO authenticated
  USING (
    public.has_employee_role(auth.uid(), 'dev')
    OR public.has_employee_role(auth.uid(), 'owner')
  )
  WITH CHECK (
    public.has_employee_role(auth.uid(), 'dev')
    OR public.has_employee_role(auth.uid(), 'owner')
  );
