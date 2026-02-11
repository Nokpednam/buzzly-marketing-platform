-- check_error_log_fields.sql
-- Check if user_id and request_id are actually populated
SELECT 
    id, 
    created_at, 
    level, 
    message, 
    user_id, 
    request_id 
FROM public.error_logs 
ORDER BY created_at DESC 
LIMIT 10;
