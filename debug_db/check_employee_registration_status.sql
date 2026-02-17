-- Debug Script: Check Employee Registration Trigger Status
-- Run this in Supabase Studio SQL Editor to diagnose the issue

-- 1. Check if the trigger exists
SELECT 
    'Trigger Status' as check_name,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT 
    'Function Status' as check_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user'
AND n.nspname = 'public';

-- 3. Check if Employee role exists
SELECT 
    'Employee Role Status' as check_name,
    id,
    role_name,
    description
FROM role_employees
WHERE LOWER(role_name) = 'employee';

-- 4. Check employees table structure
SELECT 
    'Employees Table Structure' as check_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'employees'
ORDER BY ordinal_position;

-- 5. Check profile_customers unique constraint
SELECT 
    'Profile Customers Constraints' as check_name,
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.profile_customers'::regclass
AND contype = 'u';

-- 6. Try a test insert to see what error occurs
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
BEGIN
    RAISE NOTICE 'Testing employee registration simulation...';
    
    -- This simulates what the trigger would do
    INSERT INTO public.employees (
        user_id, 
        email, 
        status, 
        approval_status,
        role_employees_id
    )
    VALUES (
        test_user_id,
        'test@example.com',
        'active',
        'pending',
        (SELECT id FROM role_employees WHERE LOWER(role_name) = 'employee' LIMIT 1)
    );
    
    RAISE NOTICE '✅ Test employee insert successful';
    
    -- Cleanup
    DELETE FROM public.employees WHERE user_id = test_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test failed with error: %', SQLERRM;
END $$;
