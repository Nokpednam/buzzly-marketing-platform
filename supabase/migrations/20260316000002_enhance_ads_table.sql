ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS media_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- TL-3: Composite index for calendar queries (WHERE team_id = ? AND scheduled_at >= ?)
CREATE INDEX IF NOT EXISTS idx_ads_team_scheduled
  ON public.ads(team_id, scheduled_at)
  WHERE scheduled_at IS NOT NULL;
