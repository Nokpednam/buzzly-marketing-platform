-- ============================================================
-- Mock Data Part 2 (FIXED): Ad Accounts, Campaigns, Ad Groups, Ads, Budgets
-- ad_accounts (50+), campaigns (60+), ad_groups (60+), ads (60+), budgets (60+)
-- Depends on: workspaces (from unified-seed), platforms (static seed)
-- NOTE: ad_groups has no campaign_id or daily_budget in schema.
--       budgets requires a name column.
-- ============================================================

DO $$
DECLARE
  v_workspaces uuid[];
  v_fb  uuid; v_gg uuid;
  v_ws  uuid;
  v_aa_fb uuid; v_aa_gg uuid;
  v_camp_id uuid;
  v_adg_id  uuid;
  v_ad_id   uuid;
  v_budget_id uuid;
  i int; v_idx int; v_camp_count int;

  v_camp_names text[] := ARRAY[
    'Summer Sale 2025','Brand Awareness Q1','Retargeting Wave','New Product Launch',
    'Holiday Special','Back to School','Flash Sale 48H','Year-End Clearance',
    'App Install Drive','Lead Generation Pro','Video Views Boost','Engagement Max',
    'Conversion Optimizer','Lookalike Expansion','Remarketing Gold'
  ];
  v_objectives text[] := ARRAY[
    'BRAND_AWARENESS','REACH','TRAFFIC','ENGAGEMENT',
    'APP_INSTALLS','VIDEO_VIEWS','LEAD_GENERATION','CONVERSIONS',
    'CATALOG_SALES','STORE_TRAFFIC'
  ];
  v_statuses text[] := ARRAY['active','active','active','paused','completed','draft'];
  v_adg_names text[] := ARRAY[
    'Bangkok Audience','Chiang Mai Segment','Mobile Users 18-34',
    'Desktop Retarget','Lookalike 1%','Interest: Shopping',
    'Interest: Technology','Broad Match','Exact Match','Competitor Keywords'
  ];
  v_ad_names text[] := ARRAY[
    'Creative A - Image','Creative B - Video','Headline Test 1',
    'Headline Test 2','Carousel Ad','Story Format',
    'Banner 300x250','Banner 728x90','Responsive Search','Dynamic Product'
  ];
BEGIN
  -- Get platform IDs
  SELECT id INTO v_fb FROM public.platforms WHERE slug = 'facebook-ads' LIMIT 1;
  SELECT id INTO v_gg FROM public.platforms WHERE slug = 'google-ads' LIMIT 1;
  -- Fallback if slugs differ
  IF v_fb IS NULL THEN SELECT id INTO v_fb FROM public.platforms ORDER BY name LIMIT 1; END IF;
  IF v_gg IS NULL THEN SELECT id INTO v_gg FROM public.platforms ORDER BY name OFFSET 1 LIMIT 1; END IF;

  -- Get first 25 workspaces
  SELECT ARRAY(SELECT id FROM public.workspaces ORDER BY created_at LIMIT 25)
  INTO v_workspaces;

  IF array_length(v_workspaces, 1) IS NULL THEN
    RAISE WARNING 'No workspaces found. Run unified-seed.sql first.';
    RETURN;
  END IF;

  FOR i IN 1..array_length(v_workspaces, 1) LOOP
    v_ws := v_workspaces[i];

    -- Facebook Ad Account
    v_aa_fb := gen_random_uuid();
    INSERT INTO public.ad_accounts (id, team_id, platform_id, account_name, platform_account_id, is_active, created_at)
    VALUES (v_aa_fb, v_ws, v_fb,
      (SELECT name FROM public.workspaces WHERE id = v_ws) || ' — FB Ads',
      'act_' || floor(random()*9000000000+1000000000)::text,
      true, NOW() - (random()*INTERVAL '180 days'))
    ON CONFLICT DO NOTHING;

    -- Google Ad Account
    v_aa_gg := gen_random_uuid();
    INSERT INTO public.ad_accounts (id, team_id, platform_id, account_name, platform_account_id, is_active, created_at)
    VALUES (v_aa_gg, v_ws, v_gg,
      (SELECT name FROM public.workspaces WHERE id = v_ws) || ' — Google Ads',
      floor(random()*900000000+100000000)::text || '-' || floor(random()*9000+1000)::text,
      false, NOW() - (random()*INTERVAL '180 days'))
    ON CONFLICT DO NOTHING;

    -- 2-3 campaigns per workspace
    v_camp_count := 2 + (i % 2);
    FOR v_idx IN 1..v_camp_count LOOP
      v_camp_id := gen_random_uuid();
      INSERT INTO public.campaigns (
        id, ad_account_id, name, status, objective,
        budget_amount, start_date, end_date, created_at
      ) VALUES (
        v_camp_id,
        CASE WHEN v_idx % 2 = 0 THEN v_aa_gg ELSE v_aa_fb END,
        v_camp_names[1 + ((i + v_idx) % array_length(v_camp_names,1))],
        v_statuses[1 + ((i + v_idx) % array_length(v_statuses,1))],
        v_objectives[1 + ((i + v_idx) % array_length(v_objectives,1))],
        (5000 + floor(random()*45000))::numeric,
        NOW() - (floor(random()*60)+1)::int * INTERVAL '1 day',
        NOW() + (floor(random()*30)+1)::int * INTERVAL '1 day',
        NOW() - (random()*INTERVAL '60 days')
      ) ON CONFLICT DO NOTHING;

      -- Budget for campaign (FIXED: added name column and team_id)
      v_budget_id := gen_random_uuid();
      INSERT INTO public.budgets (id, team_id, campaign_id, name, amount, budget_type, start_date, end_date, is_active, created_at)
      VALUES (
        v_budget_id, v_ws, v_camp_id,
        'Budget for ' || v_camp_names[1 + ((i + v_idx) % array_length(v_camp_names,1))],
        (5000 + floor(random()*45000))::numeric,
        CASE WHEN v_idx % 2 = 0 THEN 'lifetime' ELSE 'daily' END,
        CURRENT_DATE - (floor(random()*60)+1)::int,
        CURRENT_DATE + (floor(random()*30)+1)::int,
        true, NOW() - (random()*INTERVAL '60 days')
      ) ON CONFLICT DO NOTHING;

      -- Ad Group (FIXED: no campaign_id or daily_budget in schema)
      v_adg_id := gen_random_uuid();
      INSERT INTO public.ad_groups (id, name, status, created_at)
      VALUES (
        v_adg_id,
        v_adg_names[1 + ((i + v_idx) % array_length(v_adg_names,1))],
        CASE WHEN random() > 0.2 THEN 'active' ELSE 'paused' END,
        NOW() - (random()*INTERVAL '55 days')
      ) ON CONFLICT DO NOTHING;

      -- Ad for ad group
      v_ad_id := gen_random_uuid();
      INSERT INTO public.ads (id, ad_group_id, name, status, creative_type_id, created_at)
      VALUES (
        v_ad_id, v_adg_id,
        v_ad_names[1 + ((i + v_idx) % array_length(v_ad_names,1))],
        CASE WHEN random() > 0.15 THEN 'active' ELSE 'paused' END,
        NULL, -- creative_types table was dropped
        NOW() - (random()*INTERVAL '50 days')
      ) ON CONFLICT DO NOTHING;

    END LOOP;
  END LOOP;

  RAISE NOTICE 'Part 2: Ad Accounts, Campaigns, Ad Groups, Ads, Budgets seeded.';
END $$;
