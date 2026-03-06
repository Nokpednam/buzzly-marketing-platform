-- Migration: Drop confirmed-unused tables
-- Date: 2026-03-07
-- Purpose: Clean up tables that have no frontend code reading or writing to them.
--          Verified via grep across src/ on 2026-03-07.

-- ============================================================
-- SAFETY CHECK: Run these SELECTs first before executing DROP
-- ============================================================
-- SELECT COUNT(*) FROM public.role_customers;       -- Expect: 0 or seed data only
-- SELECT COUNT(*) FROM public.customer_insights;    -- Expect: 0 or old signup data
-- ============================================================

-- 1. role_customers
--    Reason: No query in src/ references this table. RLS exists but no frontend uses it.
--    No FK dependencies confirmed.
DROP TABLE IF EXISTS public.role_customers CASCADE;

-- 2. customer_insights
--    Reason: Originally stored profession/salary from signup form.
--    This data is now captured in:
--      - profile_customers.salary_range
--      - customer_personas (profession, company_size, salary_range fields)
--    No query in src/ references this table (verified grep: 0 results).
DROP TABLE IF EXISTS public.customer_insights CASCADE;

-- Add note to consolidated schema comments (documentation only)
-- Tables dropped: role_customers, customer_insights
-- Date: 2026-03-07
-- Reason: Dead tables with no active frontend usage
