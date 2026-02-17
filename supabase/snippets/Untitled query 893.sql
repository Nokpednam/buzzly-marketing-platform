-- =============================================
-- SUBSCRIPTION MOCK DATA WITH CHURN
-- Sample subscriptions with realistic cancellation patterns
-- =============================================

-- Get the plan IDs first
DO $$
DECLARE
  free_plan_id UUID;
  pro_plan_id UUID;
  team_plan_id UUID;
  thb_currency_id UUID;
  card_payment_id UUID;
  
  -- Customer IDs from sample data
  customer_ids UUID[] := ARRAY[
    'bc000001-0000-0000-0000-000000000001'::UUID,
    'bc000002-0000-0000-0000-000000000002'::UUID,
    'bc000003-0000-0000-0000-000000000003'::UUID,
    'bc000004-0000-0000-0000-000000000004'::UUID,
    'bc000005-0000-0000-0000-000000000005'::UUID,
    'bc000006-0000-0000-0000-000000000006'::UUID,
    'bc000007-0000-0000-0000-000000000007'::UUID,
    'bc000008-0000-0000-0000-000000000008'::UUID,
    'bc000009-0000-0000-0000-000000000009'::UUID,
    'bc000010-0000-0000-0000-000000000010'::UUID
  ];
  
  sub_id UUID;
  start_date TIMESTAMPTZ;
  cancel_date TIMESTAMPTZ;
  i INT;
  churn_probability NUMERIC;
BEGIN
  -- Get plan and currency IDs
  SELECT id INTO free_plan_id FROM subscription_plans WHERE slug = 'free';
  SELECT id INTO pro_plan_id FROM subscription_plans WHERE slug = 'pro';
  SELECT id INTO team_plan_id FROM subscription_plans WHERE slug = 'team';
  SELECT id INTO thb_currency_id FROM currencies WHERE code = 'THB';
  SELECT id INTO card_payment_id FROM payment_methods WHERE slug = 'card';

  -- Create 100 subscriptions with realistic churn patterns
  FOR i IN 1..100 LOOP
    sub_id := gen_random_uuid();
    
    -- Random start date between 400 days ago and 30 days ago
    start_date := NOW() - (INTERVAL '30 days' + (random() * INTERVAL '370 days'));
    
    -- Churn probability increases over time (realistic churn curve)
    -- Early days: low churn, increases gradually
    churn_probability := CASE
      WHEN i <= 70 THEN 0.20  -- 20% churn rate for majority
      WHEN i <= 85 THEN 0.35  -- 35% churn for next segment
      ELSE 0.50  -- 50% churn for oldest cohort
    END;
    
    -- Determine if this subscription churned
     IF random() < churn_probability THEN
      -- Churned subscription - set cancelled_at
      -- Churn happens between 7-300 days after start
      cancel_date := start_date + (INTERVAL '7 days' + (random() * INTERVAL '293 days'));
      
      -- Only set cancel_date if it's before now
      IF cancel_date < NOW() THEN
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
          customer_ids[(i % 10) + 1],  -- Cycle through customer IDs
          CASE 
            WHEN random() < 0.6 THEN pro_plan_id
            WHEN random() < 0.85 THEN team_plan_id
            ELSE free_plan_id
          END,
          'cancelled',
          CASE WHEN random() < 0.7 THEN 'monthly' ELSE 'yearly' END,
          start_date,
          start_date + INTERVAL '30 days',
          false,
          cancel_date,
          start_date
        );
        
        -- Create payment transaction for this subscription
        IF (SELECT price_monthly FROM subscription_plans WHERE id = pro_plan_id) > 0 THEN
          INSERT INTO payment_transactions (
            id,
            user_id,
            subscription_id,
            payment_method_id,
            amount,
            currency_id,
            status,
            transaction_type,
            created_at
          ) VALUES (
            gen_random_uuid(),
            customer_ids[(i % 10) + 1],
            sub_id,
            card_payment_id,
            CASE 
              WHEN random() < 0.6 THEN 899.00  -- Pro monthly (THB)
              WHEN random() < 0.85 THEN 2399.00  -- Team monthly (THB)
              ELSE 0
            END,
            thb_currency_id,
            'completed',
            'subscription',
            start_date
          );
        END IF;
      ELSE
        -- Start date is recent, keep as active
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
          customer_ids[(i % 10) + 1],
          CASE 
            WHEN random() < 0.6 THEN pro_plan_id
            WHEN random() < 0.85 THEN team_plan_id
            ELSE free_plan_id
          END,
          'active',
          CASE WHEN random() < 0.7 THEN 'monthly' ELSE 'yearly' END,
          start_date,
          start_date + INTERVAL '30 days',
          false,
          start_date
        );
      END IF;
    ELSE
      -- Active subscription - no cancellation
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
        customer_ids[(i % 10) + 1],
        CASE 
          WHEN random() < 0.6 THEN pro_plan_id
          WHEN random() < 0.85 THEN team_plan_id
          ELSE free_plan_id
        END,
        'active',
        CASE WHEN random() < 0.7 THEN 'monthly' ELSE 'yearly' END,
        start_date,
        start_date + INTERVAL '30 days',
        false,
        start_date
      );
      
      -- Create payment transaction for active subscription
      IF (SELECT price_monthly FROM subscription_plans WHERE id = pro_plan_id) > 0 THEN
        INSERT INTO payment_transactions (
          id,
          user_id,
          subscription_id,
          payment_method_id,
          amount,
          currency_id,
          status,
          transaction_type,
          created_at
        ) VALUES (
          gen_random_uuid(),
          customer_ids[(i % 10) + 1],
          sub_id,
          card_payment_id,
          CASE 
            WHEN random() < 0.6 THEN 899.00
            WHEN random() < 0.85 THEN 2399.00
            ELSE 0
          END,
          thb_currency_id,
          'completed',
          'subscription',
          start_date
        );
      END IF;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Created 100 subscription records with realistic churn patterns';
END $$;

-- Summary
SELECT 
  'Subscription Data Created! 🎉' as result,
  COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_subscriptions,
  COUNT(*) as total_subscriptions,
  ROUND(COUNT(*) FILTER (WHERE status = 'cancelled')::NUMERIC / COUNT(*)::NUMERIC * 100, 1) as churn_rate_percent
FROM subscriptions;
