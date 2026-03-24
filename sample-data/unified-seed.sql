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

-- 2. REFERENCE DATA (Enums/Lookups)
-- MOVED TO MIGRATION: 20260218000002_static_seed_data.sql
-- This ensures they are available before any scripts run.

DO $$ BEGIN RAISE NOTICE 'Reference Data already seeded via migrations.'; END $$;

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
            jsonb_build_object(
                'full_name', v_full_names[i],
                'first_name', split_part(v_full_names[i], ' ', 1),
                'last_name', split_part(v_full_names[i], ' ', 2)
            ),
            'authenticated', 'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

        -- 2. Insert into public.profile_customers (App Profile)
        -- Splitting Name
        INSERT INTO public.profile_customers (
            id, user_id, first_name, last_name, created_at
        ) VALUES (
            gen_random_uuid(), -- Profile ID is random
            v_user_ids[i],
            split_part(v_full_names[i], ' ', 1),
            split_part(v_full_names[i], ' ', 2),
            v_created_at
        ) ON CONFLICT (user_id) DO UPDATE SET 
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name;

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

DO $$
BEGIN
    RAISE NOTICE '✅✅ UNIFIED SEED COMPLETED SUCCESSFULLY! ✅✅';
END $$;

-- ============================================================
-- FINAL DATA POLISH: Ensure all error_logs have user_ids
-- (Because some might be created before users exist during reset)
-- ============================================================
DO $$
DECLARE
  v_user_ids uuid[];
BEGIN
  SELECT ARRAY(SELECT id FROM auth.users) INTO v_user_ids;
  
  IF v_user_ids IS NOT NULL AND array_length(v_user_ids, 1) > 0 THEN
    UPDATE public.error_logs
    SET user_id = v_user_ids[1 + floor(random() * array_length(v_user_ids, 1))::int]
    WHERE user_id IS NULL;
    
    RAISE NOTICE 'Reference Data Polish: Backfilled missing user_ids in error_logs';
  END IF;

  -- ─── New: Randomize timestamps for realism ─────────
  -- Tier History: randomize anything created in the last 15 mins (during this seed)
  UPDATE public.loyalty_tier_history
  SET changed_at = NOW() - (random() * INTERVAL '90 days')
  WHERE changed_at > NOW() - INTERVAL '15 minutes';

  -- Points Transactions: randomize anything created in the last 15 mins
  -- (Some might already be randomized, but this ensures everything is spread out)
  UPDATE public.points_transactions
  SET created_at = NOW() - (random() * INTERVAL '90 days')
  WHERE created_at > NOW() - INTERVAL '15 minutes';

  RAISE NOTICE '✅ Timestamps randomized for realism (Last 90 days).';
END $$;

-- ============================================================
-- 8. SPECIFIC EMPLOYEE PROFILES (Owner, Dev, Support)
-- ============================================================
DO $$
DECLARE
    v_role_owner_id uuid;
    v_role_dev_id uuid;
    v_role_support_id uuid;

    v_emp_owner_id uuid;
    v_emp_dev_id uuid;
    v_emp_support_id uuid;
BEGIN
    -- 1. Get Role IDs
    SELECT id INTO v_role_owner_id FROM public.role_employees WHERE role_name = 'owner';
    SELECT id INTO v_role_dev_id FROM public.role_employees WHERE role_name = 'dev';
    SELECT id INTO v_role_support_id FROM public.role_employees WHERE role_name = 'support';

    -- 2. Get Employee IDs
    SELECT id INTO v_emp_owner_id FROM public.employees WHERE email = 'hachikonoluna@gmail.com';
    SELECT id INTO v_emp_dev_id FROM public.employees WHERE email = 'dev@buzzly.co';
    SELECT id INTO v_emp_support_id FROM public.employees WHERE email = 'support@buzzly.co';

    -- 3. Upsert Profiles
    -- Owner Profile
    IF v_emp_owner_id IS NOT NULL THEN
        INSERT INTO public.employees_profile (employees_id, first_name, last_name, aptitude, last_active, role_employees_id)
        VALUES (v_emp_owner_id, 'Luna', 'Hachiko', 'Owner / Founder', NOW() - INTERVAL '1 hour', v_role_owner_id)
        ON CONFLICT (employees_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            aptitude = EXCLUDED.aptitude,
            last_active = EXCLUDED.last_active,
            role_employees_id = EXCLUDED.role_employees_id;
    END IF;

    -- Dev Profile
    IF v_emp_dev_id IS NOT NULL THEN
        INSERT INTO public.employees_profile (employees_id, first_name, last_name, aptitude, last_active, role_employees_id)
        VALUES (v_emp_dev_id, 'Developer', 'Buzzly', 'Full-stack Developer', NOW() - INTERVAL '2 minutes', v_role_dev_id)
        ON CONFLICT (employees_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            aptitude = EXCLUDED.aptitude,
            last_active = EXCLUDED.last_active,
            role_employees_id = EXCLUDED.role_employees_id;
    END IF;

    -- Support Profile
    IF v_emp_support_id IS NOT NULL THEN
        INSERT INTO public.employees_profile (employees_id, first_name, last_name, aptitude, last_active, role_employees_id)
        VALUES (v_emp_support_id, 'Support', 'No1.', 'Customer Success', NOW() - INTERVAL '4 hours', v_role_support_id)
        ON CONFLICT (employees_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            aptitude = EXCLUDED.aptitude,
            last_active = EXCLUDED.last_active,
            role_employees_id = EXCLUDED.role_employees_id;
    END IF;

    RAISE NOTICE '✅ Employee profiles seeded with Aptitudes successfully.';
END $$;
