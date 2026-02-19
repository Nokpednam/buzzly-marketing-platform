-- ============================================================
-- REALISTIC BUSINESS PERFORMANCE SEED v3
-- อิง Survival Probability Curve อย่างเคร่งครัด
-- ============================================================
-- Survival Probability targets (Kaplan-Meier):
--   Day 0:   100%
--   Day 7:    92%
--   Day 30:   80%  (month 1)
--   Day 90:   65%  (month 3)
--   Day 180:  50%  (half-year)
--   Day 365:  35%  (full year)
--
-- Revenue Model (THB):
--   Pro:  ฿990/mo  (70% paid users)
--   Team: ฿2,490/mo (30% paid users)
--   Growth: Feb 2025 → Feb 2026 (~80 → 180 paid subs)
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 0: CLEAN targeted tables
-- ============================================================
DELETE FROM public.payment_transactions;
DELETE FROM public.invoices WHERE subscription_id IN (SELECT id FROM public.subscriptions);
DELETE FROM public.subscriptions;
DELETE FROM public.customer;

-- ============================================================
-- STEP 1: Update subscription_plans to THB pricing
-- ============================================================
UPDATE public.subscription_plans
SET price_monthly = 990.00, price_yearly = 9900.00
WHERE id = '5b000002-0000-0000-0000-000000000002';

UPDATE public.subscription_plans
SET price_monthly = 2490.00, price_yearly = 24900.00
WHERE id = '5b000003-0000-0000-0000-000000000003';

-- ============================================================
-- STEP 2: Generate mock customers (300 users across 12 months)
-- Monthly acquisition: 15→52 users/month (11.5% MoM growth)
-- Month 0 = Feb 2025 (11 months ago), Month 11 = Jan 2026
-- ============================================================
DO $$
DECLARE
  v_month       int;
  v_qty         int;
  v_i           int;
  v_uid         uuid;
  v_signup_date timestamptz;
  v_day         int;
  v_count       int := 0;

  v_first text[] := ARRAY[
    'Somchai','Nattaporn','Wichai','Apirak','Thanadon','Siriporn',
    'Kanokwan','Pattanapong','Rattana','Mongkol','Tassanee','Pradit',
    'Ladda','Somsak','Chanida','Krit','Wipada','Pakorn','Narumon',
    'Suthipong','Chutima','Anuwat','Paweena','Supachai','Jirawan',
    'Alex','Sarah','Michael','Emma','David','Lisa','James','Anna',
    'Tom','Maria','John','Jennifer','Robert','Patricia','Kevin',
    'Wanlapa','Pornthip','Sompong','Niran','Apisit','Rujira','Theerayuth'
  ];
  v_last text[] := ARRAY[
    'Srisawat','Phongsathorn','Klinhom','Buathong','Saengthong',
    'Chotiwat','Rattanakorn','Piumsomboon','Kaewsri','Jandee',
    'Wilson','Johnson','Brown','Davis','Miller','Taylor','Anderson',
    'Thomas','Jackson','White','Harris','Martin','Thompson','Garcia',
    'Yodmanee','Thepwan','Charoenwong','Siriwong','Nakprasit'
  ];
  v_companies text[] := ARRAY[
    'Digital Agency Co.','TechStart Ltd.','E-Commerce Corp','Media House',
    'Retail Solutions','Marketing Pro','SocialBoost Agency','AdTech Hub',
    'Growth Studio','Brand Builders','Click Masters','Digital Surge',
    'Market Leaders','Online Pros','Campaign Kings','Data Driven Co',
    'Social Wings','Ad Wizards','Pixel Perfect','Traffic Boost',
    'Revenue Rush','Conversion Labs','Scale Fast','Lead Gen Pro',
    'Buzz Digital','Omni Media','Cloud Nine Agency','Smart Ads Co'
  ];
  v_domains text[] := ARRAY['gmail.com','outlook.com','co.th','hotmail.com','yahoo.com','icloud.com'];

BEGIN
  FOR v_month IN 0..11 LOOP
    -- Growth formula: 15 * 1.115^month → 15,17,19,21,24,27,30,33,37,41,46,52
    v_qty := GREATEST(15, ROUND(15.0 * POWER(1.115, v_month))::int);

    FOR v_i IN 1..v_qty LOOP
      v_uid := gen_random_uuid();
      v_day := (floor(random() * 27))::int;

      -- Date in the correct month (month 0 = 11 months ago, month 11 = last month)
      v_signup_date :=
        date_trunc('month', NOW() - ((11 - v_month) || ' months')::interval)::timestamptz
        + (v_day || ' days')::interval
        + (floor(random() * 20) + 1 || ' hours')::interval;

      INSERT INTO public.customer (
        id, email, full_name, company_name, plan_type,
        status, created_at, updated_at, last_active, member_since
      ) VALUES (
        v_uid,
        lower(
          v_first[1 + (v_count % array_length(v_first,1))] || '.' ||
          v_last[1 + (v_count % array_length(v_last,1))] ||
          (1000 + v_count)::text || '@' ||
          v_domains[1 + (v_count % array_length(v_domains,1))]
        ),
        v_first[1 + (v_count % array_length(v_first,1))] || ' ' ||
        v_last[1 + (v_count % array_length(v_last,1))],
        v_companies[1 + (v_count % array_length(v_companies,1))],
        -- 30% free, 70% paid
        CASE WHEN random() < 0.30 THEN 'free'
             WHEN random() < 0.70 THEN 'pro'
             ELSE 'team' END,
        'active',
        v_signup_date, v_signup_date,
        v_signup_date + (floor(random() * 7) || ' days')::interval,
        v_signup_date
      ) ON CONFLICT DO NOTHING;

      v_count := v_count + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Step 2 complete: % customers created.', v_count;
