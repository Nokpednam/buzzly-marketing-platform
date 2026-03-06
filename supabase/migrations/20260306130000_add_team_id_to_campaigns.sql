-- Add team_id to campaigns table for RLS scoping
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES workspaces(id);

-- Backfill team_id from ad_accounts for existing rows
UPDATE campaigns
SET team_id = (
  SELECT team_id FROM ad_accounts WHERE ad_accounts.id = campaigns.ad_account_id
)
WHERE team_id IS NULL AND ad_account_id IS NOT NULL;

-- Enable RLS if not already enabled
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow re-runs safely
DROP POLICY IF EXISTS "team_campaigns_select" ON campaigns;
DROP POLICY IF EXISTS "team_campaigns_insert" ON campaigns;
DROP POLICY IF EXISTS "team_campaigns_update" ON campaigns;
DROP POLICY IF EXISTS "team_campaigns_delete" ON campaigns;

-- RLS policies scoped to workspace membership
-- Uses is_team_member(auth.uid(), team_id) — the 2-arg signature this project defines
CREATE POLICY "team_campaigns_select" ON campaigns
  FOR SELECT TO authenticated
  USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "team_campaigns_insert" ON campaigns
  FOR INSERT TO authenticated
  WITH CHECK (is_team_member(auth.uid(), team_id));

CREATE POLICY "team_campaigns_update" ON campaigns
  FOR UPDATE TO authenticated
  USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "team_campaigns_delete" ON campaigns
  FOR DELETE TO authenticated
  USING (is_team_member(auth.uid(), team_id));
