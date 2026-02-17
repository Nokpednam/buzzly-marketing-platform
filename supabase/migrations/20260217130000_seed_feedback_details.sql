
DO $$
DECLARE
    v_user_id uuid;
    v_workspace_id uuid;
    v_business_type_id uuid;
    v_profile_id uuid;
    v_rating_5 uuid;
    v_rating_4 uuid;
BEGIN
    -- 1. Get a User ID (Try to find an existing one linked to auth, or just any UUID if strict FK not enforced on public tables)
    -- Ideally we want a real auth user if we want them to login, but for just showing data:
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    -- If no user found (unlikely if someone is logged in), fallback to a generated one for data display purposes 
    -- (Warning: this might fail if foreign key to auth.users is strict and row doesn't exist. 
    --  But typically profile_customers.user_id FK is to auth.users)
    
    IF v_user_id IS NOT NULL THEN
        
        -- 2. Ensure Profile exists
        SELECT id INTO v_profile_id FROM public.profile_customers WHERE user_id = v_user_id;
        IF v_profile_id IS NULL THEN
            INSERT INTO public.profile_customers (user_id, first_name, last_name, profile_img)
            VALUES (v_user_id, 'Alex', 'Founder', 'https://github.com/shadcn.png')
            RETURNING id INTO v_profile_id;
        ELSE
            -- Update existing profile if fields are empty
             UPDATE public.profile_customers 
             SET first_name = COALESCE(first_name, 'Alex'),
                 last_name = COALESCE(last_name, 'Founder'),
                 profile_img = COALESCE(profile_img, 'https://github.com/shadcn.png')
             WHERE id = v_profile_id;
        END IF;

        -- 3. Get existing Business Type (Do not insert new one as per user request)
        SELECT id INTO v_business_type_id FROM public.business_types LIMIT 1;
        
        -- If no business type exists, we can't link it, but we can still proceed with other data.
        -- Ideally the system should have seeded types.

        -- 4. Ensure Workspace exists (Use existing or create if needed, but linking to found business type)
        SELECT id INTO v_workspace_id FROM public.workspaces WHERE workspace_name = 'Buzzly HQ' LIMIT 1;
        
        IF v_workspace_id IS NULL THEN
             -- Only insert if we have a business type, otherwise we might fail FK constraints if not nullable
             -- Checking schema is hard here dynamically, so let's try to insert if we have a type, 
             -- or just pick ANY workspace if one exists.
             
             IF v_business_type_id IS NOT NULL THEN
                INSERT INTO public.workspaces (workspace_name, business_type_id, status)
                VALUES ('Buzzly HQ', v_business_type_id, 'active')
                RETURNING id INTO v_workspace_id;
             ELSE
                 -- Try to find ANY workspace
                 SELECT id INTO v_workspace_id FROM public.workspaces LIMIT 1;
             END IF;
        ELSE
            -- Update existing workspace to link to business type if it has none
            IF v_business_type_id IS NOT NULL THEN
               UPDATE public.workspaces 
               SET business_type_id = v_business_type_id 
               WHERE id = v_workspace_id AND business_type_id IS NULL;
            END IF;
        END IF;

        -- 5. Ensure Workspace Member exists
        IF NOT EXISTS (SELECT 1 FROM public.workspace_members WHERE user_id = v_user_id AND workspace_id = v_workspace_id) THEN
            INSERT INTO public.workspace_members (user_id, workspace_id, status) 
            VALUES (v_user_id, v_workspace_id, 'active');
        END IF;

        -- 6. Update/Insert Feedback
        -- Get Ratings
        SELECT id INTO v_rating_5 FROM public.rating WHERE name = 'Excellent' LIMIT 1;
        SELECT id INTO v_rating_4 FROM public.rating WHERE name = 'Good' LIMIT 1;

        -- Create customer activity link
        DECLARE
           v_act_id uuid;
        BEGIN
           SELECT id INTO v_act_id FROM public.customer_activities WHERE profile_customer_id = v_profile_id LIMIT 1;
           IF v_act_id IS NULL THEN
              INSERT INTO public.customer_activities (profile_customer_id, created_at) VALUES (v_profile_id, now()) RETURNING id INTO v_act_id;
           END IF;

           -- Update existing feedback to point to this user/activity
           UPDATE public.feedback 
           SET user_id = v_user_id,
               customer_activities_id = v_act_id
           WHERE user_id IS NULL OR customer_activities_id IS NULL;
           
           -- Insert one new specific comment to test
           INSERT INTO public.feedback (rating_id, comment, user_id, customer_activities_id, created_at)
           VALUES (
             v_rating_5, 
             'I really love the new Comments Tab! It gives so much context.',
             v_user_id,
             v_act_id,
             now()
           );
        END;
        
    END IF;
END $$;
