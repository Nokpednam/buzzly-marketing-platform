-- ============================================================
-- Mock Data Part 4 (FIXED): Social Posts & Email Campaigns
-- social_posts (60), email_campaigns (60)
-- ============================================================

-- 4.1 Social Posts
DO $$
DECLARE
  v_ws record;
  v_platforms_arr uuid[];
  v_captions text[] := ARRAY[
    'ยินดีต้อนรับสู่ฤดูกาลใหม่! 🎉 เตรียมพบกับโปรโมชั่นสุดพิเศษ',
    'เราภูมิใจนำเสนอผลิตภัณฑ์ใหม่ล่าสุด ✨ คุณภาพระดับพรีเมียม',
    'Flash Sale 24 ชั่วโมง! ลดสูงสุด 70% เฉพาะวันนี้เท่านั้น 🔥',
    'ขอบคุณลูกค้าทุกท่านที่ไว้วางใจเรามาตลอด 💙 #ThankYou',
    'เคล็ดลับการใช้งานที่คุณอาจยังไม่รู้ 💡 อ่านเพิ่มเติมในลิงก์',
    'Behind the scenes: ทีมงานของเราทำงานหนักเพื่อคุณ 💪',
    'ร่วมสนุกกับ Giveaway พิเศษ! แค่ Like & Share ก็ลุ้นรับของรางวัล 🎁',
    'New Collection พร้อมแล้ว! ดีไซน์ล้ำสมัย ตอบโจทย์ทุกไลฟ์สไตล์',
    'สิ้นเดือนนี้เท่านั้น! สมัครสมาชิกรับส่วนลด 20% ทันที',
    'ลูกค้าพูดถึงเรา ⭐⭐⭐⭐⭐ "บริการดีมาก ประทับใจมากครับ"',
    'Tips & Tricks: วิธีเพิ่ม ROI จากโฆษณาออนไลน์ให้ได้ผลสูงสุด',
    'ประกาศ! เราได้รับรางวัล Best Service Award 2025 🏆',
    'Weekend Special: ซื้อ 1 แถม 1 เฉพาะ Sat-Sun เท่านั้น',
    'Meet the Team: รู้จักกับทีมผู้เชี่ยวชาญของเรา 👋',
    'Case Study: ลูกค้าของเราเพิ่มยอดขายได้ 3x ใน 3 เดือน 📈'
  ];
  v_statuses text[] := ARRAY['published','published','published','scheduled','draft'];
  v_types    text[] := ARRAY['image','video','carousel','story','text'];
  i int; j int;
BEGIN
  SELECT ARRAY(SELECT id FROM public.platforms WHERE is_active = true ORDER BY name)
  INTO v_platforms_arr;

  j := 0;
  FOR v_ws IN SELECT id FROM public.workspaces ORDER BY created_at LIMIT 20 LOOP
    FOR i IN 1..3 LOOP
      j := j + 1;
      INSERT INTO public.social_posts (
        id, team_id, platform_id, post_type, content, status,
        scheduled_at, published_at, created_at,
        likes, comments, shares, reach, impressions, engagement_rate
      ) VALUES (
        gen_random_uuid(),
        v_ws.id,
        v_platforms_arr[1 + ((j-1) % GREATEST(array_length(v_platforms_arr,1),1))],
        v_types[1 + ((j-1) % array_length(v_types,1))],
        v_captions[1 + ((j-1) % array_length(v_captions,1))],
        v_statuses[1 + ((j-1) % array_length(v_statuses,1))],
        NOW() + (i * INTERVAL '2 days'),
        CASE WHEN i <= 2 THEN NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day' ELSE NULL END,
        NOW() - (floor(random()*60)+1)::int * INTERVAL '1 day',
        floor(random()*500)::int,
        floor(random()*80)::int,
        floor(random()*120)::int,
        floor(random()*5000)::int,
        floor(random()*8000)::int,
        round((random()*8)::numeric, 2)
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Part 4a (fixed): Social Posts seeded.';
END $$;

-- 4.2 Email Campaigns
DO $$
DECLARE
  v_ws record;
  v_subjects text[] := ARRAY[
    'ข่าวดี! โปรโมชั่นพิเศษสำหรับคุณโดยเฉพาะ 🎉',
    'อย่าพลาด! Flash Sale สิ้นสุดในอีก 24 ชั่วโมง ⏰',
    'สรุปข่าวสารประจำเดือน — Buzzly Newsletter',
    'ยืนยันการสั่งซื้อของคุณ ✅',
    'ขอบคุณที่เป็นสมาชิก Premium 💙',
    'เราคิดถึงคุณ! กลับมาใช้งานรับส่วนลด 15%',
    'รายงานประสิทธิภาพแคมเปญประจำสัปดาห์',
    'New Feature Alert: ฟีเจอร์ใหม่ที่คุณรอคอย 🚀',
    'Webinar Invitation: เรียนรู้การตลาดดิจิทัลฟรี!',
    'Happy Birthday! ของขวัญพิเศษจากเรา 🎂'
  ];
  v_statuses text[] := ARRAY['sent','sent','sent','scheduled','draft','sent'];
  i int; j int;
BEGIN
  j := 0;
  FOR v_ws IN SELECT id FROM public.workspaces ORDER BY created_at LIMIT 20 LOOP
    FOR i IN 1..3 LOOP
      j := j + 1;
      INSERT INTO public.email_campaigns (
        id, team_id, name, subject, status,
        recipient_count, open_count, click_count,
        scheduled_at, sent_at, created_at
      ) VALUES (
        gen_random_uuid(),
        v_ws.id,
        'Email Campaign #' || i || ' — ' || (SELECT name FROM public.workspaces WHERE id = v_ws.id),
        v_subjects[1 + ((j-1) % array_length(v_subjects,1))],
        v_statuses[1 + ((j-1) % array_length(v_statuses,1))],
        500 + floor(random()*4500)::int,
        floor(random()*2000)::int,
        floor(random()*500)::int,
        NOW() + (i * INTERVAL '3 days'),
        CASE WHEN i <= 2 THEN NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day' ELSE NULL END,
        NOW() - (floor(random()*60)+1)::int * INTERVAL '1 day'
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Part 4b (fixed): Email Campaigns seeded.';
END $$;
