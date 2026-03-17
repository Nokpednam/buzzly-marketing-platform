-- =========================================================
-- Persona Tab: Mock Data + Time-Series for Trends
-- 1. Enrich profile_customers (gender, birthday, salary, location)
-- 2. Create persona_metrics_daily for trend charts
-- 3. Seed 6 months of realistic trend data
-- =========================================================

-- ── 1. Enrich profile_customers with full persona data ─────────────────────
DO $$
DECLARE
  v_genders text[] := ARRAY['Male', 'Female', 'Other'];
  v_salaries text[] := ARRAY['< 15,000', '15,000-25,000', '25,000-50,000', '50,000-100,000', '> 100,000'];
  v_loc_ids uuid[];
  v_loc_id uuid;
  v_pc record;
  v_idx int;
BEGIN
  -- Get location IDs (first 50 from mock_locations)
  SELECT ARRAY_AGG(id ORDER BY id) INTO v_loc_ids
  FROM public.locations
  LIMIT 50;

  IF v_loc_ids IS NULL OR array_length(v_loc_ids, 1) = 0 THEN
    RAISE NOTICE 'No locations found, skipping profile enrichment.';
    RETURN;
  END IF;

  FOR v_pc IN SELECT id, user_id, created_at FROM public.profile_customers LOOP
    -- Random gender
    UPDATE public.profile_customers
    SET
      gender = v_genders[1 + floor(random() * array_length(v_genders, 1))::int],
      birthday_at = (NOW() - (random() * INTERVAL '50 years' + INTERVAL '18 years'))::date,
      salary_range = v_salaries[1 + floor(random() * array_length(v_salaries, 1))::int],
      location_id = v_loc_ids[1 + floor(random() * least(array_length(v_loc_ids, 1), 50))::int]
    WHERE id = v_pc.id
      AND (gender IS NULL OR gender = '' OR birthday_at IS NULL OR salary_range IS NULL OR location_id IS NULL);
  END LOOP;

  RAISE NOTICE 'Profile customers enriched with persona data.';
END $$;

-- ── 2. Create persona_metrics_daily table for trend charts ────────────────
CREATE TABLE IF NOT EXISTS public.persona_metrics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  metric_type text NOT NULL,
  metric_value text NOT NULL,
  count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_persona_metrics_daily_date_type
  ON public.persona_metrics_daily (metric_date, metric_type);

COMMENT ON TABLE public.persona_metrics_daily IS
  'Daily aggregated persona metrics for owner Product Usage Persona tab trend charts. Seeded for demo.';

ALTER TABLE public.persona_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Employees (dev/support/owner) can read; fallback for dev when employees may be empty
CREATE POLICY "Employees can read persona metrics"
  ON public.persona_metrics_daily FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e
      JOIN public.role_employees r ON e.role_employees_id = r.id
      WHERE e.user_id = auth.uid() AND r.role_name IN ('dev', 'support', 'owner')
    )
    OR NOT EXISTS (SELECT 1 FROM public.employees LIMIT 1)
  );

CREATE POLICY "Service role full access"
  ON public.persona_metrics_daily FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── 3. Seed persona_metrics_daily with 6 months of trend data ──────────────
DO $$
DECLARE
  v_start date := (date_trunc('month', CURRENT_DATE) - INTERVAL '6 months')::date;
  v_end date := CURRENT_DATE;
  v_d date;
  v_base int;
  v_trend numeric;
  v_age_groups text[] := ARRAY['18-24', '25-34', '35-44', '45-54', '55+'];
  v_genders text[] := ARRAY['Male', 'Female', 'Other'];
  v_provinces text[] := ARRAY['กรุงเทพมหานคร', 'เชียงใหม่', 'ชลบุรี', 'ขอนแก่น', 'นครราชสีมา', 'สงขลา', 'นนทบุรี', 'ปทุมธานี'];
  v_business text[] := ARRAY['Small Business', 'Agency', 'Enterprise', 'Freelancer', 'Other'];
  v_ag text;
  v_g text;
  v_p text;
  v_b text;
  v_age_idx int;
  v_gen_idx int;
  v_prov_idx int;
  v_biz_idx int;
  v_count int;
  v_day_offset int;
BEGIN
  DELETE FROM public.persona_metrics_daily;

  v_d := v_start;
  WHILE v_d <= v_end LOOP
    v_day_offset := (v_d - v_start);
    v_trend := 1.0 + (v_day_offset::numeric / 180.0) * 0.4;  -- ~40% growth over 6 months
    v_base := 20 + floor(random() * 15)::int;

    -- Age group distribution (25-34 dominant)
    FOREACH v_ag IN ARRAY v_age_groups LOOP
      v_age_idx := array_position(v_age_groups, v_ag);
      v_count := greatest(2, floor((v_base * (CASE v_age_idx
        WHEN 1 THEN 0.12
        WHEN 2 THEN 0.38
        WHEN 3 THEN 0.28
        WHEN 4 THEN 0.15
        WHEN 5 THEN 0.07
        ELSE 0.1
      END) * v_trend * (0.9 + random() * 0.2)))::int);
      INSERT INTO public.persona_metrics_daily (metric_date, metric_type, metric_value, count)
      VALUES (v_d, 'age_group', v_ag, v_count);
    END LOOP;

    -- Gender distribution
    FOREACH v_g IN ARRAY v_genders LOOP
      v_gen_idx := array_position(v_genders, v_g);
      v_count := greatest(2, floor((v_base * (CASE v_gen_idx
        WHEN 1 THEN 0.48
        WHEN 2 THEN 0.50
        WHEN 3 THEN 0.02
        ELSE 0.33
      END) * v_trend * (0.9 + random() * 0.2)))::int);
      INSERT INTO public.persona_metrics_daily (metric_date, metric_type, metric_value, count)
      VALUES (v_d, 'gender', v_g, v_count);
    END LOOP;

    -- Province distribution (Bangkok dominant)
    FOREACH v_p IN ARRAY v_provinces LOOP
      v_prov_idx := array_position(v_provinces, v_p);
      v_count := greatest(1, floor((v_base * (CASE v_prov_idx
        WHEN 1 THEN 0.35
        WHEN 2 THEN 0.12
        WHEN 3 THEN 0.10
        WHEN 4 THEN 0.08
        WHEN 5 THEN 0.08
        WHEN 6 THEN 0.07
        WHEN 7 THEN 0.10
        WHEN 8 THEN 0.10
        ELSE 0.1
      END) * v_trend * (0.85 + random() * 0.3)))::int);
      INSERT INTO public.persona_metrics_daily (metric_date, metric_type, metric_value, count)
      VALUES (v_d, 'province', v_p, v_count);
    END LOOP;

    -- Business type distribution
    FOREACH v_b IN ARRAY v_business LOOP
      v_biz_idx := array_position(v_business, v_b);
      v_count := greatest(1, floor((v_base * (CASE v_biz_idx
        WHEN 1 THEN 0.45
        WHEN 2 THEN 0.25
        WHEN 3 THEN 0.10
        WHEN 4 THEN 0.12
        WHEN 5 THEN 0.08
        ELSE 0.2
      END) * v_trend * (0.9 + random() * 0.2)))::int);
      INSERT INTO public.persona_metrics_daily (metric_date, metric_type, metric_value, count)
      VALUES (v_d, 'business_type', v_b, v_count);
    END LOOP;

    v_d := v_d + 1;
  END LOOP;

  RAISE NOTICE 'persona_metrics_daily seeded with % days of trend data.', (v_end - v_start + 1);
END $$;
