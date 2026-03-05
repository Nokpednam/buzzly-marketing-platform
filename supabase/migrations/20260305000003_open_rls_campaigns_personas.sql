-- ============================================================
-- Migration: Open RLS SELECT for Campaigns & Customer Personas
-- Date: 2026-03-05
-- Description: Allow all authenticated users to see all campaigns
--              and personas — so anyone who pulls the project and
--              logs in will see the real data already in the DB.
-- ============================================================

-- ---- CAMPAIGNS ----
DROP POLICY IF EXISTS "campaigns_select_policy" ON public.campaigns;

CREATE POLICY "campaigns_select_policy" ON public.campaigns
FOR SELECT TO authenticated
USING (true);  -- All authenticated users can see all campaigns

-- ---- CUSTOMER PERSONAS ----
DROP POLICY IF EXISTS "personas_select_policy" ON public.customer_personas;

CREATE POLICY "personas_select_policy" ON public.customer_personas
FOR SELECT TO authenticated
USING (true);  -- All authenticated users can see all personas

-- INSERT / UPDATE / DELETE remain workspace-scoped (no change needed)
