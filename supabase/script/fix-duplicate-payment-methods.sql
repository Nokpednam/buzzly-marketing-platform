-- ============================================================
-- Fix duplicate payment methods (Credit/Debit Card appears twice)
-- ============================================================

-- 1. ดูแถวซ้ำทั้งหมดก่อน
SELECT id, name, slug, is_active, display_order
FROM payment_methods
ORDER BY name, display_order;

-- 2. ลบแถวซ้ำ Credit/Debit Card ออก เก็บแค่แถวที่มี display_order น้อยที่สุด (ตัวแรก)
--    ถ้ายืนยันแล้วว่าจะลบ ให้ uncomment บรรทัด DELETE ด้านล่าง

DELETE FROM payment_methods
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY LOWER(TRIM(name))
             ORDER BY display_order ASC, created_at ASC
           ) AS rn
    FROM payment_methods
  ) ranked
  WHERE rn > 1
);

-- 3. ตรวจสอบผลลัพธ์
SELECT id, name, slug, is_active, display_order
FROM payment_methods
ORDER BY display_order;
