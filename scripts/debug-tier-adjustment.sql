-- =============================================================================
-- Debug: Tier Adjustment — run in Supabase SQL Editor to verify data flow
-- =============================================================================
-- Replace YOUR_CUSTOMER_USER_ID with the auth.uid() of the test customer
-- (get from auth.users or from the Adjust Tier dropdown when you select the customer)

-- 1. Check profile_customers exists for the customer
SELECT pc.id AS profile_id, pc.user_id, pc.first_name, pc.last_name
FROM profile_customers pc
WHERE pc.user_id = 'YOUR_CUSTOMER_USER_ID'::uuid;

-- 2. Check loyalty_points for that profile
SELECT lp.id, lp.profile_customer_id, lp.loyalty_tier_id, lp.point_balance, lp.manual_override_at,
       lt.name AS tier_name
FROM loyalty_points lp
LEFT JOIN loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
WHERE lp.profile_customer_id IN (
  SELECT id FROM profile_customers WHERE user_id = 'YOUR_CUSTOMER_USER_ID'::uuid
);

-- 3. Check loyalty_tier_history for recent manual overrides
SELECT lth.*, pc.user_id
FROM loyalty_tier_history lth
JOIN profile_customers pc ON pc.id = lth.profile_customer_id
WHERE pc.user_id = 'YOUR_CUSTOMER_USER_ID'::uuid
ORDER BY lth.changed_at DESC
LIMIT 5;

-- 4. List loyalty_tiers (to verify tier names match)
SELECT id, name, is_active FROM loyalty_tiers ORDER BY priority_level;
