-- =========================================================
-- FIX PRODUCT USAGE DATA (Comprehensive Seed in Migration)
-- Combines User Creation + Realistic Activity Data
-- Ensures data exists regardless of unified-seed.sql timing
-- =========================================================

-- We use a DO block to allow variables and logic
DO $$
DECLARE
    -- User Arrays (Must match unified-seed for consistency/idempotency)
    v_user_ids uuid[] := ARRAY[
        'c1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000005'::uuid,
        'c1000000-0000-0000-0000-000000000006'::uuid, 'c1000000-0000-0000-0000-000000000007'::uuid, 'c1000000-0000-0000-0000-000000000008'::uuid, 'c1000000-0000-0000-0000-000000000009'::uuid, 'c1000000-0000-0000-0000-000000000010'::uuid,
        'c1000000-0000-0000-0000-000000000011'::uuid, 'c1000000-0000-0000-0000-000000000012'::uuid, 'c1000000-0000-0000-0000-000000000013'::uuid, 'c1000000-0000-0000-0000-000000000014'::uuid, 'c1000000-0000-0000-0000-000000000015'::uuid,
        'c1000000-0000-0000-0000-000000000016'::uuid, 'c1000000-0000-0000-0000-000000000017'::uuid, 'c1000000-0000-0000-0000-000000000018'::uuid, 'c1000000-0000-0000-0000-000000000019'::uuid, 'c1000000-0000-0000-0000-000000000020'::uuid,
        'c1000000-0000-0000-0000-000000000021'::uuid, 'c1000000-0000-0000-0000-000000000022'::uuid, 'c1000000-0000-0000-0000-000000000023'::uuid, 'c1000000-0000-0000-0000-000000000024'::uuid, 'c1000000-0000-0000-0000-000000000025'::uuid,
        'c1000000-0000-0000-0000-000000000026'::uuid, 'c1000000-0000-0000-0000-000000000027'::uuid, 'c1000000-0000-0000-0000-000000000028'::uuid, 'c1000000-0000-0000-0000-000000000029'::uuid, 'c1000000-0000-0000-0000-000000000030'::uuid
    ];
    
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
    
    v_password_hash text := '$2a$10$rYvLBvZvQ6qE5Q5Z5Q5Q5OMxKZ9xH7xJ8wL5gF2hE9xJ8wKjL5K8i';
    
    v_user_count int;
    v_user_id uuid;
    v_created_at timestamptz;
    v_activity_timestamp timestamptz;
    i int;
    j int;
