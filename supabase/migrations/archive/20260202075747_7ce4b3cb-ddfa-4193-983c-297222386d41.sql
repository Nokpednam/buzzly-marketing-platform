-- Add salary_range column to profile_customers table
ALTER TABLE public.profile_customers 
ADD COLUMN IF NOT EXISTS salary_range VARCHAR(100) NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profile_customers.salary_range IS 'User salary range selection from signup form';