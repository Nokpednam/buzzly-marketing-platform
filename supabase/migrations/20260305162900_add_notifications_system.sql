-- ─────────────────────────────────────────────────────────────────────────────
-- Notifications System
-- Table: notifications
-- Triggers: auto-insert from error_logs, audit_logs, reward_redemptions, suspicious_loyalty_activities
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_role TEXT NOT NULL,      -- 'dev', 'support', 'owner', 'all'
    type        TEXT NOT NULL,      -- 'critical_error', 'auth_failure', 'redemption_request', 'suspicious_activity'
    title       TEXT NOT NULL,
    body        TEXT,
    link        TEXT,               -- navigation link, e.g. '/dev/support'
    is_read     BOOLEAN NOT NULL DEFAULT false,
    source_id   TEXT,               -- ID of the source record
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast unread queries per role
CREATE INDEX IF NOT EXISTS idx_notifications_role_unread
    ON notifications(target_role, is_read, created_at DESC);

-- 2. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies: employees read their own role's notifications (or all if owner)
CREATE POLICY "Employees can view their role notifications"
    ON notifications FOR SELECT
    USING (
        target_role = 'all'
        OR
        EXISTS (
            SELECT 1 FROM employees e
            JOIN role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND (re.role_name = target_role OR re.role_name = 'owner')
            AND e.status = 'active'
        )
    );

CREATE POLICY "Employees can mark notifications as read"
    ON notifications FOR UPDATE
    USING (
        target_role = 'all'
        OR
        EXISTS (
            SELECT 1 FROM employees e
            JOIN role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND (re.role_name = target_role OR re.role_name = 'owner')
            AND e.status = 'active'
        )
    )
    WITH CHECK (true);

-- 4. Enable Realtime on notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: error_logs → dev notification on critical/error
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    CREATE OR REPLACE FUNCTION fn_notify_on_critical_error()
    RETURNS TRIGGER LANGUAGE plpgsql AS $func$
    BEGIN
        IF NEW.level IN ('critical', 'error') THEN
            INSERT INTO notifications (target_role, type, title, body, link, source_id)
            VALUES (
                'dev',
                CASE WHEN NEW.level = 'critical' THEN 'critical_error' ELSE 'error_log' END,
                CASE
                    WHEN NEW.level = 'critical' THEN '🔴 Critical Error Detected'
                    ELSE '⚠️ Error Logged'
                END,
                left(NEW.message, 120),
                '/dev/support',
                NEW.id::text
            );
        END IF;
        RETURN NEW;
    END;
    $func$;

    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'error_logs'
    ) THEN
        DROP TRIGGER IF EXISTS trg_notify_critical_error ON error_logs;
        CREATE TRIGGER trg_notify_critical_error
            AFTER INSERT ON error_logs
            FOR EACH ROW EXECUTE FUNCTION fn_notify_on_critical_error();
    END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: audit_logs → dev notification on login_failed
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    CREATE OR REPLACE FUNCTION fn_notify_on_auth_failure()
    RETURNS TRIGGER LANGUAGE plpgsql AS $func$
    BEGIN
        IF NEW.action_name = 'login_failed' THEN
            INSERT INTO notifications (target_role, type, title, body, link, source_id)
            VALUES (
                'dev',
                'auth_failure',
                '🔐 Failed Login Attempt',
                'Failed login from: ' || COALESCE(NEW.ip_address, 'unknown IP'),
                '/dev/audit-logs',
                NEW.id::text
            );
        END IF;
        RETURN NEW;
    END;
    $func$;

    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'audit_logs'
    ) THEN
        DROP TRIGGER IF EXISTS trg_notify_auth_failure ON audit_logs;
        CREATE TRIGGER trg_notify_auth_failure
            AFTER INSERT ON audit_logs
            FOR EACH ROW EXECUTE FUNCTION fn_notify_on_auth_failure();
    END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: reward_redemptions → support notification on pending
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    CREATE OR REPLACE FUNCTION fn_notify_on_redemption_request()
    RETURNS TRIGGER LANGUAGE plpgsql AS $func$
    BEGIN
        IF NEW.status = 'pending' THEN
            INSERT INTO notifications (target_role, type, title, body, link, source_id)
            VALUES (
                'support',
                'redemption_request',
                '🎁 New Redemption Request',
                'A customer has submitted a new reward redemption request.',
                '/support/redemption-requests',
                NEW.id::text
            );
        END IF;
        RETURN NEW;
    END;
    $func$;

    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'reward_redemptions'
    ) THEN
        DROP TRIGGER IF EXISTS trg_notify_redemption_request ON reward_redemptions;
        CREATE TRIGGER trg_notify_redemption_request
            AFTER INSERT ON reward_redemptions
            FOR EACH ROW EXECUTE FUNCTION fn_notify_on_redemption_request();
    END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger: suspicious_loyalty_activities → support notification (conditional)
-- Only created if the table exists (not all deployments have this table yet)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
    -- Create the trigger function always (it's reusable if table is added later)
    CREATE OR REPLACE FUNCTION fn_notify_on_suspicious_activity()
    RETURNS TRIGGER LANGUAGE plpgsql AS $func$
    BEGIN
        INSERT INTO notifications (target_role, type, title, body, link, source_id)
        VALUES (
            'support',
            'suspicious_activity',
            '🚨 Suspicious Activity Detected',
            COALESCE(NEW.activity_type, 'A suspicious loyalty activity was flagged.'),
            '/support/tier-management',
            NEW.id::text
        );
        RETURN NEW;
    END;
    $func$;

    -- Only attach the trigger if the table exists
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'suspicious_loyalty_activities'
    ) THEN
        DROP TRIGGER IF EXISTS trg_notify_suspicious_activity ON suspicious_loyalty_activities;
        CREATE TRIGGER trg_notify_suspicious_activity
            AFTER INSERT ON suspicious_loyalty_activities
            FOR EACH ROW EXECUTE FUNCTION fn_notify_on_suspicious_activity();
    END IF;
END;
$$;

