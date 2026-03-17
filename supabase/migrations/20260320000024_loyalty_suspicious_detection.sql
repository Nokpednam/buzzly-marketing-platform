-- ============================================================================
-- Migration: Loyalty Suspicious Activity Detection
-- Timestamp: 20260320000024
--
-- ตรวจจับกิจกรรม Loyalty น่าสงสัย:
--   1. แต้มขึ้นจู่ๆ เยอะเกิน (single earn > 500 pts = high, > 1000 = critical)
--   2. แต้มขึ้นไวเกิน (3+ earns ใน 1 ชม. = medium, 5+ = high)
-- ============================================================================

-- 1. Trigger: ตรวจเมื่อมี points_transactions ใหม่ (earn/bonus)
CREATE OR REPLACE FUNCTION public.detect_suspicious_points_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_severity   VARCHAR(20);
    v_desc       TEXT;
    v_metadata   JSONB;
    v_recent_count INT;
BEGIN
    -- เฉพาะ earn / bonus
    IF NEW.transaction_type NOT IN ('earn', 'bonus') THEN
        RETURN NEW;
    END IF;

    v_metadata := jsonb_build_object(
        'points_transaction_id', NEW.id,
        'points_amount', NEW.points_amount,
        'balance_after', NEW.balance_after
    );

    -- กฎ 1: แต้มขึ้นจู่ๆ เยอะเกิน
    IF COALESCE(NEW.points_amount, 0) >= 1000 THEN
        v_severity := 'critical';
        v_desc := 'แต้มขึ้นจู่ๆ ' || COALESCE(NEW.points_amount, 0) || ' คะแนนในครั้งเดียว — สูงผิดปกติ';
        INSERT INTO public.suspicious_activities (user_id, activity_type, severity, description, metadata)
        VALUES (NEW.user_id, 'large_single_earn', v_severity, v_desc, v_metadata);
        RETURN NEW;
    ELSIF COALESCE(NEW.points_amount, 0) >= 500 THEN
        v_severity := 'high';
        v_desc := 'แต้มขึ้นจู่ๆ ' || COALESCE(NEW.points_amount, 0) || ' คะแนน — น่าสงสัย';
        INSERT INTO public.suspicious_activities (user_id, activity_type, severity, description, metadata)
        VALUES (NEW.user_id, 'large_single_earn', v_severity, v_desc, v_metadata);
        RETURN NEW;
    END IF;

    -- กฎ 2: แต้มขึ้นไวเกิน (หลายครั้งใน 1 ชม.)
    SELECT COUNT(*)::int INTO v_recent_count
    FROM public.points_transactions
    WHERE user_id = NEW.user_id
      AND transaction_type IN ('earn', 'bonus')
      AND created_at >= now() - INTERVAL '1 hour'
      AND id != NEW.id;

    IF v_recent_count >= 5 THEN
        v_severity := 'high';
        v_desc := 'ได้รับคะแนน ' || (v_recent_count + 1) || ' ครั้งใน 1 ชั่วโมง — เร็วผิดปกติ';
        v_metadata := v_metadata || jsonb_build_object('earn_count_1h', v_recent_count + 1);
        INSERT INTO public.suspicious_activities (user_id, activity_type, severity, description, metadata)
        VALUES (NEW.user_id, 'rapid_points_spike', v_severity, v_desc, v_metadata);
        RETURN NEW;
    ELSIF v_recent_count >= 3 THEN
        v_severity := 'medium';
        v_desc := 'ได้รับคะแนน ' || (v_recent_count + 1) || ' ครั้งใน 1 ชั่วโมง — น่าสงสัย';
        v_metadata := v_metadata || jsonb_build_object('earn_count_1h', v_recent_count + 1);
        INSERT INTO public.suspicious_activities (user_id, activity_type, severity, description, metadata)
        VALUES (NEW.user_id, 'rapid_points_spike', v_severity, v_desc, v_metadata);
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_detect_suspicious_points ON public.points_transactions;
CREATE TRIGGER trg_detect_suspicious_points
    AFTER INSERT ON public.points_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.detect_suspicious_points_activity();

-- 2. Seed กิจกรรมน่าสงสัยด้าน Loyalty สำหรับ demo (ใช้ user_id จาก customer)
DO $$
DECLARE
    r RECORD;
    v_types text[] := ARRAY[
        'large_single_earn',
        'rapid_points_spike',
        'large_single_earn',
        'rapid_points_spike'
    ];
    v_severities text[] := ARRAY['high','medium','critical','high'];
    v_descs text[] := ARRAY[
        'แต้มขึ้นจู่ๆ 850 คะแนนในครั้งเดียว — น่าสงสัย',
        'ได้รับคะแนน 4 ครั้งใน 1 ชั่วโมง — เร็วผิดปกติ',
        'แต้มขึ้นจู่ๆ 1,200 คะแนน — สูงผิดปกติ',
        'ได้รับคะแนน 6 ครั้งใน 1 ชั่วโมง — น่าสงสัย'
    ];
    i int := 0;
BEGIN
    FOR r IN
        SELECT c.id AS user_id
        FROM public.customer c
        ORDER BY c.id
        LIMIT 8
    LOOP
        i := i + 1;
        INSERT INTO public.suspicious_activities (
            user_id, activity_type, severity, description, metadata, is_resolved
        ) VALUES (
            r.user_id,
            v_types[1 + (i % 4)],
            v_severities[1 + (i % 4)],
            v_descs[1 + (i % 4)],
            jsonb_build_object('points_amount', 500 + (i * 100), 'demo', true),
            (i % 3 = 0)  -- บางราย resolved เพื่อให้มีทั้ง resolved และ unresolved
        );
    END LOOP;
    RAISE NOTICE 'Loyalty suspicious activities seeded.';
END;
$$;

NOTIFY pgrst, 'reload schema';
