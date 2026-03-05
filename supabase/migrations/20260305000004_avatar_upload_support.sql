-- ============================================================
-- Migration: Avatar Upload Support
-- Date: 2026-03-05
-- Description:
--   1. Add avatar_url column to profile_customers table
--   2. Create avatars storage bucket (public)
--   3. Set storage RLS policies so users can upload/delete their own avatars
-- ============================================================

-- 1. Add avatar_url column (safe: does nothing if column already exists)
ALTER TABLE public.profile_customers
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- 2. Create the storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,   -- public read
  2097152, -- 2 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS: allow authenticated users to upload to their own folder
CREATE POLICY "avatars_insert_policy"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Storage RLS: allow authenticated users to update their own avatars
CREATE POLICY "avatars_update_policy"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Storage RLS: allow authenticated users to delete their own avatars
CREATE POLICY "avatars_delete_policy"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Storage RLS: allow public read (anyone can view avatars)
CREATE POLICY "avatars_select_policy"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');
