-- Phase 4: Campaign auto-stop worker
--
-- Two layers of protection:
--   A) PostgreSQL function + pg_cron → DB-level status update (always runs, no HTTP needed)
--   B) pg_net HTTP call to Edge Function → also pauses ads on external platforms
--      (requires pg_net extension and SUPABASE_URL / SERVICE_ROLE_KEY to be set)
-- ---------------------------------------------------------------------------

-- ─── A) DB-level auto-stop function ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION auto_stop_completed_campaigns()
RETURNS TABLE (
  campaign_id   UUID,
  campaign_name TEXT,
  overall_pct   NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec          RECORD;
  kpi_actual   NUMERIC;
  kpi_pct      NUMERIC;
  time_pct     NUMERIC;
  overall      NUMERIC;
  now_ts       TIMESTAMPTZ := now();
BEGIN
  FOR rec IN
    SELECT
      c.id,
      c.name,
      c.start_date,
      c.end_date,
      c.target_kpi_metric,
      c.target_kpi_value,
      COALESCE(SUM(ai.clicks),      0) AS actual_clicks,
      COALESCE(SUM(ai.spend),       0) AS actual_spend,
      COALESCE(SUM(ai.conversions), 0) AS actual_conversions,
      COALESCE(SUM(ai.impressions), 0) AS actual_impressions
    FROM campaigns c
    LEFT JOIN ad_insights ai ON ai.campaign_id = c.id
    WHERE c.status = 'active'
      AND c.target_kpi_metric IS NOT NULL
      AND c.target_kpi_value  IS NOT NULL
      AND c.start_date        IS NOT NULL
      AND c.end_date          IS NOT NULL
    GROUP BY c.id
  LOOP
    -- ── KPI progress ──────────────────────────────────────────────────────────
    kpi_actual := CASE rec.target_kpi_metric
      WHEN 'clicks'      THEN rec.actual_clicks
      WHEN 'spend'       THEN rec.actual_spend
      WHEN 'conversions' THEN rec.actual_conversions
      WHEN 'impressions' THEN rec.actual_impressions
      ELSE 0
    END;

    kpi_pct := LEAST(100,
      (kpi_actual / NULLIF(rec.target_kpi_value, 0)) * 100
    );

    -- ── Time progress ─────────────────────────────────────────────────────────
    time_pct := LEAST(100, GREATEST(0,
      EXTRACT(EPOCH FROM (now_ts - rec.start_date::TIMESTAMPTZ)) /
      NULLIF(EXTRACT(EPOCH FROM (rec.end_date::TIMESTAMPTZ - rec.start_date::TIMESTAMPTZ)), 0) * 100
    ));

    -- ── Overall: 100% only when BOTH components are 100% ─────────────────────
    overall := ROUND((kpi_pct * 0.5) + (time_pct * 0.5));

    IF overall >= 100 THEN
      -- Mark campaign completed
      UPDATE campaigns
        SET status     = 'completed',
            updated_at = now_ts
        WHERE id = rec.id;

      -- Pause all active ads assigned to this campaign
      UPDATE ads
        SET status     = 'paused',
            updated_at = now_ts
        WHERE id IN (
          SELECT ad_id FROM campaign_ads WHERE campaign_id = rec.id
        )
        AND status = 'active';

      -- Audit log
      INSERT INTO audit_logs (action, entity_type, entity_id, details, created_at)
      VALUES (
        'campaign_auto_stopped',
        'campaign',
        rec.id::TEXT,
        jsonb_build_object(
          'campaign_name',        rec.name,
          'kpi_metric',           rec.target_kpi_metric,
          'kpi_target',           rec.target_kpi_value,
          'kpi_actual',           kpi_actual,
          'kpi_progress_pct',     kpi_pct,
          'time_progress_pct',    time_pct,
          'overall_progress_pct', overall,
          'stopped_by',           'pg_cron/auto_stop_completed_campaigns'
        ),
        now_ts
      );

      -- Emit result row
      campaign_id   := rec.id;
      campaign_name := rec.name;
      overall_pct   := overall;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

-- ─── B) pg_cron schedules ────────────────────────────────────────────────────
-- Guarded: silently skips if pg_cron is not installed (Free tier / local dev).
-- To enable: go to Supabase Dashboard → Database → Extensions → enable pg_cron,
-- then re-run this migration or execute the inner statement manually.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- B1: DB-level auto-stop — runs every 15 minutes, no external dependencies.
    PERFORM cron.schedule(
      'campaign-auto-stop-db',
      '*/15 * * * *',
      $cron$ SELECT * FROM auto_stop_completed_campaigns(); $cron$
    );

    RAISE NOTICE 'pg_cron: campaign-auto-stop-db scheduled successfully.';
  ELSE
    RAISE NOTICE 'pg_cron not installed — skipping cron schedule. Enable it in the Supabase Dashboard to activate auto-stop.';
  END IF;
END;
$$;

-- B2 (edge function + external platform APIs): configure manually in the Supabase Dashboard
-- under Database → Cron Jobs, or uncomment below after enabling pg_cron + pg_net and
-- substituting YOUR_PROJECT_REF and SERVICE_ROLE_KEY:
--
-- SELECT cron.schedule(
--   'campaign-auto-stop-edge',
--   '*/15 * * * *',
--   $$
--   SELECT net.http_post(
--     url     := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/campaign-auto-stop',
--     headers := jsonb_build_object(
--       'Content-Type',  'application/json',
--       'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
--     ),
--     body    := '{}'::JSONB
--   );
--   $$
-- );
