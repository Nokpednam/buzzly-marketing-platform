-- Add missing columns to discounts table (team_id, created_by, name)
ALTER TABLE public.discounts
ADD COLUMN IF NOT EXISTS team_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS name text;

-- Add foreign key constraint separately to handle potential issues with default value temporarily
ALTER TABLE public.discounts DROP CONSTRAINT IF EXISTS discounts_team_id_fkey;
ALTER TABLE public.discounts ADD CONSTRAINT discounts_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

ALTER TABLE public.discounts
ALTER COLUMN team_id DROP NOT NULL,
ALTER COLUMN team_id DROP DEFAULT;
