-- ============================================
-- Mock Data for Admin Panel Testing (UPDATED & FIXED UUIDs & Owner ID)
-- Tables: business_types, industries, workspaces, role_customers, workspace_members,
--         platforms, ad_accounts, error_logs
-- ============================================

-- 0. Insert Role Customers (Standard Roles)
-- IDs start with 10..
INSERT INTO public.role_customers (id, name, is_active) VALUES
('10000000-0000-0000-0000-000000000001', 'owner', true),
('10000000-0000-0000-0000-000000000002', 'admin', true),
('10000000-0000-0000-0000-000000000003', 'editor', true),
('10000000-0000-0000-0000-000000000004', 'viewer', true)
ON CONFLICT DO NOTHING;

-- 1. Insert Business Types
-- IDs start with 20..
INSERT INTO public.business_types (id, name, slug, description, icon_url, display_order, is_active) VALUES
('20000000-0000-0000-0000-000000000001', 'Technology', 'technology', 'Software and IT companies', NULL, 1, true),
('20000000-0000-0000-0000-000000000002', 'E-commerce', 'e-commerce', 'Online retail and marketplace', NULL, 2, true),
('20000000-0000-0000-0000-000000000003', 'Healthcare', 'healthcare', 'Medical and health services', NULL, 3, true),
('20000000-0000-0000-0000-000000000004', 'Finance', 'finance', 'Banking and financial services', NULL, 4, true),
('20000000-0000-0000-0000-000000000005', 'Education', 'education', 'Educational institutions and EdTech', NULL, 5, true),
('20000000-0000-0000-0000-000000000006', 'Real Estate', 'real-estate', 'Property and real estate', NULL, 6, true),
('20000000-0000-0000-0000-000000000007', 'F&B', 'food-beverage', 'Food and beverage industry', NULL, 7, true),
('20000000-0000-0000-0000-000000000008', 'Agency', 'agency', 'Marketing and advertising agencies', NULL, 8, true)
ON CONFLICT DO NOTHING;

-- 2. Insert Industries
-- IDs start with 30..
INSERT INTO public.industries (id, name, slug, description, icon_url, display_order, is_active) VALUES
('30000000-0000-0000-0000-000000000001', 'Software Development', 'software-development', 'Custom software and SaaS', NULL, 1, true),
('30000000-0000-0000-0000-000000000002', 'Digital Marketing', 'digital-marketing', 'Online marketing services', NULL, 2, true),
('30000000-0000-0000-0000-000000000003', 'Retail', 'retail', 'Retail and consumer goods', NULL, 3, true),
('30000000-0000-0000-0000-000000000004', 'Manufacturing', 'manufacturing', 'Manufacturing and production', NULL, 4, true),
('30000000-0000-0000-0000-000000000005', 'Consulting', 'consulting', 'Business consulting services', NULL, 5, true),
('30000000-0000-0000-0000-000000000006', 'Media & Entertainment', 'media-entertainment', 'Media and content creation', NULL, 6, true),
('30000000-0000-0000-0000-000000000007', 'Hospitality', 'hospitality', 'Hotels and tourism', NULL, 7, true),
('30000000-0000-0000-0000-000000000008', 'Logistics', 'logistics', 'Transportation and delivery', NULL, 8, true)
ON CONFLICT DO NOTHING;

-- 3. Insert Platforms
-- IDs start with 40..
INSERT INTO public.platforms (id, name, slug, description, icon_url, is_active, api_version) VALUES
('40000000-0000-0000-0000-000000000001', 'Facebook Ads', 'facebook-ads', 'Meta Facebook advertising platform', NULL, true, 'v18.0'),
('40000000-0000-0000-0000-000000000002', 'Google Ads', 'google-ads', 'Google advertising platform', NULL, true, 'v15'),
('40000000-0000-0000-0000-000000000003', 'TikTok Ads', 'tiktok-ads', 'TikTok advertising platform', NULL, true, 'v1.3'),
('40000000-0000-0000-0000-000000000004', 'LINE Ads', 'line-ads', 'LINE advertising platform', NULL, true, 'v2.0'),
('40000000-0000-0000-0000-000000000005', 'LinkedIn Ads', 'linkedin-ads', 'LinkedIn advertising platform', NULL, true, 'v2'),
('40000000-0000-0000-0000-000000000006', 'Twitter/X Ads', 'twitter-ads', 'Twitter/X advertising platform', NULL, true, 'v2'),
('40000000-0000-0000-0000-000000000007', 'Shopee Ads', 'shopee-ads', 'Shopee marketplace advertising', NULL, true, 'v2.0'),
('40000000-0000-0000-0000-000000000008', 'Lazada Ads', 'lazada-ads', 'Lazada marketplace advertising', NULL, true, 'v1.0')
ON CONFLICT DO NOTHING;

