-- Enable the employee registration trigger
-- This trigger was disabled and needs to be re-enabled

-- Check current status
DO $$
DECLARE
    trigger_status char(1);
BEGIN
    SELECT tgenabled INTO trigger_status
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    WHERE t.tgname = 'on_auth_user_created'
    AND c.relname = 'users';
    
    RAISE NOTICE 'Current trigger status: %', trigger_status;
END $$;

-- Drop and recreate trigger to ensure it's enabled
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify it's now enabled
SELECT 
    t.tgname AS trigger_name,
    CASE t.tgenabled
        WHEN 'O' THEN 'ENABLED (Origin)'
        WHEN 'D' THEN 'DISABLED'
        WHEN 'R' THEN 'REPLICA'
        WHEN 'A' THEN 'ALWAYS'
        ELSE CONCAT('UNKNOWN (', t.tgenabled, ')')
    END AS status,
    c.relname AS table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'on_auth_user_created';
