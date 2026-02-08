-- ==========================================
-- Subscription Schema Optimization
-- Drop unused subscription_orders table
-- Add performance indexes
-- ==========================================

-- Step 1: Drop subscription_orders table (not used in code)
DROP TABLE IF EXISTS public.subscription_orders CASCADE;

-- Step 1.5: Add tier column to subscription_plans (needed for upgrade/downgrade logic)
-- This was in fix_bug.sql but that file is skipped due to naming
ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS tier INTEGER NOT NULL DEFAULT 1;

-- Add constraint for tier
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_plans_tier_positive'
    ) THEN
        ALTER TABLE public.subscription_plans 
        ADD CONSTRAINT subscription_plans_tier_positive CHECK (tier >= 1);
    END IF;
END $$;

-- Update existing plans with proper tier values
UPDATE public.subscription_plans SET tier = 1 WHERE slug = 'free' AND tier = 1;
UPDATE public.subscription_plans SET tier = 2 WHERE slug = 'pro' AND tier = 1;
UPDATE public.subscription_plans SET tier = 3 WHERE slug = 'team' AND tier = 1;

-- Step 2: Add indexes for subscription queries
-- These indexes will significantly improve query performance

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_team_id ON public.subscriptions(team_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_cycle ON public.subscriptions(billing_cycle);

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON public.payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);

-- Subscription plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON public.subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON public.subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_tier ON public.subscription_plans(tier);

-- Step 3: Remove foreign key reference from profile_customers if exists
-- This FK pointed to the old subscription_orders table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profile_customers_subscription_order_id_fkey'
    ) THEN
        ALTER TABLE public.profile_customers DROP CONSTRAINT profile_customers_subscription_order_id_fkey;
    END IF;
END $$;

-- Step 4: Drop the subscription_order_id column from profile_customers
-- This column is not used in the current subscription flow
ALTER TABLE public.profile_customers 
DROP COLUMN IF EXISTS subscription_order_id;

-- Step 5: Add helpful comment for future developers
COMMENT ON TABLE public.subscriptions IS 'Active user subscriptions. Use this table for subscription management, not subscription_orders (deprecated).';
COMMENT ON TABLE public.payment_transactions IS 'Payment history for subscriptions. Links to subscriptions.id.';
COMMENT ON TABLE public.subscription_plans IS 'Available subscription plans (Free, Pro, Team). tier column determines upgrade path.';
