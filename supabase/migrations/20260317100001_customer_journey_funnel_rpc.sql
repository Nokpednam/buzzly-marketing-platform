-- ============================================================
-- Migration: Customer Journey funnel RPCs with is_estimated flags
-- Backend functions for funnel totals and monthly data.
-- Estimation logic: when ad platform doesn't report leads/adds_to_cart/conversions,
-- we apply fallback formulas. Flags indicate which metrics are estimated.
-- ============================================================

-- RPC: get_customer_journey_funnel_totals
-- Returns aggregated ad_insights with fallback-applied values and is_estimated flags.
-- RLS applies via ad_accounts join (team membership).
CREATE OR REPLACE FUNCTION public.get_customer_journey_funnel_totals(
  p_date_from date DEFAULT NULL,
  p_platform_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_impressions bigint := 0;
  v_clicks bigint := 0;
  v_leads bigint := 0;
  v_adds_to_cart bigint := 0;
  v_conversions bigint := 0;
  v_leads_estimated boolean := false;
  v_adds_to_cart_estimated boolean := false;
  v_conversions_estimated boolean := false;
  v_raw record;
BEGIN
  SELECT
    COALESCE(SUM(ai.impressions), 0)::bigint,
    COALESCE(SUM(ai.clicks), 0)::bigint,
    COALESCE(SUM(ai.leads), 0)::bigint,
    COALESCE(SUM(ai.adds_to_cart), 0)::bigint,
    COALESCE(SUM(ai.conversions), 0)::bigint
  INTO v_impressions, v_clicks, v_leads, v_adds_to_cart, v_conversions
  FROM ad_insights ai
  INNER JOIN ad_accounts aa ON aa.id = ai.ad_account_id AND aa.is_active = true
  WHERE (p_date_from IS NULL OR ai.date >= p_date_from)
    AND (p_platform_id IS NULL OR aa.platform_id = p_platform_id);

  -- Fallback: many ad platforms don't report leads/adds_to_cart; use estimates
  IF v_leads = 0 AND v_clicks > 0 THEN
    v_leads := ROUND(v_clicks * 0.05)::bigint;
    v_leads_estimated := true;
  END IF;

  IF v_adds_to_cart = 0 AND (v_leads > 0 OR v_conversions > 0) THEN
    v_adds_to_cart := GREATEST(
      ROUND(v_leads * 0.25)::bigint,
      ROUND(v_conversions * 2.5)::bigint
    );
    v_adds_to_cart_estimated := true;
  END IF;

  IF v_conversions = 0 AND v_adds_to_cart > 0 THEN
    v_conversions := ROUND(v_adds_to_cart * 0.35)::bigint;
    v_conversions_estimated := true;
  END IF;

  RETURN jsonb_build_object(
    'totals', jsonb_build_object(
      'impressions', v_impressions,
      'clicks', v_clicks,
      'leads', v_leads,
      'adds_to_cart', v_adds_to_cart,
      'conversions', v_conversions
    ),
    'used_fallback', jsonb_build_object(
      'leads', v_leads_estimated,
      'adds_to_cart', v_adds_to_cart_estimated,
      'conversions', v_conversions_estimated
    )
  );
END;
$$;

-- RPC: get_customer_journey_monthly_data
-- Returns monthly aggregated data with per-metric is_estimated flags.
CREATE OR REPLACE FUNCTION public.get_customer_journey_monthly_data(
  p_months_back int DEFAULT 6,
  p_platform_id uuid DEFAULT NULL
)
RETURNS TABLE (
  month text,
  month_label text,
  awareness bigint,
  consideration bigint,
  acquisition bigint,
  intent bigint,
  conversion bigint,
  acquisition_is_estimated boolean,
  intent_is_estimated boolean,
  conversion_is_estimated boolean
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_month_key text;
  v_date date;
  v_i int;
  v_imp bigint;
  v_clicks bigint;
  v_leads bigint;
  v_atc bigint;
  v_conv bigint;
  v_leads_est boolean;
  v_atc_est boolean;
  v_conv_est boolean;
BEGIN
  FOR v_i IN REVERSE 0..(p_months_back - 1) LOOP
    v_date := (CURRENT_DATE - (v_i || ' months')::interval)::date;
    v_month_key := to_char(v_date, 'YYYY-MM');

    SELECT
      COALESCE(SUM(ai.impressions), 0)::bigint,
      COALESCE(SUM(ai.clicks), 0)::bigint,
      COALESCE(SUM(ai.leads), 0)::bigint,
      COALESCE(SUM(ai.adds_to_cart), 0)::bigint,
      COALESCE(SUM(ai.conversions), 0)::bigint
    INTO v_imp, v_clicks, v_leads, v_atc, v_conv
    FROM ad_insights ai
    INNER JOIN ad_accounts aa ON aa.id = ai.ad_account_id AND aa.is_active = true
    WHERE ai.date >= date_trunc('month', v_date)::date
      AND ai.date < date_trunc('month', v_date)::date + interval '1 month'
      AND (p_platform_id IS NULL OR aa.platform_id = p_platform_id);

    v_leads_est := false;
    v_atc_est := false;
    v_conv_est := false;

    IF v_leads = 0 AND v_clicks > 0 THEN
      v_leads := ROUND(v_clicks * 0.05)::bigint;
      v_leads_est := true;
    END IF;

    IF v_atc = 0 AND (v_leads > 0 OR v_conv > 0) THEN
      v_atc := GREATEST(
        ROUND(v_leads * 0.25)::bigint,
        ROUND(v_conv * 2.5)::bigint
      );
      v_atc_est := true;
    END IF;

    IF v_conv = 0 AND v_atc > 0 THEN
      v_conv := ROUND(v_atc * 0.35)::bigint;
      v_conv_est := true;
    END IF;

    month := v_month_key;
    month_label := to_char(v_date, 'Mon yy');
    awareness := v_imp;
    consideration := v_clicks;
    acquisition := v_leads;
    intent := v_atc;
    conversion := v_conv;
    acquisition_is_estimated := v_leads_est;
    intent_is_estimated := v_atc_est;
    conversion_is_estimated := v_conv_est;
    RETURN NEXT;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_journey_funnel_totals(date, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customer_journey_monthly_data(int, uuid) TO authenticated;

COMMENT ON FUNCTION public.get_customer_journey_funnel_totals IS
  'Aggregates ad_insights for Customer Journey funnel. Returns totals and used_fallback flags when fallback estimation was applied.';
COMMENT ON FUNCTION public.get_customer_journey_monthly_data IS
  'Returns monthly ad_insights aggregation for Customer Journey charts. Includes is_estimated flags per metric.';
