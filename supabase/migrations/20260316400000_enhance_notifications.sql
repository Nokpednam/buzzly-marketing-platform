-- Add archiving and soft-delete support to notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Drop and recreate the index to include the new columns and handle soft-deletion
-- We want efficient lookup for: target_role, is_read, is_archived, and NOT deleted
DROP INDEX IF EXISTS idx_notifications_role_unread;

CREATE INDEX idx_notifications_role_active_status
ON notifications(target_role, is_read, is_archived)
WHERE deleted_at IS NULL;

-- Index for searching trash/archived specifically
CREATE INDEX idx_notifications_trash
ON notifications(target_role, deleted_at)
WHERE deleted_at IS NOT NULL;

CREATE INDEX idx_notifications_archived
ON notifications(target_role, is_archived)
WHERE is_archived IS TRUE AND deleted_at IS NULL;

-- Ensure Realtime Configuration
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'notifications'
    ) THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
        EXCEPTION WHEN OTHERS THEN
            -- Might fail if publication doesn't exist yet, but base migrations usually create it
            NULL;
        END;
    END IF;
END $$;
