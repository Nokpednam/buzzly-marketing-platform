
-- Backfill team_id for Ads and Ad Groups to ensure RLS works correctly
-- Using campaign_ads and ad_accounts as sources of truth

-- 1. Backfill ads team_id from campaigns (via campaign_ads)
UPDATE public.ads a
SET team_id = c.team_id
FROM public.campaign_ads ca
JOIN public.campaigns c ON c.id = ca.campaign_id
WHERE a.id = ca.ad_id
AND a.team_id IS NULL 
AND c.team_id IS NOT NULL;

-- 2. Backfill ad_groups team_id from ads
UPDATE public.ad_groups ag
SET team_id = a.team_id
FROM public.ads a
WHERE ag.id = a.ad_group_id
AND ag.team_id IS NULL
AND a.team_id IS NOT NULL;

-- 3. Backfill any remaining ads from their ad_groups (just in case)
UPDATE public.ads a
SET team_id = ag.team_id
FROM public.ad_groups ag
WHERE a.ad_group_id = ag.id
AND a.team_id IS NULL
AND ag.team_id IS NOT NULL;

-- 4. Final check for ads that might be orphaned but belong to a workspace via ad_groups/accounts
-- If an ad is in an ad_group, and that ad_group is used in a campaign, it should have a team_id.
