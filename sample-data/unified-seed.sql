-- =========================================================
-- UNIFIED SEED DATA (Consolidated & Realistic)
-- Based on: admin-mock-data.sql, mockup-customers.sql, sample-data.sql
-- =========================================================

-- =========================================================
-- 1. CLEANUP & INIT
-- =========================================================
-- Set random seed for consistency
SELECT setseed(0.42);

-- =========================================================
-- 2. REFERENCE DATA (Enums/Lookups)
-- =========================================================
DO $$ BEGIN RAISE NOTICE 'Starting Reference Data Seed...'; END $$;

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

-- 2.4 Platforms
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

-- 2.10 Role Customers
INSERT INTO public.role_customers (id, name, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 'owner', true),
  ('10000000-0000-0000-0000-000000000002', 'admin', true),
  ('10000000-0000-0000-0000-000000000003', 'editor', true),
  ('10000000-0000-0000-0000-000000000004', 'viewer', true)
ON CONFLICT (id) DO NOTHING;

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

DO $$ BEGIN RAISE NOTICE 'Reference Data Seeded Successfully.'; END $$;

-- =========================================================
-- 3. USERS & PROFILES (Realistic 30 Users)
-- =========================================================
DO $$
DECLARE
    -- User Arrays (Realistic Data)
    v_user_ids uuid[] := ARRAY[
        'c1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000005'::uuid,
        'c1000000-0000-0000-0000-000000000006'::uuid, 'c1000000-0000-0000-0000-000000000007'::uuid, 'c1000000-0000-0000-0000-000000000008'::uuid, 'c1000000-0000-0000-0000-000000000009'::uuid, 'c1000000-0000-0000-0000-000000000010'::uuid,
        'c1000000-0000-0000-0000-000000000011'::uuid, 'c1000000-0000-0000-0000-000000000012'::uuid, 'c1000000-0000-0000-0000-000000000013'::uuid, 'c1000000-0000-0000-0000-000000000014'::uuid, 'c1000000-0000-0000-0000-000000000015'::uuid,
        'c1000000-0000-0000-0000-000000000016'::uuid, 'c1000000-0000-0000-0000-000000000017'::uuid, 'c1000000-0000-0000-0000-000000000018'::uuid, 'c1000000-0000-0000-0000-000000000019'::uuid, 'c1000000-0000-0000-0000-000000000020'::uuid,
        'c1000000-0000-0000-0000-000000000021'::uuid, 'c1000000-0000-0000-0000-000000000022'::uuid, 'c1000000-0000-0000-0000-000000000023'::uuid, 'c1000000-0000-0000-0000-000000000024'::uuid, 'c1000000-0000-0000-0000-000000000025'::uuid,
        'c1000000-0000-0000-0000-000000000026'::uuid, 'c1000000-0000-0000-0000-000000000027'::uuid, 'c1000000-0000-0000-0000-000000000028'::uuid, 'c1000000-0000-0000-0000-000000000029'::uuid, 'c1000000-0000-0000-0000-000000000030'::uuid
    ];
    
    -- Names & Emails corresponding to v_user_ids
    v_emails text[] := ARRAY[
        'sarah.johnson@techstart.io', 'mike.chen@digitalwave.com', 'priya.patel@freelance.dev', 'david.martinez@consult.pro', 'emily.nguyen@shopnow.co',
        'james.wilson@creative.agency', 'lisa.anderson@gmail.com', 'carlos.rodriguez@lawfirm.com', 'amanda.kim@realestate.net', 'robert.thompson@yahoo.com',
        'natalie.brooks@mediahouse.tv', 'kevin.nakamura@designstudio.jp', 'rachel.oconnor@outlook.com', 'thomas.silva@logistics.world', 'sophia.chang@fintech.io',
        'daniel.kim@startup.tech', 'olivia.wilson@boutique.store', 'lucas.silva@import.export', 'emma.jones@marketing.hub', 'william.brown@construction.build',
        'ava.davis@healthcare.plus', 'benjamin.miller@factory.mfg', 'charlotte.moore@eduplatform.online', 'henry.taylor@devops.cloud', 'amelia.anderson@events.pro',
        'alexander.white@bizadvisory.com', 'mia.harris@legalservices.law', 'sebastian.martin@architecture.design', 'harper.thompson@accounting.cpa', 'jackson.garcia@engineering.systems'
    ];
    
    v_full_names text[] := ARRAY[
        'Sarah Johnson', 'Mike Chen', 'Priya Patel', 'David Martinez', 'Emily Nguyen',
        'James Wilson', 'Lisa Anderson', 'Carlos Rodriguez', 'Amanda Kim', 'Robert Thompson',
        'Natalie Brooks', 'Kevin Nakamura', 'Rachel O''Connor', 'Thomas Silva', 'Sophia Chang',
        'Daniel Kim', 'Olivia Wilson', 'Lucas Silva', 'Emma Jones', 'William Brown',
        'Ava Davis', 'Benjamin Miller', 'Charlotte Moore', 'Henry Taylor', 'Amelia Anderson',
        'Alexander White', 'Mia Harris', 'Sebastian Martin', 'Harper Thompson', 'Jackson Garcia'
    ];

    v_company_names text[] := ARRAY[
        'TechStart Solutions', 'Digital Wave', 'Freelance Dev', 'Martinez Consulting', 'ShopNow',
        'Wilson Creative', NULL, 'Rodriguez Law', 'Kim Realty', NULL,
        'Brooks Media', 'Nakamura Design', NULL, 'Silva Logistics', 'Chang Fintech',
        'Kim Tech', 'Wilson Boutique', 'Silva Import', 'Jones Marketing', 'Brown Construction',
        'Davis Healthcare', 'Miller Mfg', 'Moore Education', 'Taylor DevOps', 'Anderson Events',
        'White Advisory', 'Harris Legal', 'Martin Architecture', 'Thompson CPA', 'Garcia Engineering'
    ];

    i INT;
    v_created_at timestamptz;
    v_password_hash text := '$2a$10$rYvLBvZvQ6qE5Q5Z5Q5Q5OMxKZ9xH7xJ8wL5gF2hE9xJ8wKjL5K8i'; -- "owner123" (or similar hash)
    v_rls_was_enabled boolean;
    v_loyalty_point_id uuid;
