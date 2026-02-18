-- FUTURE: Clean RLS Setup (Use when ready for production)
-- For now, RLS is disabled. Apply this when you need security.

BEGIN;

-- 1. Clear ALL existing policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public' 
              AND tablename IN ('ad_insights', 'campaigns', 'ad_accounts', 'teams', 'team_members'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 2. Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_insights ENABLE ROW LEVEL SECURITY;

-- 3. Create SIMPLE, working policies

-- Teams: You can see teams you own or are a member of
CREATE POLICY "teams_policy" ON public.teams FOR ALL TO authenticated
USING (owner_id = auth.uid());

-- Team Members: You can see your own membership
CREATE POLICY "team_members_policy" ON public.team_members FOR ALL TO authenticated
USING (user_id = auth.uid());

-- Ad Accounts: You can see accounts from teams you own
CREATE POLICY "ad_accounts_policy" ON public.ad_accounts FOR ALL TO authenticated
USING (team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid()));

-- Campaigns: You can see campaigns from your ad accounts
CREATE POLICY "campaigns_policy" ON public.campaigns FOR ALL TO authenticated
USING (ad_account_id IN (SELECT id FROM public.ad_accounts WHERE team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())));

-- Insights: You can see insights from your ad accounts
CREATE POLICY "insights_policy" ON public.ad_insights FOR ALL TO authenticated
USING (ad_account_id IN (SELECT id FROM public.ad_accounts WHERE team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())));

COMMIT;
