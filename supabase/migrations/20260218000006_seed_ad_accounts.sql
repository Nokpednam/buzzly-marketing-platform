-- Migration: Seed Ad Accounts for All Teams
-- Description: Ensures every team has at least one ad account for testing/verification.

DO $$
DECLARE
    r RECORD;
    fb_id UUID;
    gg_id UUID;
BEGIN
    -- Get Platform IDs
    SELECT id INTO fb_id FROM public.platforms WHERE slug = 'facebook' LIMIT 1;
    SELECT id INTO gg_id FROM public.platforms WHERE slug = 'google' LIMIT 1;

    -- Iterate over all teams
    FOR r IN SELECT id, name FROM public.teams LOOP
        
        -- Check if team has any ad account
        IF NOT EXISTS (SELECT 1 FROM public.ad_accounts WHERE team_id = r.id) THEN
            
            -- Create Facebook Ad Account
            IF fb_id IS NOT NULL THEN
                INSERT INTO public.ad_accounts (id, team_id, platform_id, account_name, is_active)
                VALUES (
                    gen_random_uuid(), 
                    r.id, 
                    fb_id, 
                    r.name || ' - FB Ads', 
                    true
                );
            END IF;

            -- Create Google Ad Account (for variety)
            IF gg_id IS NOT NULL THEN
                 INSERT INTO public.ad_accounts (id, team_id, platform_id, account_name, is_active)
                VALUES (
                    gen_random_uuid(), 
                    r.id, 
                    gg_id, 
                    r.name || ' - Google Ads', 
                    true
                );
            END IF;
            
            RAISE NOTICE 'Seeded ad accounts for team: %', r.name;
        END IF;
        
    END LOOP;
END $$;
