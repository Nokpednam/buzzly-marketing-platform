-- ============================================================================
-- Migration: Backfill Bronze→Silver for customers who already upgraded
-- Timestamp: 20260320000050
--
-- The trigger fix (49) fixes FUTURE upgrades. Customers who already upgraded
-- via points (Bronze→Silver) before the fix have no history row. Backfill.
-- ============================================================================

INSERT INTO public.loyalty_tier_history (
    profile_customer_id,
    old_tier,
    new_tier,
    change_type,
    change_reason,
    changed_at
)
SELECT
    lp.profile_customer_id,
    'Bronze',
    lt.name,
    'auto',
    'System auto-evaluated tier (backfill)',
    NOW() - (random() * INTERVAL '30 days')
FROM public.loyalty_points lp
JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
WHERE lt.name IN ('Silver', 'Gold', 'Platinum')
  AND NOT EXISTS (
      SELECT 1 FROM public.loyalty_tier_history lth
      WHERE lth.profile_customer_id = lp.profile_customer_id
        AND lth.new_tier IN ('Silver', 'Gold', 'Platinum')
  );
