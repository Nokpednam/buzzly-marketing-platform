-- ============================================================
-- Migration: Create seed_demo_insights RPC function
-- Called from frontend (connectPlatform) to auto-seed demo data
-- when a customer connects a platform for the first time.
-- ============================================================

CREATE OR REPLACE FUNCTION public.seed_demo_insights(p_ad_account_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d int;
  v_date date;
  v_impr int; v_clicks int; v_conv int; v_reach int;
  v_spend numeric; v_roas numeric; v_ctr numeric; v_cpc numeric; v_cpm numeric;
BEGIN
  -- Only seed if this ad_account has fewer than 5 insight rows (idempotent)
  IF (SELECT COUNT(*) FROM public.ad_insights WHERE ad_account_id = p_ad_account_id) >= 5 THEN
    RETURN;
  END IF;

  -- Seed 30 days × 1 row per day for this account
  FOR d IN 0..29 LOOP
    v_date   := CURRENT_DATE - d;
    v_impr   := 800  + floor(random() * 2200)::int;
    v_clicks := 30   + floor(random() * 120)::int;
    v_conv   := 2    + floor(random() * 18)::int;
    v_reach  := floor(v_impr * (0.6 + random() * 0.3))::int;
    v_spend  := round((50 + random() * 350)::numeric, 2);
    v_roas   := round((1.5 + random() * 4.5)::numeric, 2);
    v_ctr    := round((v_clicks::numeric / GREATEST(v_impr, 1) * 100), 4);
    v_cpc    := round((v_spend / GREATEST(v_clicks, 1)), 2);
    v_cpm    := round((v_spend / GREATEST(v_impr, 1) * 1000), 2);

    INSERT INTO public.ad_insights (
      id, ad_account_id, campaign_id, date,
      impressions, reach, clicks, conversions,
      spend, roas, ctr, cpc, cpm, created_at
    ) VALUES (
      gen_random_uuid(),
      p_ad_account_id,
      NULL,  -- no campaign needed for demo data
      v_date,
      v_impr, v_reach, v_clicks, v_conv,
      v_spend, v_roas, v_ctr, v_cpc, v_cpm,
      NOW() - (d * INTERVAL '1 day')
    ) ON CONFLICT DO NOTHING;
  END LOOP;

END;
$$;

-- Grant execute to authenticated users (RLS on ad_insights still applies for SELECT)
GRANT EXECUTE ON FUNCTION public.seed_demo_insights(uuid) TO authenticated;

COMMENT ON FUNCTION public.seed_demo_insights IS
  'Seeds 30 days of demo ad insights for a newly connected ad_account. Idempotent.';
