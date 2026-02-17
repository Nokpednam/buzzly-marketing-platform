-- =============================================
-- BUZZLY COMPREHENSIVE SAMPLE DATA
-- Full Dataset for All Features (Customer, Owner, Admin)
-- Run this in Supabase SQL Editor
-- Generated: 2026-01-31 (Schema-Aligned)
-- =============================================

-- ===== AARRR Categories =====
INSERT INTO aarrr_categories (id, name, slug, description, color_code, display_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Acquisition', 'acquisition', 'How users discover and reach your product', '#3B82F6', 1),
  ('a0000002-0000-0000-0000-000000000002', 'Activation', 'activation', 'Users who complete their first meaningful action', '#10B981', 2),
  ('a0000003-0000-0000-0000-000000000003', 'Retention', 'retention', 'Users who continue to engage over time', '#F59E0B', 3),
  ('a0000004-0000-0000-0000-000000000004', 'Referral', 'referral', 'Users who recommend your product to others', '#8B5CF6', 4),
  ('a0000005-0000-0000-0000-000000000005', 'Revenue', 'revenue', 'Users who convert to paying customers', '#EF4444', 5)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color_code = EXCLUDED.color_code;

-- ===== Funnel Stages =====
INSERT INTO funnel_stages (id, name, slug, description, aarrr_categories_id, display_order) VALUES
  ('f0000001-0000-0000-0000-000000000001', 'Landing Page Visit', 'landing', 'User visits landing page', 'a0000001-0000-0000-0000-000000000001', 1),
  ('f0000002-0000-0000-0000-000000000002', 'Sign Up Started', 'signup-start', 'User initiates registration', 'a0000001-0000-0000-0000-000000000001', 2),
  ('f0000003-0000-0000-0000-000000000003', 'Email Verified', 'email-verified', 'User verifies email address', 'a0000002-0000-0000-0000-000000000002', 3),
  ('f0000004-0000-0000-0000-000000000004', 'Profile Complete', 'profile-complete', 'User completes profile setup', 'a0000002-0000-0000-0000-000000000002', 4),
  ('f0000005-0000-0000-0000-000000000005', 'First Campaign', 'first-campaign', 'User creates first campaign', 'a0000003-0000-0000-0000-000000000003', 5),
  ('f0000006-0000-0000-0000-000000000006', 'Active User', 'active', 'User is active on weekly basis', 'a0000003-0000-0000-0000-000000000003', 6),
  ('f0000007-0000-0000-0000-000000000007', 'Referral Made', 'referral', 'User refers another person', 'a0000004-0000-0000-0000-000000000004', 7),
  ('f0000008-0000-0000-0000-000000000008', 'First Payment', 'first-payment', 'User makes first payment', 'a0000005-0000-0000-0000-000000000005', 8)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Event Categories =====
INSERT INTO event_categories (id, name, slug, description, color_code, display_order) VALUES
  ('ec000001-0000-0000-0000-000000000001', 'Page Views', 'page-views', 'User page view events', '#3B82F6', 1),
  ('ec000002-0000-0000-0000-000000000002', 'User Actions', 'user-actions', 'User interaction events', '#10B981', 2),
  ('ec000003-0000-0000-0000-000000000003', 'Conversions', 'conversions', 'Conversion and purchase events', '#EF4444', 3),
  ('ec000004-0000-0000-0000-000000000004', 'Engagement', 'engagement', 'Content engagement events', '#8B5CF6', 4)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Event Types =====
INSERT INTO event_types (id, name, slug, description, event_category_id, priority_score, display_order) VALUES
  ('e7000001-0000-0000-0000-000000000001', 'Page View', 'page-view', 'User viewed a page', 'ec000001-0000-0000-0000-000000000001', 1, 1),
  ('e7000002-0000-0000-0000-000000000002', 'Sign Up', 'signup', 'User signed up for account', 'ec000002-0000-0000-0000-000000000002', 10, 2),
  ('e7000003-0000-0000-0000-000000000003', 'Login', 'login', 'User logged into account', 'ec000002-0000-0000-0000-000000000002', 5, 3),
  ('e7000004-0000-0000-0000-000000000004', 'Add to Cart', 'add-to-cart', 'Added item to shopping cart', 'ec000003-0000-0000-0000-000000000003', 8, 4),
  ('e7000005-0000-0000-0000-000000000005', 'Purchase', 'purchase', 'Completed purchase transaction', 'ec000003-0000-0000-0000-000000000003', 10, 5),
  ('e7000006-0000-0000-0000-000000000006', 'Campaign Created', 'campaign-created', 'User created a new campaign', 'ec000004-0000-0000-0000-000000000004', 7, 6),
  ('e7000007-0000-0000-0000-000000000007', 'Report Viewed', 'report-viewed', 'User viewed analytics report', 'ec000004-0000-0000-0000-000000000004', 4, 7),
  ('e7000008-0000-0000-0000-000000000008', 'Export Data', 'export-data', 'User exported data', 'ec000004-0000-0000-0000-000000000004', 6, 8)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Loyalty Tiers =====
INSERT INTO loyalty_tiers (id, name, description, min_points, min_spend_amount, discount_percentage, point_multiplier, badge_color, priority_level, benefits_summary) VALUES
  ('17000001-0000-0000-0000-000000000001', 'Bronze', 'Entry level membership tier', 0, 0, 2, 1.0, '#CD7F32', 1, 'Basic rewards, 2% discount on renewals'),
  ('17000002-0000-0000-0000-000000000002', 'Silver', 'Regular customer loyalty tier', 500, 5000, 5, 1.25, '#C0C0C0', 2, '5% discount, 1.25x points, priority support'),
  ('17000003-0000-0000-0000-000000000003', 'Gold', 'Premium customer tier', 2000, 20000, 10, 1.5, '#FFD700', 3, '10% discount, 1.5x points, dedicated manager'),
  ('17000004-0000-0000-0000-000000000004', 'Platinum', 'VIP exclusive tier', 5000, 50000, 15, 2.0, '#E5E4E2', 4, '15% discount, 2x points, exclusive features, VIP events')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  benefits_summary = EXCLUDED.benefits_summary;

-- ===== Subscription Plans =====
INSERT INTO subscription_plans (id, name, slug, description, price_monthly, price_yearly, features, limits, max_workspace, is_active, is_popular, display_order, trial_days) VALUES
  ('5b000001-0000-0000-0000-000000000001', 'Free', 'free', 'Basic features for individuals starting out', 0, 0, 
   '["3 campaigns", "Basic analytics", "Email support", "7-day data retention"]'::jsonb,
   '{"max_campaigns": 3, "max_team_members": 1}'::jsonb, 1, true, false, 1, 0),
  ('5b000002-0000-0000-0000-000000000002', 'Pro', 'pro', 'Advanced features for professionals', 29.99, 299.99,
   '["Unlimited campaigns", "Advanced analytics", "AI Insights", "Priority support", "90-day data retention", "Custom reports"]'::jsonb,
   '{"max_campaigns": -1, "max_team_members": 5}'::jsonb, 3, true, true, 2, 14),
  ('5b000003-0000-0000-0000-000000000003', 'Team', 'team', 'Full collaboration features for teams', 79.99, 799.99,
   '["Everything in Pro", "Unlimited team members", "Role-based access", "API access", "Dedicated support", "1-year data retention", "White-label reports"]'::jsonb,
   '{"max_campaigns": -1, "max_team_members": -1}'::jsonb, 10, true, false, 3, 14),
  ('5b000004-0000-0000-0000-000000000004', 'Enterprise', 'enterprise', 'Custom solutions for large organizations', 299.99, 2999.99,
   '["Everything in Team", "SSO integration", "Custom integrations", "SLA guarantee", "Unlimited data retention", "On-premise option"]'::jsonb,
   '{"max_campaigns": -1, "max_team_members": -1}'::jsonb, -1, true, false, 4, 30)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  max_workspace = EXCLUDED.max_workspace,
  is_popular = EXCLUDED.is_popular,
  display_order = EXCLUDED.display_order,
  trial_days = EXCLUDED.trial_days;

-- ===== Payment Providers =====
INSERT INTO payment_providers (id, name, slug, description, is_active) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Stripe', 'stripe', 'Global payment processing via Stripe', true),
  ('b0000002-0000-0000-0000-000000000002', 'PromptPay', 'promptpay', 'Thai PromptPay QR payment', true),
  ('b0000003-0000-0000-0000-000000000003', 'Bank Transfer', 'bank-transfer', 'Direct bank transfer payment', true),
  ('b0000004-0000-0000-0000-000000000004', 'PayPal', 'paypal', 'PayPal payment processing', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Payment Methods =====
INSERT INTO payment_methods (id, name, slug, description, provider_id, display_order) VALUES
  ('b1000001-0000-0000-0000-000000000001', 'Credit/Debit Card', 'card', 'Pay with Visa, Mastercard, JCB, AMEX', 'b0000001-0000-0000-0000-000000000001', 1),
  ('b1000002-0000-0000-0000-000000000002', 'PromptPay', 'promptpay', 'Scan QR code with Thai banking app', 'b0000002-0000-0000-0000-000000000002', 2),
  ('b1000003-0000-0000-0000-000000000003', 'Bank Transfer', 'bank-transfer', 'Transfer to company bank account', 'b0000003-0000-0000-0000-000000000003', 3),
  ('b1000004-0000-0000-0000-000000000004', 'PayPal', 'paypal', 'Pay with PayPal account', 'b0000004-0000-0000-0000-000000000004', 4)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Currencies =====
INSERT INTO currencies (id, code, name, symbol, decimal_places) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'USD', 'US Dollar', '$', 2),
  ('c0000002-0000-0000-0000-000000000002', 'THB', 'Thai Baht', '฿', 2),
  ('c0000003-0000-0000-0000-000000000003', 'EUR', 'Euro', '€', 2),
  ('c0000004-0000-0000-0000-000000000004', 'JPY', 'Japanese Yen', '¥', 0)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  symbol = EXCLUDED.symbol;

-- ===== Discounts =====
INSERT INTO discounts (id, code, description, discount_type, discount_value, is_active, start_date, end_date, usage_limit) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'SAVE20', '20% off first subscription', 'percentage', 20, true, NOW() - INTERVAL '6 months', NOW() + INTERVAL '6 months', 1000),
  ('d0000002-0000-0000-0000-000000000002', 'WELCOME10', '$10 off any plan', 'fixed', 10, true, NOW() - INTERVAL '3 months', NOW() + INTERVAL '9 months', 500),
  ('d0000003-0000-0000-0000-000000000003', 'ANNUAL30', '30% off annual subscription', 'percentage', 30, true, NOW() - INTERVAL '1 month', NOW() + INTERVAL '11 months', 200),
  ('d0000004-0000-0000-0000-000000000004', 'BLACKFRIDAY', 'Black Friday 40% off', 'percentage', 40, false, NOW() - INTERVAL '60 days', NOW() - INTERVAL '55 days', 100)