-- 4. Get existing user and Insert Workspaces (Formerly Teams)
DO $$
DECLARE
    v_owner_id uuid;
BEGIN
    SELECT id INTO v_owner_id FROM auth.users LIMIT 1;
    
    IF v_owner_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users. Please create users first.';
        RETURN;
    END IF;
    
    -- 5. Insert Workspaces (renamed from Teams)
    -- IDs start with 50..
    -- Added owner_id because it is required
    WITH workspaces_data(id, name, description, logo_url, workspace_url, status, owner_id, business_type_slug, industry_slug) AS (
      VALUES
        ('50000000-0000-0000-0000-000000000001'::uuid, 'Buzzly Digital Agency', 'Full-service digital marketing agency', NULL, 'https://buzzly-agency.com', 'active', v_owner_id, 'agency', 'digital-marketing'),
        ('50000000-0000-0000-0000-000000000002'::uuid, 'TechStart Thailand', 'Innovative startup', NULL, 'https://techstart-th.com', 'active', v_owner_id, 'technology', 'software-development'),
        ('50000000-0000-0000-0000-000000000003'::uuid, 'ShopMax E-commerce', 'Online marketplace', NULL, 'https://shopmax.co.th', 'active', v_owner_id, 'e-commerce', 'retail'),
        ('50000000-0000-0000-0000-000000000004'::uuid, 'HealthPlus Clinic', 'Modern healthcare', NULL, 'https://healthplus-clinic.com', 'active', v_owner_id, 'healthcare', NULL),
        ('50000000-0000-0000-0000-000000000005'::uuid, 'EduLearn Academy', 'Online education', NULL, 'https://edulearn-academy.com', 'active', v_owner_id, 'education', NULL),
        ('50000000-0000-0000-0000-000000000006'::uuid, 'Foodies Bangkok', 'Food delivery', NULL, 'https://foodies-bkk.com', 'active', v_owner_id, 'food-beverage', 'hospitality'),
        ('50000000-0000-0000-0000-000000000007'::uuid, 'PropertyHub Thailand', 'Real estate', NULL, NULL, 'active', v_owner_id, 'real-estate', NULL),
        ('50000000-0000-0000-0000-000000000008'::uuid, 'FastLogistics Co.', 'Express delivery', NULL, 'https://fastlogistics.co.th', 'active', v_owner_id, 'e-commerce', 'logistics')
    )
    INSERT INTO public.workspaces (id, name, description, logo_url, workspace_url, status, owner_id, business_type_id, industries_id)
    SELECT
      d.id, d.name, d.description, d.logo_url, d.workspace_url, d.status, d.owner_id,
      bt.id, ind.id
    FROM workspaces_data d
    JOIN public.business_types bt ON bt.slug = d.business_type_slug
    LEFT JOIN public.industries ind ON ind.slug = d.industry_slug
    ON CONFLICT (id) DO NOTHING;

    -- [REMOVED] Old Workspaces table insert (dropped in schema cleanup)
    -- [REMOVED] Old Workspace Members (IDs 70..) (dropped in schema cleanup)

    -- 8. Insert Workspace Members (Formerly Team Members)
    -- owner as member of each workspace
    -- Note: team_id column likely persists unless renamed in schema, assuming renamed table 'workspace_members' has 'team_id' or 'workspace_id' depending on migration.
    -- Migration RENAME TABLE usually keeps column names. So 'team_id' likely remains 'team_id'.
    INSERT INTO public.workspace_members (team_id, user_id, status, joined_at)
    SELECT t.id, t.owner_id, 'active'::member_status, (NOW() - (random() * INTERVAL '6 months'))
    FROM public.workspaces t
    WHERE t.owner_id IS NOT NULL
    ON CONFLICT (team_id, user_id) DO NOTHING;

END $$;

