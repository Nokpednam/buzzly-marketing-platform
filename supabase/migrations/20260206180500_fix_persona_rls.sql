-- Fix RLS policy for persona_definition to allow authenticated users to manage it
-- This resolves the issue where users without explicit 'owner' role in DB cannot add personas

DROP POLICY IF EXISTS "Admins can manage persona_definition" ON public.persona_definition;
DROP POLICY IF EXISTS "admin_owner_manage" ON public.persona_definition;

CREATE POLICY "Authenticated users can manage persona_definition" 
ON public.persona_definition 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
