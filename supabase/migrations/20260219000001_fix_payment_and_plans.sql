-- Seed Payment Methods
INSERT INTO public.payment_methods (name, slug, description, is_active, display_order)
VALUES
 ('Credit/Debit Card', 'credit_card', 'Pay with Visa, Mastercard, JCB, AMEX', true, 1),
 ('Thai QR Payment', 'promptpay', 'Scan QR code to pay instantly', true, 2),
 ('Bank Transfer', 'bank_transfer', 'Direct bank transfer to company account', true, 3)
ON CONFLICT (slug) DO UPDATE
SET is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

-- Update Plan Prices for 20% Yearly Savings (Yearly = 9.6 * Monthly)
-- Pro: 999 * 9.6 = 9590.4 -> 9590
UPDATE public.subscription_plans
SET price_yearly = 9590
WHERE name = 'Pro' OR id = 'pro';

-- Team: 2499 * 9.6 = 23990.4 -> 23990
UPDATE public.subscription_plans
SET price_yearly = 23990
WHERE name = 'Team' OR id = 'team';
