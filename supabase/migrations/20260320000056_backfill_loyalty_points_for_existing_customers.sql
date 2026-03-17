-- ============================================================================
-- Migration: Backfill loyalty_points for existing customers without wallet
-- Timestamp: 20260320000056
--
-- Ensures all profile_customers have a loyalty_points row so missions can award.
-- ============================================================================

INSERT INTO public.loyalty_points (profile_customer_id, loyalty_tier_id, point_balance, lifetime_points)
SELECT pc.id,
       (SELECT id FROM public.loyalty_tiers WHERE name = 'Bronze' AND is_active = true LIMIT 1),
       0, 0
FROM public.profile_customers pc
WHERE NOT EXISTS (
    SELECT 1 FROM public.loyalty_points lp WHERE lp.profile_customer_id = pc.id
);

NOTIFY pgrst, 'reload schema';
