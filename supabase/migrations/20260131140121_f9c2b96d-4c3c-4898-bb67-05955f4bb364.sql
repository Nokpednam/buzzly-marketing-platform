
-- =====================================================
-- PART 1: สร้าง 6 Tables ใหม่สำหรับ UX/UI ที่ยังไม่มี
-- =====================================================

-- 1. social_posts - สำหรับ Social Analytics page
CREATE TABLE public.social_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    platform_id UUID REFERENCES public.platforms(id),
    post_type VARCHAR(50), -- 'image', 'video', 'carousel', 'story', 'reel'
    content TEXT,
    media_urls TEXT[],
    post_url TEXT,
    platform_post_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    -- Engagement metrics
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate NUMERIC(5,2),
    -- Metadata
    hashtags TEXT[],
    mentions TEXT[],
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. reports - สำหรับ Reports page
CREATE TABLE public.reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(100) NOT NULL, -- 'campaign_performance', 'social_analytics', 'revenue', 'funnel', 'custom'
    date_range_type VARCHAR(50), -- '7d', '30d', '90d', 'custom'
    start_date DATE,
    end_date DATE,
    filters JSONB, -- {"platforms": [], "campaigns": [], "metrics": []}
    file_format VARCHAR(20) DEFAULT 'pdf', -- 'pdf', 'excel', 'csv'
    file_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
    generated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. scheduled_reports - สำหรับ automated report delivery
CREATE TABLE public.scheduled_reports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    schedule_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
    schedule_day INTEGER, -- day of week (1-7) or day of month (1-31)
    schedule_time TIME DEFAULT '09:00:00',
    timezone VARCHAR(100) DEFAULT 'Asia/Bangkok',
    recipients TEXT[], -- email addresses
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. budgets - สำหรับ Budget tracking ใน Campaign/Analytics
CREATE TABLE public.budgets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    budget_type VARCHAR(50) NOT NULL, -- 'daily', 'monthly', 'total', 'lifetime'
    amount NUMERIC(15,2) NOT NULL,
    spent_amount NUMERIC(15,2) DEFAULT 0,
    remaining_amount NUMERIC(15,2),
    currency_id UUID REFERENCES public.currencies(id),
    start_date DATE,
    end_date DATE,
    alert_threshold_percent INTEGER DEFAULT 80, -- alert when spent reaches this %
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. revenue_metrics - สำหรับ Owner Business Performance
CREATE TABLE public.revenue_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    -- Revenue data
    gross_revenue NUMERIC(15,2) DEFAULT 0,
    net_revenue NUMERIC(15,2) DEFAULT 0,
    ad_spend NUMERIC(15,2) DEFAULT 0,
    profit NUMERIC(15,2) DEFAULT 0,
    profit_margin NUMERIC(5,2),
    -- Customer metrics
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    average_order_value NUMERIC(15,2),
    -- Attribution
    revenue_by_channel JSONB, -- {"facebook": 1000, "google": 500}
    revenue_by_campaign JSONB,
    -- Comparison
    previous_period_revenue NUMERIC(15,2),
    revenue_growth_percent NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(team_id, metric_date)
);

-- 6. cohort_analysis - สำหรับ Owner Product Usage & Analytics
CREATE TABLE public.cohort_analysis (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    cohort_date DATE NOT NULL, -- วันที่ของ cohort (เช่น เดือนที่ลูกค้าเริ่มใช้งาน)
    cohort_type VARCHAR(50) DEFAULT 'monthly', -- 'daily', 'weekly', 'monthly'
    cohort_size INTEGER DEFAULT 0, -- จำนวนผู้ใช้ใน cohort
    -- Retention data by period (period 0 = first period, period 1 = second period, etc.)
    retention_data JSONB, -- {"0": 100, "1": 45, "2": 30, "3": 25} (percentage)
    -- Revenue data by period
    revenue_data JSONB, -- {"0": 5000, "1": 3000, "2": 2500}
    -- Activity data
    active_users_data JSONB, -- {"0": 100, "1": 45, "2": 30}
    -- Calculated metrics
    average_retention NUMERIC(5,2),
    lifetime_value NUMERIC(15,2),
    churn_rate NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(team_id, cohort_date, cohort_type)
);

-- =====================================================
-- INDEXES สำหรับ Performance
-- =====================================================

CREATE INDEX idx_social_posts_team_id ON public.social_posts(team_id);
CREATE INDEX idx_social_posts_platform_id ON public.social_posts(platform_id);
CREATE INDEX idx_social_posts_status ON public.social_posts(status);
CREATE INDEX idx_social_posts_published_at ON public.social_posts(published_at);

CREATE INDEX idx_reports_team_id ON public.reports(team_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_report_type ON public.reports(report_type);

CREATE INDEX idx_scheduled_reports_team_id ON public.scheduled_reports(team_id);
CREATE INDEX idx_scheduled_reports_next_send ON public.scheduled_reports(next_send_at);

CREATE INDEX idx_budgets_team_id ON public.budgets(team_id);
CREATE INDEX idx_budgets_campaign_id ON public.budgets(campaign_id);

CREATE INDEX idx_revenue_metrics_team_date ON public.revenue_metrics(team_id, metric_date);

CREATE INDEX idx_cohort_analysis_team_date ON public.cohort_analysis(team_id, cohort_date);

-- =====================================================
-- Enable RLS
-- =====================================================

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_analysis ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies - Team-based access
-- =====================================================

-- social_posts policies
CREATE POLICY "Team members can view social posts"
ON public.social_posts FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team members can create social posts"
ON public.social_posts FOR INSERT
WITH CHECK (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team members can update social posts"
ON public.social_posts FOR UPDATE
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins can delete social posts"
ON public.social_posts FOR DELETE
USING (can_manage_team(auth.uid(), team_id));

-- reports policies
CREATE POLICY "Team members can view reports"
ON public.reports FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team members can create reports"
ON public.reports FOR INSERT
WITH CHECK (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team members can update reports"
ON public.reports FOR UPDATE
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins can delete reports"
ON public.reports FOR DELETE
USING (can_manage_team(auth.uid(), team_id));

-- scheduled_reports policies
CREATE POLICY "Team members can view scheduled reports"
ON public.scheduled_reports FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins can manage scheduled reports"
ON public.scheduled_reports FOR ALL
USING (can_manage_team(auth.uid(), team_id));

-- budgets policies
CREATE POLICY "Team members can view budgets"
ON public.budgets FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins can manage budgets"
ON public.budgets FOR ALL
USING (can_manage_team(auth.uid(), team_id));

-- revenue_metrics policies
CREATE POLICY "Team members can view revenue metrics"
ON public.revenue_metrics FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins can manage revenue metrics"
ON public.revenue_metrics FOR ALL
USING (can_manage_team(auth.uid(), team_id));

-- cohort_analysis policies
CREATE POLICY "Team members can view cohort analysis"
ON public.cohort_analysis FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins can manage cohort analysis"
ON public.cohort_analysis FOR ALL
USING (can_manage_team(auth.uid(), team_id));

-- =====================================================
-- Triggers สำหรับ updated_at
-- =====================================================

CREATE TRIGGER update_social_posts_updated_at
BEFORE UPDATE ON public.social_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_reports_updated_at
BEFORE UPDATE ON public.scheduled_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_metrics_updated_at
BEFORE UPDATE ON public.revenue_metrics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cohort_analysis_updated_at
BEFORE UPDATE ON public.cohort_analysis
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
