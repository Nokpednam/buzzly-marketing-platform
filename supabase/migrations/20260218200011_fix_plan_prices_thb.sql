-- ============================================================
-- Fix Subscription Plan Prices to THB
-- Updates existing plans to use realistic THB pricing
-- Pro: ฿999/mo (฿9,990/yr), Team: ฿2,499/mo (฿24,990/yr)
-- ============================================================

UPDATE public.subscription_plans
SET price_monthly = 999.00,
    price_yearly  = 9990.00
WHERE id = '5b000002-0000-0000-0000-000000000002'; -- Pro

UPDATE public.subscription_plans
SET price_monthly = 2499.00,
    price_yearly  = 24990.00
WHERE id = '5b000003-0000-0000-0000-000000000003'; -- Team

DO $$ BEGIN RAISE NOTICE '✅ Subscription plan prices updated to THB (Pro: ฿999/mo, Team: ฿2,499/mo).'; END $$;
