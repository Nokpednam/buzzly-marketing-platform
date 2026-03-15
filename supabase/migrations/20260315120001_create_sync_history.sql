-- Sync history table for tracking platform data synchronization events
CREATE TABLE public.sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID NOT NULL REFERENCES public.platforms(id),
  team_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'scheduled', 'webhook'))
    DEFAULT 'manual',
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'in_progress'))
    DEFAULT 'in_progress',
  rows_synced INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

-- SELECT: team members can view sync history
CREATE POLICY "sync_history_select"
  ON public.sync_history
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

-- INSERT: team members can create sync history entries
CREATE POLICY "sync_history_insert"
  ON public.sync_history
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid(), team_id));

-- UPDATE: team members can update sync history (e.g., mark completed)
CREATE POLICY "sync_history_update"
  ON public.sync_history
  FOR UPDATE TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));

-- DELETE: team members can delete sync history
CREATE POLICY "sync_history_delete"
  ON public.sync_history
  FOR DELETE TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

-- Indexes
CREATE INDEX idx_sync_history_team_id ON public.sync_history(team_id);
CREATE INDEX idx_sync_history_platform_id ON public.sync_history(platform_id);
CREATE INDEX idx_sync_history_started_at ON public.sync_history(team_id, started_at DESC);

-- updated_at trigger
CREATE TRIGGER update_sync_history_updated_at
  BEFORE UPDATE ON public.sync_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
