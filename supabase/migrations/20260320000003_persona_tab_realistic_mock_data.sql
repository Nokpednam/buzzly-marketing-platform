-- =========================================================
-- Persona Tab: Realistic Mock Data (from seed_ads_persona_data + mock-api)
-- 1. Re-seed persona_metrics_daily with deterministic, mock-based distributions
-- 2. Ensure profile_customers exist + enrich with mock-aligned data
--
-- Data sources: 20260314200000_seed_ads_persona_data.sql (10 persona profiles),
-- mock-api/fixtures (age_distribution, gender, top_locations)
-- =========================================================

-- ── 1. Re-seed persona_metrics_daily with realistic mock-based data ─────────
-- Aggregated from 10 persona profiles in seed_ads_persona_data:
--   Age: 18-24(22%), 25-34(34%), 35-44(29%), 45-54(14%), 55+(6%)
--   Gender: Male(51%), Female(44%), Other(5%)
--   Provinces (Thai): กรุงเทพฯ dominant, เชียงใหม่, ชลบุรี, ภูเก็ต, ขอนแก่น, etc.
--   Business: Small Business(45%), Agency(25%), Freelancer(12%), Enterprise(10%), Other(8%)
-- =============================================================================
DO $$
DECLARE
  v_start date := (date_trunc('month', CURRENT_DATE) - INTERVAL '6 months')::date;
  v_end date := CURRENT_DATE;
  v_d date;
  v_day_offset int;
  -- Base daily volume: ~80-120 users, with ~35% growth over 6 months
  v_base int;
  v_trend numeric;
  -- Age distribution (from mock aggregate)
  v_age_pct numeric[] := ARRAY[0.22, 0.34, 0.29, 0.14, 0.06];
  v_age_groups text[] := ARRAY['18-24', '25-34', '35-44', '45-54', '55+'];
  -- Gender distribution (Male, Female, Other)
  v_gender_pct numeric[] := ARRAY[0.51, 0.44, 0.05];
  v_genders text[] := ARRAY['Male', 'Female', 'Other'];
  -- Province: Thai names from provinces table, pct from mock top_locations aggregate
  v_provinces text[] := ARRAY[
    'กรุงเทพมหานคร', 'เชียงใหม่', 'ชลบุรี', 'ภูเก็ต', 'ขอนแก่น',
    'นครราชสีมา', 'สงขลา', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ',
    'อุดรธานี', 'เชียงราย', 'ระยอง', 'ประจวบคีรีขันธ์', 'กระบี่'
  ];
  v_prov_pct numeric[] := ARRAY[
    0.42, 0.12, 0.09, 0.08, 0.07,
    0.06, 0.05, 0.04, 0.03, 0.02,
    0.01, 0.005, 0.005, 0.003, 0.002
  ];
  -- Business type (matches ProductUsage chart)
  v_business text[] := ARRAY['Small Business', 'Agency', 'Enterprise', 'Freelancer', 'Other'];
  v_biz_pct numeric[] := ARRAY[0.45, 0.25, 0.10, 0.12, 0.08];
  v_ag text;
  v_g text;
  v_p text;
  v_b text;
  v_idx int;
  v_count int;
  v_total_days int;
