-- ============================================================
-- Realistic Revenue Breakdown Seed
-- ============================================================
-- เพิ่มข้อมูลให้ Revenue Breakdown แสดง New MRR, Churn อย่างสมดุล
-- เพื่อให้ dashboard /owner/business-performance ดูสมจริงขึ้น
--
-- ผลลัพธ์ที่ต้องการ (ช่วง 1M):
--   New MRR: ~฿3,000–฿7,500 (ลูกค้าใหม่ 2–3 คน)
--   Churn: ~฿990–฿2,500 (ลูกค้า cancel 1–2 คน)
--   Net MRR Change: เป็นบวกหรือใกล้ศูนย์
-- ============================================================

DO $$
DECLARE
  v_plan_pro     uuid := '5b000002-0000-0000-0000-000000000002';
  v_plan_team   uuid := '5b000003-0000-0000-0000-000000000003';
  v_user_id     uuid;
  v_sub_id      uuid;
  v_created_at  timestamptz;
  v_days_ago    int;
  v_users_no_sub uuid[];
  v_subs_to_churn record;
  v_count_new    int := 0;
  v_count_churn int := 0;
  v_count_exp   int := 0;
  v_i           int;
BEGIN
  -- ============================================================
  -- STEP 1: New MRR — สมัครใหม่ 2–3 คน ใน 30 วันที่ผ่านมา
  -- ============================================================
  SELECT ARRAY(
    SELECT au.id FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.user_id = au.id)
    LIMIT 5
  ) INTO v_users_no_sub;

  IF v_users_no_sub IS NOT NULL AND array_length(v_users_no_sub, 1) > 0 THEN
    FOR v_i IN 1..LEAST(3, array_length(v_users_no_sub, 1)) LOOP
      v_user_id := v_users_no_sub[v_i];
      v_days_ago := 5 + floor(random() * 22)::int;  -- 5–27 วันที่แล้ว
      v_created_at := NOW() - (v_days_ago || ' days')::interval;

      INSERT INTO public.subscriptions (
        id, user_id, plan_id, status, billing_cycle,
        current_period_start, current_period_end,
        cancel_at_period_end, cancelled_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_user_id,
        CASE WHEN random() < 0.7 THEN v_plan_pro ELSE v_plan_team END,
        'active',
        CASE WHEN random() < 0.7 THEN 'monthly' ELSE 'yearly' END,
        v_created_at,
        v_created_at + INTERVAL '1 month',
        false,
        NULL,
        v_created_at,
        v_created_at
      );
      v_count_new := v_count_new + 1;
    END LOOP;
  END IF;

  -- ============================================================
  -- STEP 2: Expansion — Upgrade Pro → Team 1 คน (สมมติ upgrade)
  -- ============================================================
  UPDATE public.subscriptions
  SET plan_id = v_plan_team,
      updated_at = NOW()
  WHERE id = (
    SELECT s.id FROM public.subscriptions s
    WHERE s.plan_id = v_plan_pro
      AND s.status = 'active'
      AND s.created_at < NOW() - INTERVAL '45 days'
    ORDER BY random()
    LIMIT 1
  );
  IF FOUND THEN v_count_exp := 1; END IF;

  -- ============================================================
  -- STEP 3: Churn — ยกเลิก 1–2 คน ที่เคย active มาก่อน 30 วัน
  -- เลือก subscription ที่ created > 60 วัน และยัง active
  -- ============================================================
  FOR v_subs_to_churn IN
    SELECT s.id, s.user_id, s.created_at, s.plan_id
    FROM public.subscriptions s
    WHERE s.status = 'active'
      AND s.created_at < NOW() - INTERVAL '35 days'
    ORDER BY random()
    LIMIT 2
  LOOP
    v_days_ago := 5 + floor(random() * 22)::int;  -- cancel 5–27 วันที่แล้ว

    UPDATE public.subscriptions
    SET status = 'cancelled',
        cancelled_at = NOW() - (v_days_ago || ' days')::interval,
        updated_at = NOW()
    WHERE id = v_subs_to_churn.id;
    v_count_churn := v_count_churn + 1;
  END LOOP;

  RAISE NOTICE 'Realistic Revenue Breakdown: +% new, % expansion, -% churned.', v_count_new, v_count_exp, v_count_churn;
END $$;

-- ============================================================
-- STEP 4: Regenerate payment_transactions ให้สอดคล้องกับ subscriptions
-- ============================================================
DO $$
DECLARE
  v_sub           record;
  v_currency_id   uuid := 'c0000002-0000-0000-0000-000000000002';
  v_cursor_date   date;
  v_end_dt        timestamptz;
  v_tx_date       timestamptz;
  v_amount        numeric;
  v_plan_price    numeric;
  v_count         int := 0;
BEGIN
  DELETE FROM public.payment_transactions;

  FOR v_sub IN
    SELECT
      s.id AS sub_id,
      s.user_id,
      s.created_at,
      s.cancelled_at,
      s.status,
      s.billing_cycle,
      sp.price_monthly,
      sp.price_yearly
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE sp.price_monthly > 0
  LOOP
    v_cursor_date := date_trunc('month', v_sub.created_at)::date;
    v_end_dt := CASE
      WHEN v_sub.status = 'cancelled' AND v_sub.cancelled_at IS NOT NULL
      THEN v_sub.cancelled_at
      ELSE NOW()
    END;

    v_plan_price := CASE
      WHEN v_sub.billing_cycle = 'yearly' THEN COALESCE(v_sub.price_yearly, v_sub.price_monthly * 12)
      ELSE v_sub.price_monthly
    END;

    LOOP
      EXIT WHEN v_cursor_date > v_end_dt::date;

      v_tx_date := v_cursor_date::timestamptz
        + (floor(random() * 5))::int * INTERVAL '1 day'
        + (floor(random() * 22) || ' hours')::interval;

      IF v_tx_date < v_sub.created_at THEN
        v_tx_date := v_sub.created_at + INTERVAL '1 hour';
      END IF;
      IF v_tx_date > LEAST(v_end_dt, NOW()) THEN EXIT; END IF;

      v_amount := round((v_plan_price * (0.97 + random() * 0.06))::numeric, 2);

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
      );

      v_count := v_count + 1;

      IF v_sub.billing_cycle = 'yearly' THEN EXIT; END IF;
      v_cursor_date := (v_cursor_date + INTERVAL '1 month')::date;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Payment transactions regenerated: % records.', v_count;
END $$;

DO $$ BEGIN RAISE NOTICE '✅ Realistic Revenue Breakdown seed completed.'; END $$;
