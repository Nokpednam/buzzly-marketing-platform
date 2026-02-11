-- DEBUG MIGRATION: DISABLE RLS
-- This script turns off security checks for the dashboard tables.
-- Use this ONLY to verify if data exists. If data appears after running this, the issue is definitely RLS policies.

BEGIN;

-- Disable RLS on core dashboard tables
ALTER TABLE public.ad_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;

-- Log the action
DO $$
BEGIN
    RAISE WARNING 'RLS has been DISABLED for ad_insights, campaigns, and ad_accounts. All users can see all data.';
END $$;

COMMIT;
