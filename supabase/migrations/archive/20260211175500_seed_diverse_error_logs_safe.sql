-- =========================================================
-- Insert diverse error logs - SAFE VERSION
-- Only uses user_ids that actually exist in auth.users
-- =========================================================

DO $$
DECLARE
    v_all_users uuid[];
    v_employee_users uuid[];
    v_customer_users uuid[];
    v_random_user uuid;
    i int;
BEGIN
    -- Get ALL user IDs from auth.users (the source of truth)
    SELECT ARRAY_AGG(id) INTO v_all_users FROM auth.users;
    
    -- Get employee user IDs (intersection of employees and auth.users)
    SELECT ARRAY_AGG(e.user_id) INTO v_employee_users 
    FROM public.employees e
    WHERE e.user_id = ANY(v_all_users);
    
    -- Get customer user IDs (intersection of customer and auth.users)
    SELECT ARRAY_AGG(c.id) INTO v_customer_users 
    FROM public.customer c
    WHERE c.id = ANY(v_all_users);
    
    -- If no customers exist in auth.users, use all auth.users as "potential customers"
    IF v_customer_users IS NULL OR array_length(v_customer_users, 1) IS NULL THEN
        RAISE NOTICE 'No customers found with valid auth.users entries. Using all auth.users for customer errors.';
        v_customer_users := v_all_users;
    END IF;
    
    -- Insert 20 diverse error logs from "customers"
    IF v_customer_users IS NOT NULL AND array_length(v_customer_users, 1) > 0 THEN
        FOR i IN 1..20 LOOP
            v_random_user := v_customer_users[1 + floor(random() * array_length(v_customer_users, 1))];
            
            INSERT INTO public.error_logs (level, message, user_id, request_id, stack_trace, metadata, created_at)
            VALUES (
                CASE (random() * 3)::int
                    WHEN 0 THEN 'error'
                    WHEN 1 THEN 'warning'
                    ELSE 'info'
                END,
                CASE (random() * 8)::int
                    WHEN 0 THEN 'Failed to load campaign data'
                    WHEN 1 THEN 'Ad account connection timeout'
                    WHEN 2 THEN 'Invalid API credentials provided'
                    WHEN 3 THEN 'Rate limit exceeded for platform API'
                    WHEN 4 THEN 'Budget update failed - insufficient permissions'
                    WHEN 5 THEN 'Campaign metrics sync delayed'
                    WHEN 6 THEN 'Dashboard widget failed to render'
                    ELSE 'User session expired during data fetch'
                END,
                v_random_user,
                gen_random_uuid()::text,
                NULL,
                jsonb_build_object(
                    'source', 'customer-dashboard',
                    'user_type', 'customer',
                    'browser', (ARRAY['Chrome', 'Firefox', 'Safari', 'Edge'])[1 + floor(random() * 4)],
                    'platform', (ARRAY['google-ads', 'facebook-ads', 'tiktok-ads'])[1 + floor(random() * 3)]
                ),
                NOW() - (random() * interval '7 days')
            );
        END LOOP;
    END IF;
    
    -- Insert 10 employee-generated errors
    IF v_employee_users IS NOT NULL AND array_length(v_employee_users, 1) > 0 THEN
        FOR i IN 1..10 LOOP
            v_random_user := v_employee_users[1 + floor(random() * array_length(v_employee_users, 1))];
            
            INSERT INTO public.error_logs (level, message, user_id, request_id, stack_trace, metadata, created_at)
            VALUES (
                CASE (random() * 2)::int
                    WHEN 0 THEN 'error'
                    ELSE 'warning'
                END,
                CASE (random() * 5)::int
                    WHEN 0 THEN 'Admin backup job failed'
                    WHEN 1 THEN 'Database query timeout in admin panel'
                    WHEN 2 THEN 'Failed to update employee permissions'
                    WHEN 3 THEN 'Email notification service down'
                    ELSE 'Report generation exceeded memory limit'
                END,
                v_random_user,
                gen_random_uuid()::text,
                'Error: Internal server error\n  at AdminController.performAction\n  at async processRequest',
                jsonb_build_object(
                    'source', 'admin-panel',
                    'user_type', 'employee',
                    'action', (ARRAY['backup', 'report', 'user-management'])[1 + floor(random() * 3)]
                ),
                NOW() - (random() * interval '3 days')
            );
        END LOOP;
    END IF;
    
END $$;
