-- ============================================================
-- Fix: Sync Last Active Date for Employees
-- Current Issue: employees_profile.last_active is not updated on login
-- Solution: Backfill data from auth.users and create trigger for future updates
-- ============================================================

-- 1. Backfill existing data
-- Update employees_profile.last_active using auth.users.last_sign_in_at
UPDATE public.employees_profile ep
SET last_active = au.last_sign_in_at
FROM public.employees e
JOIN auth.users au ON e.user_id = au.id
WHERE ep.employees_id = e.id
AND au.last_sign_in_at IS NOT NULL;

-- 2. Create function to sync last_active on sign in
CREATE OR REPLACE FUNCTION public.handle_user_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the last_active timestamp in employees_profile
  -- We link auth.users -> employees -> employees_profile
  UPDATE public.employees_profile
  SET last_active = NEW.last_sign_in_at,
      updated_at = NOW()
  FROM public.employees
  WHERE public.employees.id = public.employees_profile.employees_id
  AND public.employees.user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;

CREATE TRIGGER on_auth_user_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_sign_in();
