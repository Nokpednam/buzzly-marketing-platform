-- Debug: Check auth.users to see if signup creates user
-- This will help us verify if the problem is trigger or signup

-- 1. Check recent auth.users entries
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check if any of these users have employee records
SELECT 
    u.email,
    u.created_at as user_created,
    e.id as employee_id,
    e.created_at as employee_created,
    e.approval_status
FROM auth.users u
LEFT JOIN employees e ON u.id = e.user_id
ORDER BY u.created_at DESC
LIMIT 5;

-- 3. Check Supabase logs for trigger execution
-- IMPORTANT: Check your Supabase logs at http://localhost:54323
-- Look for NOTICE messages like "handle_new_user trigger fired"
