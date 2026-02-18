-- Add unique constraint to user_id in profile_customers table
-- This is required for ON CONFLICT (user_id) clause in handle_new_user trigger

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profile_customers_user_id_key'
    ) THEN
        ALTER TABLE public.profile_customers 
        ADD CONSTRAINT profile_customers_user_id_key UNIQUE (user_id);
    END IF;
END $$;
