-- Add unique constraint on email first
ALTER TABLE public.employees ADD CONSTRAINT employees_email_key UNIQUE (email);

-- Add unique constraint on user_id
ALTER TABLE public.employees ADD CONSTRAINT employees_user_id_key UNIQUE (user_id);