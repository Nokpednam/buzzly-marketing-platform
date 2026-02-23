-- Drop the unused gender_id column from profile_customers
ALTER TABLE public.profile_customers
DROP COLUMN IF EXISTS gender_id;
