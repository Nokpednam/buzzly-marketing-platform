-- Migration: Schema Cleanup
-- Description: Drops unused 'workspaces' table and renames 'teams' to 'workspaces'.

-- 1. Drop unused tables (if they exist)
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;

-- 2. Rename 'teams' table to 'workspaces'
ALTER TABLE IF EXISTS public.teams RENAME TO workspaces;

-- 3. Rename 'team_members' table to 'workspace_members'
ALTER TABLE IF EXISTS public.team_members RENAME TO workspace_members;

-- 4. (Optional but good) Rename the Primary Key constraint if it has a default name
-- Postgres usually handles this, but explicit is better if we want clean metadata.
-- ALTER TABLE public.workspaces RENAME CONSTRAINT teams_pkey TO workspaces_pkey;
-- ALTER TABLE public.workspace_members RENAME CONSTRAINT team_members_pkey TO workspace_members_pkey;

-- 5. Update RLS Policy Names (Optional cosmetic update)
-- We can leave them as is, or rename them. For now, let's leave them to avoid complexity.
