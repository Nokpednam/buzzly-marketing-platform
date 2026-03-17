-- ============================================================================
-- Migration: Drop Strict Changer FK Constraint
-- Timestamp: 20260318800000
--
-- Problem:  manual_override_customer_tier RPC fails when an employee
--           performs the override. The loyalty_tier_history_changer_id_fkey
--           forces changer_id to belong to profile_customers.
--           Employees are NOT in profile_customers, causing an insert error.
--
-- Fix:      Drop the strict foreign key constraint on changer_id.
-- ============================================================================

ALTER TABLE public.loyalty_tier_history 
DROP CONSTRAINT IF EXISTS loyalty_tier_history_changer_id_fkey;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
