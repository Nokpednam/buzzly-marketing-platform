-- ============================================================================
-- Migration: Support can read all loyalty_points
-- Timestamp: 20260318960000
--
-- Problem:  useAllCustomers hook joins loyalty_points to show each
--           customer's current tier and balance in the God-Mode dropdown.
--           RLS blocked employees from reading other users' wallets,
--           returning 0 points and null tiers.
--
-- Fix:      Add a SELECT policy on loyalty_points allowing employees
--           to read all rows, using the standard employees join.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename   = 'loyalty_points'
      AND policyname  = 'employees_can_read_all_loyalty_points'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "employees_can_read_all_loyalty_points"
      ON public.loyalty_points
      FOR SELECT
      TO authenticated
      USING (
        -- Allow if the requesting user is an employee
        EXISTS (
          SELECT 1
          FROM public.employees_profile ep
          INNER JOIN public.employees e ON e.id = ep.employees_id
          WHERE e.user_id = auth.uid()
        )
      );
    $policy$;
  END IF;
END;
$$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
