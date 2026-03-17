-- ============================================================================
-- Migration: Seed Points Transactions for Tier Management
-- Timestamp: 20260320000022
--
-- Problem: mock_crm (20260218200006) runs BEFORE mock_owner_pages creates
--          loyalty_points, so it finds zero profile_customers with
--          loyalty_point_id → no points_transactions ever inserted.
--
-- Fix: Seed realistic points_transactions for all loyalty_points that have
--      a corresponding customer row. Uses current schema (profile_customer_id).
-- ============================================================================

DO $$
DECLARE
    r RECORD;
    v_types text[] := ARRAY['earn','earn','earn','spend','earn','spend','earn','bonus'];
    v_pts int;
    v_bal int;
    i int;
    v_count int := 0;
BEGIN
    FOR r IN
        SELECT
            lp.id AS loyalty_points_id,
            pc.user_id
        FROM public.loyalty_points lp
        JOIN public.profile_customers pc ON pc.id = lp.profile_customer_id
        WHERE EXISTS (SELECT 1 FROM public.customer c WHERE c.id = pc.user_id)
    LOOP
        v_bal := 0;
        FOR i IN 1..(3 + floor(random()*5)::int) LOOP
            v_pts := CASE
                WHEN v_types[1 + (i % array_length(v_types,1))] IN ('earn','bonus') THEN (50 + floor(random()*450))::int
                ELSE -(20 + floor(random()*180))::int
            END;
            v_bal := GREATEST(0, v_bal + v_pts);

            INSERT INTO public.points_transactions (
                user_id,
                loyalty_points_id,
                transaction_type,
                points_amount,
                balance_after,
                description,
                created_at
            ) VALUES (
                r.user_id,
                r.loyalty_points_id,
                v_types[1 + (i % array_length(v_types,1))],
                v_pts,
                v_bal,
                CASE
                    WHEN v_pts > 0 THEN 'ได้รับ ' || v_pts || ' คะแนน'
                    ELSE 'ใช้ ' || abs(v_pts) || ' คะแนนแลกของรางวัล'
                END,
                NOW() - (floor(random()*120)+1)::int * INTERVAL '1 day'
            );
            v_count := v_count + 1;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Points transactions seeded: % rows', v_count;

    -- อัปเดต last_activity_at ให้ตรงกับ transaction ล่าสุด — ป้องกัน downgrade ผิด
    -- (ผู้ใช้ที่มี earn/spend ล่าสุดจะไม่ถูกถือว่า inactive)
    UPDATE public.loyalty_points lp
    SET last_activity_at = (
        SELECT MAX(pt.created_at)
        FROM public.points_transactions pt
        WHERE pt.loyalty_points_id = lp.id
    )
    WHERE EXISTS (
        SELECT 1 FROM public.points_transactions pt
        WHERE pt.loyalty_points_id = lp.id
    );

    RAISE NOTICE 'last_activity_at synced to latest transaction per wallet.';
END;
$$;

NOTIFY pgrst, 'reload schema';
