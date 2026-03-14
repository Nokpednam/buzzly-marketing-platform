-- Phase 3: KPI targets on campaigns + junction table for campaign → ads (1:Many)

-- 1. Add KPI columns to campaigns
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS target_kpi_metric TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS target_kpi_value  NUMERIC DEFAULT NULL;

COMMENT ON COLUMN campaigns.target_kpi_metric IS 'KPI to track: clicks | spend | conversions | impressions';
COMMENT ON COLUMN campaigns.target_kpi_value  IS 'Numeric target value for the chosen KPI metric';

-- 2. campaign_ads junction table
CREATE TABLE IF NOT EXISTS campaign_ads (
  campaign_id  UUID        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  ad_id        UUID        NOT NULL REFERENCES ads(id)       ON DELETE CASCADE,
  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, ad_id)
);

-- 3. RLS on campaign_ads
ALTER TABLE campaign_ads ENABLE ROW LEVEL SECURITY;

-- Users can view campaign_ads belonging to campaigns in their workspace
CREATE POLICY "campaign_ads_select"
  ON campaign_ads FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE team_id IN (
        SELECT team_id FROM workspace_members WHERE user_id = auth.uid()
      )
      OR team_id IS NULL
    )
  );

-- Users can insert/update/delete campaign_ads for campaigns they own
CREATE POLICY "campaign_ads_write"
  ON campaign_ads FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE team_id IN (
        SELECT team_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE team_id IN (
        SELECT team_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );
