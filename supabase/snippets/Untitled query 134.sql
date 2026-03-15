DO $$ 
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
BEGIN
  -- 1. ค้นหา User ID ของคุณ (อ้างอิงจาก Profile ล่าสุดที่สร้าง)
  SELECT user_id, id INTO v_user_id, v_profile_id 
  FROM public.profile_customers 
  ORDER BY created_at DESC LIMIT 1;

  RAISE NOTICE 'กำลังแก้บั๊กให้ User: %', v_user_id;

  -- 2. บันทึกว่าทำภารกิจ Create Workspace สำเร็จแล้ว
  INSERT INTO public.loyalty_mission_completions (user_id, action_type)
  VALUES (v_user_id, 'create_workspace')
  ON CONFLICT DO NOTHING;

  -- 3. บวกแต้ม 50 คะแนนเข้ากระเป๋าตรงๆ
  -- (เฉพาะกรณีที่ยังไม่เคยได้แต้มจากภารกิจนี้มาก่อน)
  IF FOUND THEN
      UPDATE public.loyalty_points
      SET point_balance = point_balance + 50,
          total_points_earned = total_points_earned + 50
      WHERE profile_customer_id = v_profile_id;
      
      RAISE NOTICE 'บวกแต้มสำเร็จ! +50 pts';
  END IF;

END $$;