-- 9. Insert Ad Accounts
-- IDs start with 80..
WITH ad_account_data(id, account_name, team_id, platform_slug, platform_account_id, is_active) AS (
  VALUES
    ('80000000-0000-0000-0000-000000000001'::uuid, 'Buzzly - Facebook Main', '50000000-0000-0000-0000-000000000001'::uuid, 'facebook-ads', 'act_123456789', true),
    ('80000000-0000-0000-0000-000000000002'::uuid, 'Buzzly - Google Performance', '50000000-0000-0000-0000-000000000001'::uuid, 'google-ads', '1234567890', true),
    ('80000000-0000-0000-0000-000000000003'::uuid, 'Buzzly - TikTok Brand', '50000000-0000-0000-0000-000000000001'::uuid, 'tiktok-ads', 'tt_ads_001', true),
    ('80000000-0000-0000-0000-000000000004'::uuid, 'TechStart - LinkedIn B2B', '50000000-0000-0000-0000-000000000002'::uuid, 'linkedin-ads', 'li_acc_456', true),
    ('80000000-0000-0000-0000-000000000005'::uuid, 'TechStart - Google SEM', '50000000-0000-0000-0000-000000000002'::uuid, 'google-ads', '2345678901', true),
    ('80000000-0000-0000-0000-000000000006'::uuid, 'ShopMax - Facebook ROAS', '50000000-0000-0000-0000-000000000003'::uuid, 'facebook-ads', 'act_shopmax_001', true),
    ('80000000-0000-0000-0000-000000000007'::uuid, 'ShopMax - Shopee Seller', '50000000-0000-0000-0000-000000000003'::uuid, 'shopee-ads', 'shopee_123', true),
    ('80000000-0000-0000-0000-000000000008'::uuid, 'ShopMax - Lazada Store', '50000000-0000-0000-0000-000000000003'::uuid, 'lazada-ads', 'lazada_456', false),
    ('80000000-0000-0000-0000-000000000009'::uuid, 'HealthPlus - Facebook Awareness', '50000000-0000-0000-0000-000000000004'::uuid, 'facebook-ads', 'act_health_001', true),
    ('80000000-0000-0000-0000-000000000010'::uuid, 'HealthPlus - LINE Official', '50000000-0000-0000-0000-000000000004'::uuid, 'line-ads', 'line_health', true),
    ('80000000-0000-0000-0000-000000000011'::uuid, 'EduLearn - Google Display', '50000000-0000-0000-0000-000000000005'::uuid, 'google-ads', '3456789012', true),
    ('80000000-0000-0000-0000-000000000012'::uuid, 'EduLearn - Facebook Leads', '50000000-0000-0000-0000-000000000005'::uuid, 'facebook-ads', 'act_edu_001', true),
    ('80000000-0000-0000-0000-000000000013'::uuid, 'Foodies - TikTok Food', '50000000-0000-0000-0000-000000000006'::uuid, 'tiktok-ads', 'tt_foodies', true),
    ('80000000-0000-0000-0000-000000000014'::uuid, 'Foodies - Facebook Local', '50000000-0000-0000-0000-000000000006'::uuid, 'facebook-ads', 'act_foodies', false),
    ('80000000-0000-0000-0000-000000000015'::uuid, 'PropertyHub - Facebook Property', '50000000-0000-0000-0000-000000000007'::uuid, 'facebook-ads', 'act_property_001', true),
    ('80000000-0000-0000-0000-000000000016'::uuid, 'FastLogistics - Google Ads', '50000000-0000-0000-0000-000000000008'::uuid, 'google-ads', '4567890123', true)
)
INSERT INTO public.ad_accounts (id, account_name, team_id, platform_id, platform_account_id, is_active)
SELECT
  d.id, d.account_name, d.team_id,
  p.id,
  d.platform_account_id, d.is_active
