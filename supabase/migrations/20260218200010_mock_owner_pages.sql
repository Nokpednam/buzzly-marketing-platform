-- ============================================================
-- Mock Data Part 10: Owner Pages Realistic Data (v2.1 - Fix Duplicates)
-- Fixes: /owner/business-performance (all tabs) and /owner/customer-tiers
--
-- CHANGES:
-- Uses UPDATE-or-DELETE pattern to handle existing subscriptions from
-- unified-seed.sql instead of INSERTing duplicates.
-- Ensures strict 1-user-1-subscription rule.
-- ============================================================

-- ============================================================
-- PART A: Subscriptions with realistic cancelled_at
-- Logic:
-- 1. Loop through all users
-- 2. Randomly decide if they should have a sub (60%)
-- 3. If YES: Update existing sub (to preserve ID/FKs) or Insert new
-- 4. If NO: Delete existing sub (and cascading dependencies if needed)
-- ============================================================
DO $$
DECLARE
  v_user        record;
  v_sub_id      uuid;
  v_plan_pro    uuid := '5b000002-0000-0000-0000-000000000002';
  v_plan_team   uuid := '5b000003-0000-0000-0000-000000000003';
  v_plan_id     uuid;
  v_created_at  timestamptz;
  v_period_end  timestamptz;
  v_days_ago    int;
  v_rnd         float;
  v_status      text;
  v_cancelled_at timestamptz;
  v_cancel_days int;
  v_cycle       text;
  v_count_upd   int := 0;
  v_count_new   int := 0;
  v_count_del   int := 0;
BEGIN
  -- Loop through ALL users
  FOR v_user IN SELECT id FROM auth.users ORDER BY created_at LOOP
    v_rnd := random();
    
    -- Check if subscription already exists for this user (from unified-seed)
    SELECT id INTO v_sub_id FROM public.subscriptions WHERE user_id = v_user.id LIMIT 1;

    -- DECISION: 40% chance user has NO subscription (Freemium)
    IF v_rnd < 0.4 THEN
      IF v_sub_id IS NOT NULL THEN
        -- Delete dependencies first to satisfy FKs (Invoices, Transactions)
        DELETE FROM public.invoices WHERE subscription_id = v_sub_id;
        DELETE FROM public.payment_transactions WHERE subscription_id = v_sub_id;
        
        -- Delete the subscription
        DELETE FROM public.subscriptions WHERE id = v_sub_id;
        v_count_del := v_count_del + 1;
      END IF;
      CONTINUE; -- Next user
    END IF;

    -- DECISION: User GETS a subscription
    -- Determine Plan (60% Pro, 40% Team)
    v_plan_id := CASE WHEN random() < 0.6 THEN v_plan_pro ELSE v_plan_team END;
    
    -- Determine Lifecycle (80% Active, 20% Churned)
    IF random() < 0.8 THEN
      v_status := 'active';
      v_cancelled_at := NULL;
    ELSE
      v_status := 'cancelled';
    END IF;

    -- Created date (1-365 days ago)
    v_days_ago   := (floor(random() * 365) + 1)::int;
    v_created_at := NOW() - (v_days_ago || ' days')::interval;

    -- Billing Cycle
    v_cycle := CASE WHEN random() < 0.7 THEN 'monthly' ELSE 'yearly' END;
    v_period_end := CASE 
      WHEN v_cycle = 'yearly' THEN v_created_at + INTERVAL '1 year'
      ELSE                         v_created_at + INTERVAL '1 month'
    END;

    -- If cancelled, set cancelled_at
    IF v_status = 'cancelled' THEN
      v_cancel_days := (floor(random() * (v_days_ago - 30)) + 30)::int;
      IF v_cancel_days < 1 THEN v_cancel_days := 1; END IF;
      v_cancelled_at := v_created_at + (v_cancel_days || ' days')::interval;
      IF v_cancelled_at > NOW() THEN v_cancelled_at := NOW(); END IF;
    END IF;

    IF v_sub_id IS NOT NULL THEN
      -- UPDATE Existing
      UPDATE public.subscriptions SET
        plan_id = v_plan_id,
        status = v_status,
        billing_cycle = v_cycle,
        current_period_start = v_created_at,
        current_period_end = v_period_end,
        cancel_at_period_end = false,
        cancelled_at = v_cancelled_at,
        created_at = v_created_at,
        updated_at = NOW()
      WHERE id = v_sub_id;
      v_count_upd := v_count_upd + 1;
    ELSE
      -- INSERT New
      INSERT INTO public.subscriptions (
        id, user_id, plan_id, status, billing_cycle,
        current_period_start, current_period_end,
        cancel_at_period_end, cancelled_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_user.id,
        v_plan_id,
        v_status,
        v_cycle,
        v_created_at,
        v_period_end,
        false,
        v_cancelled_at,
        v_created_at,
        v_created_at
      );
      v_count_new := v_count_new + 1;
    END IF;

  END LOOP;

  RAISE NOTICE 'Part A: Subscriptions finalized. Updated: %, New: %, Deleted: %', v_count_upd, v_count_new, v_count_del;
