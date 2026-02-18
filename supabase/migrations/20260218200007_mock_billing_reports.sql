-- ============================================================
-- Mock Data Part 7 (FIXED): Billing, Reports, Team Invitations
-- invoices (50), discounts (10), user_payment_methods (30),
-- reports (60), scheduled_reports (30), team_invitations (50)
-- ============================================================

-- 7.1 Discounts / Promo Codes (FIXED: now requires team_id)
DO $$
DECLARE
  v_team_id uuid;
  v_codes text[]   := ARRAY['WELCOME20','NEWYEAR25','SAVE500','FLASH50','LOYAL10','TEAM30','REFER200','SUMMER15','BDAY100','PROEARLY'];
  v_types text[]   := ARRAY['percentage','percentage','fixed','percentage','percentage','percentage','fixed','percentage','fixed','percentage'];
  v_values numeric[] := ARRAY[20,25,500,50,10,30,200,15,100,40];
  v_mins numeric[]   := ARRAY[0,500,2000,0,0,0,0,1000,0,0];
  v_limits int[]     := ARRAY[1000,500,200,100,9999,300,9999,500,9999,50];
  v_counts int[]     := ARRAY[342,198,87,100,1205,45,892,234,456,50];
  v_active bool[]    := ARRAY[true,true,true,false,true,true,true,true,true,false];
  v_descs text[]     := ARRAY['Welcome 20% Off','New Year 25% Off','Save ฿500','Flash Sale 50%','Loyalty Member 10%','Team Plan 30% Off','Referral ฿200','Summer Sale 15%','Birthday ฿100','Pro Plan Early Bird'];
  v_days_ago int[]   := ARRAY[180,60,120,90,200,45,150,100,180,300];
  v_days_end int[]   := ARRAY[365,90,180,-89,365,180,365,100,365,-240];
  i int;
