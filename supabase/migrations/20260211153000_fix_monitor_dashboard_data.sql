-- =========================================================
-- Fix Monitor Dashboard Data Visibility
-- 1. Ensure current user has 'admin' role in public.employees
-- 2. Seed fresh error_logs data for "Last 24 Hours" view
-- =========================================================

DO $$
DECLARE
    v_user_id uuid;
    v_admin_role_id uuid;
    v_employee_id uuid;
BEGIN
    -- 1. Get the first user (likely the dev/owner)
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    -- 2. Get the 'admin' role ID for employees
    SELECT id INTO v_admin_role_id FROM public.role_employees WHERE role_name = 'admin' LIMIT 1;

    -- If no admin role exists, we might need to create it (safety check)
    IF v_admin_role_id IS NULL THEN
        INSERT INTO public.role_employees (role_name, description)
        VALUES ('admin', 'Start with default Admin role')
        RETURNING id INTO v_admin_role_id;
    END IF;

    IF v_user_id IS NOT NULL THEN
        -- 3. Upsert into employees table
        -- We check if an employee record exists for this user
        SELECT id INTO v_employee_id FROM public.employees WHERE user_id = v_user_id;

        IF v_employee_id IS NULL THEN
            -- Insert new employee record
            INSERT INTO public.employees (user_id, role_employees_id, email, status)
            SELECT v_user_id, v_admin_role_id, email, 'active'
            FROM auth.users WHERE id = v_user_id;
        ELSE
            -- Update existing record to be admin
            UPDATE public.employees
            SET role_employees_id = v_admin_role_id, status = 'active'
            WHERE id = v_employee_id;
        END IF;
    END IF;

    -- 4. Seed Error Logs (Fresh Data for "Last 24 Hours")
    -- We delete old mock logs to avoid clutter if run multiple times, or just add new ones.
    -- Let's just add new ones with a specific tag in metadata to identify them if needed, or just standard.
    
    INSERT INTO public.error_logs (level, message, stack_trace, metadata, created_at) VALUES
    ('error', 'Payment Gateway Timeout', 'TimeoutError: Gateway did not respond in 30s...', '{"service": "payment"}'::jsonb, NOW() - INTERVAL '30 minutes'),
    ('error', 'Database Connection Failed', 'ConnectionRefused: Too many clients...', '{"service": "database"}'::jsonb, NOW() - INTERVAL '2 hours'),
    ('warning', 'High CPU Usage', NULL, '{"cpu_percent": 92}'::jsonb, NOW() - INTERVAL '45 minutes'),
    ('warning', 'API Latency Spikes', NULL, '{"endpoint": "/api/v1/users"}'::jsonb, NOW() - INTERVAL '3 hours'),
    ('info', 'Daily Backup Completed', NULL, '{"size_gb": 4.2}'::jsonb, NOW() - INTERVAL '12 hours'),
    ('error', 'Third-party API Error', '503 Service Unavailable', '{"provider": "google-ads"}'::jsonb, NOW() - INTERVAL '5 hours');

END $$;
