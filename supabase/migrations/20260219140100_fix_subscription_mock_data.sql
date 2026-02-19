-- ============================================================
-- Fix: Subscription Mock Data Cleanup
-- Problem: Previous seed (Part 10) created 80 active subscriptions
--          by looping 30 users in round-robin, giving each user
--          multiple subscriptions (violates 1-user-1-active rule).
-- Solution:
--   Step 1: Delete ALL mock subscriptions (keep only those created
--           directly by real users via the app, i.e. payment_method_id
--           is NOT 'stripe' mock, OR keep rows with no payment_transactions).
--           Since mock data used gateway='stripe' and real user subs use
--           gateway='mock', we can distinguish them.
--           Safest: delete all subscriptions not linked to a real invoice,
--           then re-seed cleanly.
--   Step 2: Re-seed so every auth user gets AT MOST 1 subscription,
--           with realistic plan distribution.
-- ============================================================

-- Step 1: Remove all mock-seeded subscriptions
-- Mock subscriptions were inserted with generated UUIDs directly.
-- Real subscriptions (created by user in app) have a matching invoice.
-- We delete subscriptions that have NO invoice linked.
DELETE FROM public.subscriptions
WHERE id NOT IN (
  SELECT subscription_id FROM public.invoices
  WHERE subscription_id IS NOT NULL
);

-- Step 2: Re-seed subscriptions -- 1 per customer only
-- Assign realistic plan distribution:
--   Free (no sub):  ~40% of users get no subscription
--   Pro:            ~40% of users
--   Team:           ~20% of users
-- Spread created_at over past 12 months for realistic survival/cohort data.
DO $$
DECLARE
  v_user         record;
  v_plan_pro     uuid := '5b000002-0000-0000-0000-000000000002';
  v_plan_team    uuid := '5b000003-0000-0000-0000-000000000003';
  v_plan_id      uuid;
  v_rnd          float;
  v_days_ago     int;
  v_created_at   timestamptz;
  v_period_end   timestamptz;
  v_cycle        text;
  v_count_active int := 0;
  v_count_skip   int := 0;
BEGIN
  FOR v_user IN
    SELECT id FROM auth.users ORDER BY created_at
  LOOP
    -- Skip if this user already has an active subscription (real one from app)
    IF EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = v_user.id AND status = 'active'
    ) THEN
      v_count_skip := v_count_skip + 1;
      CONTINUE;
    END IF;

    v_rnd := random();

    -- 40% get no subscription (Free tier)
    IF v_rnd < 0.4 THEN
      CONTINUE;
    END IF;

    -- 60% get a subscription: 67% Pro, 33% Team (= 40% Pro, 20% Team of all users)
    IF v_rnd < 0.734 THEN
      v_plan_id := v_plan_pro;
    ELSE
      v_plan_id := v_plan_team;
    END IF;

    -- Random creation date within past 12 months
    v_days_ago   := (floor(random() * 365) + 1)::int;
    v_created_at := NOW() - (v_days_ago || ' days')::interval;
    v_cycle      := CASE WHEN random() < 0.7 THEN 'monthly' ELSE 'yearly' END;
    v_period_end := CASE
      WHEN v_cycle = 'yearly'  THEN v_created_at + INTERVAL '1 year'
      ELSE                          v_created_at + INTERVAL '1 month'
    END;

    INSERT INTO public.subscriptions (
      id, user_id, plan_id, status, billing_cycle,
      current_period_start, current_period_end,
      cancel_at_period_end, cancelled_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user.id,
      v_plan_id,
      'active',
      v_cycle,
      v_created_at,
      v_period_end,
      false,
      NULL,
      v_created_at,
      v_created_at
    ) ON CONFLICT DO NOTHING;

    v_count_active := v_count_active + 1;
  END LOOP;

  RAISE NOTICE 'Subscription re-seed: % active subscriptions created, % users skipped (already had real subscription).',
    v_count_active, v_count_skip;
END $$;

-- Step 3: Add a small set of cancelled subscriptions for churn/survival analysis
-- These are separate historical users who already had their subscription cancelled.
-- Only add cancelled subs for users who have NO current active subscription.
DO $$
DECLARE
  v_user       record;
  v_plan_id    uuid;
  v_days_ago   int;
  v_created_at timestamptz;
  v_cancel_at  timestamptz;
  v_count      int := 0;
BEGIN
  FOR v_user IN
    SELECT id FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM public.subscriptions WHERE status = 'active')
    ORDER BY random()
    LIMIT 10
  LOOP
    v_days_ago   := (floor(random() * 300) + 60)::int;
    v_created_at := NOW() - (v_days_ago || ' days')::interval;
    v_cancel_at  := v_created_at + ((floor(random() * (v_days_ago - 30)) + 30) || ' days')::interval;
    v_plan_id    := CASE WHEN random() < 0.7
                    THEN '5b000002-0000-0000-0000-000000000002'  -- Pro
                    ELSE '5b000003-0000-0000-0000-000000000003'  -- Team
                    END;

    INSERT INTO public.subscriptions (
      id, user_id, plan_id, status, billing_cycle,
      current_period_start, current_period_end,
      cancel_at_period_end, cancelled_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user.id,
      v_plan_id,
      'cancelled',
      'monthly',
      v_created_at,
      v_created_at + INTERVAL '1 month',
      false,
      v_cancel_at,
      v_created_at,
      v_cancel_at
    ) ON CONFLICT DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  RAISE NOTICE 'Churn simulation: % cancelled subscriptions added.', v_count;
END $$;

DO $$ BEGIN
  RAISE NOTICE '✅ Subscription mock data fixed: 1 subscription per user, realistic distribution.';
END $$;
