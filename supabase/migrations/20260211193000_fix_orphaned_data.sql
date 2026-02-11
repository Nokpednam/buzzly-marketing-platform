-- Migration: Fix Orphaned Campaigns and Insights
-- Description: Assigns campaigns and ad_insights with NULL ad_account_id to the first active ad account.
-- This ensures RLS policies (which depend on ad_account_id -> team_id) allow users to see the data.

DO $$
DECLARE
    v_ad_account_id uuid;
    v_campaigns_updated integer;
    v_insights_updated integer;
BEGIN
    -- 1. Find the first active ad account to use as a fallback/default
    SELECT id INTO v_ad_account_id 
    FROM public.ad_accounts 
    WHERE is_active = true 
    ORDER BY created_at ASC 
    LIMIT 1;

    -- 2. Update orphaned campaigns and insights if a default account exists
    IF v_ad_account_id IS NOT NULL THEN
        
        -- Fix Campaigns
        UPDATE public.campaigns
        SET ad_account_id = v_ad_account_id
        WHERE ad_account_id IS NULL;
        
        GET DIAGNOSTICS v_campaigns_updated = ROW_COUNT;

        -- Fix Ad Insights (CRITICAL for Dashboard)
        UPDATE public.ad_insights
        SET ad_account_id = v_ad_account_id
        WHERE ad_account_id IS NULL;

        GET DIAGNOSTICS v_insights_updated = ROW_COUNT;
        
        RAISE NOTICE 'Fixed % campaigns and % insight records by assigning them to ad account %', v_campaigns_updated, v_insights_updated, v_ad_account_id;
    ELSE
        RAISE WARNING 'No active ad account found. Could not fix orphaned data.';
    END IF;
END $$;