END $$;

-- ============================================================
-- STEP 3: Generate Subscriptions with Survival-aligned churn
-- Uses day-by-day hazard rates to match KM curve milestones
-- ============================================================
DO $$
DECLARE
  v_cust         record;
  v_plan_pro     uuid := '5b000002-0000-0000-0000-000000000002';
  v_plan_team    uuid := '5b000003-0000-0000-0000-000000000003';
  v_plan_id      uuid;
  v_cycle        text;
  v_status       text;
  v_cancelled_at timestamptz;
  v_period_end   timestamptz;
  v_days_since   int;
  v_d            int;
  v_hazard       float;
  v_churned      bool;
  v_churn_on_day int;
  v_n_active     int := 0;
  v_n_churned    int := 0;
  v_n_free       int := 0;
BEGIN
  FOR v_cust IN
    SELECT id, created_at, plan_type FROM public.customer ORDER BY created_at
  LOOP
    IF v_cust.plan_type = 'free' THEN
      v_n_free := v_n_free + 1;
      CONTINUE;
    END IF;

    v_plan_id := CASE WHEN random() < 0.70 THEN v_plan_pro ELSE v_plan_team END;
    v_cycle   := CASE WHEN random() < 0.75 THEN 'monthly' ELSE 'yearly' END;

    v_days_since := GREATEST(1,
      FLOOR(EXTRACT(EPOCH FROM (NOW() - v_cust.created_at)) / 86400)::int
    );

    -- Day-by-day hazard simulation
    v_churned      := false;
    v_churn_on_day := -1;

    FOR v_d IN 0..(v_days_since - 1) LOOP
      -- Hazard rate calibrated to Kaplan-Meier targets
      IF    v_d < 7   THEN v_hazard := 0.0115;  -- Day 0-6: 8% drop → Day7=92%
      ELSIF v_d < 30  THEN v_hazard := 0.0052;  -- Day 7-29: 12% more → Day30=80%
      ELSIF v_d < 90  THEN v_hazard := 0.0025;  -- Day 30-89: 15% more → Day90=65%
      ELSIF v_d < 180 THEN v_hazard := 0.0026;  -- Day 90-179: 15% more → Day180=50%
      ELSIF v_d < 270 THEN v_hazard := 0.0021;  -- Day 180-269: 8% → Day270=42%
      ELSE                  v_hazard := 0.0020;  -- Day 270-365: 7% → Day365=35%
      END IF;

      IF random() < v_hazard THEN
        v_churned      := true;
        v_churn_on_day := v_d;
        EXIT;
      END IF;
    END LOOP;

    IF v_churned THEN
      v_status       := 'cancelled';
      v_cancelled_at := v_cust.created_at + (v_churn_on_day || ' days')::interval;
      IF v_cancelled_at > NOW() THEN v_cancelled_at := NOW() - INTERVAL '2 hours'; END IF;
      v_n_churned := v_n_churned + 1;
    ELSE
      v_status       := 'active';
      v_cancelled_at := NULL;
      v_n_active     := v_n_active + 1;
    END IF;

    v_period_end := CASE
      WHEN v_cycle = 'yearly' THEN v_cust.created_at + INTERVAL '1 year'
      ELSE v_cust.created_at + INTERVAL '1 month'
    END;

    INSERT INTO public.subscriptions (
      id, user_id, plan_id, status, billing_cycle,
      current_period_start, current_period_end,
      cancel_at_period_end, cancelled_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_cust.id, v_plan_id, v_status, v_cycle,
      v_cust.created_at, v_period_end,
      false, v_cancelled_at, v_cust.created_at, NOW()
    ) ON CONFLICT DO NOTHING;

  END LOOP;

  RAISE NOTICE 'Step 3 complete: Active=%, Churned=%, Free(skip)=%', v_n_active, v_n_churned, v_n_free;
END $$;

-- ============================================================
-- STEP 4: Payment Transactions — one per billing cycle while active
-- ============================================================
DO $$
DECLARE
  v_sub     record;
  v_thb     uuid := 'c0000002-0000-0000-0000-000000000002';
  v_cursor  date;
  v_end_dt  timestamptz;
  v_tx_dt   timestamptz;
  v_price   numeric;
  v_amount  numeric;
  v_count   int := 0;
