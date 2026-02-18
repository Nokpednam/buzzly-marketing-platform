-- Fix 1: Restrict error_logs INSERT to authenticated users only
DROP POLICY IF EXISTS "Anyone can insert error logs" ON public.error_logs;

CREATE POLICY "Authenticated users can insert error logs"
  ON public.error_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix 2: Update function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;