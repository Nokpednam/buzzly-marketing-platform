-- ============================================================
-- Migration: Recreate Feature Tables for UI Integration
-- Date: 2026-02-18
-- Description: Recreate tables that were previously dropped but
--              are needed for upcoming UI features. Tables are
--              recreated with proper team_id scoping and RLS.
-- ============================================================

-- ============================================================
-- 1. BUDGETS — Campaign budget management
-- ============================================================
DROP TABLE IF EXISTS public.budgets CASCADE;
CREATE TABLE public.budgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    team_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
    name character varying(255) NOT NULL,
    budget_type character varying(50) NOT NULL DEFAULT 'monthly', -- daily | monthly | lifetime
    amount numeric(15,2) NOT NULL DEFAULT 0,
    spent_amount numeric(15,2) NOT NULL DEFAULT 0,
    remaining_amount numeric(15,2) GENERATED ALWAYS AS (amount - spent_amount) STORED,
    currency character varying(10) NOT NULL DEFAULT 'THB',
    start_date date,
    end_date date,
    alert_threshold_percent integer NOT NULL DEFAULT 80,
    is_active boolean NOT NULL DEFAULT true,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.budgets OWNER TO postgres;

-- RLS for budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team budgets"
    ON public.budgets FOR SELECT
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their team budgets"
    ON public.budgets FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their team budgets"
    ON public.budgets FOR UPDATE
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their team budgets"
    ON public.budgets FOR DELETE
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. DISCOUNTS — Promo code management
-- ============================================================
DROP TABLE IF EXISTS public.discounts CASCADE;
CREATE TABLE public.discounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    team_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    code character varying(50) NOT NULL,
    name character varying(255),
    discount_type character varying(50) NOT NULL DEFAULT 'percent', -- percent | fixed
    discount_value numeric(15,2) NOT NULL DEFAULT 0,
    min_order_value numeric(15,2) DEFAULT 0,
    max_discount_amount numeric(15,2),
    usage_limit integer,
    usage_count integer NOT NULL DEFAULT 0,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    is_active boolean NOT NULL DEFAULT true,
    description text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (team_id, code)
);

ALTER TABLE public.discounts OWNER TO postgres;

-- RLS for discounts
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team discounts"
    ON public.discounts FOR SELECT
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their team discounts"
    ON public.discounts FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their team discounts"
    ON public.discounts FOR UPDATE
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their team discounts"
    ON public.discounts FOR DELETE
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_discounts_updated_at
    BEFORE UPDATE ON public.discounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 3. TAGS — Universal tagging for campaigns, posts, personas
-- ============================================================
DROP TABLE IF EXISTS public.tags CASCADE;
CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    team_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name character varying(255) NOT NULL,
    color_code character varying(7) NOT NULL DEFAULT '#6366f1',
    entity_type character varying(50) NOT NULL DEFAULT 'campaign', -- campaign | post | persona | report
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (team_id, name, entity_type)
);

ALTER TABLE public.tags OWNER TO postgres;

-- RLS for tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team tags"
    ON public.tags FOR SELECT
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their team tags"
    ON public.tags FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their team tags"
    ON public.tags FOR UPDATE
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their team tags"
    ON public.tags FOR DELETE
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. SCHEDULED_REPORTS — Automated report scheduling
-- ============================================================
DROP TABLE IF EXISTS public.scheduled_reports CASCADE;
CREATE TABLE public.scheduled_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    team_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    report_id uuid REFERENCES public.reports(id) ON DELETE SET NULL,
    name character varying(255) NOT NULL,
    frequency character varying(50) NOT NULL DEFAULT 'weekly', -- daily | weekly | monthly
    recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
    next_run_at timestamp with time zone,
    last_run_at timestamp with time zone,
    is_active boolean NOT NULL DEFAULT true,
    format character varying(20) NOT NULL DEFAULT 'pdf', -- pdf | csv | excel
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.scheduled_reports OWNER TO postgres;

-- RLS for scheduled_reports
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team scheduled reports"
    ON public.scheduled_reports FOR SELECT
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their team scheduled reports"
    ON public.scheduled_reports FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their team scheduled reports"
    ON public.scheduled_reports FOR UPDATE
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their team scheduled reports"
    ON public.scheduled_reports FOR DELETE
    USING (
        team_id IN (
            SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_scheduled_reports_updated_at
    BEFORE UPDATE ON public.scheduled_reports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 5. CAMPAIGN_TAGS — Junction table for campaign <-> tags
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaign_tags (
    campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (campaign_id, tag_id)
);

ALTER TABLE public.campaign_tags OWNER TO postgres;

ALTER TABLE public.campaign_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage campaign tags for their team"
    ON public.campaign_tags FOR ALL
    USING (
        campaign_id IN (
            SELECT c.id FROM public.campaigns c
            JOIN public.ad_accounts aa ON c.ad_account_id = aa.id
            WHERE aa.team_id IN (
                SELECT id FROM public.workspaces WHERE owner_id = auth.uid()
                UNION
                SELECT team_id FROM public.workspace_members WHERE user_id = auth.uid()
            )
        )
    );