BEGIN
  FOR v_sub IN
    SELECT s.id AS sub_id, s.user_id, s.created_at, s.cancelled_at,
           s.status, s.billing_cycle, sp.price_monthly,
           COALESCE(sp.price_yearly, sp.price_monthly * 12) AS price_yearly
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE sp.price_monthly > 0
  LOOP
    v_cursor := date_trunc('month', v_sub.created_at)::date;
    v_end_dt := CASE
      WHEN v_sub.status = 'cancelled' AND v_sub.cancelled_at IS NOT NULL
      THEN v_sub.cancelled_at
      ELSE NOW()
    END;
    v_price := CASE
      WHEN v_sub.billing_cycle = 'yearly' THEN v_sub.price_yearly
      ELSE v_sub.price_monthly
    END;

    LOOP
      EXIT WHEN v_cursor > v_end_dt::date;

      -- Random day within billing period (1–5 days from start)
      v_tx_dt := v_cursor::timestamptz
               + (floor(random() * 5))::int * INTERVAL '1 day'
               + (floor(random() * 22) + 1 || ' hours')::interval;

      IF v_tx_dt < v_sub.created_at THEN v_tx_dt := v_sub.created_at + '30 minutes'::interval; END IF;
      IF v_tx_dt > LEAST(v_end_dt, NOW()) THEN EXIT; END IF;

      v_amount := round((v_price * (0.97 + random() * 0.06))::numeric, 2);

      INSERT INTO public.payment_transactions (
        id, user_id, subscription_id, amount, currency_id,
        status, payment_gateway, transaction_type, created_at
      ) VALUES (
        gen_random_uuid(), v_sub.user_id, v_sub.sub_id, v_amount, v_thb,
        'completed', 'stripe', 'subscription_payment', v_tx_dt
      ) ON CONFLICT DO NOTHING;

      v_count := v_count + 1;
      IF v_sub.billing_cycle = 'yearly' THEN EXIT; END IF;
      v_cursor := (v_cursor + INTERVAL '1 month')::date;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Step 4 complete: % transactions generated.', v_count;
END $$;

-- ============================================================
-- STEP 5: Cohort Analysis (12 months, aligned to survival)
-- ============================================================
DO $$
DECLARE
  v_ws   uuid;
  m      int;
  v_size int;
  v_m1   numeric;
  v_m2   numeric;
  v_m3   numeric;
BEGIN
  SELECT id INTO v_ws FROM public.workspaces ORDER BY created_at LIMIT 1;
  IF v_ws IS NULL THEN RAISE WARNING 'No workspace, skip cohort.'; RETURN; END IF;

  DELETE FROM public.cohort_analysis WHERE team_id = v_ws;

  FOR m IN 0..11 LOOP
    v_size := GREATEST(12, ROUND(15.0 * POWER(1.115, 11 - m) * 0.70)::int);
    v_m1 := round((78.0 + random() * 4.0)::numeric, 1);          -- ~80% at Day30
    v_m2 := round((v_m1 * (0.86 + random() * 0.05))::numeric, 1); -- ~72% at Day60
    v_m3 := round((v_m2 * (0.88 + random() * 0.04))::numeric, 1); -- ~65% at Day90

    INSERT INTO public.cohort_analysis (
      id, team_id, cohort_date, cohort_type, cohort_size,
      retention_data, revenue_data, average_retention, churn_rate, created_at
    ) VALUES (
      gen_random_uuid(), v_ws,
      (date_trunc('month', CURRENT_DATE - (m * INTERVAL '1 month')))::date,
      'monthly', v_size,
      jsonb_build_object('month_1', v_m1, 'month_2', v_m2, 'month_3', v_m3),
      jsonb_build_object(
        'month_1', round((v_size * 990 * v_m1/100)::numeric, 2),
        'month_2', round((v_size * 990 * v_m2/100)::numeric, 2),
        'month_3', round((v_size * 990 * v_m3/100)::numeric, 2)
      ),
      round(((v_m1 + v_m2 + v_m3) / 3)::numeric, 2),
      round((100.0 - v_m1)::numeric, 2),
      NOW() - (m * INTERVAL '1 month')
    );
  END LOOP;

  RAISE NOTICE 'Step 5 complete: 12-month cohort analysis seeded.';
END $$;

COMMIT;

-- ============================================================
-- VERIFY: Monthly MRR breakdown — should span 12+ months
-- ============================================================
SELECT
  to_char(date_trunc('month', created_at), 'Mon YYYY') AS month,
  COUNT(*)                                              AS tx_count,
  ROUND(SUM(amount))                                    AS mrr_thb,
  COUNT(DISTINCT user_id)                               AS paying_users
FROM public.payment_transactions
WHERE status = 'completed'
GROUP BY date_trunc('month', created_at)
ORDER BY date_trunc('month', created_at);