FROM ad_account_data d
JOIN public.platforms p ON p.slug = d.platform_slug
-- Updated referenced table from teams to workspaces
WHERE EXISTS (SELECT 1 FROM public.workspaces t WHERE t.id = d.team_id)
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Error Logs
-- IDs start with 90..
INSERT INTO public.error_logs (id, level, message, user_id, request_id, stack_trace, metadata, created_at) VALUES
('90000000-0000-0000-0000-000000000001', 'error', 'Database connection timeout after 30000ms', NULL, 'req_db_timeout_001', 'Error: Connection timeout', '{"database": "primary"}'::jsonb, NOW() - INTERVAL '2 hours'),
('90000000-0000-0000-0000-000000000002', 'error', 'Payment processing failed: Insufficient funds', NULL, 'req_payment_001', 'PaymentError: Transaction declined', '{"provider": "stripe"}'::jsonb, NOW() - INTERVAL '4 hours'),
('90000000-0000-0000-0000-000000000003', 'error', 'Facebook API rate limit exceeded', NULL, 'req_fb_api_001', 'FacebookAPIError: Rate limit exceeded', '{"platform": "facebook"}'::jsonb, NOW() - INTERVAL '6 hours'),
('90000000-0000-0000-0000-000000000004', 'error', 'Authentication token expired', NULL, 'req_auth_001', 'AuthenticationError: Token expired', '{"token_type": "access_token"}'::jsonb, NOW() - INTERVAL '1 day'),
('90000000-0000-0000-0000-000000000005', 'error', 'Failed to sync Google Ads', NULL, 'req_gads_001', 'GoogleAdsError: Invalid OAuth', '{"platform": "google_ads"}'::jsonb, NOW() - INTERVAL '8 hours'),
('90000000-0000-0000-0000-000000000006', 'warning', 'High memory usage detected', NULL, 'req_health_001', NULL, '{"memory_used_mb": 3400}'::jsonb, NOW() - INTERVAL '30 minutes'),
('90000000-0000-0000-0000-000000000007', 'warning', 'Slow database query detected', NULL, 'req_slow_query_001', NULL, '{"query_time_ms": 7823}'::jsonb, NOW() - INTERVAL '1 hour'),
('90000000-0000-0000-0000-000000000008', 'warning', 'API response time exceeding threshold', NULL, 'req_latency_001', NULL, '{"endpoint": "/v18.0/insights"}'::jsonb, NOW() - INTERVAL '3 hours'),
('90000000-0000-0000-0000-000000000009', 'warning', 'Retry attempt 3/5 for webhook', NULL, 'req_webhook_001', NULL, '{"webhook_url": "example.com"}'::jsonb, NOW() - INTERVAL '5 hours'),
('90000000-0000-0000-0000-000000000010', 'warning', 'Cache miss rate above 40%', NULL, 'req_cache_001', NULL, '{"cache_type": "redis"}'::jsonb, NOW() - INTERVAL '2 hours'),
('90000000-0000-0000-0000-000000000011', 'info', 'Daily ad insights sync completed', NULL, 'req_sync_001', NULL, '{"accounts_synced": 8}'::jsonb, NOW() - INTERVAL '12 hours'),
('90000000-0000-0000-0000-000000000012', 'info', 'New workspace created', NULL, 'req_workspace_001', NULL, '{"workspace_id": "w100..."}'::jsonb, NOW() - INTERVAL '1 day'),
('90000000-0000-0000-0000-000000000013', 'info', 'Scheduled report generated', NULL, 'req_report_001', NULL, '{"report_type": "weekly"}'::jsonb, NOW() - INTERVAL '18 hours'),
('90000000-0000-0000-0000-000000000014', 'info', 'User role updated', NULL, 'req_role_001', NULL, '{"old_role": "editor"}'::jsonb, NOW() - INTERVAL '6 hours'),
('90000000-0000-0000-0000-000000000015', 'info', 'Platform connection established', NULL, 'req_connect_001', NULL, '{"platform": "tiktok_ads"}'::jsonb, NOW() - INTERVAL '4 hours'),
('90000000-0000-0000-0000-000000000016', 'debug', 'Cache invalidation triggered', NULL, 'req_debug_001', NULL, '{"reason": "campaign_update"}'::jsonb, NOW() - INTERVAL '45 minutes'),
('90000000-0000-0000-0000-000000000017', 'debug', 'Background job queued', NULL, 'req_debug_002', NULL, '{"job_id": "job_abc123"}'::jsonb, NOW() - INTERVAL '20 minutes'),
('90000000-0000-0000-0000-000000000018', 'debug', 'API request logged', NULL, 'req_debug_003', NULL, '{"path": "/api/v1/campaigns"}'::jsonb, NOW() - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SCRIPT COMPLETE (Valid UUIDs + Owner ID)
-- ============================================
