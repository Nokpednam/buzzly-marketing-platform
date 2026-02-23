-- Migration to add a text-based gender column to profile_customers
-- This allows storing simple text values like 'male', 'female', 'other' instead of requiring a UUID linking to a separate table.

ALTER TABLE public.profile_customers 
ADD COLUMN IF NOT EXISTS gender VARCHAR(50);

-- Note: birthday_at (DATE) already exists in profile_customers.
