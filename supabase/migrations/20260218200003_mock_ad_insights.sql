-- ============================================================
-- Mock Data Part 3: Ad Insights (daily performance data)
-- 30 days × top campaigns = ~150+ rows
-- Depends on: campaigns (Part 2)
-- ============================================================

DO $$
DECLARE
  v_camp record;
  v_aa_id uuid;
  d int;
  v_date date;
  v_impr int; v_clicks int; v_conv int; v_reach int;
  v_spend numeric; v_roas numeric; v_ctr numeric; v_cpc numeric; v_cpm numeric;
BEGIN
  -- For each active/paused campaign that has an ad account, seed 30 days of insights
  FOR v_camp IN
    SELECT c.id AS camp_id, c.ad_account_id
    FROM public.campaigns c
    WHERE c.status IN ('active','paused','completed')
    ORDER BY c.created_at
    LIMIT 20
  LOOP
    FOR d IN 0..29 LOOP
      v_date   := CURRENT_DATE - d;
      v_impr   := 800  + floor(random()*2200)::int;
      v_clicks := 30   + floor(random()*120)::int;
      v_conv   := 2    + floor(random()*18)::int;
      v_reach  := floor(v_impr * (0.6 + random()*0.3))::int;
      v_spend  := round((50 + random()*350)::numeric, 2);
      v_roas   := round((1.5 + random()*4.5)::numeric, 2);
      v_ctr    := round((v_clicks::numeric / v_impr * 100), 4);
      v_cpc    := round((v_spend / GREATEST(v_clicks,1)), 2);
      v_cpm    := round((v_spend / GREATEST(v_impr,1) * 1000), 2);

      INSERT INTO public.ad_insights (
        id, ad_account_id, campaign_id, date,
        impressions, reach, clicks, conversions,
        spend, roas, ctr, cpc, cpm, created_at
      ) VALUES (
        gen_random_uuid(),
        v_camp.ad_account_id,
        v_camp.camp_id,
        v_date,
        v_impr, v_reach, v_clicks, v_conv,
        v_spend, v_roas, v_ctr, v_cpc, v_cpm,
        NOW() - (d * INTERVAL '1 day')
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Part 3a: Ad Insights seeded (30 days × up to 20 campaigns).';
END $$;
