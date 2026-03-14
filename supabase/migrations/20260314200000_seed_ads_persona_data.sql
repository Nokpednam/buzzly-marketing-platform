-- Seed persona_data into existing ads + assign team_id so RLS allows workspace members to read them.
-- Also seeds campaign_ads junction rows so campaigns have assigned ads (for the ad-level KPI path).

DO $$
DECLARE
  v_team_id  uuid;
  v_ad       record;
  v_camp     record;
  v_ad_ids   uuid[];
  v_idx      int;
  v_count    int;

  -- Realistic audience distributions (10 profiles, cycled across ads)
  v_personas jsonb[] := ARRAY[
    '{"age_distribution":{"18-24":0.22,"25-34":0.38,"35-44":0.25,"45-54":0.10,"55+":0.05},"gender":{"male":0.58,"female":0.38,"unknown":0.04},"top_locations":[{"name":"Bangkok","pct":0.42},{"name":"Chiang Mai","pct":0.18},{"name":"Phuket","pct":0.14},{"name":"Pattaya","pct":0.10},{"name":"Khon Kaen","pct":0.07}],"interests":[{"name":"Technology","pct":0.45},{"name":"Gaming","pct":0.32},{"name":"Sports","pct":0.28},{"name":"Travel","pct":0.22},{"name":"Food","pct":0.18},{"name":"Fashion","pct":0.12}],"device_type":{"mobile":0.68,"desktop":0.24,"tablet":0.08}}'::jsonb,
    '{"age_distribution":{"18-24":0.15,"25-34":0.30,"35-44":0.32,"45-54":0.16,"55+":0.07},"gender":{"male":0.42,"female":0.54,"unknown":0.04},"top_locations":[{"name":"Bangkok","pct":0.38},{"name":"Nonthaburi","pct":0.15},{"name":"Samut Prakan","pct":0.12},{"name":"Chiang Mai","pct":0.10},{"name":"Hat Yai","pct":0.08}],"interests":[{"name":"Fashion","pct":0.52},{"name":"Beauty","pct":0.44},{"name":"Lifestyle","pct":0.38},{"name":"Food","pct":0.30},{"name":"Travel","pct":0.25},{"name":"Fitness","pct":0.18}],"device_type":{"mobile":0.75,"desktop":0.18,"tablet":0.07}}'::jsonb,
    '{"age_distribution":{"18-24":0.28,"25-34":0.42,"35-44":0.18,"45-54":0.08,"55+":0.04},"gender":{"male":0.62,"female":0.34,"unknown":0.04},"top_locations":[{"name":"Bangkok","pct":0.50},{"name":"Phuket","pct":0.16},{"name":"Pattaya","pct":0.12},{"name":"Hua Hin","pct":0.09},{"name":"Krabi","pct":0.06}],"interests":[{"name":"Travel","pct":0.55},{"name":"Adventure","pct":0.42},{"name":"Photography","pct":0.35},{"name":"Food","pct":0.28},{"name":"Luxury","pct":0.22},{"name":"Sports","pct":0.15}],"device_type":{"mobile":0.60,"desktop":0.32,"tablet":0.08}}'::jsonb,
    '{"age_distribution":{"18-24":0.10,"25-34":0.28,"35-44":0.35,"45-54":0.20,"55+":0.07},"gender":{"male":0.55,"female":0.42,"unknown":0.03},"top_locations":[{"name":"Bangkok","pct":0.45},{"name":"Chiang Rai","pct":0.12},{"name":"Udon Thani","pct":0.10},{"name":"Khon Kaen","pct":0.10},{"name":"Nakhon Ratchasima","pct":0.08}],"interests":[{"name":"Business","pct":0.48},{"name":"Finance","pct":0.40},{"name":"Real Estate","pct":0.32},{"name":"Technology","pct":0.28},{"name":"Automotive","pct":0.20},{"name":"Golf","pct":0.14}],"device_type":{"mobile":0.52,"desktop":0.40,"tablet":0.08}}'::jsonb,
    '{"age_distribution":{"18-24":0.35,"25-34":0.40,"35-44":0.15,"45-54":0.07,"55+":0.03},"gender":{"male":0.48,"female":0.48,"unknown":0.04},"top_locations":[{"name":"Bangkok","pct":0.55},{"name":"Chiang Mai","pct":0.14},{"name":"Phuket","pct":0.10},{"name":"Pattaya","pct":0.08},{"name":"Chon Buri","pct":0.06}],"interests":[{"name":"Gaming","pct":0.58},{"name":"Technology","pct":0.50},{"name":"Anime","pct":0.38},{"name":"Music","pct":0.32},{"name":"Streaming","pct":0.28},{"name":"E-sports","pct":0.22}],"device_type":{"mobile":0.72,"desktop":0.22,"tablet":0.06}}'::jsonb,
    '{"age_distribution":{"18-24":0.12,"25-34":0.25,"35-44":0.38,"45-54":0.18,"55+":0.07},"gender":{"male":0.38,"female":0.58,"unknown":0.04},"top_locations":[{"name":"Bangkok","pct":0.40},{"name":"Samut Prakan","pct":0.14},{"name":"Pathum Thani","pct":0.12},{"name":"Nonthaburi","pct":0.11},{"name":"Chiang Mai","pct":0.08}],"interests":[{"name":"Health","pct":0.52},{"name":"Fitness","pct":0.45},{"name":"Beauty","pct":0.38},{"name":"Wellness","pct":0.30},{"name":"Organic Food","pct":0.25},{"name":"Yoga","pct":0.18}],"device_type":{"mobile":0.70,"desktop":0.22,"tablet":0.08}}'::jsonb,
    '{"age_distribution":{"18-24":0.20,"25-34":0.35,"35-44":0.28,"45-54":0.12,"55+":0.05},"gender":{"male":0.65,"female":0.30,"unknown":0.05},"top_locations":[{"name":"Bangkok","pct":0.38},{"name":"Chon Buri","pct":0.16},{"name":"Rayong","pct":0.12},{"name":"Chiang Mai","pct":0.10},{"name":"Phuket","pct":0.09}],"interests":[{"name":"Automotive","pct":0.55},{"name":"Sports","pct":0.42},{"name":"Technology","pct":0.35},{"name":"Finance","pct":0.25},{"name":"Beer & Spirits","pct":0.22},{"name":"Football","pct":0.18}],"device_type":{"mobile":0.58,"desktop":0.34,"tablet":0.08}}'::jsonb,
    '{"age_distribution":{"18-24":0.08,"25-34":0.20,"35-44":0.32,"45-54":0.25,"55+":0.15},"gender":{"male":0.45,"female":0.50,"unknown":0.05},"top_locations":[{"name":"Bangkok","pct":0.35},{"name":"Udon Thani","pct":0.14},{"name":"Khon Kaen","pct":0.12},{"name":"Nakhon Ratchasima","pct":0.12},{"name":"Chiang Mai","pct":0.10}],"interests":[{"name":"Family","pct":0.55},{"name":"Home & Garden","pct":0.45},{"name":"Education","pct":0.38},{"name":"Healthcare","pct":0.30},{"name":"Cooking","pct":0.28},{"name":"Pets","pct":0.18}],"device_type":{"mobile":0.55,"desktop":0.36,"tablet":0.09}}'::jsonb,
    '{"age_distribution":{"18-24":0.30,"25-34":0.45,"35-44":0.18,"45-54":0.05,"55+":0.02},"gender":{"male":0.40,"female":0.56,"unknown":0.04},"top_locations":[{"name":"Bangkok","pct":0.60},{"name":"Chiang Mai","pct":0.12},{"name":"Phuket","pct":0.10},{"name":"Hua Hin","pct":0.07},{"name":"Pattaya","pct":0.05}],"interests":[{"name":"Fashion","pct":0.60},{"name":"K-Pop","pct":0.48},{"name":"Skincare","pct":0.42},{"name":"Cafes","pct":0.35},{"name":"Social Media","pct":0.30},{"name":"Influencers","pct":0.22}],"device_type":{"mobile":0.82,"desktop":0.12,"tablet":0.06}}'::jsonb,
    '{"age_distribution":{"18-24":0.18,"25-34":0.32,"35-44":0.30,"45-54":0.14,"55+":0.06},"gender":{"male":0.52,"female":0.44,"unknown":0.04},"top_locations":[{"name":"Bangkok","pct":0.44},{"name":"Chiang Mai","pct":0.16},{"name":"Khon Kaen","pct":0.11},{"name":"Phuket","pct":0.10},{"name":"Hat Yai","pct":0.07}],"interests":[{"name":"Food & Dining","pct":0.50},{"name":"Travel","pct":0.42},{"name":"Entertainment","pct":0.35},{"name":"Fashion","pct":0.28},{"name":"Technology","pct":0.22},{"name":"Sports","pct":0.18}],"device_type":{"mobile":0.65,"desktop":0.28,"tablet":0.07}}'::jsonb
  ];

