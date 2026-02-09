-- ============================================
-- Mock Data for Admin Panel Testing (UPDATED & FIXED UUIDs & Owner ID)
-- Tables: business_types, industries, teams, workspaces, role_customers, workspace_members,
--         platforms, ad_accounts, error_logs
-- ============================================

-- 0. Insert Role Customers (Standard Roles)
-- IDs start with 10..
INSERT INTO public.role_customers (id, name, is_active) VALUES
('10000000-0000-0000-0000-000000000001', 'owner', true),
('10000000-0000-0000-0000-000000000002', 'admin', true),
('10000000-0000-0000-0000-000000000003', 'editor', true),
('10000000-0000-0000-0000-000000000004', 'viewer', true)
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

-- 4. Get existing user and Insert Teams, Workspaces, Members
DO $$
DECLARE
    v_owner_id uuid;
BEGIN
    SELECT id INTO v_owner_id FROM auth.users LIMIT 1;
    
    IF v_owner_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users. Please create users first.';
        RETURN;
    END IF;
    
    -- 5. Insert Teams
    -- IDs start with 50..
    -- Added owner_id because it is required
    INSERT INTO public.teams (id, name, description, logo_url, workspace_url, status, owner_id, business_type_id, industries_id) VALUES
    ('50000000-0000-0000-0000-000000000001', 'Buzzly Digital Agency', 'Full-service digital marketing agency', NULL, 'https://buzzly-agency.com', 'active', v_owner_id, '20000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000002'),
    ('50000000-0000-0000-0000-000000000002', 'TechStart Thailand', 'Innovative startup', NULL, 'https://techstart-th.com', 'active', v_owner_id, '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
    ('50000000-0000-0000-0000-000000000003', 'ShopMax E-commerce', 'Online marketplace', NULL, 'https://shopmax.co.th', 'active', v_owner_id, '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003'),
    ('50000000-0000-0000-0000-000000000004', 'HealthPlus Clinic', 'Modern healthcare', NULL, 'https://healthplus-clinic.com', 'active', v_owner_id, '20000000-0000-0000-0000-000000000003', NULL),
    ('50000000-0000-0000-0000-000000000005', 'EduLearn Academy', 'Online education', NULL, 'https://edulearn-academy.com', 'active', v_owner_id, '20000000-0000-0000-0000-000000000005', NULL),
    ('50000000-0000-0000-0000-000000000006', 'Foodies Bangkok', 'Food delivery', NULL, 'https://foodies-bkk.com', 'active', v_owner_id, '20000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007'),
    ('50000000-0000-0000-0000-000000000007', 'PropertyHub Thailand', 'Real estate', NULL, NULL, 'active', v_owner_id, '20000000-0000-0000-0000-000000000006', NULL),
    ('50000000-0000-0000-0000-000000000008', 'FastLogistics Co.', 'Express delivery', NULL, 'https://fastlogistics.co.th', 'active', v_owner_id, '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008')
    ON CONFLICT (id) DO NOTHING;

    -- 5.1 Insert Workspaces (One-to-one with Teams)
    -- IDs start with 60..
    INSERT INTO public.workspaces (id, team_id, workspace_name, status, business_type_id, industries_id) VALUES
    ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Buzzly Workspace', 'active', '20000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000002'),
    ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'TechStart Workspace', 'active', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
    ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', 'ShopMax Workspace', 'active', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003'),
    ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000004', 'HealthPlus Workspace', 'active', '20000000-0000-0000-0000-000000000003', NULL),
    ('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', 'EduLearn Workspace', 'active', '20000000-0000-0000-0000-000000000005', NULL),
    ('60000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000006', 'Foodies Workspace', 'active', '20000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007'),
    ('60000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000007', 'PropertyHub Workspace', 'active', '20000000-0000-0000-0000-000000000006', NULL),
    ('60000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000008', 'FastLogistics Workspace', 'active', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008')
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Workspace Members
    -- IDs start with 70..
    INSERT INTO public.workspace_members (id, workspace_id, user_id, role_customer_id, status, joined_at) VALUES
    -- Owners (active)
    ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', v_owner_id, '10000000-0000-0000-0000-000000000001', 'active', NOW() - INTERVAL '6 months'),
    ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', v_owner_id, '10000000-0000-0000-0000-000000000001', 'active', NOW() - INTERVAL '4 months'),
    ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', v_owner_id, '10000000-0000-0000-0000-000000000001', 'active', NOW() - INTERVAL '3 months'),
    ('70000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000004', v_owner_id, '10000000-0000-0000-0000-000000000001', 'active', NOW() - INTERVAL '5 months'),
    ('70000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000005', v_owner_id, '10000000-0000-0000-0000-000000000001', 'active', NOW() - INTERVAL '2 months'),
    ('70000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000006', v_owner_id, '10000000-0000-0000-0000-000000000002', 'active', NOW() - INTERVAL '1 month'),
    ('70000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000007', v_owner_id, '10000000-0000-0000-0000-000000000001', 'active', NOW() - INTERVAL '7 months'),
    ('70000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000008', v_owner_id, '10000000-0000-0000-0000-000000000001', 'active', NOW() - INTERVAL '2 weeks')
    ON CONFLICT (id) DO NOTHING;

    -- 7. Insert Invitations
    INSERT INTO public.workspace_members (id, workspace_id, invitation_email, role_customer_id, status, invitation_expires_at, created_at) VALUES
    ('70000000-0000-0000-0000-000000000009', '60000000-0000-0000-0000-000000000001', 'newmarketer@gmail.com', '10000000-0000-0000-0000-000000000003', 'pending', NOW() + INTERVAL '7 days', NOW() - INTERVAL '2 days'),
    ('70000000-0000-0000-0000-000000000010', '60000000-0000-0000-0000-000000000001', 'designer.pro@email.com', '10000000-0000-0000-0000-000000000004', 'pending', NOW() + INTERVAL '5 days', NOW() - INTERVAL '4 days'),
    ('70000000-0000-0000-0000-000000000011', '60000000-0000-0000-0000-000000000002', 'developer@techcompany.com', '10000000-0000-0000-0000-000000000002', 'pending', NOW() + INTERVAL '6 days', NOW() - INTERVAL '1 day'),
    ('70000000-0000-0000-0000-000000000012', '60000000-0000-0000-0000-000000000003', 'inventory.manager@shop.com', '10000000-0000-0000-0000-000000000003', 'pending', NOW() + INTERVAL '4 days', NOW() - INTERVAL '3 days')
    ON CONFLICT (id) DO NOTHING;

END $$;

-- 9. Insert Ad Accounts
-- IDs start with 80..
INSERT INTO public.ad_accounts (id, account_name, team_id, platform_id, platform_account_id, is_active) VALUES
('80000000-0000-0000-0000-000000000001', 'Buzzly - Facebook Main', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'act_123456789', true),
('80000000-0000-0000-0000-000000000002', 'Buzzly - Google Performance', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '1234567890', true),
('80000000-0000-0000-0000-000000000003', 'Buzzly - TikTok Brand', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 'tt_ads_001', true),
('80000000-0000-0000-0000-000000000004', 'TechStart - LinkedIn B2B', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000005', 'li_acc_456', true),
('80000000-0000-0000-0000-000000000005', 'TechStart - Google SEM', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '2345678901', true),
('80000000-0000-0000-0000-000000000006', 'ShopMax - Facebook ROAS', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'act_shopmax_001', true),
('80000000-0000-0000-0000-000000000007', 'ShopMax - Shopee Seller', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000007', 'shopee_123', true),
('80000000-0000-0000-0000-000000000008', 'ShopMax - Lazada Store', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000008', 'lazada_456', false),
('80000000-0000-0000-0000-000000000009', 'HealthPlus - Facebook Awareness', '50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 'act_health_001', true),
('80000000-0000-0000-0000-000000000010', 'HealthPlus - LINE Official', '50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', 'line_health', true),
('80000000-0000-0000-0000-000000000011', 'EduLearn - Google Display', '50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002', '3456789012', true),
('80000000-0000-0000-0000-000000000012', 'EduLearn - Facebook Leads', '50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', 'act_edu_001', true),
('80000000-0000-0000-0000-000000000013', 'Foodies - TikTok Food', '50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000003', 'tt_foodies', true),
('80000000-0000-0000-0000-000000000014', 'Foodies - Facebook Local', '50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000001', 'act_foodies', false),
('80000000-0000-0000-0000-000000000015', 'PropertyHub - Facebook Property', '50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000001', 'act_property_001', true),
('80000000-0000-0000-0000-000000000016', 'FastLogistics - Google Ads', '50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000002', '4567890123', true)
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
