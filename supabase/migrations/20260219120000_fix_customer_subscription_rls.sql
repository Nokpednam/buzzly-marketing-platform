-- Migration: Fix Customer Subscription RLS + Missing Column
-- Fixes:
--   1. Add missing subscription_credit_balance column to customer table
--   2. Add RLS UPDATE policy so customers can update their own record (needed for plan_type update after payment)

-- 1. Add missing column (safe, idempotent)
ALTER TABLE public.customer
ADD COLUMN IF NOT EXISTS subscription_credit_balance NUMERIC DEFAULT 0;

-- 2. Add UPDATE policy for customers to update their own row
--    (Allows plan_type, subscription_credit_balance, updated_at to be updated by the owner)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'customer'
      AND policyname = 'Users can update their own customer profile'
  ) THEN
    CREATE POLICY "Users can update their own customer profile"
    ON public.customer
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;
