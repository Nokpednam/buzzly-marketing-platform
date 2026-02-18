
-- Create ad_posts table (replaces email_campaigns concept)
CREATE TABLE IF NOT EXISTS public.ad_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, sent, paused
    category TEXT,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    recipient_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ad_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Pattern: Owner OR Member)

-- SELECT
DROP POLICY IF EXISTS "ad_posts_select_policy" ON public.ad_posts;
CREATE POLICY "ad_posts_select_policy" ON public.ad_posts
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = ad_posts.team_id
    AND (
      -- Check 1: Owner
      w.owner_id = auth.uid()
      OR
      -- Check 2: Member
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- INSERT
DROP POLICY IF EXISTS "ad_posts_insert_policy" ON public.ad_posts;
CREATE POLICY "ad_posts_insert_policy" ON public.ad_posts
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = ad_posts.team_id
    AND (
      -- Check 1: Owner
      w.owner_id = auth.uid()
      OR
      -- Check 2: Member
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- UPDATE
DROP POLICY IF EXISTS "ad_posts_update_policy" ON public.ad_posts;
CREATE POLICY "ad_posts_update_policy" ON public.ad_posts
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = ad_posts.team_id
    AND (
      -- Check 1: Owner
      w.owner_id = auth.uid()
      OR
      -- Check 2: Member
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- DELETE
DROP POLICY IF EXISTS "ad_posts_delete_policy" ON public.ad_posts;
CREATE POLICY "ad_posts_delete_policy" ON public.ad_posts
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = ad_posts.team_id
    AND (
      -- Check 1: Owner
      w.owner_id = auth.uid()
      OR
      -- Check 2: Member
      EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.team_id = w.id
        AND wm.user_id = auth.uid()
      )
    )
  )
);

-- Add triggers for updated_at if needed (optional but good practice)
-- Assuming handle_updated_at function exists from previous migrations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_ad_posts') THEN
        CREATE TRIGGER set_updated_at_ad_posts
        BEFORE UPDATE ON public.ad_posts
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
EXCEPTION
    WHEN undefined_function THEN
        -- Ignore if function doesn't exist, or create it here if strictly needed
        NULL;
END $$;
