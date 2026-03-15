ALTER TABLE public.ad_groups
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS group_type text,
  ADD COLUMN IF NOT EXISTS external_group_id text,
  ADD COLUMN IF NOT EXISTS source_platform text;

CREATE INDEX IF NOT EXISTS idx_ad_groups_team_id_group_type
  ON public.ad_groups(team_id, group_type);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ad_groups_external_group_unique
  ON public.ad_groups(team_id, source_platform, external_group_id)
  WHERE external_group_id IS NOT NULL;
