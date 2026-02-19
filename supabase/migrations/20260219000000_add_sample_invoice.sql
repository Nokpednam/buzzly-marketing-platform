-- เพิ่ม THB currency ถ้ายังไม่มี
INSERT INTO public.currencies (code, symbol, name)
SELECT 'THB', '฿', 'Thai Baht'
WHERE NOT EXISTS (
  SELECT 1 FROM public.currencies WHERE code = 'THB'
);

-- สร้าง Invoice ตัวอย่างสำหรับ Subscription ที่มีอยู่แล้ว
-- (จะสร้างให้ทุก active subscription ที่ยังไม่มี invoice)
INSERT INTO public.invoices (
  user_id,
  subscription_id,
  invoice_number,
  status,
  subtotal,
  tax_amount,
  discount_amount,
  total,
  currency_id,
  due_date,
  paid_at,
  line_items
)
SELECT 
  s.user_id,
  s.id AS subscription_id,
  'INV-' || to_char(s.current_period_start, 'YYYYMM') || '-' || substr(s.id::text, 1, 6) AS invoice_number,
  'paid' AS status,
  CASE 
    WHEN sp.price_monthly IS NOT NULL THEN sp.price_monthly 
    ELSE 0 
  END AS subtotal,
  0 AS tax_amount,
  0 AS discount_amount,
  CASE 
    WHEN sp.price_monthly IS NOT NULL THEN sp.price_monthly 
    ELSE 0 
  END AS total,
  (SELECT id FROM public.currencies WHERE code = 'THB' LIMIT 1) AS currency_id,
  s.current_period_start AS due_date,
  s.current_period_start AS paid_at,
  json_build_array(
    json_build_object(
      'description', sp.name || ' Plan - รายเดือน',
      'quantity', 1,
      'unit_price', COALESCE(sp.price_monthly, 0),
      'total', COALESCE(sp.price_monthly, 0)
    )
  )::jsonb AS line_items
FROM public.subscriptions s
JOIN public.subscription_plans sp ON s.plan_id = sp.id
WHERE s.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM public.invoices i WHERE i.subscription_id = s.id
  );
