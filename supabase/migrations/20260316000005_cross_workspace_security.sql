-- ── Trigger function: validate persona belongs to same workspace as content ──
CREATE OR REPLACE FUNCTION public.validate_persona_workspace()
RETURNS trigger AS $$
DECLARE
  v_content_team_id uuid;
  v_persona_team_id uuid;
  v_persona_is_template boolean;
BEGIN
  -- Determine the content's team_id based on the junction table
  IF TG_TABLE_NAME = 'ad_personas' THEN
    SELECT team_id INTO v_content_team_id FROM public.ads WHERE id = NEW.ad_id;
  ELSIF TG_TABLE_NAME = 'post_personas' THEN
    SELECT team_id INTO v_content_team_id FROM public.social_posts WHERE id = NEW.post_id;
  END IF;

  -- Get the persona's team_id and template flag
  SELECT team_id, is_template
    INTO v_persona_team_id, v_persona_is_template
    FROM public.customer_personas
    WHERE id = NEW.persona_id;

  -- Templates can be linked from any workspace; non-templates must match
  IF NOT v_persona_is_template AND v_persona_team_id IS DISTINCT FROM v_content_team_id THEN
    RAISE EXCEPTION 'Cannot link persona from a different workspace (persona team: %, content team: %)',
      v_persona_team_id, v_content_team_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_ad_personas_validate_workspace
  BEFORE INSERT OR UPDATE ON public.ad_personas
  FOR EACH ROW EXECUTE FUNCTION public.validate_persona_workspace();

CREATE TRIGGER trg_post_personas_validate_workspace
  BEFORE INSERT OR UPDATE ON public.post_personas
  FOR EACH ROW EXECUTE FUNCTION public.validate_persona_workspace();

-- ── Update customer_personas SELECT policy to include templates ──
DROP POLICY IF EXISTS "personas_select_policy" ON public.customer_personas;

CREATE POLICY "personas_select_policy" ON public.customer_personas
  FOR SELECT TO authenticated
  USING (
    -- Own workspace personas
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = customer_personas.team_id
      AND (
        w.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.workspace_members wm
          WHERE wm.team_id = w.id AND wm.user_id = auth.uid()
        )
      )
    )
    -- OR global templates (read-only via this policy)
    OR is_template = true
  );
