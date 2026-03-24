-- ============================================================================
-- Migration: Seed loyalty_tier_history with tier UPGRADES (not just downgrades)
-- Timestamp: 20260320000035
--
-- Problem: Tier History tab shows only downgrades from evaluate_inactivity.
--          Need realistic mix: Bronze→Silver, Silver→Gold, Gold→Platinum.
--
-- Fix: Insert seed rows into loyalty_tier_history for profile_customers
--      that have loyalty_points. Mix of upgrades and downgrades.
-- ============================================================================

DO $$
DECLARE
    r RECORD;
    v_tiers TEXT[] := ARRAY['Bronze', 'Silver', 'Gold', 'Platinum'];
    v_rand NUMERIC;
    i INT;
BEGIN
    -- For each profile_customer with loyalty_points, add 1-2 tier change events
    FOR r IN
        SELECT pc.id AS profile_customer_id, lp.id AS loyalty_points_id
        FROM public.profile_customers pc
        JOIN public.loyalty_points lp ON lp.profile_customer_id = pc.id
        ORDER BY random()
        LIMIT 50
    LOOP
        v_rand := random();

        -- 60% chance: add an UPGRADE (Bronze→Silver or Silver→Gold or Gold→Platinum)
        IF v_rand < 0.6 THEN
            -- Random upgrade path
            i := 1 + floor(random() * 3)::int;  -- 1, 2, or 3 (Bronze→Silver, Silver→Gold, Gold→Platinum)
            INSERT INTO public.loyalty_tier_history (
                profile_customer_id,
                old_tier,
                new_tier,
                change_type,
                change_reason,
                changed_at
            ) VALUES (
                r.profile_customer_id,
                v_tiers[i],
                v_tiers[i + 1],
                CASE WHEN random() < 0.3 THEN 'manual' ELSE 'auto' END,
                CASE
                    WHEN i = 1 THEN 'Points threshold reached: 500 points'
                    WHEN i = 2 THEN 'Points threshold reached: 2000 points'
                    ELSE 'VIP upgrade: 5000+ lifetime points'
                END,
                NOW() - (random() * INTERVAL '90 days')
            );
        -- 25% chance: add a downgrade (for variety)
        ELSIF v_rand < 0.85 THEN
            i := 2 + floor(random() * 2)::int;  -- 2 or 3 (Silver→Bronze or Gold→Silver)
            INSERT INTO public.loyalty_tier_history (
                profile_customer_id,
                old_tier,
                new_tier,
                change_type,
                change_reason,
                changed_at
            ) VALUES (
                r.profile_customer_id,
                v_tiers[i + 1],
                v_tiers[i],
                'auto',
                'Inactivity downgrade: no earn/redeem in 90+ days',
                NOW() - (random() * INTERVAL '90 days')
            );
        END IF;
    END LOOP;

    RAISE NOTICE 'loyalty_tier_history: seeded tier upgrades and downgrades';
END;
$$;

NOTIFY pgrst, 'reload schema';
