-- ============================================================================
-- Migration: Notification Preferences Integration
-- ============================================================================
-- Makes notification_preferences functional:
-- 1. RPC get_notification_preferences(user_id) for send logic
-- 2. workspace_notifications table for budget alerts & digests
-- 3. Budget alert trigger (respects push_notifications)
-- 4. RPC process_scheduled_reports_with_preferences (respects email_reports)
-- 5. RPC create_weekly_digest_notifications (respects weekly_digest)
-- ============================================================================

-- ─── 1. RPC: get_notification_preferences ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_notification_preferences(p_user_id uuid)
RETURNS TABLE (
  email_reports boolean,
  push_notifications boolean,
  weekly_digest boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    COALESCE(np.email_reports, true),
    COALESCE(np.push_notifications, true),
    COALESCE(np.weekly_digest, true)
  FROM notification_preferences np
  WHERE np.user_id = p_user_id
  UNION ALL
  SELECT true, true, true
  WHERE NOT EXISTS (SELECT 1 FROM notification_preferences WHERE user_id = p_user_id)
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_notification_preferences(uuid) IS
  'Returns notification preferences for a user. Defaults to all true if no row exists.';

-- ─── 2. workspace_notifications table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'budget_alert' | 'weekly_digest' | 'email_report_ready'
  title text NOT NULL,
  body text,
  link text,
  related_id uuid, -- budget_id, report_id, etc.
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_workspace_notifications_user_unread
  ON public.workspace_notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_workspace_notifications_workspace
  ON public.workspace_notifications(workspace_id);

ALTER TABLE public.workspace_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace notifications"
  ON public.workspace_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own workspace notifications (mark read)"
  ON public.workspace_notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Service/trigger needs to insert; use SECURITY DEFINER in functions

-- ─── 3. Budget alert trigger ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_notify_budget_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
  v_budget_name text;
  v_spend_pct numeric;
  v_member_rec record;
  v_prefs record;
BEGIN
  -- Only fire when spent_amount changes and crosses threshold
  IF NEW.spent_amount IS NULL OR NEW.amount IS NULL OR NEW.amount <= 0 THEN
    RETURN NEW;
  END IF;

  v_spend_pct := (NEW.spent_amount / NEW.amount) * 100;
  IF v_spend_pct < NEW.alert_threshold_percent THEN
    RETURN NEW;
  END IF;

  -- Avoid duplicate alerts: skip if we already notified this user for this budget recently (24h)
  IF EXISTS (
    SELECT 1 FROM workspace_notifications
    WHERE related_id = NEW.id
      AND type = 'budget_alert'
      AND created_at > now() - interval '24 hours'
  ) THEN
    RETURN NEW;
  END IF;

  v_workspace_id := NEW.team_id;
  v_budget_name := NEW.name;

  -- Notify workspace owner + members who have push_notifications enabled
  FOR v_member_rec IN
    SELECT owner_id AS uid FROM workspaces WHERE id = v_workspace_id
    UNION
    SELECT user_id AS uid FROM workspace_members
    WHERE team_id = v_workspace_id AND status = 'active'
  LOOP
    SELECT * INTO v_prefs FROM get_notification_preferences(v_member_rec.uid) LIMIT 1;
    IF v_prefs.push_notifications THEN
      INSERT INTO public.workspace_notifications (
        workspace_id, user_id, type, title, body, link, related_id
      ) VALUES (
        v_workspace_id,
        v_member_rec.uid,
        'budget_alert',
        'Budget alert: ' || v_budget_name,
        'Spend has reached ' || round(v_spend_pct, 1) || '% of budget (threshold: ' || NEW.alert_threshold_percent || '%).',
        '/settings',
        NEW.id
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_budget_alert ON public.budgets;
CREATE TRIGGER notify_on_budget_alert
  AFTER UPDATE OF spent_amount ON public.budgets
  FOR EACH ROW
  WHEN (
    OLD.spent_amount IS DISTINCT FROM NEW.spent_amount
    AND NEW.amount > 0
    AND (NEW.spent_amount / NEW.amount) * 100 >= NEW.alert_threshold_percent
  )
  EXECUTE FUNCTION public.fn_notify_budget_alert();

-- ─── 4. RPC: process_scheduled_reports_with_preferences ─────────────────────
-- Filters recipients by email_reports preference. Updates next_run_at.
-- Actual email sending would be done by Edge Function; this prepares the list.
CREATE OR REPLACE FUNCTION public.process_scheduled_reports_with_preferences()
RETURNS TABLE (
  report_id uuid,
  recipient_user_id uuid,
  recipient_email text,
  report_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec record;
  v_email text;
  v_user_id uuid;
  v_prefs record;
  v_recipients jsonb;
  v_next_run timestamptz;
BEGIN
  FOR v_rec IN
    SELECT sr.id, sr.team_id, sr.name, sr.frequency, sr.recipients, sr.next_run_at
    FROM scheduled_reports sr
    WHERE sr.is_active
      AND sr.next_run_at IS NOT NULL
      AND sr.next_run_at <= now()
  LOOP
    v_recipients := v_rec.recipients;
    IF jsonb_typeof(v_recipients) = 'array' THEN
      FOR v_email IN SELECT jsonb_array_elements_text(v_recipients)
      LOOP
        IF v_email IS NOT NULL AND trim(v_email) != '' THEN
          -- Resolve email to user_id (auth.users)
          SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;
          IF v_user_id IS NOT NULL THEN
            SELECT * INTO v_prefs FROM get_notification_preferences(v_user_id) LIMIT 1;
            IF v_prefs.email_reports THEN
              report_id := v_rec.id;
              recipient_user_id := v_user_id;
              recipient_email := v_email;
              report_name := v_rec.name;
              RETURN NEXT;
            END IF;
          END IF;
        END IF;
      END LOOP;
    END IF;

    -- Update next_run_at (compute next run from frequency)
    v_next_run := CASE v_rec.frequency
      WHEN 'daily' THEN now() + interval '1 day'
      WHEN 'weekly' THEN now() + interval '1 week'
      WHEN 'monthly' THEN now() + interval '1 month'
      ELSE now() + interval '1 week'
    END;

    UPDATE scheduled_reports
    SET last_run_at = now(), next_run_at = v_next_run, updated_at = now()
    WHERE id = v_rec.id;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.process_scheduled_reports_with_preferences() IS
  'Returns recipients (filtered by email_reports pref) for due scheduled reports. Call from cron/Edge Function.';

-- ─── 5. RPC: create_weekly_digest_notifications ───────────────────────────
-- Creates workspace_notifications for users with weekly_digest=true.
-- Call from pg_cron weekly (e.g. Monday 9am).
CREATE OR REPLACE FUNCTION public.create_weekly_digest_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int := 0;
  v_member_rec record;
  v_prefs record;
BEGIN
  FOR v_member_rec IN
    SELECT DISTINCT wm.user_id, wm.team_id
    FROM workspace_members wm
    WHERE wm.status = 'active'
    UNION
    SELECT w.owner_id, w.id FROM workspaces w
  LOOP
    SELECT * INTO v_prefs FROM get_notification_preferences(v_member_rec.user_id) LIMIT 1;
    IF v_prefs.weekly_digest THEN
      INSERT INTO public.workspace_notifications (
        workspace_id, user_id, type, title, body, link
      ) VALUES (
        v_member_rec.team_id,
        v_member_rec.user_id,
        'weekly_digest',
        'Weekly Performance Digest',
        'Your weekly analytics summary is ready. View your reports and growth metrics.',
        '/reports'
      );
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.create_weekly_digest_notifications() IS
  'Creates weekly digest notifications for users with weekly_digest=true. Run via pg_cron weekly.';

-- Optional: pg_cron schedule for weekly digest (if pg_cron is enabled)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'weekly-digest-notifications',
      '0 9 * * 1',  -- Monday 9am
      $cron$ SELECT create_weekly_digest_notifications(); $cron$
    );
    RAISE NOTICE 'pg_cron: weekly-digest-notifications scheduled.';
  ELSE
    RAISE NOTICE 'pg_cron not installed — weekly digest not scheduled.';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron schedule failed (job may already exist): %', SQLERRM;
END;
$$;
