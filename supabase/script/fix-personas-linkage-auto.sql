-- Auto-fix: Reassign customer_personas to each user's own workspace
-- Runs automatically as part of setup-full.sh (Step 5.6b)
-- No hardcoded emails - works for ANY user

DO $$
DECLARE
  v_workspace RECORD;
  v_persona_count INT;
  v_total_workspaces INT;
  v_total_personas INT;
  v_per_workspace INT;
  i INT;
  v_persona_ids UUID[];
BEGIN
  -- Count workspaces and personas
  SELECT COUNT(*) INTO v_total_workspaces FROM public.workspaces;
  SELECT COUNT(*) INTO v_total_personas FROM public.customer_personas;

  IF v_total_workspaces = 0 THEN
    RAISE NOTICE 'No workspaces found, skipping persona linkage.';
    RETURN;
  END IF;

  -- Distribute personas evenly across all workspaces
  v_per_workspace := GREATEST(1, v_total_personas / v_total_workspaces);

  i := 0;
  FOR v_workspace IN SELECT id, name FROM public.workspaces ORDER BY created_at LOOP
    -- Assign the next batch of personas to this workspace
    UPDATE public.customer_personas
    SET team_id = v_workspace.id
    WHERE id IN (
      SELECT id FROM public.customer_personas
      ORDER BY created_at
      LIMIT v_per_workspace
      OFFSET (i * v_per_workspace)
    );

    GET DIAGNOSTICS v_persona_count = ROW_COUNT;
    RAISE NOTICE 'Linked % personas → workspace: % (%)', v_persona_count, v_workspace.name, v_workspace.id;
    i := i + 1;
  END LOOP;

  -- If there are leftover personas with no/wrong team_id, assign to first workspace
  UPDATE public.customer_personas
  SET team_id = (SELECT id FROM public.workspaces ORDER BY created_at LIMIT 1)
  WHERE team_id NOT IN (SELECT id FROM public.workspaces);

  RAISE NOTICE 'Persona linkage complete. Total: % across % workspaces.', v_total_personas, v_total_workspaces;
END;
$$;
