-- ============================================================
-- Script to Sync Customer Plan Type with Active Subscriptions
-- ============================================================

DO $$
DECLARE
    r RECORD;
    active_sub RECORD;
    plan_slug text;
BEGIN
    -- Loop through all customers
    FOR r IN SELECT * FROM public.customer LOOP
        
        -- Find the ACTIVE subscription for this user
        SELECT s.id, p.slug 
        INTO active_sub
        FROM public.subscriptions s
        JOIN public.subscription_plans p ON s.plan_id = p.id
        WHERE s.user_id = r.id 
          AND s.status = 'active'
        LIMIT 1;

        -- If an active subscription exists, update the customer table to match
        IF active_sub.slug IS NOT NULL THEN
            IF r.plan_type != active_sub.slug THEN
                UPDATE public.customer
                SET plan_type = active_sub.slug,
                    updated_at = NOW()
                WHERE id = r.id;
                
                RAISE NOTICE 'Updated user % from % to %', r.email, r.plan_type, active_sub.slug;
            END IF;
        ELSE
            -- If NO active subscription exists, ensure they are 'free' (optional, but good for consistency)
            IF r.plan_type != 'free' THEN
                 -- Optional: You might want to leave it if it's a legacy state, but typically "no sub" = "free"
                 -- For now, let's only update if we found a specific active plan.
                 NULL;
            END IF;
        END IF;

    END LOOP;
    
    RAISE NOTICE 'Plan sync completed successfully!';
END $$;