BEGIN
  DELETE FROM public.persona_metrics_daily;
  v_total_days := (v_end - v_start) + 1;

  v_d := v_start;
  WHILE v_d <= v_end LOOP
    v_day_offset := (v_d - v_start);
    -- Deterministic trend: 1.0 at start, ~1.35 at end (35% growth)
    v_trend := 1.0 + (v_day_offset::numeric / greatest(v_total_days - 1, 1)) * 0.35;
    -- Base 80-100, slight variation by day (deterministic via day hash)
    v_base := 80 + (abs(hashtext(v_d::text)) % 21);

    -- Age group (deterministic)
    FOR v_idx IN 1..array_length(v_age_groups, 1) LOOP
      v_count := greatest(2, floor(v_base * v_age_pct[v_idx] * v_trend * (0.95 + (abs(hashtext(v_d::text || v_age_groups[v_idx])) % 11)::numeric / 100)));
      INSERT INTO public.persona_metrics_daily (metric_date, metric_type, metric_value, count)
      VALUES (v_d, 'age_group', v_age_groups[v_idx], v_count);
    END LOOP;

    -- Gender
    FOR v_idx IN 1..array_length(v_genders, 1) LOOP
      v_count := greatest(2, floor(v_base * v_gender_pct[v_idx] * v_trend * (0.95 + (abs(hashtext(v_d::text || v_genders[v_idx])) % 11)::numeric / 100)));
      INSERT INTO public.persona_metrics_daily (metric_date, metric_type, metric_value, count)
      VALUES (v_d, 'gender', v_genders[v_idx], v_count);
    END LOOP;

    -- Province (top 15 from mock)
    FOR v_idx IN 1..least(array_length(v_provinces, 1), array_length(v_prov_pct, 1)) LOOP
      v_count := greatest(1, floor(v_base * v_prov_pct[v_idx] * v_trend * (0.9 + (abs(hashtext(v_d::text || v_provinces[v_idx])) % 21)::numeric / 100)));
      INSERT INTO public.persona_metrics_daily (metric_date, metric_type, metric_value, count)
      VALUES (v_d, 'province', v_provinces[v_idx], v_count);
    END LOOP;

    -- Business type
    FOR v_idx IN 1..array_length(v_business, 1) LOOP
      v_count := greatest(1, floor(v_base * v_biz_pct[v_idx] * v_trend * (0.9 + (abs(hashtext(v_d::text || v_business[v_idx])) % 21)::numeric / 100)));
      INSERT INTO public.persona_metrics_daily (metric_date, metric_type, metric_value, count)
      VALUES (v_d, 'business_type', v_business[v_idx], v_count);
    END LOOP;

    v_d := v_d + 1;
  END LOOP;

  RAISE NOTICE 'persona_metrics_daily re-seeded with % days of realistic mock-based trend data.', v_total_days;
END $$;

-- ── 2. Ensure profile_customers exist for auth.users (backfill) ───────────────
-- Creates profile_customers from raw_user_meta_data for users missing one.
-- =============================================================================
INSERT INTO public.profile_customers (id, user_id, first_name, last_name, created_at)
SELECT
  gen_random_uuid(),
  au.id,
  COALESCE(au.raw_user_meta_data->>'first_name', split_part(COALESCE(au.raw_user_meta_data->>'full_name', au.email), ' ', 1)),
  COALESCE(au.raw_user_meta_data->>'last_name', split_part(COALESCE(au.raw_user_meta_data->>'full_name', au.email), ' ', 2)),
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.profile_customers pc WHERE pc.user_id = au.id)
ON CONFLICT (user_id) DO NOTHING;

-- ── 3. Enhance profile_customers with mock-aligned persona data ─────────────
-- Uses deterministic distributions from mock (no random()) for consistency.
-- Enriches: gender, birthday_at, salary_range, location_id
-- =============================================================================
DO $$
DECLARE
  v_genders text[] := ARRAY['Male', 'Female', 'Female', 'Male', 'Male', 'Female'];
  v_salaries text[] := ARRAY[
    '< 15,000', '15,000-25,000', '25,000-50,000', '25,000-50,000', '50,000-100,000', '> 100,000'
  ];
  v_loc_ids uuid[];
  v_pc record;
  v_idx int;
  v_loc_idx int;
BEGIN
  SELECT ARRAY_AGG(id ORDER BY id) INTO v_loc_ids
  FROM public.locations
  LIMIT 50;

  IF v_loc_ids IS NULL OR array_length(v_loc_ids, 1) = 0 THEN
    RAISE NOTICE 'No locations found — skipping profile enrichment.';
    RETURN;
  END IF;

  FOR v_pc IN SELECT id, user_id, created_at FROM public.profile_customers LOOP
    -- Deterministic index from profile id
    v_idx := abs(hashtext(v_pc.id::text)) % 6 + 1;
    v_loc_idx := (abs(hashtext(v_pc.id::text)) % least(array_length(v_loc_ids, 1), 50)) + 1;

    UPDATE public.profile_customers
    SET
      gender = COALESCE(NULLIF(trim(gender), ''), v_genders[v_idx]),
      birthday_at = COALESCE(birthday_at, (NOW() - (INTERVAL '18 years' + (v_idx * INTERVAL '5 years') + (abs(hashtext(v_pc.id::text)) % 365) * INTERVAL '1 day'))::date),
      salary_range = COALESCE(NULLIF(trim(salary_range), ''), v_salaries[v_idx]),
      location_id = COALESCE(location_id, v_loc_ids[v_loc_idx])
    WHERE id = v_pc.id
      AND (
        (gender IS NULL OR trim(gender) = '')
        OR birthday_at IS NULL
        OR (salary_range IS NULL OR trim(salary_range) = '')
        OR location_id IS NULL
      );
  END LOOP;

  RAISE NOTICE 'Profile customers enriched with mock-aligned persona data.';
END $$;
