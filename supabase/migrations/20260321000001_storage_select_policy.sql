-- 20260321000001_storage_select_policy.sql
-- Description: Allow public read access for avatars and logos

CREATE POLICY "Allow public read access for avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');
