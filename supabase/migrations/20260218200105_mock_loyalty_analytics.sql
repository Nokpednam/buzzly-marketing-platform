-- ============================================================
-- Mock Data Part 5: Loyalty, Analytics
-- tier_history (50+), customer_activities (150+),
-- revenue_metrics (90 days), cohort_analysis (6 months)
-- NOTE: points_transactions seeded in file 20260218200006
-- Depends on: users (unified-seed), loyalty_tiers (static seed)
-- ============================================================

-- 5.2 Tier History
DO $$
DECLARE
  v_user record;
  v_tiers uuid[] := ARRAY[
    '17000001-0000-0000-0000-000000000001'::uuid, -- Bronze
    '17000002-0000-0000-0000-000000000002'::uuid, -- Silver
    '17000003-0000-0000-0000-000000000003'::uuid, -- Gold
    '17000004-0000-0000-0000-000000000004'::uuid  -- Platinum
  ];
  i int;
BEGIN
  FOR v_user IN
    SELECT pc.user_id, pc.loyalty_point_id
    FROM public.profile_customers pc
    WHERE pc.loyalty_point_id IS NOT NULL
    LIMIT 30
  LOOP
    -- Start at Bronze, upgrade 1-2 times
    INSERT INTO public.tier_history (
      id, user_id, previous_tier_id, new_tier_id,
      change_reason, created_at
    ) VALUES (
      gen_random_uuid(),
      v_user.user_id,
      NULL,
      v_tiers[1],
      'Initial tier assignment',
      NOW() - (floor(random()*300)+90)::int * INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;

    IF random() > 0.4 THEN
      INSERT INTO public.tier_history (
        id, user_id, previous_tier_id, new_tier_id,
        change_reason, created_at
      ) VALUES (
        gen_random_uuid(),
        v_user.user_id,
        v_tiers[1],
        v_tiers[2],
        'Points threshold reached: 500 points',
        NOW() - (floor(random()*90)+30)::int * INTERVAL '1 day'
      ) ON CONFLICT DO NOTHING;
    END IF;

    IF random() > 0.7 THEN
      INSERT INTO public.tier_history (
        id, user_id, previous_tier_id, new_tier_id,
        change_reason, created_at
      ) VALUES (
        gen_random_uuid(),
        v_user.user_id,
        v_tiers[2],
        v_tiers[3],
        'Points threshold reached: 2000 points',
        NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day'
      ) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RAISE NOTICE 'Part 5b: Tier History seeded.';
END $$;

-- 5.3 Customer Activities (FIXED: profile_customer_id, event_type_id, event_data)
DO $$
DECLARE
  v_pc record;
  v_event_types uuid[];
  v_device_types text[] := ARRAY['mobile','desktop','tablet','mobile','mobile','desktop'];
  v_pages text[] := ARRAY['/dashboard','/campaigns','/analytics','/loyalty','/reports','/settings','/billing'];
  i int;
BEGIN
  SELECT ARRAY(SELECT id FROM public.event_types) INTO v_event_types;

  FOR v_pc IN SELECT id FROM public.profile_customers LIMIT 30 LOOP
    FOR i IN 1..(5 + floor(random()*6)::int) LOOP
      INSERT INTO public.customer_activities (
        id, profile_customer_id, event_type_id,
        device_type, page_url, event_data, created_at
      ) VALUES (
        gen_random_uuid(),
        v_pc.id,
        CASE WHEN array_length(v_event_types,1) > 0
          THEN v_event_types[1 + (i % array_length(v_event_types,1))]
          ELSE NULL END,
        v_device_types[1 + (i % array_length(v_device_types,1))],
        v_pages[1 + (i % array_length(v_pages,1))],
        jsonb_build_object(
          'duration_sec', (10 + floor(random()*300))::int,
          'action', CASE i%4 WHEN 0 THEN 'click' WHEN 1 THEN 'view' WHEN 2 THEN 'scroll' ELSE 'submit' END
        ),
        NOW() - (floor(random()*180)+1)::int * INTERVAL '1 day'
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Part 5c: Customer Activities seeded.';
END $$;

-- 5.4 Revenue Metrics (90 days)
DO $$
DECLARE
  d int;
  v_ws uuid;
  v_mrr numeric; v_arr numeric; v_new_cust int; v_churn int;
BEGIN
  SELECT id INTO v_ws FROM public.workspaces ORDER BY created_at LIMIT 1;

  FOR d IN 0..89 LOOP
    v_mrr      := round((80000 + random()*40000 + d*500)::numeric, 2);
    v_arr      := round(v_mrr * 12, 2);
    v_new_cust := (3 + floor(random()*8))::int;
    v_churn    := (0 + floor(random()*3))::int;

    INSERT INTO public.revenue_metrics (
      id, team_id, metric_date,
      gross_revenue, net_revenue, ad_spend,
      new_customers, returning_customers, total_orders,
      average_order_value, created_at
    ) VALUES (
      gen_random_uuid(),
      v_ws,
      CURRENT_DATE - d,
      round((v_mrr + random()*5000)::numeric, 2),
      round((v_mrr * 0.85 + random()*3000)::numeric, 2),
      round((v_mrr * 0.15 + random()*1000)::numeric, 2),
      v_new_cust,
      (5 + floor(random()*20))::int,
      (v_new_cust + 5 + floor(random()*20))::int,
      round((500 + random()*2000)::numeric, 2),
      NOW() - (d * INTERVAL '1 day')
    ) ON CONFLICT DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Part 5d: Revenue Metrics seeded (90 days).';
END $$;

-- 5.5 Cohort Analysis (6 months)
DO $$
DECLARE
  m int;
  v_ws uuid;
  v_cohort_size int;
BEGIN
  SELECT id INTO v_ws FROM public.workspaces ORDER BY created_at LIMIT 1;

  FOR m IN 0..5 LOOP
    v_cohort_size := (50 + floor(random()*150))::int;
    INSERT INTO public.cohort_analysis (
      id, team_id, cohort_date, cohort_type, cohort_size,
      retention_data, revenue_data, average_retention, churn_rate
    ) VALUES (
      gen_random_uuid(),
      v_ws,
      date_trunc('month', CURRENT_DATE - (m * INTERVAL '1 month'))::date,
      'monthly',
      v_cohort_size,
      jsonb_build_object(
        'month_1', floor(v_cohort_size * (0.6 + random()*0.2))::int,
        'month_2', floor(v_cohort_size * (0.4 + random()*0.2))::int,
        'month_3', floor(v_cohort_size * (0.3 + random()*0.15))::int
      ),
      jsonb_build_object(
        'month_1', round((v_cohort_size * (800 + random()*400))::numeric, 2),
        'month_2', round((v_cohort_size * (600 + random()*300))::numeric, 2),
        'month_3', round((v_cohort_size * (400 + random()*200))::numeric, 2)
      ),
      round((55 + random()*20)::numeric, 2),
      round((5 + random()*15)::numeric, 2)
    ) ON CONFLICT DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Part 5e: Cohort Analysis seeded (6 months).';
END $$;
