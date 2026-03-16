-- Add per-metric KPI target columns so users can set targets for all metrics at once.
-- Keeps target_kpi_metric/target_kpi_value for backward compatibility (auto-stop, legacy).

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS target_kpi_clicks      NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS target_kpi_conversions NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS target_kpi_spend       NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS target_kpi_impressions NUMERIC DEFAULT NULL;

COMMENT ON COLUMN campaigns.target_kpi_clicks      IS 'Target number of clicks';
COMMENT ON COLUMN campaigns.target_kpi_conversions IS 'Target number of conversions';
COMMENT ON COLUMN campaigns.target_kpi_spend       IS 'Target spend amount (฿)';
COMMENT ON COLUMN campaigns.target_kpi_impressions IS 'Target number of impressions';
