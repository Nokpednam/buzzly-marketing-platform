-- ============================================================
-- Fix missing first_name and last_name in profile_customers
-- This issue happens during initial mock seeding where raw_user_meta_data
-- might not be processed correctly by the trigger due to ON CONFLICT rules.
-- ============================================================

DO $$
DECLARE
    r RECORD;
    v_first_name text;
    v_last_name text;
BEGIN
    FOR r IN SELECT id, full_name, email FROM public.customer LOOP
        -- Split full_name into first and last
        v_first_name := split_part(r.full_name, ' ', 1);
        v_last_name := right(r.full_name, GREATEST(0, length(r.full_name) - length(v_first_name) - 1));
        
        -- Fallback to email if empty
        IF trim(v_first_name) = '' THEN
            v_first_name := split_part(r.email, '@', 1);
            v_last_name := '';
        END IF;

        -- Update any blank profile_customers records
        UPDATE public.profile_customers
        SET first_name = nullif(trim(v_first_name), ''),
            last_name = nullif(trim(v_last_name), ''),
            updated_at = NOW()
        WHERE user_id = r.id
          AND (first_name IS NULL OR first_name = '');
          
    END LOOP;
END $$;
