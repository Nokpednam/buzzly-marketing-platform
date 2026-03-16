-- =========================================================
-- STATIC SEED DATA (Lookups & Enums)
-- Extracted from unified-seed.sql to ensure availability during setup
-- =========================================================

-- 2.1 AARRR Categories
INSERT INTO public.aarrr_categories (id, name, slug, description, color_code, display_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Acquisition', 'acquisition', 'How users discover and reach your product', '#3B82F6', 1),
  ('a0000002-0000-0000-0000-000000000002', 'Activation', 'activation', 'Users who complete their first meaningful action', '#10B981', 2),
  ('a0000003-0000-0000-0000-000000000003', 'Retention', 'retention', 'Users who continue to engage over time', '#F59E0B', 3),
  ('a0000004-0000-0000-0000-000000000004', 'Referral', 'referral', 'Users who recommend your product to others', '#8B5CF6', 4),
  ('a0000005-0000-0000-0000-000000000005', 'Revenue', 'revenue', 'Users who convert to paying customers', '#EF4444', 5)
ON CONFLICT (id) DO NOTHING;

-- 2.2 Business Types
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

-- 2.3 Industries
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

-- 2.4 Platforms (slugs must match ALLOWED_PLATFORM_SLUGS in usePlatformsDB.tsx)
INSERT INTO public.platforms (id, name, slug, description, icon_url, is_active, api_version) VALUES
  ('40000000-0000-0000-0000-000000000001', 'Facebook',   'facebook',   'Meta Facebook advertising platform', NULL, true, 'v18.0'),
  ('40000000-0000-0000-0000-000000000002', 'Google',     'google',     'Google advertising platform',        NULL, true, 'v15'),
  ('40000000-0000-0000-0000-000000000003', 'TikTok',     'tiktok',     'TikTok advertising platform',        NULL, true, 'v1.3'),
  ('40000000-0000-0000-0000-000000000004', 'LINE Ads',   'line-ads',   'LINE advertising platform',          NULL, true, 'v2.0'),
  ('40000000-0000-0000-0000-000000000005', 'LinkedIn',   'linkedin-ads','LinkedIn advertising platform',     NULL, true, 'v2'),
  ('40000000-0000-0000-0000-000000000006', 'Twitter/X',  'twitter-ads','Twitter/X advertising platform',    NULL, true, 'v2'),
  ('40000000-0000-0000-0000-000000000007', 'Shopee',     'shopee',     'Shopee marketplace advertising',     NULL, true, 'v2.0'),
  ('40000000-0000-0000-0000-000000000008', 'Lazada',     'lazada-ads', 'Lazada marketplace advertising',     NULL, true, 'v1.0'),
  ('40000000-0000-0000-0000-000000000009', 'Instagram',  'instagram',  'Instagram Ads & Analytics',          NULL, true, 'v18.0')
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name;

-- 2.5 Subscription Plans
INSERT INTO public.subscription_plans (id, name, slug, description, price_monthly, price_yearly, features, limits, max_workspace, is_active, is_popular, display_order, trial_days) VALUES
  ('5b000001-0000-0000-0000-000000000001', 'Free', 'free', 'Basic features for individuals starting out', 0, 0, 
   '["3 campaigns", "Basic analytics", "Email support", "7-day data retention"]'::jsonb,
   '{"max_campaigns": 3, "max_team_members": 1}'::jsonb, 1, true, false, 1, 0),
  ('5b000002-0000-0000-0000-000000000002', 'Pro', 'pro', 'Advanced features for professionals', 29.99, 299.99,
   '["Unlimited campaigns", "Advanced analytics", "AI Insights", "Priority support", "90-day data retention", "Custom reports"]'::jsonb,
   '{"max_campaigns": -1, "max_team_members": 5}'::jsonb, 3, true, true, 2, 14),
  ('5b000003-0000-0000-0000-000000000003', 'Team', 'team', 'Full collaboration features for teams', 79.99, 799.99,
   '["Everything in Pro", "Unlimited team members", "Role-based access", "API access", "Dedicated support", "1-year data retention", "White-label reports"]'::jsonb,
   '{"max_campaigns": -1, "max_team_members": -1}'::jsonb, 10, true, false, 3, 14)
ON CONFLICT (id) DO NOTHING;

-- 2.6 Currencies
INSERT INTO public.currencies (id, code, name, symbol, decimal_places) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'USD', 'US Dollar', '$', 2),
  ('c0000002-0000-0000-0000-000000000002', 'THB', 'Thai Baht', '฿', 2)
