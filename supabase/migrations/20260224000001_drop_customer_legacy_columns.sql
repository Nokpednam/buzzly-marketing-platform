-- =======================================================================
-- Drop unused / deprecated columns from customer table
-- This data is now managed properly via profile_customers, loyalty_points, and payment_transactions
-- =======================================================================

ALTER TABLE public.customer
DROP COLUMN IF EXISTS loyalty_tier_id,
DROP COLUMN IF EXISTS loyalty_points_balance,
DROP COLUMN IF EXISTS total_spend_amount,
DROP COLUMN IF EXISTS member_since,
DROP COLUMN IF EXISTS subscription_credit_balance;
