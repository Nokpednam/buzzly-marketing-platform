-- ============================================================
-- Ensure FK constraints from tier_history / points_transactions
-- to the customer table exist (originally added in 20260224000002
-- but may have failed if orphaned rows were present at that time).
--
-- Steps:
--   1. Null-out changed_by values that have no matching customer row
--   2. Delete tier_history rows whose user_id has no customer row
--   3. Delete points_transactions rows whose user_id has no customer row
--   4. Add constraints only if they don't exist yet (idempotent)
-- ============================================================

-- 1. Null-out orphaned changed_by references
UPDATE public.tier_history
SET changed_by = NULL
WHERE changed_by IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.customer WHERE id = tier_history.changed_by);

-- 2. Remove tier_history rows whose user_id has no customer row
--    (these are orphaned mock-data rows that would prevent FK creation)
DELETE FROM public.tier_history
WHERE NOT EXISTS (SELECT 1 FROM public.customer WHERE id = tier_history.user_id);

-- 3. Remove points_transactions rows whose user_id has no customer row
DELETE FROM public.points_transactions
WHERE NOT EXISTS (SELECT 1 FROM public.customer WHERE id = points_transactions.user_id);

-- 4. Add FK constraints (idempotent via DO block)
DO $$
BEGIN
    -- tier_history -> customer (user)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'tier_history_user_id_fkey'
          AND table_name        = 'tier_history'
          AND table_schema      = 'public'
    ) THEN
        ALTER TABLE public.tier_history
        ADD CONSTRAINT tier_history_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.customer(id) ON DELETE CASCADE;
    END IF;

    -- tier_history -> customer (changer)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'tier_history_changed_by_fkey'
          AND table_name        = 'tier_history'
          AND table_schema      = 'public'
    ) THEN
        ALTER TABLE public.tier_history
        ADD CONSTRAINT tier_history_changed_by_fkey
        FOREIGN KEY (changed_by) REFERENCES public.customer(id) ON DELETE SET NULL;
    END IF;

    -- points_transactions -> customer
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'points_transactions_user_id_fkey'
          AND table_name        = 'points_transactions'
          AND table_schema      = 'public'
    ) THEN
        ALTER TABLE public.points_transactions
        ADD CONSTRAINT points_transactions_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.customer(id) ON DELETE CASCADE;
    END IF;
END $$;
