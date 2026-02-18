-- =========================================================
-- REALISTIC SEED DATA (Enhanced)
-- Extends unified-seed.sql with Customer Activities for Analytics
-- =========================================================

-- 1. EXECUTE BASE SEED (Copy of unified-seed logic or assume it runs first)
-- For simplicity, this script INCLUDES the base logic to be standalone.

-- Set random seed
SELECT setseed(0.42);

-- CLEANUP (Optional - careful in prod)
-- TRUNCATE TABLE public.customer_activities CASCADE;
-- TRUNCATE TABLE public.feedback CASCADE;

-- ... [Include Users/Workspaces/Subs from unified-seed.sql if needed, or assume they exist]
-- For this script, we assume 'unified-seed.sql' has been run or we append its logic here.
-- Let's MOCK the Activities mostly, as that's what's missing for Product Usage.

DO $$
DECLARE
    v_user_count int;
    v_users uuid[];
    v_event_types text[] := ARRAY['login', 'page-view', 'signup', 'click', 'purchase', 'campaign-created', 'referral', 'email-verified', 'profile-update', 'download-report'];
    -- Event type mappings to slugs if needed (assuming event_types table exists and has these)
    -- If event_types table needs seeding, we should do that too.
    
    v_user_id uuid;
    v_activity_timestamp timestamptz;
    i int;
    j int;
BEGIN
    -- 0. Ensure Event Types Exist
    INSERT INTO public.event_types (slug, name, description) VALUES
    ('login', 'Login', 'User logged in'),
    ('page-view', 'Page View', 'User viewed a page'),
    ('signup', 'Sign Up', 'User signed up'),
    ('click', 'Click', 'User clicked an element'),
    ('purchase', 'Purchase', 'User made a purchase'),
    ('campaign-created', 'Campaign Created', 'User created a campaign'),
    ('referral', 'Referral', 'User referred another'),
    ('email-verified', 'Email Verified', 'User verified email'),
    ('profile-update', 'Profile Update', 'User updated profile'),
    ('download-report', 'Download Report', 'User downloaded a report')
    ON CONFLICT (slug) DO NOTHING;

    -- Get Users (seeded by unified-seed.sql)
    SELECT ARRAY_AGG(id) INTO v_users FROM auth.users;
    v_user_count := array_length(v_users, 1);

    IF v_user_count IS NULL OR v_user_count = 0 THEN
        RAISE NOTICE 'No users found. Please run unified-seed.sql first or ensure users exist.';
        RETURN;
    END IF;

    RAISE NOTICE 'Seeding Customer Activities for % Users...', v_user_count;

    -- Generate Activities for DAU/MAU and Funnel
    -- We want ~5000 activities for the charts to look good.
    
    FOR i IN 1..5000 LOOP
        -- Pick random user
        v_user_id := v_users[1 + floor(random() * v_user_count)::int];
        
        -- Pick random time in last 90 days. 
        -- Weight towards recent for DAU/MAU
        -- 20% in last 24h, 50% in last 30d, 100% in last 90d
        IF random() < 0.2 THEN
            v_activity_timestamp := NOW() - (random() * INTERVAL '24 hours');
        ELSIF random() < 0.7 THEN
            v_activity_timestamp := NOW() - (random() * INTERVAL '30 days');
        ELSE
             v_activity_timestamp := NOW() - (random() * INTERVAL '90 days');
        END IF;

        INSERT INTO public.customer_activities (
            id, profile_customer_id, event_type_id, page_url, metadata, created_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            (SELECT id FROM event_types ORDER BY random() LIMIT 1), -- Random event
            '/dashboard', -- Mock URL
            '{"device": "desktop"}',
            v_activity_timestamp
        );
    END LOOP;
    
    -- SPECIFIC FUNNEL DATA SEEDING (To ensure funnel chart active)
    -- Ensure we have specific events for AARRR
    -- AARRR: Acquisition (Signup), Activation (Email/Profile), Retention (Login > 7d), Referral, Revenue (Purchase)
    
    FOR j IN 1..array_length(v_users, 1) LOOP
        v_user_id := v_users[j];
        
        -- 1. Acquisition: Signup (All users)
        INSERT INTO public.customer_activities (id, profile_customer_id, event_type_id, created_at)
        VALUES (gen_random_uuid(), v_user_id, (SELECT id FROM event_types WHERE slug='signup'), NOW() - INTERVAL '60 days');

        -- 2. Activation: Email Verified (80% of users)
         IF random() < 0.8 THEN
            INSERT INTO public.customer_activities (id, profile_customer_id, event_type_id, created_at)
            VALUES (gen_random_uuid(), v_user_id, (SELECT id FROM event_types WHERE slug='email-verified'), NOW() - INTERVAL '59 days');
         END IF;

         -- 3. Retention: Visit in last 7 days (40% of users)
         IF random() < 0.4 THEN
            INSERT INTO public.customer_activities (id, profile_customer_id, event_type_id, created_at)
            VALUES (gen_random_uuid(), v_user_id, (SELECT id FROM event_types WHERE slug='login'), NOW() - INTERVAL '2 days');
         END IF;

         -- 4. Referral: (15% of users)
         IF random() < 0.15 THEN
            INSERT INTO public.customer_activities (id, profile_customer_id, event_type_id, created_at)
            VALUES (gen_random_uuid(), v_user_id, (SELECT id FROM event_types WHERE slug='referral'), NOW() - INTERVAL '10 days');
         END IF;

         -- 5. Revenue: Purchase (10% of users)
         IF random() < 0.10 THEN
            INSERT INTO public.customer_activities (id, profile_customer_id, event_type_id, created_at)
            VALUES (gen_random_uuid(), v_user_id, (SELECT id FROM event_types WHERE slug='purchase'), NOW() - INTERVAL '5 days');
         END IF;

    END LOOP;

    RAISE NOTICE 'Activities Seeded.';
END $$;
