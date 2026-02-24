-- Fix: Link existing campaigns to current user's workspace via ad_accounts
-- Run this in Supabase Studio SQL Editor

-- Step 1: See what we have
SELECT 
  u.email,
  w.id as workspace_id,
  aa.id as ad_account_id,
  aa.account_name,
  COUNT(c.id) as campaign_count
FROM auth.users u
LEFT JOIN public.workspaces w ON w.owner_id = u.id
LEFT JOIN public.ad_accounts aa ON aa.team_id = w.id
LEFT JOIN public.campaigns c ON c.ad_account_id = aa.id
GROUP BY u.email, w.id, aa.id, aa.account_name
ORDER BY u.email;
