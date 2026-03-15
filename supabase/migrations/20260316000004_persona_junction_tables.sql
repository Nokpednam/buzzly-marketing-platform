-- ── ad_personas: many-to-many between ads and customer_personas ──
CREATE TABLE IF NOT EXISTS public.ad_personas (
  ad_id       uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  persona_id  uuid NOT NULL REFERENCES public.customer_personas(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ad_id, persona_id)
);

ALTER TABLE public.ad_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_personas_select" ON public.ad_personas
  FOR SELECT TO authenticated
  USING (
    ad_id IN (
      SELECT id FROM public.ads
      WHERE team_id IN (
        SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        UNION
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "ad_personas_write" ON public.ad_personas
  FOR ALL TO authenticated
  USING (
    ad_id IN (
      SELECT id FROM public.ads
      WHERE team_id IN (
        SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        UNION
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      )
    )
  );

-- ── post_personas: many-to-many between social_posts and customer_personas ──
CREATE TABLE IF NOT EXISTS public.post_personas (
  post_id     uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  persona_id  uuid NOT NULL REFERENCES public.customer_personas(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, persona_id)
);

ALTER TABLE public.post_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_personas_select" ON public.post_personas
  FOR SELECT TO authenticated
  USING (
    post_id IN (
      SELECT id FROM public.social_posts
      WHERE team_id IN (
        SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        UNION
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "post_personas_write" ON public.post_personas
  FOR ALL TO authenticated
  USING (
    post_id IN (
      SELECT id FROM public.social_posts
      WHERE team_id IN (
        SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        UNION
        SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
      )
    )
  );

GRANT ALL ON public.ad_personas TO authenticated;
GRANT ALL ON public.ad_personas TO service_role;
GRANT ALL ON public.post_personas TO authenticated;
GRANT ALL ON public.post_personas TO service_role;
