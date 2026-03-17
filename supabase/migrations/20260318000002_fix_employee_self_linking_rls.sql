-- ============================================================
-- Fix: Allow Self-Linking for Re-registered Employees
-- Timestamp: 20260318000002
--
-- Problem:
--   When an employee is deleted by an admin and then re-invited,
--   their Supabase Auth account often still exists. When they log in,
--   the app fails to find their employee record because the new
--   record has user_id=NULL, and RLS blocks them from seeing or
--   updating any record that doesn't already have their user_id.
--
-- Fix:
--   Add RLS policies to allow an authenticated user to claim an
--   unlinked employee record that matches their email.
-- ============================================================

-- 1. Allow authenticated users to SEE unlinked employee records with their email
DROP POLICY IF EXISTS "Allow users to see their unlinked employee record" ON public.employees;
CREATE POLICY "Allow users to see their unlinked employee record"
  ON public.employees FOR SELECT
  TO authenticated
  USING (
    user_id IS NULL 
    AND email = (auth.jwt() ->> 'email')
  );

-- 2. Allow authenticated users to LINK their user_id to an unlinked record with their email
DROP POLICY IF EXISTS "Allow users to link themselves to employee record" ON public.employees;
CREATE POLICY "Allow users to link themselves to employee record"
  ON public.employees FOR UPDATE
  TO authenticated
  USING (
    user_id IS NULL 
    AND email = (auth.jwt() ->> 'email')
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- 3. Trigger to auto-link user_id if an auth user with this email already exists
CREATE OR REPLACE FUNCTION public.auto_link_employee_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Only try to link if user_id is not already provided
    IF NEW.user_id IS NULL THEN
        SELECT id INTO NEW.user_id
        FROM auth.users
        WHERE email = NEW.email
        LIMIT 1;
        
        IF NEW.user_id IS NOT NULL THEN
            RAISE NOTICE 'Auto-linked existing auth user % to new employee record for %', NEW.user_id, NEW.email;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_link_employee_on_insert ON public.employees;
CREATE TRIGGER trigger_auto_link_employee_on_insert
    BEFORE INSERT ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_link_employee_on_insert();
