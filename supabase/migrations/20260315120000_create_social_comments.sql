-- Social comments table for the Inbox feature
CREATE TABLE public.social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.platforms(id),
  platform_comment_id TEXT,
  author_name TEXT NOT NULL DEFAULT 'Unknown',
  author_avatar_url TEXT,
  author_platform_id TEXT,
  content TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_replied BOOLEAN NOT NULL DEFAULT FALSE,
  replied_at TIMESTAMPTZ,
  reply_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;

-- SELECT: team members can view comments
CREATE POLICY "social_comments_select"
  ON public.social_comments
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

-- INSERT: team members can create comments
CREATE POLICY "social_comments_insert"
  ON public.social_comments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid(), team_id));

-- UPDATE: team members can update comments (mark read, add reply)
CREATE POLICY "social_comments_update"
  ON public.social_comments
  FOR UPDATE TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));

-- DELETE: team members can delete comments
CREATE POLICY "social_comments_delete"
  ON public.social_comments
  FOR DELETE TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

-- Indexes
CREATE INDEX idx_social_comments_post_id ON public.social_comments(post_id);
CREATE INDEX idx_social_comments_team_id ON public.social_comments(team_id);
CREATE INDEX idx_social_comments_unread ON public.social_comments(team_id, is_read)
  WHERE is_read = FALSE;

-- updated_at trigger (matches project pattern: update_updated_at_column)
CREATE TRIGGER update_social_comments_updated_at
  BEFORE UPDATE ON public.social_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