BEGIN
  -- ── Step 1: Find the primary workspace (first connected team or any workspace) ──────────
  SELECT team_id INTO v_team_id
  FROM public.workspace_api_keys
  WHERE sync_status = 'connected' OR is_active = true
  LIMIT 1;

  IF v_team_id IS NULL THEN
    SELECT id INTO v_team_id FROM public.workspaces ORDER BY created_at LIMIT 1;
  END IF;

  IF v_team_id IS NULL THEN
    RAISE NOTICE 'No workspace found — skipping persona_data seed.';
    RETURN;
  END IF;

  RAISE NOTICE 'Seeding persona_data for team_id = %', v_team_id;

  -- ── Step 2: Assign team_id to ads that are NULL so RLS allows reading them ─────────────
  UPDATE public.ads
  SET team_id = v_team_id
  WHERE team_id IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Assigned team_id to % ads with NULL team_id.', v_count;

  -- Also fix ad_groups with NULL team_id
  UPDATE public.ad_groups
  SET team_id = v_team_id
  WHERE team_id IS NULL;

  -- ── Step 3: Seed persona_data into ads that don't have it yet ────────────────────────
  v_idx := 0;
  FOR v_ad IN
    SELECT id FROM public.ads
    WHERE team_id = v_team_id
      AND persona_data IS NULL
    ORDER BY created_at
  LOOP
    UPDATE public.ads
    SET persona_data = v_personas[(v_idx % array_length(v_personas, 1)) + 1]
    WHERE id = v_ad.id;
    v_idx := v_idx + 1;
  END LOOP;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Seeded persona_data into % ads.', v_idx;

  -- ── Step 4: Seed campaign_ads junction so campaigns have assigned ads ─────────────────
  -- Link each active/paused campaign to 2–3 ads from its ad_account's ad_groups
  FOR v_camp IN
    SELECT c.id AS camp_id, c.ad_account_id
    FROM public.campaigns c
    WHERE c.team_id = v_team_id
      AND c.status IN ('active', 'paused', 'completed')
    ORDER BY c.created_at
    LIMIT 20
  LOOP
    -- Get up to 3 ads for this campaign (via ad_groups linked to the same team)
    SELECT ARRAY(
      SELECT a.id
      FROM public.ads a
      JOIN public.ad_groups ag ON ag.id = a.ad_group_id
      WHERE a.team_id = v_team_id
        AND a.persona_data IS NOT NULL
      ORDER BY random()
      LIMIT 3
    ) INTO v_ad_ids;

    IF array_length(v_ad_ids, 1) IS NOT NULL THEN
      FOR v_idx IN 1..array_length(v_ad_ids, 1) LOOP
        INSERT INTO public.campaign_ads (campaign_id, ad_id)
        VALUES (v_camp.camp_id, v_ad_ids[v_idx])
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;

  RAISE NOTICE 'campaign_ads junction rows seeded.';
  RAISE NOTICE '✅ persona_data seed complete for team %', v_team_id;
END $$;
