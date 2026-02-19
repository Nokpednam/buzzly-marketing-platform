-- ============================================================
-- TARGETED FIX: Regenerate payment_transactions from EXISTING subscriptions
-- ============================================================
-- ทำไมต้องแบบนี้:
--   Survival Probability, Growth Analysis, Cohort ทำงานได้ → subscriptions มีข้อมูลถูกต้อง
--   Revenue Trends ว่าง → payment_transactions ว่าง
--   วิธีนี้ไม่แตะ subscriptions เลย ใช้ subscription.user_id ที่ valid อยู่แล้ว
--
-- ผลลัพธ์: Revenue Trends จะแสดง 12 เดือน aligned กับ Survival Probability
-- ============================================================

DO $$
DECLARE
  v_sub     record;
  v_thb     uuid;
  v_cursor  date;
  v_end_dt  timestamptz;
  v_tx_dt   timestamptz;
  v_price   numeric;
  v_amount  numeric;
  v_count   int := 0;
  v_skipped int := 0;
BEGIN
  -- Get THB currency ID
  SELECT id INTO v_thb FROM public.currencies WHERE code = 'THB' LIMIT 1;
  IF v_thb IS NULL THEN
    SELECT id INTO v_thb FROM public.currencies ORDER BY created_at LIMIT 1;
  END IF;
  RAISE NOTICE 'Using currency_id: %', v_thb;

  -- Step 1: Clear existing transactions
  DELETE FROM public.payment_transactions;
  RAISE NOTICE 'Cleared old payment_transactions.';

  -- Step 2: Set THB-scale pricing on plans (so Revenue Trends shows realistic THB amounts)
  UPDATE public.subscription_plans SET price_monthly = 990.00,  price_yearly = 9900.00
  WHERE slug = 'pro';
  UPDATE public.subscription_plans SET price_monthly = 2490.00, price_yearly = 24900.00
  WHERE slug = 'team';
  RAISE NOTICE 'Updated subscription_plans to THB pricing.';

  -- Step 3: Loop through ALL existing subscriptions and generate historical payments
  FOR v_sub IN
    SELECT
      s.id           AS sub_id,
      s.user_id,
      s.created_at,
      s.cancelled_at,
      s.status,
      s.billing_cycle,
      sp.price_monthly,
      COALESCE(sp.price_yearly, sp.price_monthly * 12) AS price_yearly
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE sp.price_monthly > 0
    ORDER BY s.created_at
  LOOP
    -- Subscription window: created_at → cancelled_at (or NOW)
    v_cursor := date_trunc('month', v_sub.created_at)::date;
    v_end_dt := CASE
      WHEN v_sub.status = 'cancelled' AND v_sub.cancelled_at IS NOT NULL
      THEN v_sub.cancelled_at
      ELSE NOW()
    END;

    -- Price: yearly billing = one upfront payment, monthly = recurring
    v_price := CASE
      WHEN v_sub.billing_cycle = 'yearly' THEN v_sub.price_yearly
      ELSE v_sub.price_monthly
    END;

    -- Skip if price is still near USD values (plan wasn't updated yet — failsafe)
    IF v_price < 100 THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    LOOP
      EXIT WHEN v_cursor > v_end_dt::date;

      -- Random time within the billing period (realistic: 1–5 days from month start)
      v_tx_dt := v_cursor::timestamptz
               + (floor(random() * 5))::int * INTERVAL '1 day'
               + (floor(random() * 22) + 1 || ' hours')::interval;

      -- Clamp timestamp to subscription window
      IF v_tx_dt < v_sub.created_at THEN
        v_tx_dt := v_sub.created_at + INTERVAL '30 minutes';
      END IF;
      IF v_tx_dt > LEAST(v_end_dt, NOW()) THEN EXIT; END IF;

      -- ±3% variance for realism
      v_amount := round((v_price * (0.97 + random() * 0.06))::numeric, 2);

      INSERT INTO public.payment_transactions (
        id, user_id, subscription_id, amount, currency_id,
        status, payment_gateway, transaction_type, created_at
      ) VALUES (
        gen_random_uuid(),
        v_sub.user_id,
        v_sub.sub_id,
        v_amount,
        v_thb,
        'completed',
        'stripe',
        'subscription_payment',
        v_tx_dt
      ) ON CONFLICT DO NOTHING;

      v_count := v_count + 1;

      -- Yearly: 1 payment only; Monthly: advance to next month
      IF v_sub.billing_cycle = 'yearly' THEN EXIT; END IF;
      v_cursor := (v_cursor + INTERVAL '1 month')::date;
    END LOOP;
  END LOOP;

  RAISE NOTICE '✅ Done: % transactions inserted, % skipped (low price = plan not updated yet).', v_count, v_skipped;
  RAISE NOTICE 'If skipped > 0, run the UPDATE subscription_plans statements separately first, then re-run this script.';
END $$;

-- ============================================================
-- VERIFY: Should show 12+ months with growing MRR
-- Expected: Mar 2025 → Feb 2026, MRR growing each month
-- ============================================================
SELECT
  to_char(date_trunc('month', created_at), 'Mon YYYY') AS month,
  COUNT(*)                                              AS tx_count,
  ROUND(SUM(amount))                                    AS total_mrr_thb,
  COUNT(DISTINCT user_id)                               AS paying_users
FROM public.payment_transactions
WHERE status = 'completed'
GROUP BY date_trunc('month', created_at)
ORDER BY date_trunc('month', created_at);
