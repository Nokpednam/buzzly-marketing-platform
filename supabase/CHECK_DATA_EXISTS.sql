-- SIMPLE DATA CHECK
-- Just run this and show me what it returns

-- Check 1: Do insights exist?
SELECT 'ad_insights' as table_name, COUNT(*) as row_count, 
       MAX(date) as latest_date, MIN(date) as earliest_date
FROM public.ad_insights;

-- Check 2: Do campaigns exist?
SELECT 'campaigns' as table_name, COUNT(*) as row_count
FROM public.campaigns;

-- Check 3: Do ad accounts exist?
SELECT 'ad_accounts' as table_name, COUNT(*) as row_count
FROM public.ad_accounts;

-- Check 4: Is RLS on or off?
SELECT 
    tablename,
    CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
AND tablename IN ('ad_insights', 'campaigns', 'ad_accounts')
AND c.relname = tablename;
