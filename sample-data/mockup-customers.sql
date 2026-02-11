-- =========================================================
-- Comprehensive Customer Seed (High Realism)
-- 30 customers with ALL fields populated
-- Timestamps: 2025-2026 only (distributed across last 365 days)
-- RLS-safe: Uses transaction with temporarily disabled RLS
-- =========================================================

DO $$
DECLARE
    v_user_ids uuid[] := ARRAY[
        'c1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid,
        'c1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000005'::uuid, 'c1000000-0000-0000-0000-000000000006'::uuid,
        'c1000000-0000-0000-0000-000000000007'::uuid, 'c1000000-0000-0000-0000-000000000008'::uuid, 'c1000000-0000-0000-0000-000000000009'::uuid,
        'c1000000-0000-0000-0000-000000000010'::uuid, 'c1000000-0000-0000-0000-000000000011'::uuid, 'c1000000-0000-0000-0000-000000000012'::uuid,
        'c1000000-0000-0000-0000-000000000013'::uuid, 'c1000000-0000-0000-0000-000000000014'::uuid, 'c1000000-0000-0000-0000-000000000015'::uuid,
        'c1000000-0000-0000-0000-000000000016'::uuid, 'c1000000-0000-0000-0000-000000000017'::uuid, 'c1000000-0000-0000-0000-000000000018'::uuid,
        'c1000000-0000-0000-0000-000000000019'::uuid, 'c1000000-0000-0000-0000-000000000020'::uuid, 'c1000000-0000-0000-0000-000000000021'::uuid,
        'c1000000-0000-0000-0000-000000000022'::uuid, 'c1000000-0000-0000-0000-000000000023'::uuid, 'c1000000-0000-0000-0000-000000000024'::uuid,
        'c1000000-0000-0000-0000-000000000025'::uuid, 'c1000000-0000-0000-0000-000000000026'::uuid, 'c1000000-0000-0000-0000-000000000027'::uuid,
        'c1000000-0000-0000-0000-000000000028'::uuid, 'c1000000-0000-0000-0000-000000000029'::uuid, 'c1000000-0000-0000-0000-000000000030'::uuid
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
    
    v_company_names text[] := ARRAY[
        'TechStart Solutions Inc', 'Digital Wave Marketing', 'Freelance Developer (Individual)', 'Martinez Business Consulting', 'ShopNow E-commerce',
        'Wilson Creative Agency', 'Individual Consultant', 'Rodriguez & Associates Law', 'Kim Realty Group', 'Thompson & Partners',
        'Brooks Media Productions', 'Nakamura Design Studio', 'O''Connor PR Services', 'Silva Global Logistics', 'Chang Financial Technologies',
        'Kim Tech Innovations', 'Wilson Fashion Boutique', 'Silva Import/Export Ltd', 'Jones Marketing Hub', 'Brown Construction Co',
        'Davis Healthcare Solutions', 'Miller Manufacturing Corp', 'Moore Education Platform', 'Taylor DevOps Cloud', 'Anderson Event Management',
        'White Business Advisory', 'Harris Legal Services', 'Martin Architecture Firm', 'Thompson CPA Group', 'Garcia Engineering Systems'
    ];
    
    v_phone_numbers text[] := ARRAY[
        '+1-415-555-0101', '+86-138-1234-5678', '+91-98765-43210', '+52-55-1234-5678', '+84-90-777-8888',
        '+44-20-7946-0958', '+61-2-9876-5432', '+34-91-123-4567', '+82-10-9876-5432', '+1-212-555-0202',
        '+1-310-555-0303', '+81-3-5432-1098', '+353-1-234-5678', '+55-11-98765-4321', '+886-2-2345-6789',
        '+82-2-1234-5678', '+1-617-555-0404', '+55-21-91234-5678', '+1-312-555-0505', '+1-713-555-0606',
        '+1-206-555-0707', '+1-248-555-0808', '+1-650-555-0909', '+1-415-555-1010', '+1-305-555-1111',
        '+1-214-555-1212', '+1-702-555-1313', '+1-512-555-1414', '+1-480-555-1515', '+1-303-555-1616'
    ];
    
    v_birthdays date[] := ARRAY[
        '1992-03-15', '1988-07-22', '1995-11-08', '1985-01-30', '1993-09-12',
        '1990-05-18', '1987-12-25', '1991-04-07', '1994-06-14', '1989-10-03',
        '1996-02-28', '1986-08-19', '1992-11-30', '1984-03-22', '1997-07-09',
        '1991-01-15', '1993-02-22', '1995-03-08', '1990-04-30', '1988-05-12',
        '1992-06-18', '1989-07-25', '1994-08-07', '1987-09-14', '1996-10-03',
        '1985-11-28', '1993-12-19', '1991-01-30', '1988-02-22', '1995-03-09'
    ];
    
    -- Diverse plan distribution
    v_plan_types text[] := ARRAY[
        'free', 'pro', 'free', 'team', 'pro', 'enterprise', 'free', 'team', 'pro', 'free',
        'pro', 'team', 'free', 'enterprise', 'pro', 'team', 'free', 'pro', 'enterprise', 'free',
        'pro', 'team', 'free', 'pro', 'enterprise', 'team', 'free', 'pro', 'team', 'pro'
    ];
    
    -- Realistic status distribution (mostly active)
    v_statuses text[] := ARRAY[
        'active', 'active', 'active', 'active', 'active', 'active', 'inactive', 'active', 'active', 'churned',
        'active', 'active', 'trial', 'active', 'active', 'active', 'inactive', 'active', 'active', 'trial',
        'active', 'active', 'active', 'active', 'active', 'active', 'inactive', 'active', 'active', 'active'
    ];
    
    
    -- Loyalty tier variables (will be fetched from database)
    v_loyalty_tier_ids uuid[];
    v_tier_bronze_id uuid;
    v_tier_silver_id uuid;
    v_tier_gold_id uuid;
    v_tier_platinum_id uuid;
    
    -- Points matching tiers (Bronze: 0-499, Silver: 500-1999, Gold: 2000-4999, Platinum: 5000+)
    v_loyalty_points int[] := ARRAY[
        125, 850, 45, 2200, 670, 5800, 0, 2100, 780, 0,
        920, 2400, 30, 6200, 1100, 3000, 50, 900, 7000, 20,
        600, 2500, 100, 800, 4500, 3200, 10, 880, 2100, 1200
    ];
    
    -- Spend matching tiers
    v_total_spends numeric[] := ARRAY[
        299.99, 1250.00, 89.99, 5400.00, 980.00, 25000.00, 0.00, 4800.00, 1150.00, 0.00,
        1450.00, 5200.00, 59.99, 32000.00, 1890.00, 6000.00, 49.99, 1500.00, 35000.00, 0.00,
        1300.00, 5500.00, 120.00, 1600.00, 22000.00, 7000.00, 19.99, 1550.00, 4900.00, 2100.00
    ];
    
    -- 2025-2026 range: Max 365 days in the past (from Feb 11, 2026)
    -- Oldest: Feb 11, 2025 | Newest: Feb 10, 2026
    v_created_offsets interval[] := ARRAY[
        '350 days'::interval, '330 days'::interval, '310 days'::interval, '290 days'::interval, '270 days'::interval,
        '250 days'::interval, '230 days'::interval, '210 days'::interval, '190 days'::interval, '170 days'::interval,
        '150 days'::interval, '135 days'::interval, '120 days'::interval, '105 days'::interval, '90 days'::interval,
        '75 days'::interval, '65 days'::interval, '55 days'::interval, '48 days'::interval, '42 days'::interval,
        '35 days'::interval, '28 days'::interval, '21 days'::interval, '16 days'::interval, '12 days'::interval,
        '9 days'::interval, '6 days'::interval, '4 days'::interval, '2 days'::interval, '1 day'::interval
    ];
    
    v_last_active_offsets interval[] := ARRAY[
        '2 days'::interval, '5 hours'::interval, '1 day'::interval, '12 hours'::interval, '3 days'::interval,
        '1 hour'::interval, '75 days'::interval, '4 hours'::interval, '2 days'::interval, '150 days'::interval,
        '6 hours'::interval, '1 day'::interval, '2 hours'::interval, '8 hours'::interval, '5 hours'::interval,
        '3 hours'::interval, '60 days'::interval, '1 day'::interval, '10 hours'::interval, '1 hour'::interval,
        '2 days'::interval, '12 hours'::interval, '4 days'::interval, '6 hours'::interval, '1 day'::interval,
        '15 hours'::interval, '45 days'::interval, '3 hours'::interval, '2 days'::interval, '5 hours'::interval
    ];
    
    i int;
    v_created_at timestamptz;
    v_password_hash text := '$2a$10$rYvLBvZvQ6qE5Q5Z5Q5Q5OMxKZ9xH7xJ8wL5gF2hE9xJ8wKjL5K8i';
    v_rls_was_enabled boolean;
BEGIN
    -- Fetch actual loyalty tier IDs from database
    SELECT id INTO v_tier_bronze_id FROM loyalty_tiers WHERE name = 'Bronze' LIMIT 1;
    SELECT id INTO v_tier_silver_id FROM loyalty_tiers WHERE name = 'Silver' LIMIT 1;
    SELECT id INTO v_tier_gold_id FROM loyalty_tiers WHERE name = 'Gold' LIMIT 1;
    SELECT id INTO v_tier_platinum_id FROM loyalty_tiers WHERE name = 'Platinum' LIMIT 1;
    
    -- Build loyalty tier ID array based on tier names
    v_loyalty_tier_ids := ARRAY[
        v_tier_bronze_id, v_tier_silver_id, v_tier_bronze_id, v_tier_gold_id, v_tier_silver_id, v_tier_platinum_id,
        v_tier_bronze_id, v_tier_gold_id, v_tier_silver_id, v_tier_bronze_id, v_tier_silver_id, v_tier_gold_id,
        v_tier_bronze_id, v_tier_platinum_id, v_tier_silver_id, v_tier_gold_id, v_tier_bronze_id, v_tier_silver_id,
        v_tier_platinum_id, v_tier_bronze_id, v_tier_silver_id, v_tier_gold_id, v_tier_bronze_id, v_tier_silver_id,
        v_tier_platinum_id, v_tier_gold_id, v_tier_bronze_id, v_tier_silver_id, v_tier_gold_id, v_tier_silver_id
    ];
    
    RAISE NOTICE 'Loaded tier IDs: Bronze=%, Silver=%, Gold=%, Platinum=%', 
        v_tier_bronze_id, v_tier_silver_id, v_tier_gold_id, v_tier_platinum_id;
    
    -- Check if RLS is enabled on customer table
    SELECT relrowsecurity INTO v_rls_was_enabled 
    FROM pg_class 
    WHERE oid = 'public.customer'::regclass;
    
    -- Temporarily disable RLS for this transaction
    ALTER TABLE public.customer DISABLE ROW LEVEL SECURITY;
    
    FOR i IN 1..array_length(v_user_ids, 1) LOOP
        v_created_at := NOW() - v_created_offsets[i];
        
        -- Insert into auth.users
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role
        ) VALUES (
            v_user_ids[i], '00000000-0000-0000-0000-000000000000', v_emails[i], v_password_hash,
            v_created_at + INTERVAL '15 minutes',
            v_created_at, NOW() - v_last_active_offsets[i],
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('full_name', v_full_names[i]),
            'authenticated', 'authenticated'
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Insert into public.customer (ALL columns)
        INSERT INTO public.customer (
            id, email, full_name, company_name, phone_number, birthday_at,
            plan_type, status, loyalty_tier_id, loyalty_points_balance, total_spend_amount,
            member_since, last_active, created_at, updated_at
        ) VALUES (
            v_user_ids[i], v_emails[i], v_full_names[i], v_company_names[i], v_phone_numbers[i], v_birthdays[i],
            v_plan_types[i], v_statuses[i], v_loyalty_tier_ids[i], v_loyalty_points[i], v_total_spends[i],
            v_created_at, NOW() - v_last_active_offsets[i], v_created_at, NOW() - v_last_active_offsets[i]
        ) ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            company_name = EXCLUDED.company_name,
            phone_number = EXCLUDED.phone_number,
            birthday_at = EXCLUDED.birthday_at,
            plan_type = EXCLUDED.plan_type,
            status = EXCLUDED.status,
            loyalty_tier_id = EXCLUDED.loyalty_tier_id,
            loyalty_points_balance = EXCLUDED.loyalty_points_balance,
            total_spend_amount = EXCLUDED.total_spend_amount,
            member_since = EXCLUDED.member_since,
            last_active = EXCLUDED.last_active,
            updated_at = EXCLUDED.updated_at;
    END LOOP;
    
    -- Re-enable RLS if it was enabled before
    IF v_rls_was_enabled THEN
        ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;
    END IF;
    
    RAISE NOTICE 'Successfully seeded 30 realistic customers (2025-2026 timeframe)';
END $$;

-- Verification
SELECT 
    COUNT(*) as total,
    COUNT(DISTINCT plan_type) as plan_variety,
    COUNT(DISTINCT status) as status_variety,
    MIN(created_at)::date as earliest_signup,
    MAX(created_at)::date as latest_signup,
    COUNT(CASE WHEN company_name IS NOT NULL THEN 1 END) as with_company,
    COUNT(CASE WHEN phone_number IS NOT NULL THEN 1 END) as with_phone,
    COUNT(CASE WHEN birthday_at IS NOT NULL THEN 1 END) as with_birthday,
    COUNT(CASE WHEN loyalty_tier_id IS NOT NULL THEN 1 END) as with_loyalty_tier
FROM public.customer
WHERE id >= 'c1000000-0000-0000-0000-000000000001'
  AND id <= 'c1000000-0000-0000-0000-000000000030';
