-- 20260321000000_secure_storage_uploads.sql
-- Description: Enforce strict content_type limits for profile pictures and logos.

-- CREATE (INSERT) Policy
CREATE POLICY "Strict image upload types for Avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND owner = auth.uid()
  AND (metadata->>'mimetype') IN ('image/jpeg', 'image/png', 'image/svg+xml')
);

-- UPDATE Policy
CREATE POLICY "Strict image update types for Avatars"
ON storage.objects
FOR UPDATE
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND owner = auth.uid()
  AND (metadata->>'mimetype') IN ('image/jpeg', 'image/png', 'image/svg+xml')
);
