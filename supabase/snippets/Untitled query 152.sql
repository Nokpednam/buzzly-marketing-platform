-- =============================================
-- COMPREHENSIVE SAMPLE DATA - Properly Linked
-- =============================================
-- Purpose: Create sample data with correct relationships between:
--   - auth.users
--   - profile_customers  
--   - workspaces
--   - subscriptions
--   - payment_transactions
-- 
-- Prerequisites:
--   - At least 10 users in auth.users table
--   - Run sample-data.sql first (for base tables like aarrr_categories, plans, etc.)
--
-- Features:
--   - Uses setseed() for consistent random data across runs
--   - Properly links all foreign keys
--   - Creates realistic test data for owner dashboards
-- =============================================

-- Set random seed for consistent data generation
SELECT setseed(0.42);

DO $$
DECLARE
  real_user_ids UUID[];
  user_count INT;
  
  -- Business type IDs
  agency_bt_id UUID;
  tech_bt_id UUID;
  ecommerce_bt_id UUID;
  
  -- Subscription plan IDs
  free_plan_id UUID;
  pro_plan_id UUID;
  team_plan_id UUID;
  
  -- Currency and payment method IDs
  thb_currency_id UUID;
  card_payment_id UUID;
  
  -- Loop variables
  i INT;
  current_user_id UUID;
  workspace_id UUID;
  profile_id UUID;
  sub_id UUID;
  start_date TIMESTAMPTZ;
  cancel_date TIMESTAMPTZ;
  churn_probability NUMERIC;
  plan_choice NUMERIC;
  selected_plan_id UUID;
  plan_price NUMERIC;
  
