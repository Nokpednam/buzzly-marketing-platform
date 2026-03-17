-- Seed realistic audit_logs_enhanced for Product Usage
-- ครอบคลุมทุกฟีเจอร์ที่ Customer กดได้ (page_url = pathname)
-- Run after mock_crm_system or when auth.users/customer exist

DO $$
DECLARE
  v_user_ids uuid[];
  v_actions uuid[];
  v_uid uuid;
  v_act uuid;
  v_meta jsonb;
  i int;
  j int;
  v_paths text[] := ARRAY['/dashboard','/personas','/campaigns','/campaigns/demo-campaign-1','/social/planner','/social/analytics','/social/inbox','/social/integrations','/customer-journey','/aarrr-funnel','/api-keys','/analytics','/reports','/settings','/team','/support/discount-management','/support/tier-management','/support/rewards-management','/support/redemption-requests','/support/activity-codes','/support/workspaces'];
  v_counts int[] := ARRAY[8,4,6,5,5,4,2,3,4,3,2,6,5,4,3,2,2,3,2,1,2];
BEGIN
  SELECT ARRAY(SELECT id FROM auth.users LIMIT 50) INTO v_user_ids;
  IF v_user_ids IS NULL OR array_length(v_user_ids, 1) IS NULL THEN
    SELECT ARRAY(SELECT id FROM public.customer LIMIT 50) INTO v_user_ids;
  END IF;
  IF v_user_ids IS NULL OR array_length(v_user_ids, 1) IS NULL THEN
    RAISE WARNING 'No auth.users or customer found, skipping feature usage audit seed.';
    RETURN;
  END IF;

  SELECT ARRAY(SELECT id FROM public.action_type) INTO v_actions;

  -- Insert success (page views) — ทุกฟีเจอร์ที่ Customer กดได้
  FOR j IN 1..array_length(v_paths, 1) LOOP
    FOR i IN 1..v_counts[j] LOOP
      v_uid := v_user_ids[1 + (i % array_length(v_user_ids, 1))];
      v_act := CASE WHEN array_length(v_actions, 1) > 0
        THEN v_actions[1 + (i % array_length(v_actions, 1))] ELSE NULL END;
      v_meta := jsonb_build_object('action_name', 'Page View', 'page_url', v_paths[j], 'browser', 'Chrome');

      INSERT INTO public.audit_logs_enhanced (
        id, user_id, action_type_id, category, description,
        ip_address, status, metadata, created_at
      ) VALUES (
        gen_random_uuid(), v_uid, v_act, 'feature',
        'Viewed ' || v_paths[j],
        '10.' || (floor(random()*255))::text || '.' || (floor(random()*255))::text || '.' || (floor(random()*255))::text,
        'success',
        v_meta || jsonb_build_object('timestamp', (NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day' - (floor(random()*24))::int * INTERVAL '1 hour')::timestamptz),
        NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day'
               - (floor(random()*24))::int * INTERVAL '1 hour'
      );
    END LOOP;
  END LOOP;

  -- Insert friction (failed) — กระจายตามฟีเจอร์
  FOR i IN 1..220 LOOP
    v_uid := v_user_ids[1 + (i % array_length(v_user_ids, 1))];
    v_act := CASE WHEN array_length(v_actions, 1) > 0
      THEN v_actions[1 + (i % array_length(v_actions, 1))] ELSE NULL END;

    CASE (1 + (i % 8))
      WHEN 1 THEN v_meta := jsonb_build_object('action_name', 'Login Failed', 'page_url', '/auth');
      WHEN 2 THEN v_meta := jsonb_build_object('action_name', 'Campaign Created', 'page_url', '/campaigns');
      WHEN 3 THEN v_meta := jsonb_build_object('action_name', 'Data Exported', 'page_url', '/reports');
      WHEN 4 THEN v_meta := jsonb_build_object('action_name', 'Platform Connected', 'page_url', '/social/integrations');
      WHEN 5 THEN v_meta := jsonb_build_object('action_name', 'API Key Created', 'page_url', '/api-keys');
      WHEN 6 THEN v_meta := jsonb_build_object('action_name', 'Report Generated', 'page_url', '/reports');
      WHEN 7 THEN v_meta := jsonb_build_object('action_name', 'Campaign Created', 'page_url', '/campaigns');
      ELSE v_meta := jsonb_build_object('action_name', 'Settings Changed', 'page_url', '/settings');
    END CASE;

    INSERT INTO public.audit_logs_enhanced (
      id, user_id, action_type_id, category, description,
      ip_address, status, metadata, created_at
    ) VALUES (
      gen_random_uuid(), v_uid, v_act,
      (ARRAY['authentication','campaign','data','integration','settings','campaign','data','settings'])[1 + (i % 8)],
      'Action failed',
      '10.' || (floor(random()*255))::text || '.' || (floor(random()*255))::text || '.' || (floor(random()*255))::text,
      (ARRAY['failed','error'])[1 + (i % 2)],
      v_meta || jsonb_build_object('timestamp', (NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day')::timestamptz),
      NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day'
             - (floor(random()*24))::int * INTERVAL '1 hour'
    );
  END LOOP;

  RAISE NOTICE 'Feature usage audit logs seeded: 21 features (Customer + Support) + 220 friction rows.';
END $$;
