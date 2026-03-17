-- ============================================================================
-- Migration: Fix last_activity_at from points_transactions
-- Timestamp: 20260320000023
--
-- ปัญหา: last_activity_at ถูกตั้งจาก migration 21 ก่อนมี points_transactions
--        ทำให้ผู้ใช้ที่มีธุรกรรมยังถูกถือว่า inactive และ downgrade
--
-- แก้: sync last_activity_at = transaction ล่าสุดของแต่ละ wallet
--      ผู้ใช้ที่มี earn/spend จะไม่ถูก downgrade ผิด
-- ============================================================================

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

NOTIFY pgrst, 'reload schema';
