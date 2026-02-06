-- Drop existing restrictive RLS policies on prospects
DROP POLICY IF EXISTS "Admins can view all prospects" ON public.prospects;
DROP POLICY IF EXISTS "Admins can insert prospects" ON public.prospects;
DROP POLICY IF EXISTS "Admins can update prospects" ON public.prospects;
DROP POLICY IF EXISTS "Admins can delete prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can view their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can insert their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can update their own prospects" ON public.prospects;
DROP POLICY IF EXISTS "Users can delete their own prospects" ON public.prospects;
-- Create new RLS policies for prospects table to allow customers to manage their own prospects
CREATE POLICY "Users can view their own prospects"
ON public.prospects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prospects"
ON public.prospects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospects"
ON public.prospects
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospects"
ON public.prospects
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can still view all prospects
CREATE POLICY "Admins can view all prospects"
ON public.prospects
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- Create customer_insights table to track Buzzly app users (our prospects)
CREATE TABLE public.customer_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profession text NOT NULL,
  company text NOT NULL,
  salary_range text NOT NULL,
  num_employees text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on customer_insights
ALTER TABLE public.customer_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for customer_insights
CREATE POLICY "Users can insert their own insights"
ON public.customer_insights
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own insights"
ON public.customer_insights
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
ON public.customer_insights
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all customer insights"
ON public.customer_insights
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'owner'::app_role));

-- Create trigger for updating updated_at on customer_insights
CREATE TRIGGER update_customer_insights_updated_at
BEFORE UPDATE ON public.customer_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();