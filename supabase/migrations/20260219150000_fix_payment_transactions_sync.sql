-- ============================================================
-- FIX: Payment Transactions Sync with Subscriptions Lifecycle
-- ============================================================
-- ปัญหาเดิม: Part B ใน mock_owner_pages.sql มี bug คือ
--   1. insert `v_user.id` แต่ v_user เป็น uuid[] จึงได้ NULL
--   2. ราคาใน transactions ไม่สอดคล้องกับ subscription_plans
--   3. transactions ถูก generate แบบ random ไม่เชื่อมกับ subscription ที่มีจริง
--
-- แก้ไข: Generate payment_transactions โดยอิงจาก subscriptions ที่มีจริง
--   - ทุก subscription ที่ active/cancelled จะมี monthly transaction
--     ตั้งแต่ created_at ยัน cancelled_at (หรือ NOW())
--   - ใช้ price_monthly จาก subscription_plans จริงๆ
--   - ทำให้ Revenue Trends chart สอดคล้องกับ Survival Probability data
-- ============================================================

DO $$
DECLARE
  v_sub           record;
  v_plan          record;
  v_currency_id   uuid := 'c0000002-0000-0000-0000-000000000002'; -- THB
  v_start_date    timestamptz;
  v_end_date      timestamptz;
  v_cursor_date   date;
  v_tx_date       timestamptz;
  v_amount        numeric;
  v_plan_price    numeric;
  v_count         int := 0;
BEGIN
  -- Step 1: Clear old broken transactions (from mock_owner_pages Part B bug)
  DELETE FROM public.payment_transactions;
  RAISE NOTICE 'Cleared all old payment_transactions.';

  -- Step 2: Loop through every subscription and create monthly payments
  -- aligned with the subscription's active lifecycle
  FOR v_sub IN
    SELECT
      s.id              AS sub_id,
      s.user_id,
      s.plan_id,
      s.created_at,
      s.cancelled_at,
      s.status,
      s.billing_cycle,
      sp.price_monthly,
      sp.price_yearly,
      sp.name           AS plan_name
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE sp.price_monthly > 0   -- skip Free plan subs
  LOOP
    -- Determine the date range for this subscription's payments
    v_start_date := date_trunc('month', v_sub.created_at);
    
    -- End date: if cancelled → use cancelled_at, else → use NOW()
    IF v_sub.status = 'cancelled' AND v_sub.cancelled_at IS NOT NULL THEN
      v_end_date := v_sub.cancelled_at;
    ELSE
      v_end_date := NOW();
    END IF;

    -- Determine price per transaction based on billing cycle
    IF v_sub.billing_cycle = 'yearly' THEN
      -- yearly billing: one transaction for the full year amount
      v_plan_price := COALESCE(v_sub.price_yearly, v_sub.price_monthly * 12);
    ELSE
      -- monthly billing: one transaction per month
      v_plan_price := v_sub.price_monthly;
    END IF;

    -- Add small variance for realism (±5%)
    -- Generate one transaction per billing cycle within the active window
    v_cursor_date := v_start_date::date;

    LOOP
      EXIT WHEN v_cursor_date > v_end_date::date;

      -- Random day within the billing month (1st to 28th)
      v_tx_date := (v_cursor_date + (floor(random() * 5))::int * INTERVAL '1 day')
                   + (floor(random() * 22) || ' hours')::interval;

      -- Ensure transaction date is within subscription window
      IF v_tx_date < v_sub.created_at THEN
        v_tx_date := v_sub.created_at + '1 hour'::interval;
      END IF;
      IF v_tx_date > LEAST(v_end_date, NOW()) THEN
        EXIT;
      END IF;

      -- Apply small variance ±3% to price for realism
      v_amount := v_plan_price * (0.97 + random() * 0.06);
      v_amount := round(v_amount::numeric, 2);

      INSERT INTO public.payment_transactions (
        id,
        user_id,
        subscription_id,
        amount,
        currency_id,
        status,
        payment_gateway,
        transaction_type,
        created_at
      ) VALUES (
        gen_random_uuid(),
        v_sub.user_id,
        v_sub.sub_id,
        v_amount,
        v_currency_id,
        'completed',
        'stripe',
        'subscription_payment',
        v_tx_date
      ) ON CONFLICT DO NOTHING;

      v_count := v_count + 1;

      -- Advance by billing cycle
      IF v_sub.billing_cycle = 'yearly' THEN
        EXIT; -- Only 1 transaction per year
      ELSE
        -- Next month
        v_cursor_date := (v_cursor_date + INTERVAL '1 month')::date;
      END IF;
    END LOOP;

  END LOOP;

  RAISE NOTICE 'Fix: Payment Transactions regenerated. Total inserted: % transactions (linked to real subscriptions).', v_count;
END $$;


-- ============================================================
-- VERIFY: Show summary of transactions per month for sanity check
-- ============================================================
DO $$
DECLARE
  v_total int;
  v_months int;
BEGIN
  SELECT COUNT(*) INTO v_total FROM public.payment_transactions WHERE status = 'completed';
  SELECT COUNT(DISTINCT date_trunc('month', created_at)) INTO v_months FROM public.payment_transactions;
  
  RAISE NOTICE '✅ Verification: % completed transactions across % distinct months.', v_total, v_months;
END $$;