ON CONFLICT (id) DO NOTHING;

-- 2.7 Payment Methods & Providers
INSERT INTO public.payment_providers (id, name, slug, description, is_active) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Stripe', 'stripe', 'Global payment processing via Stripe', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payment_methods (id, name, slug, description, provider_id, display_order) VALUES
  ('b1000001-0000-0000-0000-000000000001', 'Credit/Debit Card', 'card', 'Pay with Visa, Mastercard, JCB, AMEX', 'b0000001-0000-0000-0000-000000000001', 1)
ON CONFLICT (id) DO NOTHING;

-- 2.8 Genders
INSERT INTO public.genders (id, name_gender) VALUES
  ('6e000001-0000-0000-0000-000000000001', 'Male'),
  ('6e000002-0000-0000-0000-000000000002', 'Female'),
  ('6e000003-0000-0000-0000-000000000003', 'Non-binary'),
  ('6e000004-0000-0000-0000-000000000004', 'Prefer not to say')
ON CONFLICT (id) DO NOTHING;

-- 2.9 Loyalty Tiers
INSERT INTO public.loyalty_tiers (id, name, description, min_points, min_spend_amount, discount_percentage, point_multiplier, badge_color, priority_level) VALUES
  ('17000001-0000-0000-0000-000000000001', 'Bronze', 'Entry level membership tier', 0, 0, 2, 1.0, '#CD7F32', 1),
  ('17000002-0000-0000-0000-000000000002', 'Silver', 'Regular customer loyalty tier', 500, 5000, 5, 1.25, '#C0C0C0', 2),
  ('17000003-0000-0000-0000-000000000003', 'Gold', 'Premium customer tier', 2000, 20000, 10, 1.5, '#FFD700', 3),
  ('17000004-0000-0000-0000-000000000004', 'Platinum', 'VIP exclusive tier', 5000, 50000, 15, 2.0, '#E5E4E2', 4)
ON CONFLICT (id) DO NOTHING;

-- 2.10a Role Customers
INSERT INTO public.role_customers (id, name, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'owner', true),
  ('10000000-0000-0000-0000-000000000002', 'admin', true),
  ('10000000-0000-0000-0000-000000000003', 'editor', true),
  ('10000000-0000-0000-0000-000000000004', 'viewer', true)
ON CONFLICT (id) DO NOTHING;

-- 2.10b Role Employees (CRITICAL FOR SETUP)
INSERT INTO public.role_employees (role_name, description, permission_level) VALUES
    ('owner', 'Buzzly Owner - Full access', 100),
    ('admin', 'Administrator - Manage Workspaces/Users', 80),
    ('support', 'Support - View Logs/Help Customers', 50),
    ('dev', 'Developer - API/Pipelines', 60)
ON CONFLICT (role_name) DO NOTHING;