BEGIN
    -- 1. SEED USERS (If they don't exist)
    -- This ensures we have users to attach activities to.
    
    FOR i IN 1..array_length(v_user_ids, 1) LOOP
        v_created_at := NOW() - (random() * INTERVAL '365 days');
        
        -- Insert into auth.users (Safe Insert)
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

        -- Insert into public.profile_customers
        INSERT INTO public.profile_customers (
            id, user_id, first_name, last_name, gender_id, created_at
        ) VALUES (
            gen_random_uuid(),
            v_user_ids[i],
            split_part(v_full_names[i], ' ', 1),
            split_part(v_full_names[i], ' ', 2),
            (SELECT id FROM genders ORDER BY random() LIMIT 1),
            v_created_at
        ) ON CONFLICT (user_id) DO NOTHING;
        
        -- Insert into public.customer (for compat)
        INSERT INTO public.customer (
            id, email, full_name, status, created_at, updated_at
        ) VALUES (
             v_user_ids[i], v_emails[i], v_full_names[i], 'active', v_created_at, v_created_at
        ) ON CONFLICT (id) DO NOTHING;

    END LOOP;
    
    -- 2. ENSURE EVENT TYPES EXIST (Safe Insert without Unique Constraint)
    -- We use a loop or individual statements because slug might not be unique in schema
    
    INSERT INTO public.event_types (slug, name, description)
    SELECT 'login', 'Login', 'User logged in'
    WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'login');

    INSERT INTO public.event_types (slug, name, description)
    SELECT 'page-view', 'Page View', 'User viewed a page'
    WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'page-view');

    INSERT INTO public.event_types (slug, name, description)
    SELECT 'signup', 'Sign Up', 'User signed up'
    WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'signup');

    INSERT INTO public.event_types (slug, name, description)
    SELECT 'click', 'Click', 'User clicked an element'
    WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'click');

    INSERT INTO public.event_types (slug, name, description)
    SELECT 'purchase', 'Purchase', 'User made a purchase'
    WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'purchase');

    INSERT INTO public.event_types (slug, name, description)
    SELECT 'campaign-created', 'Campaign Created', 'User created a campaign'
    WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'campaign-created');

    INSERT INTO public.event_types (slug, name, description)
    SELECT 'referral', 'Referral', 'User referred another'
    WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'referral');

    INSERT INTO public.event_types (slug, name, description)
    SELECT 'email-verified', 'Email Verified', 'User verified email'
    WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'email-verified');

    INSERT INTO public.event_types (slug, name, description)
    SELECT 'profile-update', 'Profile Update', 'User updated profile'
    WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'profile-update');

    INSERT INTO public.event_types (slug, name, description)
    SELECT 'download-report', 'Download Report', 'User downloaded a report'
    WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'download-report');
    
    -- 3. GENERATE ACTIVITIES (The Core Fix)
    -- We need activities for stats to show up.
    
    v_user_count := array_length(v_user_ids, 1);
    
    -- Check if we already have a lot of activities to avoid double seeding if run multiple times without reset
    IF (SELECT count(*) FROM public.customer_activities) < 1000 THEN
    
        RAISE NOTICE 'Seeding 5000+ Activities for Product Usage Analytics...';
        
        -- A. Random Noise (Background Usage) ~5000 events
        FOR i IN 1..5000 LOOP
            v_user_id := v_user_ids[1 + floor(random() * v_user_count)::int];
            
            -- Weight timestamp: 20% < 24h, 50% < 30d, 100% < 90d
            IF random() < 0.2 THEN
                v_activity_timestamp := NOW() - (random() * INTERVAL '24 hours');
            ELSIF random() < 0.7 THEN
                v_activity_timestamp := NOW() - (random() * INTERVAL '30 days');
            ELSE
                 v_activity_timestamp := NOW() - (random() * INTERVAL '90 days');
            END IF;
    
            INSERT INTO public.customer_activities (
                id, profile_customer_id, event_type_id, page_url, event_data, created_at
            ) VALUES (
                gen_random_uuid(),
                (SELECT id FROM profile_customers WHERE user_id = v_user_id LIMIT 1),
                (SELECT id FROM event_types ORDER BY random() LIMIT 1),
                '/dashboard', 
                '{"device": "desktop", "seeded_by": "migration"}',
                v_activity_timestamp
            );
        END LOOP;
        
        -- B. Structured Funnel Data (AARRR)
        -- Ensure specific milestones are hit
        FOR j IN 1..v_user_count LOOP
            v_user_id := v_user_ids[j];
            
            -- 1. Acquisition: Signup (All users) in last 60 days
            INSERT INTO public.customer_activities (id, profile_customer_id, event_type_id, created_at)
            VALUES (gen_random_uuid(), (SELECT id FROM profile_customers WHERE user_id = v_user_id LIMIT 1), (SELECT id FROM event_types WHERE slug='signup'), NOW() - (random() * INTERVAL '60 days'));
    
            -- 2. Activation: Email Verified (80%)
             IF random() < 0.8 THEN
                INSERT INTO public.customer_activities (id, profile_customer_id, event_type_id, created_at)
                VALUES (gen_random_uuid(), (SELECT id FROM profile_customers WHERE user_id = v_user_id LIMIT 1), (SELECT id FROM event_types WHERE slug='email-verified'), NOW() - (random() * INTERVAL '59 days'));
             END IF;
    
             -- 3. Retention: Login in last 7 days (40%)
             IF random() < 0.4 THEN
                INSERT INTO public.customer_activities (id, profile_customer_id, event_type_id, created_at)
                VALUES (gen_random_uuid(), (SELECT id FROM profile_customers WHERE user_id = v_user_id LIMIT 1), (SELECT id FROM event_types WHERE slug='login'), NOW() - (random() * INTERVAL '6 days'));
             END IF;
    
             -- 4. Referral: (15%)
             IF random() < 0.15 THEN
                INSERT INTO public.customer_activities (id, profile_customer_id, event_type_id, created_at)
                VALUES (gen_random_uuid(), (SELECT id FROM profile_customers WHERE user_id = v_user_id LIMIT 1), (SELECT id FROM event_types WHERE slug='referral'), NOW() - (random() * INTERVAL '20 days'));
             END IF;
    
             -- 5. Revenue: Purchase (10%)
             IF random() < 0.10 THEN
                INSERT INTO public.customer_activities (id, profile_customer_id, event_type_id, created_at)
                VALUES (gen_random_uuid(), (SELECT id FROM profile_customers WHERE user_id = v_user_id LIMIT 1), (SELECT id FROM event_types WHERE slug='purchase'), NOW() - (random() * INTERVAL '10 days'));
             END IF;
        END LOOP;
        
        RAISE NOTICE 'Activities Seeded Successfully.';
        
    ELSE
        RAISE NOTICE 'Activities already exist, skipping seed.';
    END IF;

END $$;
