-- ============================================================
-- Mock Data Part 6 (v2 FIXED): Prospects, Personas, Error Logs, Audit Logs,
--   System Monitoring, Suspicious Activities
-- ============================================================

-- 6.1 Prospects (FIXED: user_id/name/company/status: hot|warm|cold, score 0-100)
DO $$
DECLARE
  v_user_ids uuid[];
  v_names text[] := ARRAY[
    'สมชาย ใจดี','สมหญิง สุขสม','วิชัย มีทรัพย์','นภา รักไทย','ธนา ศรีสุข',
    'พิมพ์ วงศ์ทอง','ชัยวัฒน์ พงษ์ศิริ','สุดา บุญมา','กิตติ แก้วมณี','มณี สมบูรณ์',
    'อนุชา ทองคำ','ปิยะ ดีงาม','วรรณา สว่างใจ','ภาณุ ชัยชนะ','รัตนา พรหมมา',
    'เอกชัย นาคา','ลลิตา ศิริวงศ์','ศักดิ์ดา บุญเรือง','จิรา ทวีสุข','ประยุทธ์ มงคล',
    'ณัฐ ศรีวิชัย','กาญจนา ทองใส','ธีรพงศ์ สุขใจ','ปณิตา วิชัย','ยุทธนา ดีมาก',
    'สุภาพ รักดี','นิตยา ใจงาม','ชาญณรงค์ สมหวัง','พรทิพย์ มีสุข','วิไล ดีเลิศ',
    'อภิชาติ สุขสวัสดิ์','ปรีชา วงศ์ดี','สมพร ทรัพย์มาก','กัญญา รุ่งเรือง','ธนพล ชัยดี',
    'ศิริพร สมบัติ','ณัฐพล ดีงาม','พัชรา สุขสม','วรพล มีทรัพย์','สุนิสา ใจดี',
    'ชัชวาล รักไทย','ปิยนุช ศรีสุข','กิตติพงศ์ วงศ์ทอง','นันทนา พงษ์ศิริ','ธีรศักดิ์ บุญมา',
    'สุภาภรณ์ แก้วมณี','ประสิทธิ์ สมบูรณ์','วิภาวดี ทองคำ','ชนาธิป ดีงาม','ศุภชัย สว่างใจ'
  ];
  v_companies text[] := ARRAY['บริษัท ไทยเทค จำกัด','ห้างหุ้นส่วน สยามเทรด','บริษัท ดิจิทัลมาร์ท จำกัด',
    'ร้านค้า ออนไลน์ช็อป','บริษัท กรีนเอนเนอร์จี จำกัด','สำนักงาน ที่ปรึกษาธุรกิจ',
    'บริษัท ฟู้ดเดลิเวอรี่ จำกัด','ห้างสรรพสินค้า เมกาพลาซ่า','บริษัท เฮลท์แคร์ พลัส จำกัด',
    'สถาบัน การศึกษาออนไลน์'];
  v_statuses text[] := ARRAY['hot','hot','warm','warm','cold','cold','warm','hot','cold','warm'];
  i int; v_uid uuid;
