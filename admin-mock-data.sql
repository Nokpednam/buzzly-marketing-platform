-- ============================================
-- Mock Data for Admin Panel Testing
-- Tables: business_types, industries, teams, team_members, team_invitations, 
--         workspace_members, platforms, ad_accounts, error_logs, profiles
-- ============================================

-- 1. Insert Business Types (ถ้ายังไม่มี)
INSERT INTO public.business_types (id, name, slug, description, icon_url, display_order, is_active) VALUES
('b1000000-0000-0000-0000-000000000001', 'Technology', 'technology', 'Software and IT companies', NULL, 1, true),
('b1000000-0000-0000-0000-000000000002', 'E-commerce', 'e-commerce', 'Online retail and marketplace', NULL, 2, true),
('b1000000-0000-0000-0000-000000000003', 'Healthcare', 'healthcare', 'Medical and health services', NULL, 3, true),
('b1000000-0000-0000-0000-000000000004', 'Finance', 'finance', 'Banking and financial services', NULL, 4, true),
('b1000000-0000-0000-0000-000000000005', 'Education', 'education', 'Educational institutions and EdTech', NULL, 5, true),
('b1000000-0000-0000-0000-000000000006', 'Real Estate', 'real-estate', 'Property and real estate', NULL, 6, true),
('b1000000-0000-0000-0000-000000000007', 'F&B', 'food-beverage', 'Food and beverage industry', NULL, 7, true),
('b1000000-0000-0000-0000-000000000008', 'Agency', 'agency', 'Marketing and advertising agencies', NULL, 8, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Industries (ถ้ายังไม่มี)
INSERT INTO public.industries (id, name, slug, description, icon_url, display_order, is_active) VALUES
('i1000000-0000-0000-0000-000000000001', 'Software Development', 'software-development', 'Custom software and SaaS', NULL, 1, true),
('i1000000-0000-0000-0000-000000000002', 'Digital Marketing', 'digital-marketing', 'Online marketing services', NULL, 2, true),
('i1000000-0000-0000-0000-000000000003', 'Retail', 'retail', 'Retail and consumer goods', NULL, 3, true),
('i1000000-0000-0000-0000-000000000004', 'Manufacturing', 'manufacturing', 'Manufacturing and production', NULL, 4, true),
('i1000000-0000-0000-0000-000000000005', 'Consulting', 'consulting', 'Business consulting services', NULL, 5, true),
('i1000000-0000-0000-0000-000000000006', 'Media & Entertainment', 'media-entertainment', 'Media and content creation', NULL, 6, true),
('i1000000-0000-0000-0000-000000000007', 'Hospitality', 'hospitality', 'Hotels and tourism', NULL, 7, true),
('i1000000-0000-0000-0000-000000000008', 'Logistics', 'logistics', 'Transportation and delivery', NULL, 8, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Platforms (สำหรับ Ad Accounts)
INSERT INTO public.platforms (id, name, slug, description, icon_url, is_active, api_version) VALUES
('p1000000-0000-0000-0000-000000000001', 'Facebook Ads', 'facebook-ads', 'Meta Facebook advertising platform', NULL, true, 'v18.0'),
('p1000000-0000-0000-0000-000000000002', 'Google Ads', 'google-ads', 'Google advertising platform', NULL, true, 'v15'),
('p1000000-0000-0000-0000-000000000003', 'TikTok Ads', 'tiktok-ads', 'TikTok advertising platform', NULL, true, 'v1.3'),
('p1000000-0000-0000-0000-000000000004', 'LINE Ads', 'line-ads', 'LINE advertising platform', NULL, true, 'v2.0'),
('p1000000-0000-0000-0000-000000000005', 'LinkedIn Ads', 'linkedin-ads', 'LinkedIn advertising platform', NULL, true, 'v2'),
('p1000000-0000-0000-0000-000000000006', 'Twitter/X Ads', 'twitter-ads', 'Twitter/X advertising platform', NULL, true, 'v2'),
('p1000000-0000-0000-0000-000000000007', 'Shopee Ads', 'shopee-ads', 'Shopee marketplace advertising', NULL, true, 'v2.0'),
('p1000000-0000-0000-0000-000000000008', 'Lazada Ads', 'lazada-ads', 'Lazada marketplace advertising', NULL, true, 'v1.0')
ON CONFLICT (id) DO NOTHING;

-- 4. Get existing user to use as owner (ใช้ user ID ที่มีอยู่จริงในระบบ)
-- หมายเหตุ: ต้องเปลี่ยน user_id นี้เป็น UUID ของผู้ใช้จริงในระบบ
-- คุณสามารถหา user_id ได้จาก: SELECT id FROM auth.users LIMIT 5;

-- สำหรับตัวอย่างนี้ใช้ placeholder UUID - ต้องเปลี่ยนเป็น user_id จริง!
DO $$
DECLARE
    v_owner_id uuid;
    v_user_id_1 uuid;
    v_user_id_2 uuid;
    v_user_id_3 uuid;
BEGIN
    -- ดึง user_id จริงจากระบบ (เลือก 4 คนแรก)
    SELECT id INTO v_owner_id FROM auth.users LIMIT 1;
    
    -- ถ้าไม่มี user ให้หยุด
    IF v_owner_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users. Please create users first.';
        RETURN;
    END IF;
    
    -- 5. Insert Teams (Workspaces) with real owner
    INSERT INTO public.teams (id, name, description, logo_url, workspace_url, status, owner_id, business_type_id, industries_id) VALUES
    ('t1000000-0000-0000-0000-000000000001', 'Buzzly Digital Agency', 'Full-service digital marketing agency specializing in social media and paid ads', NULL, 'https://buzzly-agency.com', 'active', v_owner_id, 'b1000000-0000-0000-0000-000000000008', 'i1000000-0000-0000-0000-000000000002'),
    ('t1000000-0000-0000-0000-000000000002', 'TechStart Thailand', 'Innovative startup focusing on SaaS solutions for SMEs', NULL, 'https://techstart-th.com', 'active', v_owner_id, 'b1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000001'),
    ('t1000000-0000-0000-0000-000000000003', 'ShopMax E-commerce', 'Leading online marketplace for consumer electronics', NULL, 'https://shopmax.co.th', 'active', v_owner_id, 'b1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000003'),
    ('t1000000-0000-0000-0000-000000000004', 'HealthPlus Clinic', 'Modern healthcare provider with telemedicine services', NULL, 'https://healthplus-clinic.com', 'active', v_owner_id, 'b1000000-0000-0000-0000-000000000003', NULL),
    ('t1000000-0000-0000-0000-000000000005', 'EduLearn Academy', 'Online education platform for professional development', NULL, 'https://edulearn-academy.com', 'active', v_owner_id, 'b1000000-0000-0000-0000-000000000005', NULL),
    ('t1000000-0000-0000-0000-000000000006', 'Foodies Bangkok', 'Popular food delivery and restaurant chain', NULL, 'https://foodies-bkk.com', 'active', v_owner_id, 'b1000000-0000-0000-0000-000000000007', 'i1000000-0000-0000-0000-000000000007'),
    ('t1000000-0000-0000-0000-000000000007', 'PropertyHub Thailand', 'Real estate agency with premium listings', NULL, NULL, 'active', v_owner_id, 'b1000000-0000-0000-0000-000000000006', NULL),
    ('t1000000-0000-0000-0000-000000000008', 'FastLogistics Co.', 'Express delivery and logistics solutions', NULL, 'https://fastlogistics.co.th', 'active', v_owner_id, 'b1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000008')
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Team Members (หลายสมาชิกต่อทีม)
    INSERT INTO public.team_members (id, team_id, user_id, role, status, joined_at) VALUES
    -- Buzzly Digital Agency members
    ('tm100000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001', v_owner_id, 'owner', 'active', NOW() - INTERVAL '6 months'),
    -- TechStart Thailand members
    ('tm100000-0000-0000-0000-000000000005', 't1000000-0000-0000-0000-000000000002', v_owner_id, 'owner', 'active', NOW() - INTERVAL '4 months'),
    -- ShopMax E-commerce members
    ('tm100000-0000-0000-0000-000000000008', 't1000000-0000-0000-0000-000000000003', v_owner_id, 'owner', 'active', NOW() - INTERVAL '3 months'),
    -- HealthPlus Clinic members
    ('tm100000-0000-0000-0000-000000000010', 't1000000-0000-0000-0000-000000000004', v_owner_id, 'owner', 'active', NOW() - INTERVAL '5 months'),
    -- EduLearn Academy members
    ('tm100000-0000-0000-0000-000000000012', 't1000000-0000-0000-0000-000000000005', v_owner_id, 'owner', 'active', NOW() - INTERVAL '2 months'),
    -- Foodies Bangkok members
    ('tm100000-0000-0000-0000-000000000014', 't1000000-0000-0000-0000-000000000006', v_owner_id, 'admin', 'active', NOW() - INTERVAL '1 month'),
    -- PropertyHub Thailand members
    ('tm100000-0000-0000-0000-000000000016', 't1000000-0000-0000-0000-000000000007', v_owner_id, 'owner', 'active', NOW() - INTERVAL '7 months'),
    -- FastLogistics Co. members
    ('tm100000-0000-0000-0000-000000000017', 't1000000-0000-0000-0000-000000000008', v_owner_id, 'owner', 'active', NOW() - INTERVAL '2 weeks')
    ON CONFLICT (id) DO NOTHING;

    -- 7. Insert Team Invitations
    INSERT INTO public.team_invitations (id, team_id, email, role, invited_by, expires_at, status, created_at) VALUES
    -- Pending invitations
    ('ti100000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001', 'newmarketer@gmail.com', 'editor', v_owner_id, NOW() + INTERVAL '7 days', 'pending', NOW() - INTERVAL '2 days'),
    ('ti100000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000001', 'designer.pro@email.com', 'viewer', v_owner_id, NOW() + INTERVAL '5 days', 'pending', NOW() - INTERVAL '4 days'),
    ('ti100000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000002', 'developer@techcompany.com', 'admin', v_owner_id, NOW() + INTERVAL '6 days', 'pending', NOW() - INTERVAL '1 day'),
    ('ti100000-0000-0000-0000-000000000004', 't1000000-0000-0000-0000-000000000003', 'inventory.manager@shop.com', 'editor', v_owner_id, NOW() + INTERVAL '4 days', 'pending', NOW() - INTERVAL '3 days'),
    -- Accepted invitations
    ('ti100000-0000-0000-0000-000000000005', 't1000000-0000-0000-0000-000000000001', 'accepted.user@company.com', 'editor', v_owner_id, NOW() - INTERVAL '1 day', 'accepted', NOW() - INTERVAL '10 days'),
    ('ti100000-0000-0000-0000-000000000006', 't1000000-0000-0000-0000-000000000002', 'joined.member@startup.io', 'admin', v_owner_id, NOW() - INTERVAL '3 days', 'accepted', NOW() - INTERVAL '14 days'),
    -- Expired invitations  
    ('ti100000-0000-0000-0000-000000000007', 't1000000-0000-0000-0000-000000000004', 'expired.invite@hospital.com', 'viewer', v_owner_id, NOW() - INTERVAL '2 days', 'expired', NOW() - INTERVAL '12 days'),
    ('ti100000-0000-0000-0000-000000000008', 't1000000-0000-0000-0000-000000000005', 'missed.deadline@edu.com', 'editor', v_owner_id, NOW() - INTERVAL '5 days', 'expired', NOW() - INTERVAL '15 days')
    ON CONFLICT (id) DO NOTHING;

    -- 8. Insert Workspace Members (Member Chains)
    INSERT INTO public.workspace_members (id, workspace_id, user_id, status, joined_at) VALUES
    ('wm100000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001', v_owner_id, 'active', NOW() - INTERVAL '6 months'),
    ('wm100000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000002', v_owner_id, 'active', NOW() - INTERVAL '4 months'),
    ('wm100000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000003', v_owner_id, 'active', NOW() - INTERVAL '3 months'),
    ('wm100000-0000-0000-0000-000000000004', 't1000000-0000-0000-0000-000000000004', v_owner_id, 'active', NOW() - INTERVAL '5 months'),
    ('wm100000-0000-0000-0000-000000000005', 't1000000-0000-0000-0000-000000000005', v_owner_id, 'pending', NOW() - INTERVAL '1 week'),
    ('wm100000-0000-0000-0000-000000000006', 't1000000-0000-0000-0000-000000000006', v_owner_id, 'active', NOW() - INTERVAL '1 month')
    ON CONFLICT (id) DO NOTHING;

END $$;

-- 9. Insert Ad Accounts (เชื่อมกับ Teams และ Platforms)
INSERT INTO public.ad_accounts (id, account_name, team_id, platform_id, platform_account_id, is_active) VALUES
-- Buzzly Digital Agency ad accounts
('aa100000-0000-0000-0000-000000000001', 'Buzzly - Facebook Main', 't1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'act_123456789', true),
('aa100000-0000-0000-0000-000000000002', 'Buzzly - Google Performance', 't1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000002', '1234567890', true),
('aa100000-0000-0000-0000-000000000003', 'Buzzly - TikTok Brand', 't1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000003', 'tt_ads_001', true),
-- TechStart Thailand ad accounts
('aa100000-0000-0000-0000-000000000004', 'TechStart - LinkedIn B2B', 't1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000005', 'li_acc_456', true),
('aa100000-0000-0000-0000-000000000005', 'TechStart - Google SEM', 't1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', '2345678901', true),
-- ShopMax E-commerce ad accounts
('aa100000-0000-0000-0000-000000000006', 'ShopMax - Facebook ROAS', 't1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', 'act_shopmax_001', true),
('aa100000-0000-0000-0000-000000000007', 'ShopMax - Shopee Seller', 't1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000007', 'shopee_123', true),
('aa100000-0000-0000-0000-000000000008', 'ShopMax - Lazada Store', 't1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000008', 'lazada_456', false),
-- HealthPlus Clinic ad accounts
('aa100000-0000-0000-0000-000000000009', 'HealthPlus - Facebook Awareness', 't1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000001', 'act_health_001', true),
('aa100000-0000-0000-0000-000000000010', 'HealthPlus - LINE Official', 't1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', 'line_health', true),
-- EduLearn Academy ad accounts
('aa100000-0000-0000-0000-000000000011', 'EduLearn - Google Display', 't1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000002', '3456789012', true),
('aa100000-0000-0000-0000-000000000012', 'EduLearn - Facebook Leads', 't1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000001', 'act_edu_001', true),
-- Foodies Bangkok ad accounts
('aa100000-0000-0000-0000-000000000013', 'Foodies - TikTok Food', 't1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000003', 'tt_foodies', true),
('aa100000-0000-0000-0000-000000000014', 'Foodies - Facebook Local', 't1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000001', 'act_foodies', false),
-- PropertyHub Thailand ad accounts
('aa100000-0000-0000-0000-000000000015', 'PropertyHub - Facebook Property', 't1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000001', 'act_property_001', true),
-- FastLogistics Co. ad accounts
('aa100000-0000-0000-0000-000000000016', 'FastLogistics - Google Ads', 't1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000002', '4567890123', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Error Logs (สำหรับ Admin Support page)
INSERT INTO public.error_logs (id, level, message, user_id, request_id, stack_trace, metadata, created_at) VALUES
-- Critical Errors
('el100000-0000-0000-0000-000000000001', 'error', 'Database connection timeout after 30000ms', NULL, 'req_db_timeout_001', 'Error: Connection timeout
    at PostgresClient.connect (/app/node_modules/pg/lib/client.js:132:11)
    at Pool._connect (/app/node_modules/pg/lib/pool.js:161:25)
    at async handleRequest (/app/src/api/handler.ts:45:12)', '{"database": "primary", "pool_size": 20, "active_connections": 20}'::jsonb, NOW() - INTERVAL '2 hours'),

('el100000-0000-0000-0000-000000000002', 'error', 'Payment processing failed: Insufficient funds', NULL, 'req_payment_001', 'PaymentError: Transaction declined
    at StripeProcessor.charge (/app/src/payments/stripe.ts:89:15)
    at CheckoutController.process (/app/src/controllers/checkout.ts:156:20)
    at async routeHandler (/app/src/routes/api.ts:34:8)', '{"provider": "stripe", "amount": 5000, "currency": "THB", "error_code": "insufficient_funds"}'::jsonb, NOW() - INTERVAL '4 hours'),

('el100000-0000-0000-0000-000000000003', 'error', 'Facebook API rate limit exceeded (200 requests/hour)', NULL, 'req_fb_api_001', 'FacebookAPIError: Rate limit exceeded
    at MetaAPI.fetch (/app/src/integrations/facebook/api.ts:67:11)
    at AdInsightsSyncer.sync (/app/src/jobs/sync-insights.ts:123:18)', '{"platform": "facebook", "endpoint": "/insights", "rate_limit": 200, "current_count": 201}'::jsonb, NOW() - INTERVAL '6 hours'),

('el100000-0000-0000-0000-000000000004', 'error', 'Authentication token expired for user session', NULL, 'req_auth_001', 'AuthenticationError: Token expired
    at JWTValidator.verify (/app/src/auth/jwt.ts:45:9)
    at authMiddleware (/app/src/middleware/auth.ts:23:14)', '{"token_type": "access_token", "expired_at": "2024-01-15T10:30:00Z"}'::jsonb, NOW() - INTERVAL '1 day'),

('el100000-0000-0000-0000-000000000005', 'error', 'Failed to sync Google Ads campaign: Invalid credentials', NULL, 'req_gads_001', 'GoogleAdsError: Invalid OAuth credentials
    at GoogleAdsClient.authenticate (/app/src/integrations/google/client.ts:34:11)
    at CampaignSync.run (/app/src/jobs/campaign-sync.ts:78:22)', '{"platform": "google_ads", "account_id": "1234567890", "error_type": "OAUTH_INVALID"}'::jsonb, NOW() - INTERVAL '8 hours'),

-- Warnings
('el100000-0000-0000-0000-000000000006', 'warning', 'High memory usage detected: 85% of available memory', NULL, 'req_health_001', NULL, '{"memory_used_mb": 3400, "memory_total_mb": 4000, "threshold": 80}'::jsonb, NOW() - INTERVAL '30 minutes'),

('el100000-0000-0000-0000-000000000007', 'warning', 'Slow database query detected (>5s): Campaign analytics aggregation', NULL, 'req_slow_query_001', NULL, '{"query_time_ms": 7823, "table": "ad_insights", "operation": "aggregate", "rows_scanned": 1500000}'::jsonb, NOW() - INTERVAL '1 hour'),

('el100000-0000-0000-0000-000000000008', 'warning', 'API response time exceeding threshold: Facebook Insights API', NULL, 'req_latency_001', NULL, '{"endpoint": "/v18.0/insights", "response_time_ms": 4500, "threshold_ms": 3000}'::jsonb, NOW() - INTERVAL '3 hours'),

('el100000-0000-0000-0000-000000000009', 'warning', 'Retry attempt 3/5 for webhook delivery to client endpoint', NULL, 'req_webhook_001', NULL, '{"webhook_url": "https://client-api.example.com/webhook", "attempt": 3, "max_attempts": 5, "last_error": "Connection refused"}'::jsonb, NOW() - INTERVAL '5 hours'),

('el100000-0000-0000-0000-000000000010', 'warning', 'Cache miss rate above 40% for campaign data', NULL, 'req_cache_001', NULL, '{"cache_type": "redis", "hit_rate": 58.5, "miss_rate": 41.5, "key_pattern": "campaign:*"}'::jsonb, NOW() - INTERVAL '2 hours'),

-- Info logs
('el100000-0000-0000-0000-000000000011', 'info', 'Daily ad insights sync completed successfully for 8 accounts', NULL, 'req_sync_001', NULL, '{"accounts_synced": 8, "insights_fetched": 15420, "duration_seconds": 145}'::jsonb, NOW() - INTERVAL '12 hours'),

('el100000-0000-0000-0000-000000000012', 'info', 'New workspace created: Buzzly Digital Agency', NULL, 'req_workspace_001', NULL, '{"workspace_id": "t1000000-0000-0000-0000-000000000001", "owner_email": "admin@buzzly.com", "plan": "pro"}'::jsonb, NOW() - INTERVAL '1 day'),

('el100000-0000-0000-0000-000000000013', 'info', 'Scheduled report generated and sent to 5 recipients', NULL, 'req_report_001', NULL, '{"report_type": "weekly_performance", "recipients": 5, "format": "pdf", "size_kb": 2450}'::jsonb, NOW() - INTERVAL '18 hours'),

('el100000-0000-0000-0000-000000000014', 'info', 'User role updated: editor -> admin for team member', NULL, 'req_role_001', NULL, '{"team_id": "t1000000-0000-0000-0000-000000000002", "user_email": "promoted@example.com", "old_role": "editor", "new_role": "admin"}'::jsonb, NOW() - INTERVAL '6 hours'),

('el100000-0000-0000-0000-000000000015', 'info', 'Platform connection established: TikTok Ads API', NULL, 'req_connect_001', NULL, '{"platform": "tiktok_ads", "account_id": "tt_ads_001", "features_enabled": ["insights", "campaigns", "audiences"]}'::jsonb, NOW() - INTERVAL '4 hours'),

-- Debug logs
('el100000-0000-0000-0000-000000000016', 'debug', 'Cache invalidation triggered for campaign ID: camp_12345', NULL, 'req_debug_001', NULL, '{"cache_keys": ["campaign:camp_12345", "insights:camp_12345:*"], "reason": "campaign_update"}'::jsonb, NOW() - INTERVAL '45 minutes'),

('el100000-0000-0000-0000-000000000017', 'debug', 'Background job queued: process_webhook_payload', NULL, 'req_debug_002', NULL, '{"job_id": "job_abc123", "queue": "webhooks", "priority": "high", "payload_size_bytes": 4521}'::jsonb, NOW() - INTERVAL '20 minutes'),

('el100000-0000-0000-0000-000000000018', 'debug', 'API request logged: GET /api/v1/campaigns with 15 query params', NULL, 'req_debug_003', NULL, '{"method": "GET", "path": "/api/v1/campaigns", "query_params_count": 15, "response_time_ms": 234}'::jsonb, NOW() - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- สรุป Mock Data ที่สร้าง:
-- - business_types: 8 รายการ
-- - industries: 8 รายการ  
-- - platforms: 8 รายการ (Facebook, Google, TikTok, LINE, LinkedIn, Twitter, Shopee, Lazada)
-- - teams (workspaces): 8 รายการ
-- - team_members: 8 รายการ
-- - team_invitations: 8 รายการ (4 pending, 2 accepted, 2 expired)
-- - workspace_members: 6 รายการ
-- - ad_accounts: 16 รายการ (เชื่อมกับ teams และ platforms)
-- - error_logs: 18 รายการ (5 error, 5 warning, 5 info, 3 debug)
-- ============================================
