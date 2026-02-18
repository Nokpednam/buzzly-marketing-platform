-- ============================================================
-- Mock Data Part 8: Team Activity Logs (50 rows)
-- team_activity_logs: id, team_id, user_id, action, target_user_id, target_email, details, created_at
-- Depends on: workspaces, auth.users
-- ============================================================

DO $$
DECLARE
  v_ws record;
  v_user_ids uuid[];
  v_actions text[] := ARRAY[
    'member_invited','member_joined','member_removed','member_role_changed',
    'invitation_accepted','invitation_expired','invitation_revoked',
    'workspace_settings_updated','workspace_name_changed','workspace_logo_updated',
    'campaign_created','campaign_paused','campaign_deleted','campaign_budget_updated',
    'report_generated','report_scheduled','report_deleted',
    'api_key_created','api_key_revoked',
    'billing_plan_upgraded','billing_plan_downgraded'
  ];
  v_emails text[] := ARRAY[
    'member1@company.co.th','member2@gmail.com','editor@outlook.com',
    'viewer@hotmail.com','admin@company.co.th','staff@yahoo.com',
    'analyst@company.co.th','marketing@gmail.com','sales@outlook.com','ops@company.co.th'
  ];
  i int; j int;
  v_uid uuid; v_target_uid uuid;
BEGIN
  SELECT ARRAY(SELECT id FROM auth.users LIMIT 30) INTO v_user_ids;

  IF array_length(v_user_ids, 1) IS NULL THEN
    RAISE WARNING 'No users found. Skipping team_activity_logs seed.';
    RETURN;
  END IF;

  j := 0;
  FOR v_ws IN SELECT id, owner_id FROM public.workspaces ORDER BY created_at LIMIT 25 LOOP
    FOR i IN 1..2 LOOP
      j := j + 1;
      v_uid := v_user_ids[1 + (j % array_length(v_user_ids,1))];
      v_target_uid := v_user_ids[1 + ((j+1) % array_length(v_user_ids,1))];

      INSERT INTO public.team_activity_logs (
        id, team_id, user_id, action,
        target_user_id, target_email,
        details, created_at
      ) VALUES (
        gen_random_uuid(),
        v_ws.id,
        v_uid,
        v_actions[1 + (j % array_length(v_actions,1))],
        CASE WHEN j % 3 = 0 THEN v_target_uid ELSE NULL END,
        CASE WHEN j % 3 != 0 THEN v_emails[1 + (j % array_length(v_emails,1))] ELSE NULL END,
        jsonb_build_object(
          'action', v_actions[1 + (j % array_length(v_actions,1))],
          'ip_address', '10.' || (floor(random()*255))::text || '.' || (floor(random()*255))::text || '.' || (floor(random()*255))::text,
          'browser', CASE j%3 WHEN 0 THEN 'Chrome' WHEN 1 THEN 'Firefox' ELSE 'Safari' END,
          'os', CASE j%2 WHEN 0 THEN 'Windows' ELSE 'macOS' END
        ),
        NOW() - (floor(random()*30)+1)::int * INTERVAL '1 day'
               - (floor(random()*24))::int * INTERVAL '1 hour'
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Part 8: Team Activity Logs seeded (50 rows).';
END $$;

DO $$ BEGIN RAISE NOTICE '✅ ALL MOCK DATA COMPLETE — team_activity_logs added!'; END $$;