BEGIN
  SELECT ARRAY(SELECT id FROM auth.users LIMIT 50) INTO v_user_ids;
  IF v_user_ids IS NULL OR array_length(v_user_ids,1) IS NULL THEN
    RAISE WARNING 'Part 6a: No auth.users found, skipping prospects seed.';
    RETURN;
  END IF;
  FOR i IN 1..50 LOOP
    v_uid := v_user_ids[1 + ((i-1) % array_length(v_user_ids,1))];
    INSERT INTO public.prospects (
      id, user_id, name, email, company, phone,
      status, score, notes, created_at
    ) VALUES (
      gen_random_uuid(), v_uid,
      v_names[1 + ((i-1) % array_length(v_names,1))],
      'prospect' || i::text || '@example.co.th',
      v_companies[1 + ((i-1) % array_length(v_companies,1))],
      '08' || floor(random()*90000000+10000000)::text,
      v_statuses[1 + ((i-1) % array_length(v_statuses,1))],
      (10 + floor(random()*90))::int,
      'Prospect #' || i::text || ' — ' || v_statuses[1 + ((i-1) % array_length(v_statuses,1))],
      NOW() - (floor(random()*180)+1)::int * INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Part 6a: Prospects seeded (50).';
END $$;

-- 6.2 Customer Personas (FIXED: persona_name, age_min/age_max, gender_id)
DO $$
DECLARE
  v_ws record;
  v_persona_names text[] := ARRAY[
    'นักช้อปออนไลน์','คนรุ่นใหม่ใส่ใจสุขภาพ','ผู้บริหารระดับกลาง','แม่บ้านยุคดิจิทัล',
    'นักศึกษามหาวิทยาลัย','เจ้าของธุรกิจ SME','ผู้สูงอายุที่ใช้เทคโนโลยี',
    'ฟรีแลนซ์ครีเอทีฟ','นักลงทุนรายย่อย','คนทำงาน Gen Z'
  ];
  v_gender_ids uuid[];
  i int; j int;
BEGIN
  SELECT ARRAY(SELECT id FROM public.genders ORDER BY name_gender) INTO v_gender_ids;
  j := 0;
  FOR v_ws IN SELECT id FROM public.workspaces ORDER BY created_at LIMIT 10 LOOP
    FOR i IN 1..5 LOOP
      j := j + 1;
      INSERT INTO public.customer_personas (
        id, team_id, persona_name, gender_id,
        age_min, age_max,
        interests, pain_points, goals,
        created_at
      ) VALUES (
        gen_random_uuid(), v_ws.id,
        v_persona_names[1 + (j % array_length(v_persona_names,1))],
        CASE WHEN array_length(v_gender_ids,1) > 0 THEN v_gender_ids[1 + (j % array_length(v_gender_ids,1))] ELSE NULL END,
        18 + (i * 5),
        18 + (i * 5) + 9,
        ARRAY['shopping','technology','health','travel','food']::text[],
        ARRAY['ราคาสูง','บริการช้า','ขาดข้อมูล']::text[],
        ARRAY['ประหยัดเวลา','ได้ของดีราคาถูก','บริการสะดวก']::text[],
        NOW() - (floor(random()*90)+1)::int * INTERVAL '1 day'
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Part 6b: Customer Personas seeded (50).';
END $$;

-- 6.3 Points Transactions (FIXED: points_amount, balance_after, loyalty_points_id)
DO $$
DECLARE
  v_user record;
  v_types text[] := ARRAY['earn','earn','earn','spend','earn','spend','earn','bonus'];
  i int; v_pts int; v_bal int;
BEGIN
  FOR v_user IN
    SELECT pc.user_id, pc.loyalty_point_id
    FROM public.profile_customers pc
    WHERE pc.loyalty_point_id IS NOT NULL
    LIMIT 30
  LOOP
    v_bal := 0;
    FOR i IN 1..(3 + floor(random()*3)::int) LOOP
      v_pts := CASE
        WHEN v_types[1 + (i % array_length(v_types,1))] IN ('earn','bonus') THEN (50 + floor(random()*450))::int
        ELSE -(20 + floor(random()*180))::int
      END;
      v_bal := GREATEST(0, v_bal + v_pts);

      INSERT INTO public.points_transactions (
        id, user_id, loyalty_points_id,
        transaction_type, points_amount, balance_after,
        description, created_at
      ) VALUES (
        gen_random_uuid(),
        v_user.user_id,
        v_user.loyalty_point_id,
        v_types[1 + (i % array_length(v_types,1))],
        v_pts,
        v_bal,
        CASE
          WHEN v_pts > 0 THEN 'ได้รับ ' || v_pts || ' คะแนน'
          ELSE 'ใช้ ' || abs(v_pts) || ' คะแนนแลกของรางวัล'
        END,
        NOW() - (floor(random()*180)+1)::int * INTERVAL '1 day'
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Part 6c: Points Transactions seeded.';
END $$;

-- 6.4 Error Logs (+56 rows)
DO $$
DECLARE
  v_levels text[] := ARRAY['error','error','warning','info','warning','error','critical'];
  v_messages text[] := ARRAY[
    'Database connection timeout after 30s',
    'Payment gateway returned 502 Bad Gateway',
    'High memory usage detected: 87%',
    'Scheduled report generation completed',
    'Rate limit exceeded for Facebook Ads API',
    'User authentication failed: invalid token',
    'Email delivery failed: SMTP connection refused',
    'Cache miss rate above threshold: 45%',
    'Webhook delivery failed after 3 retries',
    'Disk usage critical: 92% on /var/data',
    'SSL certificate expires in 7 days',
    'Slow query detected: 4.2s on ad_insights',
    'Background job queue depth: 1,200 items',
    'Third-party API response time: 8.5s',
    'Failed login attempt from IP 103.45.67.89'
  ];
  v_services text[] := ARRAY['api','payment','auth','scheduler','ads-sync','email','cache','webhook','storage','database'];
  v_user_ids uuid[];
  i int;
BEGIN
  SELECT ARRAY(SELECT id FROM auth.users LIMIT 50) INTO v_user_ids; -- Get some users

  FOR i IN 1..56 LOOP
    INSERT INTO public.error_logs (
      id, level, message, user_id, stack_trace, request_id, metadata, created_at
    ) VALUES (
      gen_random_uuid(),
      v_levels[1 + (i % array_length(v_levels,1))],
      v_messages[1 + (i % array_length(v_messages,1))],
      CASE 
        WHEN array_length(v_user_ids, 1) > 0 THEN v_user_ids[1 + floor(random() * array_length(v_user_ids, 1))::int]
        ELSE NULL 
      END,
      CASE WHEN v_levels[1 + (i % array_length(v_levels,1))] IN ('error','critical')
        THEN 'Error: ' || v_messages[1 + (i % array_length(v_messages,1))] || E'\n  at handler (/app/src/index.ts:' || (100+i)::text || ')'
        ELSE NULL END,
      'req_' || substr(md5(i::text), 1, 8),
      jsonb_build_object('service', v_services[1 + (i % array_length(v_services,1))], 'env', 'production'),
      NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day'
             - (floor(random()*24))::int * INTERVAL '1 hour'
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Part 6d: Error Logs seeded (+56 rows).';
END $$;

-- 6.5 Audit Logs Enhanced (FIXED: category, description, status — no resource_type/resource_id/user_agent)
DO $$
DECLARE
  v_user_ids uuid[];
  v_actions uuid[];
  v_categories text[] := ARRAY['campaign','workspace','user','subscription','ad_account','report','employee','discount'];
  v_descs text[] := ARRAY[
    'Created new campaign','Updated workspace settings','Changed user role',
    'Upgraded subscription','Connected ad account','Generated report',
    'Added team member','Applied discount code'
  ];
  i int; v_uid uuid; v_act uuid;
BEGIN
  SELECT ARRAY(SELECT id FROM auth.users LIMIT 30) INTO v_user_ids;
  SELECT ARRAY(SELECT id FROM public.action_type) INTO v_actions;
  IF v_user_ids IS NULL OR array_length(v_user_ids,1) IS NULL THEN
    RAISE WARNING 'Part 6e: No auth.users found, skipping audit_logs_enhanced seed.';
    RETURN;
  END IF;
  FOR i IN 1..50 LOOP
    v_uid := v_user_ids[1 + (i % array_length(v_user_ids,1))];
    v_act := CASE WHEN array_length(v_actions,1) > 0 THEN v_actions[1 + (i % array_length(v_actions,1))] ELSE NULL END;
    INSERT INTO public.audit_logs_enhanced (
      id, user_id, action_type_id, category, description,
      ip_address, status, metadata, created_at
    ) VALUES (
      gen_random_uuid(), v_uid, v_act,
      v_categories[1 + (i % array_length(v_categories,1))],
      v_descs[1 + (i % array_length(v_descs,1))],
      '10.' || (floor(random()*255))::text || '.' || (floor(random()*255))::text || '.' || (floor(random()*255))::text,
      'success',
      jsonb_build_object('browser','Chrome','os','Windows','version','120.0'),
      NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day'
             - (floor(random()*24))::int * INTERVAL '1 hour'
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Part 6e: Audit Logs Enhanced seeded (50).';
END $$;

-- 6.6 Server (FIXED: hostname, ip_address, cpu_usage_percent, memory in bytes)
INSERT INTO public.server (id, hostname, ip_address, status, cpu_usage_percent, total_memory, used_memory, disk_total, disk_used, system_boot_time, last_update) VALUES
  (gen_random_uuid(),'web-01.buzzly.internal','10.0.1.10','healthy',32.5,17179869184,9999999999,107374182400,44040192000,NOW()-INTERVAL '30 days',NOW()),
  (gen_random_uuid(),'web-02.buzzly.internal','10.0.1.11','healthy',28.1,17179869184,9057787699,107374182400,42445619200,NOW()-INTERVAL '29 days',NOW()),
  (gen_random_uuid(),'db-01.buzzly.internal','10.0.2.10','healthy',45.8,34359738368,24855638630,536870912000,338855895040,NOW()-INTERVAL '60 days',NOW()),
  (gen_random_uuid(),'db-02.buzzly.internal','10.0.2.11','healthy',12.4,34359738368,16792723456,536870912000,331107532800,NOW()-INTERVAL '59 days',NOW()),
  (gen_random_uuid(),'cache-01.buzzly.internal','10.0.3.10','healthy',8.2,8589934592,7859200000,53687091200,8221380608,NOW()-INTERVAL '40 days',NOW()),
  (gen_random_uuid(),'queue-01.buzzly.internal','10.0.4.10','healthy',55.3,8589934592,5505024000,53687091200,15393162240,NOW()-INTERVAL '20 days',NOW()),
  (gen_random_uuid(),'cdn-01.buzzly.internal','10.0.5.10','healthy',22.7,4294967296,1529346048,107374182400,59246592000,NOW()-INTERVAL '90 days',NOW()),
  (gen_random_uuid(),'backup-01.buzzly.internal','10.0.6.10','warning',5.1,4294967296,1297612800,1099511627776,947912130560,NOW()-INTERVAL '120 days',NOW())
ON CONFLICT DO NOTHING;

-- 6.7 Data Pipeline (FIXED: only columns that exist: name, status, last_run_at, next_run_at, schedule_cron, config)
INSERT INTO public.data_pipeline (id, name, status, last_run_at, next_run_at, schedule_cron, config) VALUES
  (gen_random_uuid(),'Facebook Ads Sync','active',NOW()-INTERVAL '1 hour',NOW()+INTERVAL '1 hour','0 * * * *',jsonb_build_object('source','facebook_ads_api','destination','ad_insights','records',125430)),
  (gen_random_uuid(),'Google Ads Sync','active',NOW()-INTERVAL '2 hours',NOW()+INTERVAL '2 hours','0 */2 * * *',jsonb_build_object('source','google_ads_api','destination','ad_insights','records',98720)),
  (gen_random_uuid(),'Revenue Aggregator','active',NOW()-INTERVAL '6 hours',NOW()+INTERVAL '18 hours','0 */6 * * *',jsonb_build_object('source','payment_transactions','destination','revenue_metrics','records',8920)),
  (gen_random_uuid(),'Email Stats Sync','active',NOW()-INTERVAL '3 hours',NOW()+INTERVAL '3 hours','0 */3 * * *',jsonb_build_object('source','sendgrid_api','destination','email_campaigns','records',45600,'errors',2)),
  (gen_random_uuid(),'Cohort Builder','active',NOW()-INTERVAL '12 hours',NOW()+INTERVAL '12 hours','0 */12 * * *',jsonb_build_object('source','customer_activities','destination','cohort_analysis','records',230000)),
  (gen_random_uuid(),'Audit Log Archiver','active',NOW()-INTERVAL '24 hours',NOW()+INTERVAL '24 hours','0 0 * * *',jsonb_build_object('source','audit_logs_enhanced','destination','archive_storage','records',1250000)),
  (gen_random_uuid(),'Social Media Sync','warning',NOW()-INTERVAL '4 hours',NOW()+INTERVAL '4 hours','0 */4 * * *',jsonb_build_object('source','line_tiktok_apis','destination','social_posts','records',32100,'errors',5)),
  (gen_random_uuid(),'Backup Pipeline','active',NOW()-INTERVAL '24 hours',NOW()+INTERVAL '24 hours','0 1 * * *',jsonb_build_object('source','all_tables','destination','backup_storage','records',5000000))
ON CONFLICT DO NOTHING;

-- 6.8 External API Status (FIXED: platform_id, latency_ms, last_status_code only)
DO $$
DECLARE
  v_platforms uuid[];
  v_latencies int[] := ARRAY[245,312,189,1850,98,145,420,380];
  v_codes int[] := ARRAY[200,200,200,503,200,200,200,200];
  v_colors text[] := ARRAY['#22c55e','#22c55e','#22c55e','#f59e0b','#22c55e','#22c55e','#22c55e','#22c55e'];
  i int;
BEGIN
  SELECT ARRAY(SELECT id FROM public.platforms ORDER BY name) INTO v_platforms;
  FOR i IN 1..LEAST(8, array_length(v_platforms,1)) LOOP
    INSERT INTO public.external_api_status (id, platform_id, latency_ms, last_status_code, color_code, created_at)
    VALUES (
      gen_random_uuid(),
      v_platforms[i],
      v_latencies[i],
      v_codes[i],
      v_colors[i],
      NOW()
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Part 6h: External API Status seeded.';
END $$;

-- 6.9 System Health
INSERT INTO public.system_health (id, service_name, service_type, status, uptime_percentage, response_time_ms, last_checked, metadata) VALUES
  (gen_random_uuid(),'API Gateway','api','healthy',99.95,45,NOW(),jsonb_build_object('region','ap-southeast-1')),
  (gen_random_uuid(),'Auth Service','auth','healthy',99.99,12,NOW(),jsonb_build_object('provider','supabase')),
  (gen_random_uuid(),'Database','database','healthy',99.98,8,NOW(),jsonb_build_object('engine','postgresql','version','15.4')),
  (gen_random_uuid(),'Cache Layer','cache','healthy',99.9,2,NOW(),jsonb_build_object('engine','redis','version','7.2')),
  (gen_random_uuid(),'Queue Service','queue','healthy',99.8,15,NOW(),jsonb_build_object('engine','bull','workers',4)),
  (gen_random_uuid(),'Email Service','email','healthy',99.7,120,NOW(),jsonb_build_object('provider','sendgrid')),
  (gen_random_uuid(),'Storage Service','storage','healthy',99.95,35,NOW(),jsonb_build_object('provider','supabase-storage')),
  (gen_random_uuid(),'CDN','cdn','healthy',99.99,8,NOW(),jsonb_build_object('provider','cloudflare'))
ON CONFLICT DO NOTHING;

-- 6.10 Suspicious Activities (20)
DO $$
DECLARE
  v_user_ids uuid[];
  v_types text[] := ARRAY[
    'multiple_failed_logins','unusual_location','api_abuse',
    'bulk_data_export','permission_escalation','suspicious_ip',
    'credential_stuffing','unusual_time_access'
  ];
  i int;
BEGIN
  SELECT ARRAY(SELECT id FROM auth.users LIMIT 30) INTO v_user_ids;
  IF v_user_ids IS NULL OR array_length(v_user_ids,1) IS NULL THEN
    RAISE WARNING 'Part 6j: No auth.users found, skipping suspicious_activities seed.';
    RETURN;
  END IF;
  FOR i IN 1..20 LOOP
    INSERT INTO public.suspicious_activities (
      id, user_id, activity_type, severity,
      description, is_resolved, created_at
    ) VALUES (
      gen_random_uuid(),
      v_user_ids[1 + (i % array_length(v_user_ids,1))],
      v_types[1 + (i % array_length(v_types,1))],
      CASE WHEN i % 5 = 0 THEN 'critical' WHEN i % 3 = 0 THEN 'high' WHEN i % 2 = 0 THEN 'medium' ELSE 'low' END,
      'Detected ' || v_types[1 + (i % array_length(v_types,1))] || ' from unusual location',
      (random() > 0.6),
      NOW() - (floor(random()*14)+1)::int * INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  RAISE NOTICE 'Part 6j: Suspicious Activities seeded (20).';
END $$;
