
-- Check table definition
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'social_posts';

-- Check policies
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'social_posts';

-- Check is_team_member definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'is_team_member';
