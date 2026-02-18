-- ============================================================
-- Fix: Backfill industries_id for Workspaces
-- Current Issue: Workspaces have NULL industries_id, causing missing data in Admin UI
-- Solution: Randomly assign an active industry to each workspace that lacks one
-- ============================================================

DO $$
DECLARE
  v_workspace record;
  v_industry_id uuid;
  v_industry_ids uuid[];
BEGIN
  -- Get all valid industry IDs
  SELECT ARRAY(SELECT id FROM public.industries WHERE is_active = true) INTO v_industry_ids;

  -- Check if we have industries to assign
  IF v_industry_ids IS NULL OR array_length(v_industry_ids, 1) IS NULL THEN
    RAISE WARNING 'No active industries found. Cannot backfill workspaces.';
    RETURN;
  END IF;

  -- Iterate through workspaces with missing industry
  FOR v_workspace IN 
    SELECT id FROM public.workspaces WHERE industries_id IS NULL
  LOOP
    -- Pick a random industry
    v_industry_id := v_industry_ids[1 + floor(random() * array_length(v_industry_ids, 1))];

    -- Update the workspace
    UPDATE public.workspaces
    SET industries_id = v_industry_id
    WHERE id = v_workspace.id;
  END LOOP;

  RAISE NOTICE 'Successfully backfilled industries for workspaces.';
END $$;