-- 2.11 Event Types & Categories (Minimal Set)
INSERT INTO public.event_categories (id, name, slug, description, color_code, display_order) VALUES
  ('ec000001-0000-0000-0000-000000000001', 'Page Views', 'page-views', 'User page view events', '#3B82F6', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.event_types (id, name, slug, description, event_category_id, priority_score, display_order) VALUES
  ('e7000001-0000-0000-0000-000000000001', 'Page View', 'page-view', 'User viewed a page', 'ec000001-0000-0000-0000-000000000001', 1, 1),
  ('e7000002-0000-0000-0000-000000000002', 'Sign Up', 'signup', 'User signed up', 'ec000001-0000-0000-0000-000000000001', 10, 2),
  ('e7000003-0000-0000-0000-000000000003', 'Login', 'login', 'User logged in', 'ec000001-0000-0000-0000-000000000001', 5, 3)
ON CONFLICT (id) DO NOTHING;

-- 2.12 Rating Types
INSERT INTO public.rating (id, name, descriptions, color_code) VALUES
  ('47000001-0000-0000-0000-000000000001', '5 Stars', 'Excellent - Extremely satisfied', '#10B981'),
  ('47000002-0000-0000-0000-000000000002', '4 Stars', 'Good - Satisfied', '#22C55E'),
  ('47000003-0000-0000-0000-000000000003', '3 Stars', 'Average - Neutral experience', '#F59E0B'),
  ('47000004-0000-0000-0000-000000000004', '2 Stars', 'Poor - Dissatisfied', '#F97316'),
  ('47000005-0000-0000-0000-000000000005', '1 Star', 'Very Poor - Very dissatisfied', '#EF4444')
ON CONFLICT (id) DO NOTHING;

-- 2.13 Priority Levels (SLA)
INSERT INTO public.priority_level (id, priority_name, description, color_code, sla_hours) VALUES
  ('f0000001-0000-0000-0000-000000000001', 'Low', 'Routine tasks with flexible deadlines', '#10B981', 48.0),
  ('f0000002-0000-0000-0000-000000000002', 'Medium', 'Standard priority tasks', '#3B82F6', 24.0),
  ('f0000003-0000-0000-0000-000000000003', 'High', 'Urgent tasks requiring immediate attention', '#F59E0B', 8.0),
  ('f0000004-0000-0000-0000-000000000004', 'Critical', 'System outages or critical bugs', '#EF4444', 2.0)
ON CONFLICT (id) DO NOTHING;

-- 2.14 Action Types (Audit Logs)
INSERT INTO public.action_type (id, action_name, description, icon_url, color_code) VALUES
  ('ac000001-0000-0000-0000-000000000001', 'LOGIN', 'User logged into the system', 'log-in', '#10B981'),
  ('ac000002-0000-0000-0000-000000000002', 'LOGOUT', 'User logged out', 'log-out', '#6B7280'),
  ('ac000003-0000-0000-0000-000000000003', 'CREATE', 'Created a new resource', 'plus-circle', '#3B82F6'),
  ('ac000004-0000-0000-0000-000000000004', 'UPDATE', 'Updated an existing resource', 'edit', '#F59E0B'),
  ('ac000005-0000-0000-0000-000000000005', 'DELETE', 'Deleted a resource', 'trash-2', '#EF4444'),
  ('ac000006-0000-0000-0000-000000000006', 'EXPORT', 'Exported data report', 'download', '#8B5CF6')
ON CONFLICT (id) DO NOTHING;

-- 2.15 Ad Buying Types
INSERT INTO public.ad_buying_types (id, name, slug, description, display_order, is_active) VALUES
  ('ab000001-0000-0000-0000-000000000001', 'CPM (Cost Per Mille)', 'cpm', 'Pay per 1,000 impressions', 1, true),
  ('ab000002-0000-0000-0000-000000000002', 'CPC (Cost Per Click)', 'cpc', 'Pay when user clicks the ad', 2, true),
  ('ab000003-0000-0000-0000-000000000003', 'CPA (Cost Per Action)', 'cpa', 'Pay when user performs a specific action', 3, true),
  ('ab000004-0000-0000-0000-000000000004', 'Flat Rate', 'flat', 'Fixed price for a specific duration', 4, true)
ON CONFLICT (id) DO NOTHING;

-- 2.16 Creative Types (Ad Formats)
INSERT INTO public.creative_types (id, name, slug, description, display_order, is_active) VALUES
  ('ce000001-0000-0000-0000-000000000001', 'Image', 'image', 'Static image banner', 1, true),
  ('ce000002-0000-0000-0000-000000000002', 'Video', 'video', 'Video advertisement', 2, true),
  ('ce000003-0000-0000-0000-000000000003', 'Carousel', 'carousel', 'Scrollable series of images/videos', 3, true),
  ('ce000004-0000-0000-0000-000000000004', 'Story', 'story', 'Full-screen vertical format', 4, true),
  ('ce000005-0000-0000-0000-000000000005', 'Text', 'text', 'Text-only advertisement', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 2.17 Change Types (Audit Context)
INSERT INTO public.change_type (id, priority_level_id, name, description, color_code) VALUES
  ('c8000001-0000-0000-0000-000000000001', 'f0000002-0000-0000-0000-000000000002', 'Configuration Change', 'Updates to system settings', '#6B7280'),
  ('c8000002-0000-0000-0000-000000000002', 'f0000003-0000-0000-0000-000000000003', 'Security Update', 'Changes to roles or permissions', '#EF4444'),
  ('c8000003-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000001', 'Content Update', 'Changes to content or text', '#3B82F6'),
  ('c8000004-0000-0000-0000-000000000004', 'f0000004-0000-0000-0000-000000000004', 'Schema Migration', 'Database schema modifications', '#8B5CF6')
ON CONFLICT (id) DO NOTHING;