ON CONFLICT (id) DO UPDATE SET 
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- ===== Platforms =====
INSERT INTO platforms (name, slug, description, is_active) VALUES
  ('Facebook', 'facebook', 'Meta Facebook Ads Platform', true),
  ('Instagram', 'instagram', 'Meta Instagram Ads Platform', true),
  ('TikTok', 'tiktok', 'TikTok for Business Ads', true),
  ('Shopee', 'shopee', 'Shopee Marketplace Ads', true),
  ('Google', 'google', 'Google Ads Platform', true),
  ('LINE', 'line', 'LINE Ads Platform', true),
  ('YouTube', 'youtube', 'YouTube Ads via Google', true),
  ('Twitter/X', 'twitter', 'X (Twitter) Ads', true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Ad Accounts (Moved up to fix FK order) =====
DO $$
DECLARE
  t_id UUID;
  fb_id UUID;
  gg_id UUID;
  o_id UUID;
BEGIN
  -- 1. Ensure a team exists (Required for sample data)
  SELECT id INTO t_id FROM public.teams LIMIT 1;
  
  IF t_id IS NULL THEN
    -- Find an owner or any user to own the team
    SELECT id INTO o_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF o_id IS NOT NULL THEN
      INSERT INTO public.teams (id, name, owner_id)
      VALUES (gen_random_uuid(), 'Sample Growth Team', o_id)
      RETURNING id INTO t_id;
      
      -- Also add to team_members
      INSERT INTO public.team_members (team_id, user_id, role, status)
      VALUES (t_id, o_id, 'owner', 'active')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- 2. Create Ad Accounts linked to this team
  SELECT id INTO fb_id FROM public.platforms WHERE slug = 'facebook';
  SELECT id INTO gg_id FROM public.platforms WHERE slug = 'google';

  IF t_id IS NOT NULL AND fb_id IS NOT NULL AND gg_id IS NOT NULL THEN
    INSERT INTO public.ad_accounts (id, team_id, platform_id, account_name, is_active)
    VALUES 
      ('aa000001-0000-0000-0000-000000000001', t_id, fb_id, 'Buzzly Facebook Ads', true),
      ('aa000002-0000-0000-0000-000000000002', t_id, gg_id, 'Buzzly Google Ads', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ===== Sample Campaigns (Moved up to fix FK order) =====
-- Linked to Ad Account aa...01 (Facebook) or aa...02 (Google)
INSERT INTO public.campaigns (id, ad_account_id, name, objective, status, budget_amount, start_date, end_date) VALUES
  ('ca000001-0000-0000-0000-000000000001', 'aa000001-0000-0000-0000-000000000001', 'Q1 Brand Awareness 2025', 'awareness', 'active', 5000, NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days'),
  ('ca000002-0000-0000-0000-000000000002', 'aa000001-0000-0000-0000-000000000001', 'Black Friday 2025', 'conversions', 'active', 15000, NOW() - INTERVAL '7 days', NOW() + INTERVAL '3 days'),
  ('ca000003-0000-0000-0000-000000000003', 'aa000002-0000-0000-0000-000000000002', 'Holiday Season 2025', 'sales', 'draft', 20000, NOW() + INTERVAL '30 days', NOW() + INTERVAL '60 days'),
  ('ca000004-0000-0000-0000-000000000004', 'aa000001-0000-0000-0000-000000000001', 'Summer Promotion 2025', 'engagement', 'completed', 8000, NOW() - INTERVAL '180 days', NOW() - INTERVAL '120 days'),
  ('ca000005-0000-0000-0000-000000000005', 'aa000002-0000-0000-0000-000000000002', 'Retargeting Q4', 'conversions', 'active', 3500, NOW() - INTERVAL '45 days', NOW() + INTERVAL '15 days'),
  ('ca000006-0000-0000-0000-000000000006', 'aa000001-0000-0000-0000-000000000001', 'New Product Launch', 'awareness', 'paused', 12000, NOW() - INTERVAL '60 days', NOW() + INTERVAL '30 days'),
  ('ca000007-0000-0000-0000-000000000007', 'aa000002-0000-0000-0000-000000000002', 'Email Subscriber Growth', 'leads', 'active', 2500, NOW() - INTERVAL '14 days', NOW() + INTERVAL '46 days'),
  ('ca000008-0000-0000-0000-000000000008', 'aa000001-0000-0000-0000-000000000001', 'Q4 Revenue Push', 'conversions', 'active', 25000, NOW() - INTERVAL '21 days', NOW() + INTERVAL '39 days')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  budget_amount = EXCLUDED.budget_amount;

-- ===== Ad Groups =====
INSERT INTO ad_groups (id, name, status) VALUES
  ('a6000001-0000-0000-0000-000000000001', 'Summer Campaign 2025', 'active'),
  ('a6000002-0000-0000-0000-000000000002', 'Black Friday Promo', 'active'),
  ('a6000003-0000-0000-0000-000000000003', 'Year End Sale', 'active'),
  ('a6000004-0000-0000-0000-000000000004', 'New Product Launch', 'active'),
  ('a6000005-0000-0000-0000-000000000005', 'Brand Awareness Q1', 'active'),
  ('a6000006-0000-0000-0000-000000000006', 'Retargeting Visitors', 'paused'),
  ('a6000007-0000-0000-0000-000000000007', 'Lookalike Audiences', 'active'),
  ('a6000008-0000-0000-0000-000000000008', 'Email Subscribers', 'active')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  status = EXCLUDED.status;

-- ===== Ads =====
INSERT INTO ads (id, name, headline, ad_copy, call_to_action, ad_group_id, status) VALUES
  ('ad000001-0000-0000-0000-000000000001', 'Summer Sale V1', 'Beat the Heat This Summer', 'Get 30% off all summer collection. Limited time only! Shop now and save big.', 'Shop Now', 'a6000001-0000-0000-0000-000000000001', 'active'),
  ('ad000002-0000-0000-0000-000000000002', 'Summer Sale V2', 'Hot Summer Deals Await', 'Cool prices for hot days. Save up to 50% on selected items!', 'Learn More', 'a6000001-0000-0000-0000-000000000001', 'active'),
  ('ad000003-0000-0000-0000-000000000003', 'BF Flash Sale', 'Black Friday MEGA SALE', 'Up to 70% off everything. 24 hours only! Don''t miss out.', 'Shop Now', 'a6000002-0000-0000-0000-000000000002', 'active'),
  ('ad000004-0000-0000-0000-000000000004', 'New Arrival', 'Introducing Our Latest Innovation', 'Be the first to experience our newest product line. Pre-order now!', 'Pre-Order', 'a6000004-0000-0000-0000-000000000004', 'active'),
  ('ad000005-0000-0000-0000-000000000005', 'Year End V1', 'End the Year with Big Savings', 'Last chance to save big this year! Up to 60% off storewide.', 'Get Deal', 'a6000003-0000-0000-0000-000000000003', 'active'),
  ('ad000006-0000-0000-0000-000000000006', 'Brand Story', 'Our Story, Your Journey', 'Discover how we''re changing the industry, one customer at a time.', 'Watch Video', 'a6000005-0000-0000-0000-000000000005', 'active'),
  ('ad000007-0000-0000-0000-000000000007', 'Retarget Cart', 'Forgot Something?', 'Your cart is waiting! Complete your purchase and get free shipping.', 'Complete Order', 'a6000006-0000-0000-0000-000000000006', 'paused'),
  ('ad000008-0000-0000-0000-000000000008', 'Lookalike Promo', 'Join 100K+ Happy Customers', 'See why thousands choose us. Start your journey today!', 'Get Started', 'a6000007-0000-0000-0000-000000000007', 'active')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  headline = EXCLUDED.headline,
  ad_copy = EXCLUDED.ad_copy;

-- ===== Ad Insights (1 YEAR - 365 days of data) =====
DO $$
DECLARE
  d DATE;
  ad_id UUID;
  -- Map ads to campaigns for insights consistency
  -- ad 1,2 -> campaign 1 (Brand Awareness)
  -- ad 3 -> campaign 2 (Black Friday)
  -- ad 4 -> campaign 4 (Summer)
  -- ad 5 -> campaign 3 (Holiday)
  -- ad 6 -> campaign 6 (New Launch)
  -- ad 7 -> campaign 5 (Retargeting)
  -- ad 8 -> campaign 7 (Email Growth)
  ad_ids UUID[] := ARRAY[
    'ad000001-0000-0000-0000-000000000001'::UUID,
    'ad000002-0000-0000-0000-000000000002'::UUID,
    'ad000003-0000-0000-0000-000000000003'::UUID,
    'ad000004-0000-0000-0000-000000000004'::UUID,
    'ad000005-0000-0000-0000-000000000005'::UUID,
    'ad000006-0000-0000-0000-000000000006'::UUID,
    'ad000007-0000-0000-0000-000000000007'::UUID,
    'ad000008-0000-0000-0000-000000000008'::UUID
  ];
  -- Corresponding campaign IDs for the ads above
  camp_ids UUID[] := ARRAY[
    'ca000001-0000-0000-0000-000000000001'::UUID,
    'ca000001-0000-0000-0000-000000000001'::UUID,
    'ca000002-0000-0000-0000-000000000002'::UUID,
    'ca000004-0000-0000-0000-000000000004'::UUID,
    'ca000003-0000-0000-0000-000000000003'::UUID,
    'ca000006-0000-0000-0000-000000000006'::UUID,
    'ca000005-0000-0000-0000-000000000005'::UUID,
    'ca000007-0000-0000-0000-000000000007'::UUID
  ];
  -- Corresponding ad account IDs (campaign 1,4,6,8 -> aa...01; 3,5,7 -> aa...02)
  -- But simplified: just use the one linked in campaigns table
  acc_ids UUID[] := ARRAY[
    'aa000001-0000-0000-0000-000000000001'::UUID,
    'aa000001-0000-0000-0000-000000000001'::UUID,
    'aa000001-0000-0000-0000-000000000001'::UUID,
    'aa000001-0000-0000-0000-000000000001'::UUID,
    'aa000002-0000-0000-0000-000000000002'::UUID,
    'aa000001-0000-0000-0000-000000000001'::UUID,
    'aa000002-0000-0000-0000-000000000002'::UUID,
    'aa000002-0000-0000-0000-000000000002'::UUID
  ];

  base_impressions INT;
  base_spend NUMERIC;
  day_of_week INT;
  month_of_year INT;
  seasonal_mult NUMERIC;
  weekend_mult NUMERIC;
  i INT;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day')::DATE LOOP
    day_of_week := EXTRACT(DOW FROM d)::INT;
    month_of_year := EXTRACT(MONTH FROM d)::INT;
    
    weekend_mult := CASE WHEN day_of_week IN (0, 6) THEN 0.75 ELSE 1.0 END;
    seasonal_mult := CASE 
      WHEN month_of_year IN (11, 12) THEN 1.4
      WHEN month_of_year IN (1, 2) THEN 0.8
      WHEN month_of_year IN (6, 7, 8) THEN 0.9
      ELSE 1.0 
    END;
    
    FOR i IN 1..array_length(ad_ids, 1) LOOP
      ad_id := ad_ids[i];
      base_impressions := (1500 + random() * 4000)::INT;
      base_spend := (15 + random() * 85)::NUMERIC;
      
      INSERT INTO ad_insights (
        ads_id, campaign_id, ad_account_id, date, impressions, clicks, conversions, spend, reach, ctr, cpm, cpc, roas
      )
      VALUES (
        ad_id,
        camp_ids[i],
        acc_ids[i],
        d,
        (base_impressions * seasonal_mult * weekend_mult)::INT,
        ((base_impressions * seasonal_mult * weekend_mult * (0.02 + random() * 0.04)))::INT,
        ((base_impressions * seasonal_mult * weekend_mult * 0.003 * (0.5 + random())))::INT,
        (base_spend * seasonal_mult)::NUMERIC(10,2),
        (base_impressions * seasonal_mult * weekend_mult * 0.85)::INT,
        (1.5 + random() * 3.5)::NUMERIC(5,2),
        (6 + random() * 18)::NUMERIC(6,2),
        (0.15 + random() * 1.5)::NUMERIC(6,2),
        (1.2 + random() * 4.8)::NUMERIC(5,2)
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ===== Cohort Analysis (12 months of monthly cohorts) =====
DO $$
DECLARE
  d DATE;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE - INTERVAL '12 months', CURRENT_DATE, '1 month')::DATE LOOP
    INSERT INTO cohort_analysis (
      cohort_date, cohort_type, cohort_size, average_retention, churn_rate, lifetime_value, 
      retention_data, revenue_data, active_users_data
    )
    VALUES (
      d,
      'monthly',
      (150 + random() * 450)::INT,
      (35 + random() * 35)::NUMERIC(5,2),
      (5 + random() * 12)::NUMERIC(5,2),
      (800 + random() * 1800)::NUMERIC(10,2),
      jsonb_build_object(
        'week_1', (92 + random() * 6)::INT,
        'week_2', (78 + random() * 12)::INT,
        'week_3', (65 + random() * 15)::INT,
        'week_4', (55 + random() * 15)::INT,
        'month_2', (42 + random() * 18)::INT,
        'month_3', (35 + random() * 15)::INT,
        'month_6', (25 + random() * 15)::INT,
        'month_12', (18 + random() * 12)::INT
      ),
      jsonb_build_object(
        'month_1', (5000 + random() * 10000)::INT,
        'month_2', (4000 + random() * 8000)::INT,
        'month_3', (3500 + random() * 7000)::INT,
        'total_ltv', (15000 + random() * 25000)::INT
      ),
      jsonb_build_object(
        'daily_active', (50 + random() * 150)::INT,
        'weekly_active', (120 + random() * 280)::INT,
        'monthly_active', (200 + random() * 400)::INT
      )
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ===== Rating Types (FIXED: uses name, descriptions columns) =====
INSERT INTO rating (id, name, descriptions, color_code) VALUES
  ('47000001-0000-0000-0000-000000000001', '5 Stars', 'Excellent - Extremely satisfied', '#10B981'),
  ('47000002-0000-0000-0000-000000000002', '4 Stars', 'Good - Satisfied', '#22C55E'),
  ('47000003-0000-0000-0000-000000000003', '3 Stars', 'Average - Neutral experience', '#F59E0B'),
  ('47000004-0000-0000-0000-000000000004', '2 Stars', 'Poor - Dissatisfied', '#F97316'),
  ('47000005-0000-0000-0000-000000000005', '1 Star', 'Very Poor - Very dissatisfied', '#EF4444')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  descriptions = EXCLUDED.descriptions;

-- ===== Sample Feedback for Owner Dashboard (50+ reviews) =====
INSERT INTO feedback (id, rating_id, comment, created_at) VALUES
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'Love the new dashboard! Very intuitive and easy to navigate.', NOW() - INTERVAL '11 months'),
  (gen_random_uuid(), '47000002-0000-0000-0000-000000000002', 'Good features but could use more platform integrations.', NOW() - INTERVAL '10 months'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'The AI insights feature is absolutely amazing! Saved us hours of analysis.', NOW() - INTERVAL '10 months'),
  (gen_random_uuid(), '47000003-0000-0000-0000-000000000003', 'Decent tool, meets our basic marketing needs.', NOW() - INTERVAL '9 months'),
  (gen_random_uuid(), '47000004-0000-0000-0000-000000000004', 'Had some issues with loading times, hope this gets fixed.', NOW() - INTERVAL '9 months'),
  (gen_random_uuid(), '47000002-0000-0000-0000-000000000002', 'Great customer support team! Very responsive.', NOW() - INTERVAL '8 months'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'Best marketing platform I''ve used in my 10 years of experience.', NOW() - INTERVAL '8 months'),
  (gen_random_uuid(), '47000003-0000-0000-0000-000000000003', 'Could improve the reporting features, but overall okay.', NOW() - INTERVAL '7 months'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'Campaign management is super streamlined. Love it!', NOW() - INTERVAL '7 months'),
  (gen_random_uuid(), '47000002-0000-0000-0000-000000000002', 'Worth every penny of the Pro subscription.', NOW() - INTERVAL '6 months'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'AARRR funnel visualization is brilliant!', NOW() - INTERVAL '6 months'),
  (gen_random_uuid(), '47000002-0000-0000-0000-000000000002', 'Solid platform. Our team productivity increased 30%.', NOW() - INTERVAL '5 months'),
  (gen_random_uuid(), '47000003-0000-0000-0000-000000000003', 'Good value for money at the free tier.', NOW() - INTERVAL '5 months'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'The multi-platform integration saved us so much time!', NOW() - INTERVAL '4 months'),
  (gen_random_uuid(), '47000002-0000-0000-0000-000000000002', 'Real-time analytics are very helpful for quick decisions.', NOW() - INTERVAL '4 months'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'Upgraded to Team plan - no regrets!', NOW() - INTERVAL '3 months'),
  (gen_random_uuid(), '47000003-0000-0000-0000-000000000003', 'Interface could be more modern, but functionality is great.', NOW() - INTERVAL '3 months'),
  (gen_random_uuid(), '47000002-0000-0000-0000-000000000002', 'API access on Team plan is exactly what we needed.', NOW() - INTERVAL '2 months'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'Customer success team helped us optimize our campaigns.', NOW() - INTERVAL '2 months'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'The cohort analysis feature is incredibly insightful.', NOW() - INTERVAL '1 month'),
  (gen_random_uuid(), '47000002-0000-0000-0000-000000000002', 'Mobile responsiveness has improved a lot!', NOW() - INTERVAL '1 month'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'Best investment for our marketing team this year.', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), '47000002-0000-0000-0000-000000000002', 'Loyalty program integration works seamlessly.', NOW() - INTERVAL '10 days'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'Highly recommend for any e-commerce business!', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '47000001-0000-0000-0000-000000000001', 'Thai language support is excellent. ขอบคุณมาก!', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '47000005-0000-0000-0000-000000000005', 'Very disappointed with the pricing changes.', NOW() - INTERVAL '45 days'),
  (gen_random_uuid(), '47000004-0000-0000-0000-000000000004', 'Integration broke after the last update.', NOW() - INTERVAL '35 days'),
  (gen_random_uuid(), '47000003-0000-0000-0000-000000000003', 'Average experience, nothing special.', NOW() - INTERVAL '25 days')
ON CONFLICT DO NOTHING;

-- ===== Role Employees (for internal staff) =====
INSERT INTO role_employees (id, role_name, description) VALUES
  ('4e000001-0000-0000-0000-000000000001', 'Owner', 'Business owner with full system access'),
  ('4e000002-0000-0000-0000-000000000002', 'Admin', 'System administrator with management access'),
  ('4e000003-0000-0000-0000-000000000003', 'Support', 'Customer support representative'),
  ('4e000004-0000-0000-0000-000000000004', 'Developer', 'Development team member'),
  ('4e000005-0000-0000-0000-000000000005', 'Analyst', 'Data analyst with reporting access'),
  ('4e000006-0000-0000-0000-000000000006', 'Marketing', 'Marketing team member')
ON CONFLICT (id) DO UPDATE SET 
  role_name = EXCLUDED.role_name,
  description = EXCLUDED.description;

-- ===== Genders =====
INSERT INTO genders (id, name_gender) VALUES
  ('6e000001-0000-0000-0000-000000000001', 'Male'),
  ('6e000002-0000-0000-0000-000000000002', 'Female'),
  ('6e000003-0000-0000-0000-000000000003', 'Non-binary'),
  ('6e000004-0000-0000-0000-000000000004', 'Prefer not to say')
ON CONFLICT (id) DO UPDATE SET 
  name_gender = EXCLUDED.name_gender;

-- ===== Server Status (FIXED: uses hostname, not server_name) =====
INSERT INTO server (id, hostname, ip_address, status) VALUES
  ('5a000001-0000-0000-0000-000000000001', 'api-primary-sg', '10.0.1.10', 'healthy'),
  ('5a000002-0000-0000-0000-000000000002', 'api-secondary-jp', '10.0.1.11', 'healthy'),
  ('5a000003-0000-0000-0000-000000000003', 'db-primary-sg', '10.0.2.10', 'healthy'),
  ('5a000004-0000-0000-0000-000000000004', 'db-replica-jp', '10.0.2.11', 'healthy'),
  ('5a000005-0000-0000-0000-000000000005', 'cdn-edge-global', '10.0.3.10', 'healthy'),
  ('5a000006-0000-0000-0000-000000000006', 'redis-cache-sg', '10.0.4.10', 'healthy'),
  ('5a000007-0000-0000-0000-000000000007', 'queue-worker-sg', '10.0.5.10', 'warning')
ON CONFLICT (id) DO UPDATE SET 
  hostname = EXCLUDED.hostname,
  status = EXCLUDED.status;

-- ===== Pipeline Types =====
INSERT INTO pipeline_type (id, name, description, color_code) VALUES
  ('b7000001-0000-0000-0000-000000000001', 'Data Sync', 'Synchronize data between external platforms', '#3B82F6'),
  ('b7000002-0000-0000-0000-000000000002', 'ETL', 'Extract, Transform, Load data processes', '#10B981'),
  ('b7000003-0000-0000-0000-000000000003', 'Analytics', 'Analytics computation and aggregation', '#8B5CF6'),
  ('b7000004-0000-0000-0000-000000000004', 'Backup', 'Data backup and recovery processes', '#F59E0B'),
  ('b7000005-0000-0000-0000-000000000005', 'ML Pipeline', 'Machine learning model training', '#EF4444'),
  ('b7000006-0000-0000-0000-000000000006', 'Notification', 'Alert and notification delivery', '#06B6D4')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Data Pipelines =====
INSERT INTO data_pipeline (id, name, pipeline_type_id, status, schedule_cron, last_run_at, next_run_at) VALUES
  ('db000001-0000-0000-0000-000000000001', 'Facebook Ads Sync', 'b7000001-0000-0000-0000-000000000001', 'running', '0 */4 * * *', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '2 hours'),
  ('db000002-0000-0000-0000-000000000002', 'Instagram Insights Sync', 'b7000001-0000-0000-0000-000000000001', 'completed', '0 */4 * * *', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '3 hours'),
  ('db000003-0000-0000-0000-000000000003', 'Daily Analytics Aggregation', 'b7000003-0000-0000-0000-000000000003', 'completed', '0 2 * * *', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '18 hours'),
  ('db000004-0000-0000-0000-000000000004', 'User ETL Pipeline', 'b7000002-0000-0000-0000-000000000002', 'running', '0 */6 * * *', NOW() - INTERVAL '4 hours', NOW() + INTERVAL '2 hours'),
  ('db000005-0000-0000-0000-000000000005', 'Database Backup', 'b7000004-0000-0000-0000-000000000004', 'completed', '0 0 * * *', NOW() - INTERVAL '12 hours', NOW() + INTERVAL '12 hours'),
  ('db000006-0000-0000-0000-000000000006', 'TikTok Ads Sync', 'b7000001-0000-0000-0000-000000000001', 'failed', '0 */6 * * *', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '3 hours'),
  ('db000007-0000-0000-0000-000000000007', 'Cohort Analysis Weekly', 'b7000003-0000-0000-0000-000000000003', 'completed', '0 3 * * 0', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days'),
  ('db000008-0000-0000-0000-000000000008', 'AI Insights Training', 'b7000005-0000-0000-0000-000000000005', 'queued', '0 4 * * 1', NOW() - INTERVAL '6 days', NOW() + INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  last_run_at = EXCLUDED.last_run_at,
  next_run_at = EXCLUDED.next_run_at;

-- ===== External API Status =====
-- ===== External API Status =====
DO $$
DECLARE
  fb_id UUID;
  ig_id UUID;
  tt_id UUID;
  sh_id UUID;
  gg_id UUID;
  ln_id UUID;
  yt_id UUID;
  tw_id UUID;
BEGIN
  SELECT id INTO fb_id FROM platforms WHERE slug = 'facebook';
  SELECT id INTO ig_id FROM platforms WHERE slug = 'instagram';
  SELECT id INTO tt_id FROM platforms WHERE slug = 'tiktok';
  SELECT id INTO sh_id FROM platforms WHERE slug = 'shopee';
  SELECT id INTO gg_id FROM platforms WHERE slug = 'google';
  SELECT id INTO ln_id FROM platforms WHERE slug = 'line';
  SELECT id INTO yt_id FROM platforms WHERE slug = 'youtube';
  SELECT id INTO tw_id FROM platforms WHERE slug = 'twitter';

  INSERT INTO external_api_status (id, platform_id, last_status_code, latency_ms, color_code, created_at) VALUES
    ('ea500001-0000-0000-0000-000000000001', fb_id, 200, 145, '#10B981', NOW()),
    ('ea500002-0000-0000-0000-000000000002', ig_id, 200, 132, '#10B981', NOW()),
    ('ea500003-0000-0000-0000-000000000003', tt_id, 200, 289, '#10B981', NOW()),
    ('ea500004-0000-0000-0000-000000000004', sh_id, 200, 178, '#10B981', NOW()),
    ('ea500005-0000-0000-0000-000000000005', gg_id, 200, 95, '#10B981', NOW()),
    ('ea500006-0000-0000-0000-000000000006', ln_id, 200, 156, '#10B981', NOW()),
    ('ea500007-0000-0000-0000-000000000007', yt_id, 200, 112, '#10B981', NOW()),
    ('ea500008-0000-0000-0000-000000000008', tw_id, 429, 2450, '#EF4444', NOW())
  ON CONFLICT (id) DO UPDATE SET 
    last_status_code = EXCLUDED.last_status_code,
    latency_ms = EXCLUDED.latency_ms,
    color_code = EXCLUDED.color_code;
END $$;

-- ===== Action Types (for Audit Logs) =====
INSERT INTO action_type (id, action_name, description, color_code) VALUES
  ('ac700001-0000-0000-0000-000000000001', 'Login', 'User login event', '#10B981'),
  ('ac700002-0000-0000-0000-000000000002', 'Logout', 'User logout event', '#6B7280'),
  ('ac700003-0000-0000-0000-000000000003', 'Create', 'Resource creation event', '#3B82F6'),
  ('ac700004-0000-0000-0000-000000000004', 'Update', 'Resource update event', '#F59E0B'),
  ('ac700005-0000-0000-0000-000000000005', 'Delete', 'Resource deletion event', '#EF4444'),
  ('ac700006-0000-0000-0000-000000000006', 'Export', 'Data export event', '#8B5CF6'),
  ('ac700007-0000-0000-0000-000000000007', 'Import', 'Data import event', '#06B6D4'),
  ('ac700008-0000-0000-0000-000000000008', 'Permission Change', 'Permission modification', '#F97316')
ON CONFLICT (id) DO UPDATE SET 
  action_name = EXCLUDED.action_name,
  description = EXCLUDED.description;

-- ===== Error Logs (for Admin Support Page) =====
INSERT INTO error_logs (id, level, message, stack_trace, request_id, metadata, created_at) VALUES
  (gen_random_uuid(), 'error', 'Database connection timeout after 30s', 'Error: Connection timeout\n    at PostgresConnection.connect (/app/db/connection.ts:45)\n    at async getConnection (/app/db/pool.ts:23)', 'req_abc123', '{"service": "api", "endpoint": "/api/campaigns", "user_id": null}', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), 'error', 'Failed to sync Facebook Ads data: Rate limit exceeded', 'Error: Rate limit exceeded (429)\n    at FacebookAPI.fetch (/app/integrations/facebook.ts:89)\n    at syncAdsData (/app/jobs/sync.ts:34)', 'req_def456', '{"platform": "facebook", "ad_account_id": "act_123456789"}', NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), 'warning', 'High memory usage detected: 85% of allocated memory', NULL, 'health_check_789', '{"server": "api-primary", "memory_mb": 3400, "threshold_mb": 4000}', NOW() - INTERVAL '4 hours'),
  (gen_random_uuid(), 'error', 'Payment processing failed: Card declined', 'Error: Card declined (insufficient_funds)\n    at StripeClient.charge (/app/payments/stripe.ts:67)\n    at processPayment (/app/services/billing.ts:123)', 'req_ghi789', '{"user_id": "user_123", "amount": 29.99, "currency": "USD"}', NOW() - INTERVAL '5 hours'),
  (gen_random_uuid(), 'warning', 'Slow query detected: Query took 3.2s to execute', NULL, 'query_monitor_001', '{"query": "SELECT * FROM ad_insights WHERE...", "duration_ms": 3200, "table": "ad_insights"}', NOW() - INTERVAL '6 hours'),
  (gen_random_uuid(), 'error', 'Email delivery failed: Invalid recipient address', 'Error: Invalid recipient\n    at SendGrid.send (/app/notifications/email.ts:45)\n    at notifyUser (/app/services/notification.ts:78)', 'req_jkl012', '{"recipient": "invalid@", "template": "welcome"}', NOW() - INTERVAL '8 hours'),
  (gen_random_uuid(), 'info', 'Scheduled maintenance completed successfully', NULL, 'maintenance_002', '{"duration_minutes": 15, "services_restarted": ["api", "worker"]}', NOW() - INTERVAL '12 hours'),
  (gen_random_uuid(), 'error', 'TikTok API authentication failed: Invalid access token', 'Error: Authentication failed (401)\n    at TikTokAPI.authenticate (/app/integrations/tiktok.ts:34)\n    at refreshToken (/app/auth/oauth.ts:89)', 'req_mno345', '{"platform": "tiktok", "error_code": "INVALID_TOKEN"}', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'warning', 'Redis cache miss rate above threshold: 25%', NULL, 'cache_monitor_003', '{"miss_rate": 0.25, "threshold": 0.20, "cache_size_mb": 512}', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'error', 'Failed to generate PDF report: Template not found', 'Error: Template not found\n    at PDFGenerator.render (/app/reports/pdf.ts:56)\n    at generateReport (/app/services/reports.ts:112)', 'req_pqr678', '{"report_type": "monthly_summary", "template": "v2"}', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'info', 'New user registration spike: 150% above average', NULL, 'analytics_004', '{"registrations_today": 250, "daily_average": 100}', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'error', 'Webhook delivery failed after 3 retries', 'Error: Connection refused\n    at WebhookService.deliver (/app/webhooks/delivery.ts:78)\n    at processQueue (/app/jobs/webhooks.ts:45)', 'webhook_stu901', '{"endpoint": "https://customer-api.com/webhook", "event": "campaign.completed"}', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'warning', 'API rate limit approaching for customer: 80% of quota used', NULL, 'rate_limit_005', '{"customer_id": "cust_789", "requests_used": 8000, "quota": 10000}', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'error', 'Image upload failed: File size exceeds limit', 'Error: File too large\n    at StorageService.upload (/app/storage/upload.ts:34)\n    at handleUpload (/app/api/upload.ts:56)', 'req_vwx234', '{"file_size_mb": 15, "max_size_mb": 10, "file_type": "image/png"}', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'info', 'Database backup completed successfully', NULL, 'backup_006', '{"backup_size_gb": 12.5, "duration_minutes": 45, "storage": "s3"}', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- ===== Business Types =====
INSERT INTO business_types (id, name, slug, description, display_order) VALUES
  ('b7500001-0000-0000-0000-000000000001', 'E-commerce', 'ecommerce', 'Online retail and marketplace businesses', 1),
  ('b7500002-0000-0000-0000-000000000002', 'SaaS', 'saas', 'Software as a Service companies', 2),
  ('b7500003-0000-0000-0000-000000000003', 'Agency', 'agency', 'Marketing, creative, and consulting agencies', 3),
  ('b7500004-0000-0000-0000-000000000004', 'Freelancer', 'freelancer', 'Independent professionals and consultants', 4),
  ('b7500005-0000-0000-0000-000000000005', 'Enterprise', 'enterprise', 'Large enterprise organizations', 5),
  ('b7500006-0000-0000-0000-000000000006', 'Startup', 'startup', 'Early-stage startup companies', 6),
  ('b7500007-0000-0000-0000-000000000007', 'SMB', 'smb', 'Small and medium-sized businesses', 7)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Industries =====
INSERT INTO industries (id, name, slug, description, display_order) VALUES
  ('1ed00001-0000-0000-0000-000000000001', 'Technology', 'technology', 'Tech, software, and IT services', 1),
  ('1ed00002-0000-0000-0000-000000000002', 'Retail', 'retail', 'Retail, e-commerce, and consumer goods', 2),
  ('1ed00003-0000-0000-0000-000000000003', 'Healthcare', 'healthcare', 'Healthcare, medical, and wellness', 3),
  ('1ed00004-0000-0000-0000-000000000004', 'Finance', 'finance', 'Financial services and fintech', 4),
  ('1ed00005-0000-0000-0000-000000000005', 'Education', 'education', 'Education, edtech, and training', 5),
  ('1ed00006-0000-0000-0000-000000000006', 'Food & Beverage', 'food-beverage', 'Restaurants, F&B, and hospitality', 6),
  ('1ed00007-0000-0000-0000-000000000007', 'Real Estate', 'real-estate', 'Real estate and property', 7),
  ('1ed00008-0000-0000-0000-000000000008', 'Travel', 'travel', 'Travel, tourism, and transportation', 8)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Social Posts (FIXED: uses correct column names from schema) =====
DO $$
DECLARE
  fb_id UUID;
  ig_id UUID;
  tt_id UUID;
  ln_id UUID;
  tw_id UUID;
BEGIN
  SELECT id INTO fb_id FROM platforms WHERE slug = 'facebook';
  SELECT id INTO ig_id FROM platforms WHERE slug = 'instagram';
  SELECT id INTO tt_id FROM platforms WHERE slug = 'tiktok';
  SELECT id INTO ln_id FROM platforms WHERE slug = 'line';
  SELECT id INTO tw_id FROM platforms WHERE slug = 'twitter';

  INSERT INTO social_posts (id, platform_id, post_type, content, status, scheduled_at, published_at, impressions, reach, likes, comments, shares, saves, clicks, engagement_rate, created_at) VALUES
    (gen_random_uuid(), fb_id, 'feed', '🚀 Exciting news! We''ve just launched our new AI-powered analytics dashboard. Check it out and let us know what you think! #MarketingTech #AI #Analytics', 'published', NOW() - INTERVAL '6 months', NOW() - INTERVAL '6 months', 45000, 38000, 1250, 89, 234, 120, 890, 4.5, NOW() - INTERVAL '6 months'),
    (gen_random_uuid(), ig_id, 'story', '📊 Behind the scenes: How our team builds data-driven marketing strategies. Swipe up to learn more! #MarketingTips', 'published', NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months', 32000, 28000, 890, 45, 67, 89, 456, 3.8, NOW() - INTERVAL '5 months'),
    (gen_random_uuid(), tt_id, 'feed', '💡 Pro tip: Always test your ad creatives with at least 3 variations. Our data shows this improves CTR by 40%! #DigitalMarketing', 'published', NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months', 67000, 55000, 2100, 156, 345, 200, 1200, 5.2, NOW() - INTERVAL '4 months'),
    (gen_random_uuid(), fb_id, 'feed', 'Summer sale is LIVE! 30% off all annual plans 🌴', 'published', NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 months', 29000, 24000, 423, 56, 89, 40, 610, 3.8, NOW() - INTERVAL '3 months'),
    (gen_random_uuid(), ig_id, 'story', 'Quick tip: Always A/B test your ad creatives! Here''s why... 🧪', 'published', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months', 21000, 17000, 567, 78, 45, 62, 330, 4.2, NOW() - INTERVAL '2 months'),
    (gen_random_uuid(), tw_id, 'feed', 'We just hit 100K users! Thank you for being part of our journey 🎉', 'published', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month', 48000, 39000, 1234, 189, 312, 140, 980, 5.1, NOW() - INTERVAL '1 month'),
    (gen_random_uuid(), ig_id, 'feed', 'New integration coming soon! Stay tuned for the big reveal 👀', 'scheduled', NOW() + INTERVAL '2 days', NULL, NULL, NULL, 0, 0, 0, 0, 0, NULL, NOW() - INTERVAL '1 day'),
    (gen_random_uuid(), fb_id, 'feed', 'Black Friday special announcement coming this Friday!', 'scheduled', NOW() + INTERVAL '3 days', NULL, NULL, NULL, 0, 0, 0, 0, 0, NULL, NOW()),
    (gen_random_uuid(), ln_id, 'feed', 'LINE Official Account now connected! 🇹🇭', 'published', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 17000, 14000, 289, 34, 12, 22, 260, 3.0, NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), ln_id, 'feed', 'เปิดตัวฟีเจอร์ใหม่! วิเคราะห์ข้อมูลด้วย AI 🤖', 'published', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', 25000, 21000, 456, 67, 23, 44, 420, 3.7, NOW() - INTERVAL '20 days')
  ON CONFLICT DO NOTHING;
END $$;

-- ===== Loyalty Points (MUST come before profile_customers due to FK) =====
INSERT INTO loyalty_points (id, loyalty_tier_id, point_balance, total_points_earned, total_points_spend, status, last_earned_at) VALUES
  ('1b000001-0000-0000-0000-000000000001', '17000001-0000-0000-0000-000000000001', 250, 350, 100, 'active', NOW() - INTERVAL '2 weeks'),
  ('1b000002-0000-0000-0000-000000000002', '17000002-0000-0000-0000-000000000002', 850, 1200, 350, 'active', NOW() - INTERVAL '1 week'),
  ('1b000003-0000-0000-0000-000000000003', '17000003-0000-0000-0000-000000000003', 2500, 3500, 1000, 'active', NOW() - INTERVAL '3 days'),
  ('1b000004-0000-0000-0000-000000000004', '17000004-0000-0000-0000-000000000004', 6500, 8000, 1500, 'active', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET 
  point_balance = EXCLUDED.point_balance,
  status = EXCLUDED.status;

-- ===== Sample Profile Customers (for Customer Journey & Personas) =====
INSERT INTO profile_customers (id, user_id, gender_id, loyalty_point_id, first_name, last_name, phone_number, birthday_at, last_active, created_at) VALUES
  ('bc000001-0000-0000-0000-000000000001', NULL, '6e000001-0000-0000-0000-000000000001', '1b000001-0000-0000-0000-000000000001', 'Somchai', 'Tanaka', '0891234567', '1992-04-12', NOW() - INTERVAL '2 days', NOW() - INTERVAL '8 months'),
  ('bc000002-0000-0000-0000-000000000002', NULL, '6e000002-0000-0000-0000-000000000002', '1b000002-0000-0000-0000-000000000002', 'Nattaya', 'Wong', '0812345678', '1990-09-01', NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 months'),
  ('bc000003-0000-0000-0000-000000000003', NULL, '6e000001-0000-0000-0000-000000000001', '1b000003-0000-0000-0000-000000000003', 'Michael', 'Johnson', '0998887776', '1988-01-30', NOW() - INTERVAL '4 days', NOW() - INTERVAL '10 months'),
  ('bc000004-0000-0000-0000-000000000004', NULL, '6e000002-0000-0000-0000-000000000002', '1b000002-0000-0000-0000-000000000002', 'Sakura', 'Yamamoto', '0923456789', '1995-12-22', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '4 months'),
  ('bc000005-0000-0000-0000-000000000005', NULL, '6e000001-0000-0000-0000-000000000001', '1b000004-0000-0000-0000-000000000004', 'David', 'Lee', '0861112223', '1985-07-15', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 months'),
  ('bc000006-0000-0000-0000-000000000006', NULL, '6e000002-0000-0000-0000-000000000002', '1b000001-0000-0000-0000-000000000001', 'Ploy', 'Srisawat', '0834567890', '1998-03-08', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '3 months'),
  ('bc000007-0000-0000-0000-000000000007', NULL, '6e000001-0000-0000-0000-000000000001', '1b000003-0000-0000-0000-000000000003', 'James', 'Smith', '0821113334', '1991-11-05', NOW() - INTERVAL '3 days', NOW() - INTERVAL '9 months'),
  ('bc000008-0000-0000-0000-000000000008', NULL, '6e000002-0000-0000-0000-000000000002', '1b000002-0000-0000-0000-000000000002', 'Mai', 'Nguyen', '0842223334', '1994-05-19', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 months'),
  ('bc000009-0000-0000-0000-000000000009', NULL, '6e000003-0000-0000-0000-000000000003', '1b000001-0000-0000-0000-000000000001', 'Alex', 'Kim', '0879998887', '1993-02-14', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 months'),
  ('bc000010-0000-0000-0000-000000000010', NULL, '6e000002-0000-0000-0000-000000000002', '1b000002-0000-0000-0000-000000000002', 'Pim', 'Chaiyo', '0855554443', '1999-10-28', NOW() - INTERVAL '9 hours', NOW() - INTERVAL '2 months')
ON CONFLICT (id) DO UPDATE SET 
  last_active = EXCLUDED.last_active;

-- ===== Customer Insights (for Prospects/Persona page) =====
DO $$
DECLARE
  u1 uuid;
  u2 uuid;
  u3 uuid;
BEGIN
  SELECT id INTO u1 FROM auth.users ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO u2 FROM auth.users ORDER BY created_at ASC OFFSET 1 LIMIT 1;
  SELECT id INTO u3 FROM auth.users ORDER BY created_at ASC OFFSET 2 LIMIT 1;

  IF u1 IS NOT NULL THEN
    INSERT INTO customer_insights (id, user_id, profession, company, salary_range, num_employees, phone, created_at)
    VALUES (gen_random_uuid(), u1, 'Marketing Manager', 'Tech Startup Inc.', '50,000 - 80,000 THB', '10-50', '+66891234567', NOW() - INTERVAL '8 months')
    ON CONFLICT DO NOTHING;
  END IF;

  IF u2 IS NOT NULL THEN
    INSERT INTO customer_insights (id, user_id, profession, company, salary_range, num_employees, phone, created_at)
    VALUES (gen_random_uuid(), u2, 'E-commerce Owner', 'Fashion Online Shop', '100,000 - 200,000 THB', '1-10', '+66892345678', NOW() - INTERVAL '6 months')
    ON CONFLICT DO NOTHING;
  END IF;

  IF u3 IS NOT NULL THEN
    INSERT INTO customer_insights (id, user_id, profession, company, salary_range, num_employees, phone, created_at)
    VALUES (gen_random_uuid(), u3, 'Digital Marketing Specialist', 'Agency XYZ', '30,000 - 50,000 THB', '50-200', '+66893456789', NOW() - INTERVAL '10 months')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ===== Customer Activities (for Customer Journey) =====
INSERT INTO customer_activities (id, profile_customer_id, event_type_id, campaign_id, page_url, device_type, browser, created_at) VALUES
  (gen_random_uuid(), 'bc000001-0000-0000-0000-000000000001', 'e7000001-0000-0000-0000-000000000001', NULL, '/landing', 'mobile', 'Chrome', NOW() - INTERVAL '8 months'),
  (gen_random_uuid(), 'bc000001-0000-0000-0000-000000000001', 'e7000002-0000-0000-0000-000000000002', NULL, '/signup', 'mobile', 'Chrome', NOW() - INTERVAL '8 months' + INTERVAL '1 hour'),
  (gen_random_uuid(), 'bc000001-0000-0000-0000-000000000001', 'e7000006-0000-0000-0000-000000000006', 'ca000001-0000-0000-0000-000000000001', '/campaigns/new', 'desktop', 'Chrome', NOW() - INTERVAL '7 months'),
  (gen_random_uuid(), 'bc000002-0000-0000-0000-000000000002', 'e7000001-0000-0000-0000-000000000001', NULL, '/landing', 'desktop', 'Safari', NOW() - INTERVAL '6 months'),
  (gen_random_uuid(), 'bc000002-0000-0000-0000-000000000002', 'e7000002-0000-0000-0000-000000000002', NULL, '/signup', 'desktop', 'Safari', NOW() - INTERVAL '6 months' + INTERVAL '30 minutes'),
  (gen_random_uuid(), 'bc000002-0000-0000-0000-000000000002', 'e7000005-0000-0000-0000-000000000005', NULL, '/checkout', 'desktop', 'Safari', NOW() - INTERVAL '5 months'),
  (gen_random_uuid(), 'bc000003-0000-0000-0000-000000000003', 'e7000001-0000-0000-0000-000000000001', 'ca000002-0000-0000-0000-000000000002', '/promo/blackfriday', 'mobile', 'Firefox', NOW() - INTERVAL '10 months'),
  (gen_random_uuid(), 'bc000003-0000-0000-0000-000000000003', 'e7000004-0000-0000-0000-000000000004', NULL, '/cart', 'mobile', 'Firefox', NOW() - INTERVAL '10 months' + INTERVAL '2 hours'),
  (gen_random_uuid(), 'bc000004-0000-0000-0000-000000000004', 'e7000003-0000-0000-0000-000000000003', NULL, '/login', 'tablet', 'Safari', NOW() - INTERVAL '4 months'),
  (gen_random_uuid(), 'bc000004-0000-0000-0000-000000000004', 'e7000007-0000-0000-0000-000000000007', NULL, '/analytics', 'tablet', 'Safari', NOW() - INTERVAL '4 months' + INTERVAL '1 day'),
  (gen_random_uuid(), 'bc000005-0000-0000-0000-000000000005', 'e7000001-0000-0000-0000-000000000001', NULL, '/landing', 'desktop', 'Edge', NOW() - INTERVAL '12 months'),
  (gen_random_uuid(), 'bc000005-0000-0000-0000-000000000005', 'e7000002-0000-0000-0000-000000000002', NULL, '/signup', 'desktop', 'Edge', NOW() - INTERVAL '12 months' + INTERVAL '15 minutes'),
  (gen_random_uuid(), 'bc000005-0000-0000-0000-000000000005', 'e7000005-0000-0000-0000-000000000005', NULL, '/checkout', 'desktop', 'Edge', NOW() - INTERVAL '11 months'),
  (gen_random_uuid(), 'bc000005-0000-0000-0000-000000000005', 'e7000008-0000-0000-0000-000000000008', NULL, '/reports/export', 'desktop', 'Edge', NOW() - INTERVAL '10 months'),
  (gen_random_uuid(), 'bc000006-0000-0000-0000-000000000006', 'e7000001-0000-0000-0000-000000000001', NULL, '/landing', 'mobile', 'LINE', NOW() - INTERVAL '3 months'),
  (gen_random_uuid(), 'bc000007-0000-0000-0000-000000000007', 'e7000001-0000-0000-0000-000000000001', 'ca000004-0000-0000-0000-000000000004', '/summer-sale', 'desktop', 'Chrome', NOW() - INTERVAL '9 months'),
  (gen_random_uuid(), 'bc000008-0000-0000-0000-000000000008', 'e7000002-0000-0000-0000-000000000002', NULL, '/signup', 'mobile', 'Chrome', NOW() - INTERVAL '5 months'),
  (gen_random_uuid(), 'bc000009-0000-0000-0000-000000000009', 'e7000006-0000-0000-0000-000000000006', 'ca000005-0000-0000-0000-000000000005', '/campaigns/retarget', 'desktop', 'Chrome', NOW() - INTERVAL '7 months'),
  (gen_random_uuid(), 'bc000010-0000-0000-0000-000000000010', 'e7000003-0000-0000-0000-000000000003', NULL, '/login', 'mobile', 'Safari', NOW() - INTERVAL '2 months')
ON CONFLICT DO NOTHING;

-- ===== Persona Definitions =====
INSERT INTO persona_definition (id, name, description, demographics, behaviors, characteristics, is_active) VALUES
  ('be000001-0000-0000-0000-000000000001', 'Growth Marketer', 'Digital marketing professionals focused on growth', 
   '{"age_range": "25-35", "income": "50k-100k", "location": "Urban", "education": "Bachelor+"}',
   '{"purchase_frequency": "Monthly", "preferred_channels": ["Email", "LinkedIn"], "decision_time": "1-2 weeks"}',
   '{"tech_savvy": true, "data_driven": true, "budget_conscious": false}',
   true),
  ('be000002-0000-0000-0000-000000000002', 'E-commerce Entrepreneur', 'Online shop owners seeking marketing automation',
   '{"age_range": "28-45", "income": "80k-200k", "location": "Any", "education": "Varied"}',
   '{"purchase_frequency": "Quarterly", "preferred_channels": ["Social", "Search"], "decision_time": "2-4 weeks"}',
   '{"tech_savvy": true, "data_driven": true, "budget_conscious": true}',
   true),
  ('be000003-0000-0000-0000-000000000003', 'Agency Manager', 'Marketing agency professionals managing multiple clients',
   '{"age_range": "30-50", "income": "100k-250k", "location": "Urban", "education": "Bachelor+"}',
   '{"purchase_frequency": "Annually", "preferred_channels": ["Direct", "Referral"], "decision_time": "1-3 months"}',
   '{"tech_savvy": true, "data_driven": true, "budget_conscious": false}',
   true),
  ('be000004-0000-0000-0000-000000000004', 'Startup Founder', 'Early-stage company founders needing affordable solutions',
   '{"age_range": "22-40", "income": "Variable", "location": "Urban/Remote", "education": "Bachelor+"}',
   '{"purchase_frequency": "As needed", "preferred_channels": ["Product Hunt", "Twitter"], "decision_time": "Days"}',
   '{"tech_savvy": true, "data_driven": false, "budget_conscious": true}',
   true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;
-- ===== Audit Logs Enhanced (for Admin) =====
INSERT INTO audit_logs_enhanced (id, action_type_id, category, description, status, ip_address, metadata, created_at) VALUES
  (gen_random_uuid(), 'ac700001-0000-0000-0000-000000000001', 'authentication', 'User login successful', 'success', '203.150.45.123', '{"method": "email", "device": "desktop"}', NOW() - INTERVAL '1 hour'),
  (gen_random_uuid(), 'ac700003-0000-0000-0000-000000000003', 'campaign', 'New campaign created', 'success', '203.150.45.123', '{"campaign_id": "ca000001", "name": "Q1 Brand Awareness"}', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), 'ac700004-0000-0000-0000-000000000004', 'settings', 'Account settings updated', 'success', '118.172.89.45', '{"changed_fields": ["email_notifications", "timezone"]}', NOW() - INTERVAL '3 hours'),
  (gen_random_uuid(), 'ac700006-0000-0000-0000-000000000006', 'data', 'Campaign report exported', 'success', '203.150.45.123', '{"format": "csv", "date_range": "last_30_days"}', NOW() - INTERVAL '4 hours'),
  (gen_random_uuid(), 'ac700005-0000-0000-0000-000000000005', 'campaign', 'Campaign deleted', 'success', '118.172.89.45', '{"campaign_id": "old_campaign_123", "reason": "completed"}', NOW() - INTERVAL '6 hours'),
  (gen_random_uuid(), 'ac700001-0000-0000-0000-000000000001', 'authentication', 'Login attempt failed', 'failed', '45.33.22.11', '{"method": "email", "reason": "invalid_password", "attempts": 3}', NOW() - INTERVAL '8 hours'),
  (gen_random_uuid(), 'ac700008-0000-0000-0000-000000000008', 'security', 'Team member permission changed', 'success', '203.150.45.123', '{"user": "member@example.com", "new_role": "editor"}', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'ac700002-0000-0000-0000-000000000002', 'authentication', 'User logout', 'success', '118.172.89.45', '{"session_duration_minutes": 45}', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'ac700007-0000-0000-0000-000000000007', 'data', 'Bulk data import completed', 'success', '203.150.45.123', '{"records_imported": 1500, "source": "csv"}', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'ac700003-0000-0000-0000-000000000003', 'integration', 'Platform connection added', 'success', '118.172.89.45', '{"platform": "facebook", "account_id": "act_123456"}', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- ===== Countries =====
INSERT INTO countries (id, name, code) VALUES
  ('c7000001-0000-0000-0000-000000000001', 'Thailand', 'TH'),
  ('c7000002-0000-0000-0000-000000000002', 'United States', 'US'),
  ('c7000003-0000-0000-0000-000000000003', 'Japan', 'JP'),
  ('c7000004-0000-0000-0000-000000000004', 'Singapore', 'SG'),
  ('c7000005-0000-0000-0000-000000000005', 'Vietnam', 'VN'),
  ('c7000006-0000-0000-0000-000000000006', 'Indonesia', 'ID'),
  ('c7000007-0000-0000-0000-000000000007', 'Malaysia', 'MY'),
  ('c7000008-0000-0000-0000-000000000008', 'Philippines', 'PH')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  code = EXCLUDED.code;

-- ===== Provinces (Thailand) =====
INSERT INTO provinces (id, province_name, country_id) VALUES
  ('b4000001-0000-0000-0000-000000000001', 'Bangkok', 'c7000001-0000-0000-0000-000000000001'),
  ('b4000002-0000-0000-0000-000000000002', 'Chiang Mai', 'c7000001-0000-0000-0000-000000000001'),
  ('b4000003-0000-0000-0000-000000000003', 'Phuket', 'c7000001-0000-0000-0000-000000000001'),
  ('b4000004-0000-0000-0000-000000000004', 'Chonburi', 'c7000001-0000-0000-0000-000000000001'),
  ('b4000005-0000-0000-0000-000000000005', 'Khon Kaen', 'c7000001-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET 
  province_name = EXCLUDED.province_name;

-- ===== Creative Types =====
INSERT INTO creative_types (id, name, slug, description, display_order) VALUES
  ('c4700001-0000-0000-0000-000000000001', 'Image', 'image', 'Static image advertisement', 1),
  ('c4700002-0000-0000-0000-000000000002', 'Video', 'video', 'Video advertisement', 2),
  ('c4700003-0000-0000-0000-000000000003', 'Carousel', 'carousel', 'Multi-image carousel ad', 3),
  ('c4700004-0000-0000-0000-000000000004', 'Story', 'story', 'Full-screen story format', 4),
  ('c4700005-0000-0000-0000-000000000005', 'Collection', 'collection', 'Product collection ad', 5)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Priority Levels =====
INSERT INTO priority_level (id, priority_name, description, color_code) VALUES
  ('b4100001-0000-0000-0000-000000000001', 'Critical', 'Requires immediate attention', '#EF4444'),
  ('b4100002-0000-0000-0000-000000000002', 'High', 'Should be addressed soon', '#F59E0B'),
  ('b4100003-0000-0000-0000-000000000003', 'Medium', 'Normal priority', '#3B82F6'),
  ('b4100004-0000-0000-0000-000000000004', 'Low', 'Can be addressed later', '#6B7280')
ON CONFLICT (id) DO UPDATE SET 
  priority_name = EXCLUDED.priority_name,
  description = EXCLUDED.description;

-- ===== Product Categories =====
INSERT INTO product_categories (id, name, description) VALUES
  ('b4500001-0000-0000-0000-000000000001', 'Subscription Plans', 'Monthly and yearly subscription plans'),
  ('b4500002-0000-0000-0000-000000000002', 'Add-ons', 'Additional features and services'),
  ('b4500003-0000-0000-0000-000000000003', 'Credits', 'Platform credits for additional usage'),
  ('b4500004-0000-0000-0000-000000000004', 'Enterprise', 'Custom enterprise solutions')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Mapping Categories =====
INSERT INTO mapping_categories (id, name, slug, description, target_table) VALUES
  ('aa700001-0000-0000-0000-000000000001', 'Ad Performance', 'ad-performance', 'Metrics related to ad performance', 'ad_insights'),
  ('aa700002-0000-0000-0000-000000000002', 'User Engagement', 'user-engagement', 'User engagement metrics', 'customer_activities'),
  ('aa700003-0000-0000-0000-000000000003', 'Revenue', 'revenue', 'Revenue and financial metrics', 'payment_transactions'),
  ('aa700004-0000-0000-0000-000000000004', 'Conversion', 'conversion', 'Conversion tracking metrics', 'conversion_events')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ===== Metric Templates =====
INSERT INTO metric_templates (id, metric_name, description, data_type, unit, mapping_category_id, display_order) VALUES
  ('ae700001-0000-0000-0000-000000000001', 'Impressions', 'Total ad impressions', 'integer', 'count', 'aa700001-0000-0000-0000-000000000001', 1),
  ('ae700002-0000-0000-0000-000000000002', 'Clicks', 'Total ad clicks', 'integer', 'count', 'aa700001-0000-0000-0000-000000000001', 2),
  ('ae700003-0000-0000-0000-000000000003', 'CTR', 'Click-through rate', 'decimal', 'percentage', 'aa700001-0000-0000-0000-000000000001', 3),
  ('ae700004-0000-0000-0000-000000000004', 'CPC', 'Cost per click', 'decimal', 'currency', 'aa700001-0000-0000-0000-000000000001', 4),
  ('ae700005-0000-0000-0000-000000000005', 'ROAS', 'Return on ad spend', 'decimal', 'ratio', 'aa700001-0000-0000-0000-000000000001', 5),
  ('ae700006-0000-0000-0000-000000000006', 'Page Views', 'Total page views', 'integer', 'count', 'aa700002-0000-0000-0000-000000000002', 1),
  ('ae700007-0000-0000-0000-000000000007', 'Sessions', 'Total user sessions', 'integer', 'count', 'aa700002-0000-0000-0000-000000000002', 2),
  ('ae700008-0000-0000-0000-000000000008', 'Revenue', 'Total revenue', 'decimal', 'currency', 'aa700003-0000-0000-0000-000000000003', 1),
  ('ae700009-0000-0000-0000-000000000009', 'Conversions', 'Total conversions', 'integer', 'count', 'aa700004-0000-0000-0000-000000000004', 1),
  ('ae700010-0000-0000-0000-000000000010', 'Conversion Rate', 'Conversion rate percentage', 'decimal', 'percentage', 'aa700004-0000-0000-0000-000000000004', 2)
ON CONFLICT (id) DO UPDATE SET 
  metric_name = EXCLUDED.metric_name,
  description = EXCLUDED.description;

-- ===== Final Summary =====
SELECT 
  'Sample Data Inserted Successfully! 🎉' as result,
  (SELECT COUNT(*) FROM ad_insights) as ad_insights_count,
  (SELECT COUNT(*) FROM cohort_analysis) as cohort_analysis_count,
  (SELECT COUNT(*) FROM campaigns) as campaigns_count,
  (SELECT COUNT(*) FROM feedback) as feedback_count,
  (SELECT COUNT(*) FROM social_posts) as social_posts_count,
  (SELECT COUNT(*) FROM platforms) as platforms_count,
  (SELECT COUNT(*) FROM loyalty_tiers) as loyalty_tiers_count,
  (SELECT COUNT(*) FROM error_logs) as error_logs_count,
  (SELECT COUNT(*) FROM customer_activities) as customer_activities_count,
  (SELECT COUNT(*) FROM profile_customers) as profile_customers_count;
