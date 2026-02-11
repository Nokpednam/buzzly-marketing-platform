-- Migration: Fix Campaigns with NULL ad_account_id
-- Description: Assigns all campaigns with no ad account to the first active ad account found.

DO $$
DECLARE
    v_ad_account_id uuid;
    v_rows_updated integer;
BEGIN
    -- 1. Find the first active ad account (prioritize Facebook or Google if available, but take any)
    SELECT id INTO v_ad_account_id 
    FROM public.ad_accounts 
    WHERE is_active = true 
    ORDER BY created_at ASC 
    LIMIT 1;

    -- 2. If an account exists, update the orphaned campaigns
    IF v_ad_account_id IS NOT NULL THEN
        UPDATE public.campaigns
        SET ad_account_id = v_ad_account_id
        WHERE ad_account_id IS NULL;
        
        GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
        
        RAISE NOTICE 'Fixed % campaigns by assigning them to ad account %', v_rows_updated, v_ad_account_id;
    ELSE
        RAISE WARNING 'No active ad account found in public.ad_accounts. Campaigns could not be fixed.';
    END IF;
END $$;
