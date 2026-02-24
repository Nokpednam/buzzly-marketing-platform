-- =======================================================================
-- Add missing foreign keys for loyalty-related tables
-- This enables PostgREST to perform automatic joins to the customer table
-- =======================================================================

-- 1. tier_history -> customer
ALTER TABLE public.tier_history
ADD CONSTRAINT tier_history_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.customer(id) ON DELETE CASCADE;

-- 2. tier_history -> customer (changer)
ALTER TABLE public.tier_history
ADD CONSTRAINT tier_history_changed_by_fkey 
FOREIGN KEY (changed_by) REFERENCES public.customer(id) ON DELETE SET NULL;

-- 3. points_transactions -> customer
ALTER TABLE public.points_transactions
ADD CONSTRAINT points_transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.customer(id) ON DELETE CASCADE;

-- 4. suspicious_activities -> customer
ALTER TABLE public.suspicious_activities
ADD CONSTRAINT suspicious_activities_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.customer(id) ON DELETE CASCADE;