BEGIN
  -- =============================================
  -- 1. GET REAL AUTH USERS
  -- =============================================
  RAISE NOTICE '1. Fetching real auth users...';
  
  SELECT array_agg(id ORDER BY created_at) INTO real_user_ids 
  FROM auth.users 
  LIMIT 15;
  
  user_count := COALESCE(array_length(real_user_ids, 1), 0);
  
  IF user_count < 3 THEN
    RAISE EXCEPTION 'Insufficient users! Found % users, need at least 3. Please create more users first.', user_count;
  END IF;
  
  RAISE NOTICE '✓ Found % users', user_count;
  
  -- =============================================
  -- 2. GET LOOKUP IDs
  -- =============================================
  RAISE NOTICE '2. Getting lookup IDs...';
  
  SELECT id INTO agency_bt_id FROM business_types WHERE slug = 'agency' LIMIT 1;
  SELECT id INTO tech_bt_id FROM business_types WHERE slug = 'technology' LIMIT 1;
  SELECT id INTO ecommerce_bt_id FROM business_types WHERE slug = 'e-commerce' LIMIT 1;
  
  SELECT id INTO free_plan_id FROM subscription_plans WHERE slug = 'free' LIMIT 1;
  SELECT id INTO pro_plan_id FROM subscription_plans WHERE slug = 'pro' LIMIT 1;
  SELECT id INTO team_plan_id FROM subscription_plans WHERE slug = 'team' LIMIT 1;
  
  SELECT id INTO thb_currency_id FROM currencies WHERE code = 'THB' LIMIT 1;
  SELECT id INTO card_payment_id FROM payment_methods WHERE slug = 'card' LIMIT 1;
  
  IF agency_bt_id IS NULL OR pro_plan_id IS NULL THEN
    RAISE EXCEPTION 'Missing required reference data. Please run sample-data.sql first.';
  END IF;
  
  RAISE NOTICE '✓ Lookup IDs ready';
  
  -- =============================================
  -- 3. CREATE WORKSPACES (One per user)
  -- =============================================
  RAISE NOTICE '3. Creating workspaces...';
  
  FOR i IN 1..user_count LOOP
    current_user_id := real_user_ids[i];
    workspace_id := gen_random_uuid();
    
    INSERT INTO workspaces (
      id,
      name,  -- Renamed from workspace_name
      business_type_id,
      status,
      owner_id, -- Added owner_id
      created_at
    ) VALUES (
      workspace_id,
      'Workspace ' || i,
      CASE 
        WHEN i % 3 = 1 THEN agency_bt_id
        WHEN i % 3 = 2 THEN tech_bt_id
        ELSE ecommerce_bt_id
      END,
      'active',
      current_user_id, -- Owner ID
      NOW() - (random() * INTERVAL '365 days')
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Link user as workspace member
    -- Renamed table workspace_members (ex-team_members)
    INSERT INTO workspace_members (
      team_id, -- Note: column name likely still team_id from original table
      user_id,
      role,    -- Replaced role_customer_id with role string
      status,
      joined_at
    ) VALUES (
      workspace_id,
      current_user_id,
      'owner',
      'active',
      NOW() - (random() * INTERVAL '365 days')
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  RAISE NOTICE '✓ Created % workspaces', user_count;
  
  -- =============================================
  -- 4. CREATE PROFILE CUSTOMERS (Linked to users)
  -- =============================================
  RAISE NOTICE '4. Creating profile_customers...';
  
  FOR i IN 1..user_count LOOP
    current_user_id := real_user_ids[i];
    profile_id := gen_random_uuid();
    
    INSERT INTO profile_customers (
      id,
      user_id,
      gender_id,
      loyalty_point_id,
      first_name,
      last_name,
      phone_number,
      birthday_at,
      last_active,
      created_at
    ) VALUES (
      profile_id,
      current_user_id,  -- ✅ Real user_id, not NULL!
      (SELECT id FROM genders ORDER BY random() LIMIT 1),
      (SELECT id FROM loyalty_points ORDER BY random() LIMIT 1),
      'User',
      'Test ' || i,
      '08' || LPAD((90000000 + i)::TEXT, 8, '0'),
      DATE '1990-01-01' + (random() * 10000)::INT,
      NOW() - (random() * INTERVAL '7 days'),
      NOW() - (random() * INTERVAL '365 days')
    )
    ON CONFLICT (user_id) DO NOTHING;  -- ✅ Fixed: Handle user_id unique constraint
  END LOOP;
  
  RAISE NOTICE '✓ Created % profile_customers', user_count;
  
  -- =============================================
  -- 5. CREATE CUSTOMER ACTIVITIES
  -- =============================================
  RAISE NOTICE '5. Creating customer_activities...';
  
  -- Create 3-10 activities per customer
  FOR i IN 1..user_count LOOP
    FOR j IN 1..(3 + (random() * 7)::INT) LOOP
      INSERT INTO customer_activities (
        profile_customer_id,
        event_type_id,
        page_url,
        device_type,
        browser,
        created_at
      )
      SELECT 
        pc.id,
        (SELECT id FROM event_types ORDER BY random() LIMIT 1),
        '/page-' || (random() * 10)::INT,
        CASE WHEN random() < 0.5 THEN 'desktop' ELSE 'mobile' END,
        CASE WHEN random() < 0.7 THEN 'Chrome' ELSE 'Safari' END,
        NOW() - (random() * INTERVAL '30 days')
      FROM profile_customers pc
      WHERE pc.user_id = real_user_ids[i]
      LIMIT 1
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '✓ Created customer_activities';
  
  -- =============================================
  -- 6. CREATE SUBSCRIPTIONS (100 total, linked to real users)
  -- =============================================
  RAISE NOTICE '6. Creating subscriptions...';
  
  FOR i IN 1..100 LOOP
    sub_id := gen_random_uuid();
    current_user_id := real_user_ids[(i % user_count) + 1];  -- ✅ Real auth.users.id
    
    -- Random start date between 400 days ago and 30 days ago
    start_date := NOW() - (INTERVAL '30 days' + (random() * INTERVAL '370 days'));
    
    -- Churn probability
    churn_probability := CASE
      WHEN i <= 70 THEN 0.20
      WHEN i <= 85 THEN 0.35
      ELSE 0.50
    END;
    
    -- Plan selection
    plan_choice := random();
    IF plan_choice < 0.6 THEN
      selected_plan_id := pro_plan_id;
      plan_price := 899.00;
    ELSIF plan_choice < 0.85 THEN
      selected_plan_id := team_plan_id;
      plan_price := 2399.00;
    ELSE
      selected_plan_id := free_plan_id;
      plan_price := 0;
    END IF;
    
    -- Determine if churned
    IF random() < churn_probability THEN
      cancel_date := start_date + (INTERVAL '7 days' + (random() * INTERVAL '293 days'));
      
      IF cancel_date < NOW() THEN
        -- CHURNED subscription
        INSERT INTO subscriptions (
          id,
          user_id,
          plan_id,
          status,
          billing_cycle,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          cancelled_at,
          created_at
        ) VALUES (
          sub_id,
          current_user_id,
          selected_plan_id,
          'cancelled',
          CASE WHEN random() < 0.7 THEN 'monthly' ELSE 'yearly' END,
          start_date,
          start_date + INTERVAL '30 days',
          false,
          cancel_date,
          start_date
        )
        ON CONFLICT (id) DO NOTHING;
        
        -- Create payment for churned subscription
        IF plan_price > 0 THEN
          INSERT INTO payment_transactions (
            user_id,
            subscription_id,
            payment_method_id,
            amount,
            currency_id,
            status,
            transaction_type,
            created_at
          ) VALUES (
            current_user_id,
            sub_id,
            card_payment_id,
            plan_price,
            thb_currency_id,
            'completed',
            'subscription',
            start_date
          )
          ON CONFLICT DO NOTHING;
        END IF;
      ELSE
        -- Would churn in future, keep as active
        INSERT INTO subscriptions (
          id,
          user_id,
          plan_id,
          status,
          billing_cycle,
          current_period_start,
          current_period_end,
          cancel_at_period_end,
          created_at
        ) VALUES (
          sub_id,
          current_user_id,
          selected_plan_id,
          'active',
          CASE WHEN random() < 0.7 THEN 'monthly' ELSE 'yearly' END,
          start_date,
          start_date + INTERVAL '30 days',
          false,
          start_date
        )
        ON CONFLICT (id) DO NOTHING;
      END IF;
    ELSE
      -- ACTIVE subscription
      INSERT INTO subscriptions (
        id,
        user_id,
        plan_id,
        status,
        billing_cycle,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        created_at
      ) VALUES (
        sub_id,
        current_user_id,
        selected_plan_id,
        'active',
        CASE WHEN random() < 0.7 THEN 'monthly' ELSE 'yearly' END,
        start_date,
        start_date + INTERVAL '30 days',
        false,
        start_date
      )
      ON CONFLICT (id) DO NOTHING;
      
      -- Create payment for active subscription
      IF plan_price > 0 THEN
        INSERT INTO payment_transactions (
          user_id,
          subscription_id,
          payment_method_id,
          amount,
          currency_id,
          status,
          transaction_type,
          created_at
        ) VALUES (
          current_user_id,
          sub_id,
          card_payment_id,
          plan_price,
          thb_currency_id,
          'completed',
          'subscription',
          start_date
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✓ Created 100 subscriptions';
  
  -- =============================================
  -- SUMMARY
  -- =============================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ COMPREHENSIVE SAMPLE DATA CREATED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Workspaces: %', (SELECT COUNT(*) FROM workspaces);
  RAISE NOTICE 'Profile Customers: %', (SELECT COUNT(*) FROM profile_customers WHERE user_id IS NOT NULL);
  RAISE NOTICE 'Active Subscriptions: %', (SELECT COUNT(*) FROM subscriptions WHERE status = 'active');
  RAISE NOTICE 'Cancelled Subscriptions: %', (SELECT COUNT(*) FROM subscriptions WHERE status = 'cancelled');
  RAISE NOTICE 'Payment Transactions: %', (SELECT COUNT(*) FROM payment_transactions);
  RAISE NOTICE 'Customer Activities: %', (SELECT COUNT(*) FROM customer_activities);
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Ready to test Owner Dashboard!';
  RAISE NOTICE 'Navigate to: /owner/product-usage and /owner/business-performance';
  
END $$;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify no NULL user_ids in profile_customers
SELECT 
  'Profile Customers with NULL user_id' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM profile_customers 
WHERE user_id IS NULL;

-- Verify subscriptions link to real users
SELECT 
  'Subscriptions with valid user_id' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM subscriptions s
WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = s.user_id);

-- Verify workspaces have business types
SELECT 
  'Workspaces with business_type' as check_name,
  COUNT(*) as count,
  CASE WHEN COUNT(*) > 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM workspaces w
WHERE w.business_type_id IS NOT NULL;
