-- check_error_logs.sql
-- Run this in your Supabase SQL Editor to verify data existence

-- 1. Check total count (Bypassing RLS if run as admin/postgres, but via API it respects RLS)
SELECT COUNT(*) as total_error_logs_count FROM public.error_logs;

-- 2. Check recent logs (last 24h)
SELECT COUNT(*) as recent_24h_count 
FROM public.error_logs 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- 3. Sample data (to see if level is correct)
SELECT level, message, created_at FROM public.error_logs ORDER BY created_at DESC LIMIT 5;
