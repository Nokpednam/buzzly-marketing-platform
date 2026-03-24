-- =============================================================================
-- Buzzly — Seed demo Owner / Dev / Support (matches setup-full.sh credentials)
-- =============================================================================
-- Run in: Supabase Dashboard → SQL Editor → New query → Paste → Run
--
-- Credentials after success (same as setup-full.sh):
--   Owner   : hachikonoluna@gmail.com / owner123
--   Dev     : dev@buzzly.co           / dev123
--   Support : support@buzzly.co       / support123
--
-- Idempotent: safe to re-run. Updates passwords to these demo values.
-- DEMO ONLY — change passwords if this database is not throwaway.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_instance_id uuid;
  owner_fixed_id uuid := '15b96bdd-41dd-4d38-83a4-a6577b57eec3';
  dev_fixed_id uuid := 'd0000000-0000-0000-0000-000000000000';
  support_fixed_id uuid := 'e0000000-0000-0000-0000-000000000000';
  owner_email text := 'hachikonoluna@gmail.com';
  owner_pass text := 'owner123';
  dev_email text := 'dev@buzzly.co';
  dev_pass text := 'dev123';
  support_email text := 'support@buzzly.co';
  support_pass text := 'support123';
  owner_role_id uuid;
  dev_role_id uuid;
  support_role_id uuid;
  owner_uid uuid;
  dev_uid uuid;
  support_uid uuid;
  v_ws_id uuid;
  v_bt_id uuid;
BEGIN
  -- Hosted Supabase may have no rows in auth.instances; match local docker fallback.
  SELECT id INTO v_instance_id FROM auth.instances LIMIT 1;
  IF v_instance_id IS NULL THEN
    SELECT instance_id INTO v_instance_id FROM auth.users WHERE instance_id IS NOT NULL LIMIT 1;
  END IF;
  IF v_instance_id IS NULL THEN
    v_instance_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;

  SELECT id INTO owner_role_id FROM public.role_employees WHERE role_name = 'owner';
  SELECT id INTO dev_role_id FROM public.role_employees WHERE role_name = 'dev';
  SELECT id INTO support_role_id FROM public.role_employees WHERE role_name = 'support';

  IF owner_role_id IS NULL OR dev_role_id IS NULL OR support_role_id IS NULL THEN
    RAISE EXCEPTION 'role_employees must contain owner, dev, support (got null)';
  END IF;

  -- ─── Owner: prefer existing auth user by email; else insert fixed UUID ───
  SELECT id INTO owner_uid FROM auth.users WHERE lower(email) = lower(owner_email);
  IF owner_uid IS NULL THEN
    owner_uid := owner_fixed_id;
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
      is_sso_user, is_anonymous
    ) VALUES (
      v_instance_id,
      owner_uid,
      'authenticated',
      'authenticated',
      owner_email,
      extensions.crypt(owner_pass, extensions.gen_salt('bf')),
      NOW(),
      '', '', '', '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Owner Account","is_employee_signup":true}'::jsonb,
      false,
      NOW(),
      NOW(),
      false,
      false
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = extensions.crypt(owner_pass, extensions.gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider":"email","providers":["email"]}'::jsonb,
      updated_at = NOW()
    WHERE id = owner_uid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = owner_uid AND provider = 'email') THEN
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      owner_uid::text,
      owner_uid,
      jsonb_build_object('sub', owner_uid::text, 'email', owner_email),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  INSERT INTO public.employees (user_id, email, status, approval_status, role_employees_id, created_at, updated_at)
  VALUES (owner_uid, owner_email, 'active', 'approved', owner_role_id, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    status = 'active',
    approval_status = 'approved',
    role_employees_id = EXCLUDED.role_employees_id,
    updated_at = NOW();

  -- Workspace for owner (if none)
  IF NOT EXISTS (SELECT 1 FROM public.workspaces WHERE owner_id = owner_uid) THEN
    SELECT id INTO v_bt_id FROM public.business_types LIMIT 1;
    v_ws_id := gen_random_uuid();
    INSERT INTO public.workspaces (id, name, owner_id, status, business_type_id, created_at, updated_at)
    VALUES (v_ws_id, 'My Awesome Business', owner_uid, 'active', v_bt_id, NOW(), NOW());
    INSERT INTO public.workspace_members (team_id, user_id, role, status)
    VALUES (v_ws_id, owner_uid, 'owner', 'active')
    ON CONFLICT (team_id, user_id) DO UPDATE SET status = 'active', role = 'owner';
  END IF;

  -- ─── Dev (fixed UUID) ───
  SELECT id INTO dev_uid FROM auth.users WHERE lower(email) = lower(dev_email);
  IF dev_uid IS NULL THEN
    dev_uid := dev_fixed_id;
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      is_sso_user, is_anonymous
    ) VALUES (
      v_instance_id,
      dev_uid,
      'authenticated',
      'authenticated',
      dev_email,
      extensions.crypt(dev_pass, extensions.gen_salt('bf')),
      NOW(),
      '', '', '', '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Dev User","is_employee_signup":true}'::jsonb,
      NOW(),
      NOW(),
      false,
      false
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = extensions.crypt(dev_pass, extensions.gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW()
    WHERE id = dev_uid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = dev_uid AND provider = 'email') THEN
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      dev_uid::text,
      dev_uid,
      jsonb_build_object('sub', dev_uid::text, 'email', dev_email),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  INSERT INTO public.employees (user_id, email, status, approval_status, role_employees_id, created_at, updated_at)
  VALUES (dev_uid, dev_email, 'active', 'approved', dev_role_id, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    status = 'active',
    approval_status = 'approved',
    role_employees_id = EXCLUDED.role_employees_id,
    updated_at = NOW();

  -- ─── Support (fixed UUID) ───
  SELECT id INTO support_uid FROM auth.users WHERE lower(email) = lower(support_email);
  IF support_uid IS NULL THEN
    support_uid := support_fixed_id;
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      is_sso_user, is_anonymous
    ) VALUES (
      v_instance_id,
      support_uid,
      'authenticated',
      'authenticated',
      support_email,
      extensions.crypt(support_pass, extensions.gen_salt('bf')),
      NOW(),
      '', '', '', '',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Support User","is_employee_signup":true}'::jsonb,
      NOW(),
      NOW(),
      false,
      false
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = extensions.crypt(support_pass, extensions.gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW()
    WHERE id = support_uid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = support_uid AND provider = 'email') THEN
    INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      support_uid::text,
      support_uid,
      jsonb_build_object('sub', support_uid::text, 'email', support_email),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  INSERT INTO public.employees (user_id, email, status, approval_status, role_employees_id, created_at, updated_at)
  VALUES (support_uid, support_email, 'active', 'approved', support_role_id, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    status = 'active',
    approval_status = 'approved',
    role_employees_id = EXCLUDED.role_employees_id,
    updated_at = NOW();

  RAISE NOTICE 'Demo employees ready — Owner: % / Dev: % / Support: %', owner_email, dev_email, support_email;
END $$;
