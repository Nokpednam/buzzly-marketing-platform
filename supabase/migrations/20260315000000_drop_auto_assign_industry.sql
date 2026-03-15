-- Drop the trigger that auto-assigns industries to workspaces
DROP TRIGGER IF EXISTS trigger_assign_workspace_industry ON public.workspaces;
DROP FUNCTION IF EXISTS public.auto_assign_workspace_industry();