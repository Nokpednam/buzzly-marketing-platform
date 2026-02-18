
-- 1. Try to update the function with the correct parameter names (_user_id, _team_id)
-- This matches the original definition to avoid "cannot change name of input parameter"
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check members table
  IF EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.user_id = _user_id
      AND wm.team_id = _team_id
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check owners (workspaces table)
  IF EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = _team_id
      AND w.owner_id = _user_id
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Add an explicit policy for Owners on social_posts as a backup
-- This ensures that even if the function update fails, owners can still post.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'social_posts' AND policyname = 'Owners can insert social posts'
  ) THEN
    CREATE POLICY "Owners can insert social posts" ON public.social_posts
    FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = social_posts.team_id
        AND w.owner_id = auth.uid()
      )
    );
  END IF;
  
  -- Also for SELECT to be safe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'social_posts' AND policyname = 'Owners can view social posts'
  ) THEN
    CREATE POLICY "Owners can view social posts" ON public.social_posts
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = social_posts.team_id
        AND w.owner_id = auth.uid()
      )
    );
  END IF;
END $$;
