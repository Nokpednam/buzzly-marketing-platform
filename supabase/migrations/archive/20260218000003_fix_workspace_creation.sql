-- Migration: Fix Workspace Creation
-- Description: Updates handle_new_user to create a default team and member record for new users.
--              Also backfills missing team_members for existing users who are owners of a team.

-- 1. Update handle_new_user to create Team and Team Member
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
    _gender_id uuid;
    new_team_id uuid;
    new_customer_id uuid;
BEGIN
    -- Log the trigger execution
    RAISE NOTICE 'handle_new_user trigger fired for user: %', new.email;

    -- ==================================================
    -- 1. Check if this is an Employee Signup
    -- ==================================================
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        RAISE NOTICE 'Employee signup detected for: %', new.email;
        
        BEGIN
            -- A. Create Employee Record
            INSERT INTO public.employees (
                user_id, 
                email, 
                status, 
                approval_status,
                role_employees_id
            )
            VALUES (
                new.id, 
                new.email, 
                'active', 
                'pending',
                (SELECT id FROM public.role_employees WHERE LOWER(role_name) = 'admin' LIMIT 1)
            )
            ON CONFLICT (user_id) DO UPDATE
            SET email = EXCLUDED.email,
                updated_at = NOW()
            RETURNING id INTO new_employee_id;
            
            -- B. Create Employee Profile
            IF new_employee_id IS NOT NULL THEN
                INSERT INTO public.employees_profile (
                    employees_id,
                    first_name,
                    last_name,
                    aptitude,
                    birthday_at
                )
                VALUES (
                    new_employee_id,
                    new.raw_user_meta_data->>'first_name',
                    new.raw_user_meta_data->>'last_name',
                    new.raw_user_meta_data->>'aptitude',
                    CASE 
                        WHEN new.raw_user_meta_data->>'birthday' IS NOT NULL 
                        AND new.raw_user_meta_data->>'birthday' != '' 
                        THEN (new.raw_user_meta_data->>'birthday')::date
                        ELSE NULL
                    END
                )
                ON CONFLICT (employees_id) DO UPDATE
                SET first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    updated_at = NOW();
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating employee record: %', SQLERRM;
        END;
        
    ELSE
        -- ==================================================
        -- 2. Customer Signup Flow
        -- ==================================================
        RAISE NOTICE 'Customer signup detected for: %', new.email;
        
        -- A. Create Customer Record (Fixed Schema)
        BEGIN
            INSERT INTO public.customer (
                id,
                email,
                full_name,
                plan_type
            )
            VALUES (
                new.id,
                new.email,
                COALESCE(
                    new.raw_user_meta_data->>'full_name',
                    (new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name'),
                    new.email
                ),
                'free'
            )
            ON CONFLICT (id) DO UPDATE
            SET email = EXCLUDED.email,
                full_name = EXCLUDED.full_name,
                updated_at = NOW()
            RETURNING id INTO new_customer_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating customer record: %', SQLERRM;
        END;
        
        -- B. Create Customer Profile
        BEGIN
            -- Safe cast for gender_id
            BEGIN
                _gender_id := (new.raw_user_meta_data->>'gender_id')::uuid;
            EXCEPTION WHEN OTHERS THEN
                _gender_id := NULL;
            END;

            INSERT INTO public.profile_customers (
                user_id,
                first_name,
                last_name,
                display_name,
                phone,
                gender_id,
                salary_range
            )
            VALUES (
                new.id,
                new.raw_user_meta_data->>'first_name',
                new.raw_user_meta_data->>'last_name',
                COALESCE(new.raw_user_meta_data->>'full_name', new.email),
                new.raw_user_meta_data->>'phone',
                _gender_id,
                new.raw_user_meta_data->>'salary_range'
            )
            ON CONFLICT (user_id) DO UPDATE
            SET first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                updated_at = NOW();
        EXCEPTION WHEN OTHERS THEN
             RAISE WARNING 'Error creating profile_customers: %', SQLERRM;
        END;

        -- C. Create Default Team (Workspace) and Member
        BEGIN
            -- 1. Create Team
            INSERT INTO public.teams (
                name, 
                owner_id,
                description
            )
            VALUES (
                COALESCE(new.raw_user_meta_data->>'company_name', 'My Workspace'), 
                new.id,
                'Default workspace for ' || new.email
            )
            RETURNING id INTO new_team_id;

            -- 2. Add as Team Member (Owner)
            IF new_team_id IS NOT NULL THEN
                INSERT INTO public.team_members (
                    team_id,
                    user_id,
                    role,
                    status
                )
                VALUES (
                    new_team_id,
                    new.id,
                    'owner',
                    'active'
                );
                
                RAISE NOTICE 'Created default team % and added user % as owner', new_team_id, new.id;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error creating default team: %', SQLERRM;
        END;
            
    END IF;
    
    RETURN new;
END;
$$;


-- 2. Backfill: Fix existing users who own a team but are not in team_members
DO $$
DECLARE
    r RECORD;
    v_count INT := 0;
BEGIN
    FOR r IN 
        SELECT t.id as team_id, t.owner_id 
        FROM public.teams t
        LEFT JOIN public.team_members tm ON t.id = tm.team_id AND t.owner_id = tm.user_id
        WHERE tm.id IS NULL
    LOOP
        INSERT INTO public.team_members (team_id, user_id, role, status)
        VALUES (r.team_id, r.owner_id, 'owner', 'active')
        ON CONFLICT (team_id, user_id) DO NOTHING;
        
        v_count := v_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Backfilled % missing team memberships', v_count;
END $$;
