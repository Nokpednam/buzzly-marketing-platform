-- ============================================================
-- Mock Data Part 7 (FIXED): Billing, Reports, Team Invitations
-- invoices (50), discounts (10), user_payment_methods (30),
-- reports (60), scheduled_reports (30), team_invitations (50)
-- ============================================================

-- 7.1 Discounts / Promo Codes (FIXED: min_order_value, usage_limit, usage_count)
INSERT INTO public.discounts (id, code, discount_type, discount_value, min_order_value, usage_limit, usage_count, is_active, start_date, end_date, description, created_at) VALUES
  (gen_random_uuid(),'WELCOME20','percentage',20,0,1000,342,true,NOW()-INTERVAL '180 days',NOW()+INTERVAL '365 days','Welcome 20% Off',NOW()-INTERVAL '180 days'),
  (gen_random_uuid(),'NEWYEAR25','percentage',25,500,500,198,true,NOW()-INTERVAL '60 days',NOW()+INTERVAL '90 days','New Year 25% Off',NOW()-INTERVAL '60 days'),
  (gen_random_uuid(),'SAVE500','fixed',500,2000,200,87,true,NOW()-INTERVAL '120 days',NOW()+INTERVAL '180 days','Save ฿500',NOW()-INTERVAL '120 days'),
  (gen_random_uuid(),'FLASH50','percentage',50,0,100,100,false,NOW()-INTERVAL '90 days',NOW()-INTERVAL '89 days','Flash Sale 50%',NOW()-INTERVAL '90 days'),
  (gen_random_uuid(),'LOYAL10','percentage',10,0,9999,1205,true,NOW()-INTERVAL '200 days',NOW()+INTERVAL '365 days','Loyalty Member 10%',NOW()-INTERVAL '200 days'),
  (gen_random_uuid(),'TEAM30','percentage',30,0,300,45,true,NOW()-INTERVAL '45 days',NOW()+INTERVAL '180 days','Team Plan 30% Off',NOW()-INTERVAL '45 days'),
  (gen_random_uuid(),'REFER200','fixed',200,0,9999,892,true,NOW()-INTERVAL '150 days',NOW()+INTERVAL '365 days','Referral ฿200',NOW()-INTERVAL '150 days'),
  (gen_random_uuid(),'SUMMER15','percentage',15,1000,500,234,true,NOW()-INTERVAL '100 days',NOW()+INTERVAL '100 days','Summer Sale 15%',NOW()-INTERVAL '100 days'),
  (gen_random_uuid(),'BDAY100','fixed',100,0,9999,456,true,NOW()-INTERVAL '180 days',NOW()+INTERVAL '365 days','Birthday ฿100',NOW()-INTERVAL '180 days'),
  (gen_random_uuid(),'PROEARLY','percentage',40,0,50,50,false,NOW()-INTERVAL '300 days',NOW()-INTERVAL '240 days','Pro Plan Early Bird',NOW()-INTERVAL '300 days')
ON CONFLICT DO NOTHING;

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

-- 7.5 Scheduled Reports (FIXED: schedule_type/next_send_at columns)
DO $$
DECLARE
  v_ws record;
  v_schedule_types text[] := ARRAY['daily','weekly','monthly'];
  v_report_types text[] := ARRAY['campaign_performance','revenue_summary','funnel_analysis','email_performance'];
  i int;
BEGIN
  i := 0;
  FOR v_ws IN SELECT id FROM public.workspaces ORDER BY created_at LIMIT 30 LOOP
    i := i + 1;
    INSERT INTO public.scheduled_reports (
      id, team_id, name, schedule_type,
      recipients, is_active, next_send_at, created_at
    ) VALUES (
      gen_random_uuid(), v_ws.id,
      v_report_types[1 + (i % array_length(v_report_types,1))] || ' — Auto Report',
      v_schedule_types[1 + (i % array_length(v_schedule_types,1))],
      ARRAY['admin@buzzly.com', 'report@buzzly.com'],
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
