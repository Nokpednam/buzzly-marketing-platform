-- แก้ราคารายปีให้ประหยัด 17% (monthly * 12 * 0.83)
-- Pro: 999 * 12 * 0.83 = 9950
-- Team: 2499 * 12 * 0.83 = 24890
UPDATE public.subscription_plans SET price_yearly = 9950 WHERE slug = 'pro';
UPDATE public.subscription_plans SET price_yearly = 24890 WHERE slug = 'team';
