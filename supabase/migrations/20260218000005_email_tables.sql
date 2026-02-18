-- ============================================================
-- Migration: Email Campaigns Table
-- Date: 2026-02-18
-- Description: Create email_campaigns table for Email Marketing
--              page real data integration.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    team_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name character varying(255) NOT NULL,
    subject character varying(500) NOT NULL,
    status character varying(50) NOT NULL DEFAULT 'draft', -- draft | scheduled | sent | paused
    category character varying(100),
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    recipient_count integer NOT NULL DEFAULT 0,
    open_count integer NOT NULL DEFAULT 0,
    click_count integer NOT NULL DEFAULT 0,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.email_campaigns OWNER TO postgres;

-- RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team email campaigns"
    ON public.email_campaigns FOR SELECT
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their team email campaigns"
    ON public.email_campaigns FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their team email campaigns"
    ON public.email_campaigns FOR UPDATE
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their team email campaigns"
    ON public.email_campaigns FOR DELETE
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON public.email_campaigns
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
