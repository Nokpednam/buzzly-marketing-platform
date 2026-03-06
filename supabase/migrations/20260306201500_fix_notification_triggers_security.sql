-- ============================================================================
-- Migration: Fix Notification Triggers Security Definer
-- ============================================================================
-- Description: Updates the notification trigger functions to run as 
-- SECURITY DEFINER so they can successfully insert into the notifications 
-- table, bypassing the table's Row Level Security which normally blocks it.
-- ============================================================================

BEGIN;

-- 1. Trigger: error_logs → dev notification
CREATE OR REPLACE FUNCTION public.fn_notify_on_critical_error()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
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

-- 2. Trigger: audit_logs → dev notification on login_failed
CREATE OR REPLACE FUNCTION public.fn_notify_on_login_failure()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
    IF NEW.action = 'login_failed' THEN
        INSERT INTO notifications (target_role, type, title, body, link, source_id)
        VALUES (
            'dev',
            'security_alert',
            '🛑 Repeated Login Failures',
            'Multiple failed login attempts detected for ' || COALESCE(NEW.user_email, 'unknown user'),
            '/dev/support',
            NEW.id::text
        );
    END IF;
    RETURN NEW;
END;
$func$;

-- 3. Trigger: reward_redemptions → support/dev notification
CREATE OR REPLACE FUNCTION public.fn_notify_on_reward_redemption()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
    IF NEW.status = 'pending' THEN
        INSERT INTO notifications (target_role, type, title, body, link, source_id)
        VALUES (
            'support',
            'reward_redemption',
            '🎁 New Reward Redemption Request',
            'A customer has requested to redeem a reward. Action required.',
            '/support/rewards',
            NEW.id::text
        );
    END IF;
    RETURN NEW;
END;
$func$;

-- 4. Trigger: suspicious_loyalty_activities → dev notification
CREATE OR REPLACE FUNCTION public.fn_notify_on_suspicious_activity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
    INSERT INTO notifications (target_role, type, title, body, link, source_id)
    VALUES (
        'dev',
        'suspicious_activity',
        '🚨 Suspicious Loyalty Activity',
        'Suspicious point transaction detected ("' || COALESCE(NEW.reason, 'Unknown') || '").',
        '/dev/support',
        NEW.id::text
    );
    RETURN NEW;
END;
$func$;

COMMIT;
