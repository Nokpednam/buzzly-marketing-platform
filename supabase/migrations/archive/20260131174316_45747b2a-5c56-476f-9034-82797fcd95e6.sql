
-- ============================================================
-- DROP REDUNDANT TABLES
-- ============================================================

-- 1. Drop 'roles' table (redundant with user_roles, role_employees, role_customers)
DROP TABLE IF EXISTS public.roles CASCADE;

-- 2. Drop 'status_code' table first (depends on status_category)
DROP TABLE IF EXISTS public.status_code CASCADE;

-- 3. Drop 'status_category' table (not used - status stored as VARCHAR in other tables)
DROP TABLE IF EXISTS public.status_category CASCADE;

-- 4. Drop 'buzzly_tiers' table (redundant - loyalty_tiers has all the data and more detail)
-- First remove the FK constraint from loyalty_tiers
ALTER TABLE public.loyalty_tiers DROP CONSTRAINT IF EXISTS loyalty_tiers_buzzly_tier_id_fkey;
ALTER TABLE public.loyalty_tiers DROP COLUMN IF EXISTS buzzly_tier_id;

DROP TABLE IF EXISTS public.buzzly_tiers CASCADE;
