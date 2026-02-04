-- Update handle_new_user function to set plan_type = 'free' by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  -- Create profile with free plan by default
  insert into public.profiles (id, email, full_name, plan_type)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'free');
  
  return new;
end;
$$;