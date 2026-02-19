-- Assign Existing Industries to Workspaces
-- Updates workspaces that have NULL industries_id to use 'Software Development' from static_seed_data.sql
-- ID: 30000000-0000-0000-0000-000000000001 (Software Development)

-- Assign Random Industry to Workspaces on Insert
-- Trigger to handle seed data or any new workspace creation

-- 1. Create Function to assign random industry
CREATE OR REPLACE FUNCTION public.auto_assign_workspace_industry()
RETURNS trigger AS $$
BEGIN
  -- Only assign if not provided (NULL)
  IF NEW.industries_id IS NULL THEN
    -- Select a random industry ID
    SELECT id INTO NEW.industries_id
    FROM public.industries
    ORDER BY random()
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create Trigger (Before Insert)
DROP TRIGGER IF EXISTS trigger_assign_workspace_industry ON public.workspaces;

CREATE TRIGGER trigger_assign_workspace_industry
BEFORE INSERT ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_workspace_industry();

-- 3. Update existing NULLs (just in case running on existing data)
UPDATE public.workspaces
SET industries_id = (SELECT id FROM public.industries ORDER BY random() LIMIT 1)
WHERE industries_id IS NULL;
