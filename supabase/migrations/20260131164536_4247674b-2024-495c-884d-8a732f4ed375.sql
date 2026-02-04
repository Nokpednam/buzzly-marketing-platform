-- Insert subscription plans data
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, features, limits, display_order, is_popular, is_active) VALUES
('Free', 'free', 'เริ่มต้นใช้งานฟรี', 0, 0, 
 '["Dashboard พื้นฐาน", "เชื่อมต่อ 2 แพลตฟอร์ม", "รายงานรายสัปดาห์", "ข้อมูลย้อนหลัง 7 วัน"]'::jsonb,
 '{"api_calls": 1000, "platforms": 2, "team_members": 1}'::jsonb, 1, false, true),
('Pro', 'pro', 'สำหรับธุรกิจที่ต้องการเติบโต', 990, 9900,
 '["ทุกอย่างใน Free", "AI Insights", "เชื่อมต่อไม่จำกัด", "Real-time Dashboard", "ข้อมูลย้อนหลัง 90 วัน", "Custom Reports"]'::jsonb,
 '{"api_calls": 50000, "platforms": -1, "team_members": 3}'::jsonb, 2, true, true),
('Team', 'team', 'สำหรับทีมที่ต้องการจัดการร่วมกัน', 2490, 24900,
 '["ทุกอย่างใน Pro", "ทีมไม่จำกัด", "API Access", "Priority Support", "ข้อมูลย้อนหลังไม่จำกัด"]'::jsonb,
 '{"api_calls": -1, "platforms": -1, "team_members": -1}'::jsonb, 3, false, true)
ON CONFLICT (slug) DO UPDATE SET 
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  is_popular = EXCLUDED.is_popular,
  is_active = EXCLUDED.is_active;