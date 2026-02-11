-- Create server table
CREATE TABLE IF NOT EXISTS public.server (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostname TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'healthy', -- healthy, warning, critical, maintenance
    cpu_usage_percent NUMERIC,
    used_memory NUMERIC, -- in bytes
    total_memory NUMERIC, -- in bytes
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create data_pipeline table
CREATE TABLE IF NOT EXISTS public.data_pipeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, inactive, error
    schedule_cron TEXT,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create external_api_status table
CREATE TABLE IF NOT EXISTS public.external_api_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID REFERENCES public.platforms(id),
    last_status_code INTEGER,
    latency_ms INTEGER,
    color_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.server ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_api_status ENABLE ROW LEVEL SECURITY;

-- Create policies (modify as needed for your auth setup)
-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" ON public.server FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON public.data_pipeline FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON public.external_api_status FOR SELECT TO authenticated USING (true);

-- Allow insert/update/delete to admins/owners (simplified for now to authenticated for dev speed, restrict later)
CREATE POLICY "Allow write access to authenticated users" ON public.server FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow write access to authenticated users" ON public.data_pipeline FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow write access to authenticated users" ON public.external_api_status FOR ALL TO authenticated USING (true);


-- Seed Data
INSERT INTO public.server (hostname, status, cpu_usage_percent, used_memory, total_memory, ip_address) VALUES
('prod-api-01', 'healthy', 45.5, 8589934592, 17179869184, '10.0.0.1'),
('prod-db-01', 'healthy', 62.1, 24696061952, 34359738368, '10.0.0.2'),
('prod-worker-01', 'warning', 88.4, 7516192768, 8589934592, '10.0.0.3'),
('staging-api-01', 'healthy', 12.3, 2147483648, 4294967296, '10.0.1.1');

INSERT INTO public.data_pipeline (name, status, schedule_cron, last_run_at, next_run_at) VALUES
('Facebook Ads Sync', 'active', '0 */2 * * *', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '1 hour'),
('Google Ads Sync', 'active', '0 */4 * * *', NOW() - INTERVAL '3 hour', NOW() + INTERVAL '1 hour'),
('TikTok Ads Sync', 'error', '0 */6 * * *', NOW() - INTERVAL '5 hour', NOW() + INTERVAL '1 hour'),
('Daily Reporting', 'active', '0 0 * * *', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day');

-- Assuming platform_ids exist from previous seeding or we fetch them dynamically?
-- For now, we'll try to insert using a subquery to find platform IDs if possible, or just insert meaningful placeholders if foreign key constraints allow strictly valid IDs.
-- Since we know platform names from admin-mock-data.sql (Facebook Ads, Google Ads etc), we can try to link them.
-- If no platforms exist, these inserts might fail violently if we don't handle it.
-- Let's use a DO block to be safe.

DO $$
DECLARE
    fb_id uuid;
    google_id uuid;
    tiktok_id uuid;
BEGIN
    SELECT id INTO fb_id FROM public.platforms WHERE slug = 'facebook-ads' LIMIT 1;
    SELECT id INTO google_id FROM public.platforms WHERE slug = 'google-ads' LIMIT 1;
    SELECT id INTO tiktok_id FROM public.platforms WHERE slug = 'tiktok-ads' LIMIT 1;

    IF fb_id IS NOT NULL THEN
        INSERT INTO public.external_api_status (platform_id, last_status_code, latency_ms, color_code) VALUES
        (fb_id, 200, 145, '#1877F2');
    END IF;

    IF google_id IS NOT NULL THEN
         INSERT INTO public.external_api_status (platform_id, last_status_code, latency_ms, color_code) VALUES
        (google_id, 200, 210, '#4285F4');
    END IF;

    IF tiktok_id IS NOT NULL THEN
         INSERT INTO public.external_api_status (platform_id, last_status_code, latency_ms, color_code) VALUES
        (tiktok_id, 500, 1200, '#000000');
    END IF;
END $$;