END $$;

-- ============================================================
-- PART B: Payment Transactions (12 months of MRR data, THB)
-- Realistic SaaS growth: ฿80,000 → ฿150,000 over 12 months
-- Pro plan = ฿999/mo, Team plan = ฿2,499/mo
-- ~30-55 transactions per month
--
-- NOTE: We wipe existing transactions to ensure clean MRR data
-- ============================================================
DO $$
DECLARE
  v_users       uuid[];
  v_user_id     uuid;
  v_currency_id uuid := 'c0000002-0000-0000-0000-000000000002'; -- THB
  v_month       int;
  v_tx_count    int;
  v_amount      numeric;
  i             int;
  v_tx_date     timestamptz;
BEGIN
  -- Clear all existing transactions (from unified-seed) to avoid pollution
  DELETE FROM public.payment_transactions;

  SELECT ARRAY(SELECT id FROM auth.users ORDER BY created_at LIMIT 100) INTO v_users;

  IF v_users IS NULL OR array_length(v_users, 1) IS NULL THEN
    RAISE WARNING 'Part B: No auth.users found, skipping payment_transactions seed.';
    RETURN;
  END IF;

  -- Loop through 12 months (month 11 = 11 months ago, month 0 = current month)
  FOR v_month IN REVERSE 11..0 LOOP
    -- Realistic growth: start at ~30 transactions, grow to ~55
    v_tx_count := (30 + floor((11 - v_month) * 2.2) + floor(random() * 8))::int;

    FOR i IN 1..v_tx_count LOOP
      v_user_id := v_users[1 + ((i - 1) % array_length(v_users, 1))];

      -- Random day within that month
      v_tx_date := date_trunc('month', NOW() - (v_month || ' months')::interval)
                   + (floor(random() * 28) || ' days')::interval
                   + (floor(random() * 23) || ' hours')::interval;

      -- Amount: 70% Pro (฿999), 30% Team (฿2,499), with small random variance
      v_amount := CASE
        WHEN random() < 0.7 THEN 999.00 + (random() * 50 - 25)::numeric
        ELSE 2499.00 + (random() * 100 - 50)::numeric
      END;
      v_amount := round(v_amount, 2);

      INSERT INTO public.payment_transactions (
        id, user_id, amount, currency_id, status,
        payment_gateway, transaction_type, created_at
      ) VALUES (
        gen_random_uuid(),
        v_user.id,
        v_amount,
        v_currency_id,
        'completed',
        'stripe',
        'subscription_payment',
        v_tx_date
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Part B: Payment Transactions seeded (12 months of THB MRR data).';
END $$;

-- ============================================================
-- PART C: Loyalty Points Backfill
-- Distribution: Bronze 55%, Silver 25%, Gold 15%, Platinum 5%
-- ============================================================
DO $$
DECLARE
  v_pc          record;
  v_lp_id       uuid;
  v_tier_id     uuid;
  v_rnd         float;
  v_points      int;
  v_total_pts   int;
  -- Tier IDs from static seed
  v_bronze      uuid := '17000001-0000-0000-0000-000000000001';
  v_silver      uuid := '17000002-0000-0000-0000-000000000002';
  v_gold        uuid := '17000003-0000-0000-0000-000000000003';
  v_platinum    uuid := '17000004-0000-0000-0000-000000000004';
BEGIN
  FOR v_pc IN
    SELECT id, user_id
    FROM public.profile_customers
    WHERE loyalty_point_id IS NULL
  LOOP
    v_rnd := random();

    -- Assign tier based on distribution
    IF v_rnd < 0.55 THEN
      v_tier_id   := v_bronze;
      v_points    := (floor(random() * 499))::int;          -- 0–499 pts
      v_total_pts := v_points + (floor(random() * 200))::int;
    ELSIF v_rnd < 0.80 THEN
      v_tier_id   := v_silver;
      v_points    := (500 + floor(random() * 1499))::int;   -- 500–1999 pts
      v_total_pts := v_points + (floor(random() * 500))::int;
    ELSIF v_rnd < 0.95 THEN
      v_tier_id   := v_gold;
      v_points    := (2000 + floor(random() * 2999))::int;  -- 2000–4999 pts
      v_total_pts := v_points + (floor(random() * 1000))::int;
    ELSE
      v_tier_id   := v_platinum;
      v_points    := (5000 + floor(random() * 5000))::int;  -- 5000–9999 pts
      v_total_pts := v_points + (floor(random() * 2000))::int;
    END IF;

    -- Insert loyalty_points record
    v_lp_id := gen_random_uuid();
    INSERT INTO public.loyalty_points (
      id, loyalty_tier_id, point_balance, total_points_earned,
      total_points_spend, status, last_earned_at,
      created_at, updated_at
    ) VALUES (
      v_lp_id,
      v_tier_id,
      v_points,
      v_total_pts,
      v_total_pts - v_points,
      'active',
      NOW() - (floor(random() * 30) || ' days')::interval,
      NOW() - (floor(random() * 365) + 30 || ' days')::interval,
      NOW() - (floor(random() * 7) || ' days')::interval
    ) ON CONFLICT DO NOTHING;

    -- Link profile_customer to loyalty_points
    UPDATE public.profile_customers
    SET loyalty_point_id = v_lp_id,
        updated_at = NOW()
    WHERE id = v_pc.id
      AND loyalty_point_id IS NULL;

  END LOOP;

  RAISE NOTICE 'Part C: Loyalty Points backfilled for all profile_customers.';
END $$;

-- ============================================================
-- PART D: Cohort Analysis — Replace with percentage-based retention
-- Deletes existing rows and re-inserts with realistic % retention
-- ============================================================
DO $$
DECLARE
  v_ws_id       uuid;
  v_cohort_size int;
  v_m1          numeric;
  v_m2          numeric;
  v_m3          numeric;
  m             int;
BEGIN
  SELECT id INTO v_ws_id FROM public.workspaces ORDER BY created_at LIMIT 1;

  IF v_ws_id IS NULL THEN
    RAISE WARNING 'Part D: No workspace found, skipping cohort_analysis seed.';
    RETURN;
  END IF;

  -- Remove old cohort data for this workspace (both absolute-count and old % data)
  DELETE FROM public.cohort_analysis WHERE team_id = v_ws_id;

  -- Insert 8 months of cohort data with PERCENTAGE retention
  FOR m IN 0..7 LOOP
    v_cohort_size := (80 + floor(random() * 120))::int;  -- 80–200 users per cohort

    -- Realistic SaaS retention percentages (declining each month)
    v_m1 := round((72 + random() * 18)::numeric, 1);                          -- 72–90%
    v_m2 := round((v_m1 * (0.70 + random() * 0.10))::numeric, 1);             -- ~70–80% of M1
    v_m3 := round((v_m2 * (0.70 + random() * 0.10))::numeric, 1);             -- ~70–80% of M2

    INSERT INTO public.cohort_analysis (
      id, team_id, cohort_date, cohort_type, cohort_size,
      retention_data, revenue_data, average_retention, churn_rate,
      created_at
    ) VALUES (
      gen_random_uuid(),
      v_ws_id,
      date_trunc('month', CURRENT_DATE - (m * INTERVAL '1 month'))::date,
      'monthly',
      v_cohort_size,
      jsonb_build_object(
        'month_1', v_m1,
        'month_2', v_m2,
        'month_3', v_m3
      ),
      jsonb_build_object(
        'month_1', round((v_cohort_size * 999 * (v_m1 / 100))::numeric, 2),
        'month_2', round((v_cohort_size * 999 * (v_m2 / 100))::numeric, 2),
        'month_3', round((v_cohort_size * 999 * (v_m3 / 100))::numeric, 2)
      ),
      round(((v_m1 + v_m2 + v_m3) / 3)::numeric, 2),
      round((100 - v_m1)::numeric, 2),
      NOW() - (m * INTERVAL '1 month')
    );
  END LOOP;

  RAISE NOTICE 'Part D: Cohort Analysis seeded (8 months, percentage-based retention).';
END $$;

-- ============================================================
-- PART E: Also fix existing cohort_analysis rows from old seed
-- ============================================================
DO $$
DECLARE
  v_row   record;
  v_m1    numeric;
  v_m2    numeric;
  v_m3    numeric;
  v_size  int;
BEGIN
  FOR v_row IN
    SELECT id, cohort_size, retention_data
    FROM public.cohort_analysis
    WHERE (retention_data->>'month_1')::numeric > 100
  LOOP
    v_size := GREATEST(v_row.cohort_size, 1);
    v_m1 := round(((v_row.retention_data->>'month_1')::numeric / v_size * 100)::numeric, 1);
    v_m2 := round(((v_row.retention_data->>'month_2')::numeric / v_size * 100)::numeric, 1);
    v_m3 := round(((v_row.retention_data->>'month_3')::numeric / v_size * 100)::numeric, 1);

    UPDATE public.cohort_analysis
    SET retention_data = jsonb_build_object(
      'month_1', v_m1,
      'month_2', v_m2,
      'month_3', v_m3
    )
    WHERE id = v_row.id;
  END LOOP;

  RAISE NOTICE 'Part E: Converted absolute-count cohort rows to percentages.';
END $$;

DO $$ BEGIN RAISE NOTICE '✅ Part 10 (v2.1): Owner Pages Mock Data seeded successfully (Clean Update)!'; END $$;
