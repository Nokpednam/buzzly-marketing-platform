-- Add RLS policy to allow everyone to read subscription_plans
CREATE POLICY "Anyone can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

-- Add RLS policy to allow everyone to read payment_methods
CREATE POLICY "Anyone can view payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (true);

-- Add RLS policy to allow everyone to read currencies
CREATE POLICY "Anyone can view currencies" 
ON public.currencies 
FOR SELECT 
USING (true);