BEGIN
  SELECT id INTO v_team_id FROM public.workspaces ORDER BY created_at LIMIT 1;
  IF v_team_id IS NULL THEN
    RAISE WARNING 'No workspace found, skipping discounts seed.';
    RETURN;
  END IF;
  FOR i IN 1..10 LOOP
    INSERT INTO public.discounts (
      id, team_id, code, discount_type, discount_value,
      min_order_value, usage_limit, usage_count,
      is_active, start_date, end_date, description, created_at
    ) VALUES (
      gen_random_uuid(), v_team_id,
      v_codes[i], v_types[i], v_values[i],
      v_mins[i], v_limits[i], v_counts[i],
      v_active[i],
      NOW() - (v_days_ago[i] || ' days')::interval,
      NOW() + (v_days_end[i] || ' days')::interval,
      v_descs[i],
      NOW() - (v_days_ago[i] || ' days')::interval
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Part 7a: Discounts seeded (10 promo codes).';
END $$;

-- 7.2 User Payment Methods (FIXED: card_last_four, gateway_customer_id, gateway_payment_method_id)
DO $$
DECLARE
  v_user record;
  v_brands text[] := ARRAY['visa','mastercard','jcb','amex'];
  i int := 0;
BEGIN
  FOR v_user IN SELECT id FROM public.customer LIMIT 30 LOOP
    i := i + 1;
    INSERT INTO public.user_payment_methods (
      id, user_id, payment_method_id,
      gateway_customer_id, gateway_payment_method_id,
      card_brand, card_last_four, card_exp_month, card_exp_year,
      is_default, is_active, created_at
    ) VALUES (
      gen_random_uuid(),
      v_user.id,
      'b1000001-0000-0000-0000-000000000001',
      'cus_' || substr(md5(v_user.id::text), 1, 14),
      'pm_' || substr(md5(v_user.id::text || i::text), 1, 16),
      v_brands[1 + (i % array_length(v_brands,1))],
      lpad((floor(random()*9000+1000))::text, 4, '0'),
      (1 + floor(random()*12))::int,
      2026 + floor(random()*4)::int,
      true, true,
      NOW() - (floor(random()*180)+1)::int * INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Part 7b: User Payment Methods seeded (30).';
END $$;

-- 7.3 Invoices (50)
DO $$
DECLARE
  v_sub record;
  v_inv_no int := 1001;
  i int := 0;
BEGIN
  FOR v_sub IN
    SELECT s.id AS sub_id, s.user_id, s.plan_id, sp.price_monthly
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE sp.price_monthly > 0
    LIMIT 50
  LOOP
    i := i + 1;
    INSERT INTO public.invoices (
      id, user_id, subscription_id, invoice_number,
      subtotal, total, currency_id, status,
      due_date, paid_at, created_at
    ) VALUES (
      gen_random_uuid(),
      v_sub.user_id,
      v_sub.sub_id,
      'INV-2025-' || lpad(v_inv_no::text, 4, '0'),
      v_sub.price_monthly,
      v_sub.price_monthly,
      'c0000002-0000-0000-0000-000000000002',
      CASE WHEN random() > 0.1 THEN 'paid' ELSE 'overdue' END,
      NOW() - (floor(random()*30))::int * INTERVAL '1 day' + INTERVAL '30 days',
      CASE WHEN random() > 0.1 THEN NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day' ELSE NULL END,
      NOW() - (floor(random()*180)+1)::int * INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;
    v_inv_no := v_inv_no + 1;
  END LOOP;
  RAISE NOTICE 'Part 7c: Invoices seeded (50).';
END $$;

-- 7.4 Reports (FIXED: start_date/end_date/file_format columns)
DO $$
DECLARE
  v_ws record;
  v_report_types text[] := ARRAY['campaign_performance','audience_insights','revenue_summary',
    'funnel_analysis','competitor_benchmark','email_performance','social_engagement','loyalty_report'];
  v_formats text[] := ARRAY['pdf','excel','csv'];
  i int; j int;
BEGIN
  j := 0;
  FOR v_ws IN SELECT id FROM public.workspaces ORDER BY created_at LIMIT 20 LOOP
    FOR i IN 1..3 LOOP
      j := j + 1;
      INSERT INTO public.reports (
        id, team_id, name, report_type, file_format,
        status, start_date, end_date, created_at
      ) VALUES (
        gen_random_uuid(), v_ws.id,
        v_report_types[1 + (j % array_length(v_report_types,1))] || ' — ' || to_char(NOW()-((j*7)||' days')::interval,'Mon YYYY'),
        v_report_types[1 + (j % array_length(v_report_types,1))],
        v_formats[1 + (j % array_length(v_formats,1))],
        CASE WHEN random() > 0.2 THEN 'completed' ELSE 'processing' END,
        CURRENT_DATE - 30,
        CURRENT_DATE,
        NOW() - (floor(random()*60)+1)::int * INTERVAL '1 day'
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Part 7d: Reports seeded (60).';
END $$;

-- 7.5 Scheduled Reports (FIXED: frequency/next_run_at/recipients jsonb per new schema)
DO $$
DECLARE
  v_ws record;
  v_frequencies text[] := ARRAY['daily','weekly','monthly'];
  v_report_types text[] := ARRAY['campaign_performance','revenue_summary','funnel_analysis','email_performance'];
  i int;
BEGIN
  i := 0;
  FOR v_ws IN SELECT id FROM public.workspaces ORDER BY created_at LIMIT 30 LOOP
    i := i + 1;
    INSERT INTO public.scheduled_reports (
      id, team_id, name, frequency,
      recipients, is_active, next_run_at, created_at
    ) VALUES (
      gen_random_uuid(), v_ws.id,
      v_report_types[1 + (i % array_length(v_report_types,1))] || ' — Auto Report',
      v_frequencies[1 + (i % array_length(v_frequencies,1))],
      '["admin@buzzly.com","report@buzzly.com"]'::jsonb,
      true,
      NOW() + (7 - (i % 7))::int * INTERVAL '1 day',
      NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Part 7e: Scheduled Reports seeded (30).';
END $$;

-- 7.6 Team Invitations (50)
-- Note: role uses team_role enum, status uses invitation_status enum
DO $$
DECLARE
  v_ws record;
  v_roles text[] := ARRAY['admin','editor','viewer','editor','viewer'];
  v_statuses text[] := ARRAY['pending','accepted','pending','expired','accepted'];
  v_domains text[] := ARRAY['gmail.com','outlook.com','company.co.th','hotmail.com','yahoo.com'];
  i int; j int;
BEGIN
  j := 0;
  FOR v_ws IN SELECT id, owner_id FROM public.workspaces ORDER BY created_at LIMIT 25 LOOP
    FOR i IN 1..2 LOOP
      j := j + 1;
      INSERT INTO public.team_invitations (
        id, team_id, invited_by, email, role, status,
        token, expires_at, created_at
      ) VALUES (
        gen_random_uuid(), v_ws.id, v_ws.owner_id,
        'invite' || j::text || '@' || v_domains[1 + (j % array_length(v_domains,1))],
        v_roles[1 + (j % array_length(v_roles,1))]::public.team_role,
        v_statuses[1 + (j % array_length(v_statuses,1))]::public.invitation_status,
        md5(gen_random_uuid()::text),
        NOW() + INTERVAL '7 days',
        NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day'
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Part 7f: Team Invitations seeded (50).';
END $$;

DO $$ BEGIN RAISE NOTICE '✅ ALL MOCK DATA SEEDED SUCCESSFULLY!'; END $$;
