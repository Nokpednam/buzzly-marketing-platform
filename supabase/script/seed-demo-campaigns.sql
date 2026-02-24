-- Fix: Seed some demo campaigns linked to the current user's ad_accounts
-- Run this in Supabase Studio → SQL Editor

DO $$
DECLARE
  v_account RECORD;
  v_campaign_count INT;
BEGIN
  -- Loop through all active ad_accounts for all workspaces
  FOR v_account IN 
    SELECT aa.id as ad_account_id, aa.account_name, w.owner_id
    FROM public.ad_accounts aa
    JOIN public.workspaces w ON w.id = aa.team_id
    WHERE aa.is_active = true
  LOOP
    -- Count how many campaigns already exist for this account
    SELECT COUNT(*) INTO v_campaign_count
    FROM public.campaigns
    WHERE ad_account_id = v_account.ad_account_id;

    -- Only seed if account has no campaigns
    IF v_campaign_count = 0 THEN
      INSERT INTO public.campaigns (ad_account_id, name, status, objective, budget_amount, start_date, end_date)
      VALUES
        (v_account.ad_account_id, v_account.account_name || ' - Q1 Brand Awareness', 'active', 'Awareness', 15000, NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days'),
        (v_account.ad_account_id, v_account.account_name || ' - Conversion Push', 'active', 'Conversions', 8000, NOW() - INTERVAL '14 days', NOW() + INTERVAL '14 days'),
        (v_account.ad_account_id, v_account.account_name || ' - Retargeting', 'draft', 'Retargeting', 3000, NULL, NULL);

      RAISE NOTICE 'Seeded 3 campaigns for ad_account: %', v_account.account_name;
    ELSE
      RAISE NOTICE 'Skipped ad_account % - already has % campaigns', v_account.account_name, v_campaign_count;
    END IF;
  END LOOP;

  RAISE NOTICE 'Done! Campaign seed complete.';
END;
$$;

-- Verify result
SELECT c.name, c.status, aa.account_name, w.id as workspace_id
FROM public.campaigns c
JOIN public.ad_accounts aa ON aa.id = c.ad_account_id
JOIN public.workspaces w ON w.id = aa.team_id
ORDER BY c.created_at DESC
LIMIT 20;
