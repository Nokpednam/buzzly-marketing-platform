-- Remove default plan so new users start with no plan and must choose one
ALTER TABLE public.profiles
ALTER COLUMN plan_type DROP DEFAULT;