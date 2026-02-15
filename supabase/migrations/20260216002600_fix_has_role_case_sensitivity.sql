-- Fix RLS Policies for Admin Employee Visibility
-- Problem: has_role() is case-sensitive, causing admins to only see themselves

-- Update has_role function to be case-insensitive
CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.role_employees re
    JOIN public.employees e ON e.role_employees_id = re.id
    WHERE e.user_id = _user_id
    AND e.status = 'active'
    AND e.approval_status = 'approved'
    AND LOWER(re.role_name) = LOWER(_role)  -- Case-insensitive comparison
  );
END;
$$;

-- Verify the function works
SELECT 
  auth.uid() as current_user,
  public.has_role(auth.uid(), 'admin') as is_admin_lowercase,
  public.has_role(auth.uid(), 'Admin') as is_admin_capitalized,
  public.has_role(auth.uid(), 'owner') as is_owner;
