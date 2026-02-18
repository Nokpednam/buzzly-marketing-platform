-- ============================================================
-- Script to Backfill Missing Customer Data for Existing Users
-- ============================================================

DO $$
DECLARE
    r RECORD;
    free_plan_id uuid;
    meta jsonb;
BEGIN
    -- 1. Get the Free Plan ID
    SELECT id INTO free_plan_id FROM public.subscription_plans WHERE slug = 'free' LIMIT 1;

    -- 2. Loop through all registered users in auth.users
    FOR r IN SELECT * FROM auth.users LOOP
        
        RAISE NOTICE 'Processing user: %', r.email;
        
        -- Safe casting of metadata, handle nulls
        meta := COALESCE(r.raw_user_meta_data::jsonb, '{}'::jsonb);

        -- A. Insert into public.customer if missing
        INSERT INTO public.customer (id, email, full_name, plan_type)
        VALUES (
            r.id,
            r.email,
            COALESCE(
                jsonb_extract_path_text(meta, 'full_name'),
                (jsonb_extract_path_text(meta, 'first_name') || ' ' || jsonb_extract_path_text(meta, 'last_name')),
                r.email
            ),
            'free'
        )
        ON CONFLICT (id) DO NOTHING;

        -- B. Insert into public.profile_customers if missing
        INSERT INTO public.profile_customers (user_id, first_name, last_name)
        VALUES (
            r.id,
            COALESCE(jsonb_extract_path_text(meta, 'first_name'), ''),
            COALESCE(jsonb_extract_path_text(meta, 'last_name'), '')
        )
        ON CONFLICT (user_id) DO NOTHING;

        -- C. Ensure they have a FREE subscription if they don't have ANY subscription
        IF free_plan_id IS NOT NULL THEN
            IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = r.id AND status = 'active') THEN
                 INSERT INTO public.subscriptions (
                    user_id,
                    plan_id,
                    status,
                    billing_cycle,
                    current_period_start,
                    current_period_end
                 )
                 VALUES (
                    r.id,
                    free_plan_id,
                    'active',
                    'monthly',
                    NOW(),
                    NOW() + INTERVAL '1 month'
                 )
                 ON CONFLICT DO NOTHING;
                 
                 RAISE NOTICE 'Created default FREE subscription for user: %', r.email;
            END IF;
        END IF;

    END LOOP;
    
    RAISE NOTICE 'Backfill completed successfully!';
END $$;
