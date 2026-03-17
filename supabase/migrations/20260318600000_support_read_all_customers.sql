-- ===========================================================================
-- Migration: Support can read all profile_customers + loyalty_tier_history
-- Purpose:   Allows employee/support accounts to SELECT from:
--              1. profile_customers  → powers the God-Mode customer dropdown
--              2. loyalty_tier_history → powers the Tier History tabs
--
-- Note: employees_profile has NO direct user_id column.
--       Auth identity lives on the `employees` table.
--       Correct join: employees_profile → employees (via employees_id) → auth.uid()
-- ===========================================================================

-- ── Policy 1: profile_customers ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename   = 'profile_customers'
      AND policyname  = 'employees_can_read_all_profile_customers'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "employees_can_read_all_profile_customers"
      ON public.profile_customers
      FOR SELECT
      TO authenticated
      USING (
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

-- ── Policy 2: loyalty_tier_history ───────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename   = 'loyalty_tier_history'
      AND policyname  = 'employees_can_read_tier_history'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "employees_can_read_tier_history"
      ON public.loyalty_tier_history
      FOR SELECT
      TO authenticated
      USING (
        -- Employees can read all tier history rows for the support console
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
