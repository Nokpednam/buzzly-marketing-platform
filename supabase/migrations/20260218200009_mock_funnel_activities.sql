-- ============================================================
-- Mock Data: Funnel Stages + Customer Activities
-- For Owner Dashboard: Product Usage & AARRR Funnel
-- ============================================================

-- ============================================================
-- PART 1: Funnel Stages (linked to aarrr_categories)
-- ============================================================
INSERT INTO public.funnel_stages (id, aarrr_categories_id, name, slug, display_order, description)
VALUES
  -- Acquisition
  ('f0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Landing Page Visit', 'landing',       1, 'User visits the landing page'),
  ('f0000002-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Sign Up Started',    'signup-start',  2, 'User begins the sign-up process'),
  -- Activation
  ('f0000003-0000-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000002', 'Email Verified',     'email-verified',3, 'User verifies their email address'),
  ('f0000004-0000-0000-0000-000000000004', 'a0000002-0000-0000-0000-000000000002', 'Profile Complete',   'profile-complete',4, 'User completes their profile'),
  -- Retention
  ('f0000005-0000-0000-0000-000000000005', 'a0000003-0000-0000-0000-000000000003', 'First Campaign',     'first-campaign',5, 'User creates their first campaign'),
  ('f0000006-0000-0000-0000-000000000006', 'a0000003-0000-0000-0000-000000000003', 'Active User',        'active',        6, 'User is actively using the platform'),
  -- Referral
  ('f0000007-0000-0000-0000-000000000007', 'a0000004-0000-0000-0000-000000000004', 'Referral Sent',      'referral',      7, 'User refers another user'),
  -- Revenue
  ('f0000008-0000-0000-0000-000000000008', 'a0000005-0000-0000-0000-000000000005', 'First Payment',      'first-payment', 8, 'User makes their first payment')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PART 2: Customer Activities (mock behavioral data)
-- Seeds activities for profile_customers over the past 90 days
-- ============================================================
DO $$
DECLARE
  v_customers uuid[];
  v_customer_id uuid;
  v_event_page_view uuid := 'e7000001-0000-0000-0000-000000000001';
  v_event_signup    uuid := 'e7000002-0000-0000-0000-000000000002';
  v_event_login     uuid := 'e7000003-0000-0000-0000-000000000003';
  v_devices text[]  := ARRAY['desktop','mobile','tablet'];
  v_browsers text[] := ARRAY['Chrome','Firefox','Safari','Edge'];
  v_pages text[]    := ARRAY['/dashboard','/campaigns','/analytics','/settings','/reports','/prospects'];
  i int;
  j int;
  v_days_ago int;
  v_num_activities int;
BEGIN
  -- Guard: check if profile_customers has data
  IF NOT EXISTS (SELECT 1 FROM public.profile_customers LIMIT 1) THEN
    RAISE WARNING 'No profile_customers found, skipping customer_activities seed.';
    RETURN;
  END IF;

  -- Get all customer IDs
  SELECT ARRAY(SELECT id FROM public.profile_customers ORDER BY created_at) INTO v_customers;

  -- For each customer, generate realistic activity patterns
  FOR i IN 1..array_length(v_customers, 1) LOOP
    v_customer_id := v_customers[i];

    -- Signup event (once, at account creation time ~60-90 days ago)
    INSERT INTO public.customer_activities (
      id, profile_customer_id, event_type_id,
      session_id, page_url, device_type, browser, created_at
    ) VALUES (
      gen_random_uuid(), v_customer_id, v_event_signup,
      md5(v_customer_id::text || 'signup'),
      '/signup',
      v_devices[1 + (i % array_length(v_devices, 1))],
      v_browsers[1 + (i % array_length(v_browsers, 1))],
      NOW() - ((60 + (i % 30)) || ' days')::interval
    ) ON CONFLICT DO NOTHING;

    -- Number of login/activity sessions varies by user (simulate different engagement levels)
    v_num_activities := 5 + (i % 20); -- 5-24 activities per user

    FOR j IN 1..v_num_activities LOOP
      v_days_ago := (j * 3) % 90; -- spread over 90 days

      -- Login event
      INSERT INTO public.customer_activities (
        id, profile_customer_id, event_type_id,
        session_id, page_url, device_type, browser, created_at
      ) VALUES (
        gen_random_uuid(), v_customer_id, v_event_login,
        md5(v_customer_id::text || j::text || 'login'),
        '/auth',
        v_devices[1 + (j % array_length(v_devices, 1))],
        v_browsers[1 + (j % array_length(v_browsers, 1))],
        NOW() - (v_days_ago || ' days')::interval - ((j % 12) || ' hours')::interval
      ) ON CONFLICT DO NOTHING;

      -- Page view event
      INSERT INTO public.customer_activities (
        id, profile_customer_id, event_type_id,
        session_id, page_url, device_type, browser, created_at
      ) VALUES (
        gen_random_uuid(), v_customer_id, v_event_page_view,
        md5(v_customer_id::text || j::text || 'view'),
        v_pages[1 + (j % array_length(v_pages, 1))],
        v_devices[1 + (j % array_length(v_devices, 1))],
        v_browsers[1 + (j % array_length(v_browsers, 1))],
        NOW() - (v_days_ago || ' days')::interval - ((j % 12) || ' hours')::interval + '5 minutes'::interval
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Part 9: Customer Activities seeded for % customers.', array_length(v_customers, 1);
END $$;
