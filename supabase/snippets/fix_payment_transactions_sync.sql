-- ============================================================
-- FIX: Payment Transactions Sync with Subscriptions Lifecycle
-- ============================================================
-- คำอธิบาย:
--   ปัญหาเดิมคือ payment_transactions ถูก generate ผิด (bug ใน Part B ของ
--   20260218200010_mock_owner_pages.sql: ใช้ v_user.id ซึ่งเป็น uuid[] array)
--   ทำให้ทุก transaction insert ค่า NULL → Revenue Trends chart เห็นแค่เดือนเดียว
--
--   Script นี้จะ:
--   1. ลบ payment_transactions ทั้งหมดที่มีอยู่
--   2. Generate ใหม่โดยอิงจาก subscriptions จริงใน DB
--      - ทุก subscription ที่ active/cancelled จะมี monthly payment
--        ตั้งแต่ created_at ยัน cancelled_at (หรือ NOW())
--      - ใช้ price_monthly จาก subscription_plans จริงๆ
--   3. แสดง summary ของข้อมูลที่ generate ได้ per month
--
--   ผลลัพธ์: Revenue Trends จะสอดคล้องกับ Survival Probability data
-- ============================================================

DO $$
DECLARE
  v_sub           record;
  v_currency_id   uuid := 'c0000002-0000-0000-0000-000000000002'; -- THB
  v_start_date    timestamptz;
  v_end_date      timestamptz;
  v_cursor_date   date;
  v_tx_date       timestamptz;
  v_amount        numeric;
  v_plan_price    numeric;
  v_count         int := 0;
BEGIN
  -- Step 1: Clear old broken transactions
  DELETE FROM public.payment_transactions;
  RAISE NOTICE 'Cleared all old payment_transactions.';

  -- Step 2: Loop through every non-free subscription and create monthly payments
  FOR v_sub IN
    SELECT
      s.id              AS sub_id,
      s.user_id,
      s.created_at,
      s.cancelled_at,
      s.status,
      s.billing_cycle,
      sp.price_monthly,
      COALESCE(sp.price_yearly, sp.price_monthly * 12) AS price_yearly
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE sp.price_monthly > 0   -- exclude Free plan
  LOOP
    -- Date range: from subscription start to end (cancelled_at or NOW)
    v_start_date := date_trunc('month', v_sub.created_at);
    
    IF v_sub.status = 'cancelled' AND v_sub.cancelled_at IS NOT NULL THEN
      v_end_date := v_sub.cancelled_at;
    ELSE
      v_end_date := NOW();
    END IF;

    -- Price per transaction based on billing cycle
    IF v_sub.billing_cycle = 'yearly' THEN
      v_plan_price := v_sub.price_yearly;
    ELSE
      v_plan_price := v_sub.price_monthly;
    END IF;

    -- Walk through months and insert a transaction per billing cycle
    v_cursor_date := v_start_date::date;

    LOOP
      EXIT WHEN v_cursor_date > v_end_date::date;

      -- Random day within the billing month (±5 days from 1st for realism)
      v_tx_date := v_cursor_date
                   + (floor(random() * 5))::int * INTERVAL '1 day'
                   + (floor(random() * 22) || ' hours')::interval;

      -- Clamp to subscription window
      IF v_tx_date < v_sub.created_at THEN
        v_tx_date := v_sub.created_at + '1 hour'::interval;
      END IF;
      IF v_tx_date > LEAST(v_end_date, NOW()) THEN
        EXIT;
      END IF;

      -- Add ±3% variance for realism
      v_amount := v_plan_price * (0.97 + random() * 0.06);
      v_amount := round(v_amount::numeric, 2);

      INSERT INTO public.payment_transactions (
        id, user_id, subscription_id, amount, currency_id,
        status, payment_gateway, transaction_type, created_at
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

      -- Yearly billing = 1 transaction only, Monthly = advance 1 month
      IF v_sub.billing_cycle = 'yearly' THEN
        EXIT;
      ELSE
        v_cursor_date := (v_cursor_date + INTERVAL '1 month')::date;
      END IF;
    END LOOP;

  END LOOP;

  RAISE NOTICE '✅ Fix complete: % payment_transactions inserted (linked to real subscriptions lifecycle).', v_count;
END $$;


-- ============================================================
-- VERIFICATION: Monthly MRR breakdown (should span multiple months)
-- ============================================================
SELECT
  to_char(date_trunc('month', created_at), 'Mon YYYY') AS month,
  COUNT(*)                                              AS tx_count,
  SUM(amount)::numeric(12,2)                           AS total_mrr_thb
FROM public.payment_transactions
WHERE status = 'completed'
GROUP BY date_trunc('month', created_at)
ORDER BY date_trunc('month', created_at);