BEGIN
    RAISE NOTICE 'Seeding Users & Profiles...';
    
    FOR i IN 1..array_length(v_user_ids, 1) LOOP
        -- Random creation date within last year
        v_created_at := NOW() - (random() * INTERVAL '365 days');

        -- 1. Insert into auth.users
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
        ) VALUES (
            v_user_ids[i], '00000000-0000-0000-0000-000000000000', v_emails[i], v_password_hash,
            v_created_at, v_created_at, v_created_at,
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('full_name', v_full_names[i]),
            'authenticated', 'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

        -- 2. Create Loyalty Points
        v_loyalty_point_id := gen_random_uuid();
        INSERT INTO public.loyalty_points (id, loyalty_tier_id, point_balance, status)
        VALUES (
             v_loyalty_point_id, 
             '17000001-0000-0000-0000-000000000001', -- Bronze
             (random() * 500)::int, 
             'active'
        ) ON CONFLICT DO NOTHING;

        -- 3. Insert into public.profile_customers (App Profile)
        -- Splitting Name
        INSERT INTO public.profile_customers (
            id, user_id, first_name, last_name, gender_id, loyalty_point_id, created_at
        ) VALUES (
            gen_random_uuid(), -- Profile ID is random
            v_user_ids[i],
            split_part(v_full_names[i], ' ', 1),
            split_part(v_full_names[i], ' ', 2),
            (SELECT id FROM genders ORDER BY random() LIMIT 1),
            v_loyalty_point_id,
            v_created_at
        ) ON CONFLICT (user_id) DO NOTHING;

        -- 4. Insert into public.customer (Admin/CRM compatibility)
        INSERT INTO public.customer (
            id, email, full_name, company_name, phone_number,
            status, created_at, updated_at
        ) VALUES (
            v_user_ids[i], -- ID Matches User ID
            v_emails[i],
            v_full_names[i],
            v_company_names[i],
            '08' || floor(random() * 90000000 + 10000000)::text,
            'active',
            v_created_at,
            v_created_at
        ) ON CONFLICT (id) DO NOTHING;
        
    END LOOP;
    
    RAISE NOTICE 'Users & Profiles Seeded.';
END $$;

-- =========================================================
-- 4. WORKSPACES (1 per user)
-- =========================================================
DO $$
DECLARE
    v_user_id uuid;
    v_workspace_id uuid;
    v_company_name text;
    rec record;
BEGIN
    RAISE NOTICE 'Seeding Workspaces...';
    
    FOR rec IN SELECT id, full_name, company_name FROM public.customer LOOP
        v_workspace_id := gen_random_uuid();
        -- Use company name if available, else "Name's Workspace"
        IF rec.company_name IS NOT NULL THEN
            v_company_name := rec.company_name;
        ELSE
            v_company_name := split_part(rec.full_name, ' ', 1) || '''s Workspace';
        END IF;

        -- Insert Workspace
        INSERT INTO public.workspaces (
             id, name, owner_id, status, created_at, business_type_id
        ) VALUES (
             v_workspace_id,
             v_company_name,
             rec.id,
             'active',
             NOW() - (random() * INTERVAL '30 days'),
             (SELECT id FROM business_types ORDER BY random() LIMIT 1)
        ) ON CONFLICT DO NOTHING;

        -- Insert Member (Owner)
        INSERT INTO public.workspace_members (
            team_id, user_id, role, status
        ) VALUES (
            v_workspace_id, rec.id, 'owner', 'active'
        ) ON CONFLICT DO NOTHING;
        
    END LOOP;
END $$;

-- =========================================================
-- 5. SUBSCRIPTIONS & TRANSACTIONS (Churn & Active)
-- =========================================================
DO $$
DECLARE
    v_user_id uuid;
    v_sub_id uuid;
    v_plan_id uuid;
    v_plan_price numeric;
    v_is_churned boolean;
    v_created_at timestamptz;
    rec record;
BEGIN
    RAISE NOTICE 'Seeding Subscriptions...';

    FOR rec IN SELECT id, created_at FROM public.customer LOOP
        v_sub_id := gen_random_uuid();
        v_created_at := rec.created_at; -- Sub starts around signup

        -- Random Plan
        SELECT id, price_monthly INTO v_plan_id, v_plan_price 
        FROM subscription_plans 
        WHERE slug IN ('pro', 'team', 'free') 
        ORDER BY random() LIMIT 1;

        -- Random Churn (30% chance)
        v_is_churned := (random() < 0.3);

        IF v_is_churned THEN
            INSERT INTO public.subscriptions (
                id, user_id, plan_id, status, billing_cycle,
                current_period_start, current_period_end, cancelled_at, created_at
            ) VALUES (
                v_sub_id, rec.id, v_plan_id, 'cancelled', 'monthly',
                v_created_at, v_created_at + INTERVAL '1 month', 
                v_created_at + INTERVAL '20 days', v_created_at
            );
        ELSE
            INSERT INTO public.subscriptions (
                id, user_id, plan_id, status, billing_cycle,
                current_period_start, current_period_end, created_at
            ) VALUES (
                v_sub_id, rec.id, v_plan_id, 'active', 'monthly',
                NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', v_created_at
            );
        END IF;

        -- Transaction (if paid plan)
        IF v_plan_price > 0 THEN
            INSERT INTO public.payment_transactions (
                user_id, subscription_id, payment_method_id, amount,
                currency_id, status, transaction_type, created_at
            ) VALUES (
                rec.id, v_sub_id, 'b1000001-0000-0000-0000-000000000001', v_plan_price,
                'c0000002-0000-0000-0000-000000000002', 'completed', 'subscription', v_created_at
            );
        END IF;

    END LOOP;
END $$;

-- =========================================================
-- 6. FEEDBACK (Realistic 40+ Reviews)
-- =========================================================
DO $$
DECLARE
    v_comments text[] := ARRAY[
        'Love the new dashboard! Very intuitive.',
        'Great tool for our marketing team.',
        'Customer support was very helpful with my issue.',
        'I wish there were more integrations available.',
        'The mobile view could use some improvement.',
        'Excellent value for the price.',
        'Saved us hours of manual work every week.',
        'Highly recommended for small businesses.',
        'The analytics reports are exactly what we needed.',
        'A bit of a learning curve, but worth it.',
        'Billing process is smooth and transparent.',
        'We increased our ROI by 20% using this.',
        'Would love to see a dark mode option.',
        'Integration with Facebook Ads is seamless.',
        'Our team loves the collaboration features.',
        'Good, but experienced some downtime last month.',
        'The best platform we have used so far.',
        'User interface is beautiful and fast.',
        'Documentation is clear and easy to follow.',
        'Automated reports are a lifesaver.',
        'Waiting for the new feature release!',
        'Solid performance, no complaints.',
        'Pricing is competitive compared to others.',
        'The AI insights are surprisingly accurate.',
        'Need more customization options for reports.',
        'Setup was a breeze, up and running in minutes.',
        'Great experience overall, 5 stars!',
        'Found a bug but it was fixed quickly.',
        'Helped us streamline our workflow significantly.',
        'Customer service reps are very knowledgeable.',
        'The free plan is very generous.',
        'Pro plan features are definitely worth the upgrade.',
        'Data export formats are very convenient.',
        'Responsive design works well on tablet.',
        'My go-to tool for daily tasks.',
        'Referral program is a nice bonus.',
        'Security features give us peace of mind.',
        'Regular updates keep making it better.',
        'Simple, clean, and effective.',
        'Does exactly what it says on the tin.'
    ];
    v_user_id uuid;
    v_rating_id uuid;
    i int;
BEGIN
    RAISE NOTICE 'Seeding Feedback...';
    
    FOR i IN 1..40 LOOP
        -- Select Random User from our created list
        SELECT id INTO v_user_id FROM auth.users WHERE id = ANY(ARRAY[
            'c1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000005'::uuid,
            'c1000000-0000-0000-0000-000000000006'::uuid, 'c1000000-0000-0000-0000-000000000007'::uuid, 'c1000000-0000-0000-0000-000000000008'::uuid, 'c1000000-0000-0000-0000-000000000009'::uuid, 'c1000000-0000-0000-0000-000000000010'::uuid,
            'c1000000-0000-0000-0000-000000000011'::uuid, 'c1000000-0000-0000-0000-000000000012'::uuid, 'c1000000-0000-0000-0000-000000000013'::uuid, 'c1000000-0000-0000-0000-000000000014'::uuid, 'c1000000-0000-0000-0000-000000000015'::uuid,
            'c1000000-0000-0000-0000-000000000016'::uuid, 'c1000000-0000-0000-0000-000000000017'::uuid, 'c1000000-0000-0000-0000-000000000018'::uuid, 'c1000000-0000-0000-0000-000000000019'::uuid, 'c1000000-0000-0000-0000-000000000020'::uuid,
            'c1000000-0000-0000-0000-000000000021'::uuid, 'c1000000-0000-0000-0000-000000000022'::uuid, 'c1000000-0000-0000-0000-000000000023'::uuid, 'c1000000-0000-0000-0000-000000000024'::uuid, 'c1000000-0000-0000-0000-000000000025'::uuid,
            'c1000000-0000-0000-0000-000000000026'::uuid, 'c1000000-0000-0000-0000-000000000027'::uuid, 'c1000000-0000-0000-0000-000000000028'::uuid, 'c1000000-0000-0000-0000-000000000029'::uuid, 'c1000000-0000-0000-0000-000000000030'::uuid
        ]) ORDER BY random() LIMIT 1;
        
        -- Determine Rating based on comment sentiment (Simple heuristic or random weighted high)
        -- Weighted: 60% 5-star, 20% 4-star, 10% 3-star, 10% 1-2 star
        IF random() < 0.6 THEN
            v_rating_id := '47000001-0000-0000-0000-000000000001'; -- 5 Star
        ELSIF random() < 0.8 THEN
             v_rating_id := '47000002-0000-0000-0000-000000000002'; -- 4 Star
        ELSIF random() < 0.9 THEN
              v_rating_id := '47000003-0000-0000-0000-000000000003'; -- 3 Star
        ELSE
              v_rating_id := '47000005-0000-0000-0000-000000000005'; -- 1 Star
        END IF;

        INSERT INTO public.feedback (
            id, user_id, rating_id, comment, created_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            v_rating_id,
            v_comments[1 + floor(random() * array_length(v_comments, 1))::int],
            NOW() - (random() * INTERVAL '180 days')
        );
    END LOOP;
END $$;

-- =========================================================
-- 7. ERROR LOGS (Admin Support)
-- =========================================================
INSERT INTO public.error_logs (id, level, message, stack_trace, request_id, metadata, created_at) VALUES
  (gen_random_uuid(), 'error', 'Database connection timeout after 30s', 'Error: Connection timeout', 'req_abc123', '{"service": "api"}', NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), 'warning', 'High memory usage detected', NULL, 'health_789', '{"memory": "85%"}', NOW() - INTERVAL '4 hours'),
  (gen_random_uuid(), 'error', 'Payment processing failed', 'Error: Card declined', 'req_pay123', '{"user_id": "123"}', NOW() - INTERVAL '5 hours'),
  (gen_random_uuid(), 'info', 'Scheduled maintenance completed', NULL, 'maint_001', '{"duration": "15m"}', NOW() - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;

RAISE NOTICE '✅✅ UNIFIED SEED COMPLETED SUCCESSFULLY! ✅✅';
