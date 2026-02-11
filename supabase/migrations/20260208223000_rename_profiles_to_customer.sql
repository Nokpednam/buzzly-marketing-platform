-- Rename table profiles to customer
-- This migration renames the profiles table to better reflect its purpose
-- The profiles table is used exclusively for customer role, not for all roles
-- Admin and owner roles use the employees/employees_profile tables

-- Step 1: Rename the table
ALTER TABLE public.profiles RENAME TO customer;

-- Step 2: Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.customer;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.customer;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.customer;
DROP POLICY IF EXISTS "Users can update own profile" ON public.customer;
DROP POLICY IF EXISTS "Prevent manual profile creation" ON public.customer;
DROP POLICY IF EXISTS "Prevent profile deletion" ON public.customer;

-- Step 3: Create new RLS policies with updated names
CREATE POLICY "Users can view own customer"
  ON public.customer FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all customers"
  ON public.customer FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Admins can update customers"
  ON public.customer FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Users can update own customer"
  ON public.customer FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Prevent manual customer creation"
  ON public.customer FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Prevent customer deletion"
  ON public.customer FOR DELETE
  TO authenticated
  USING (false);

-- Step 4: Update triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.customer;

CREATE TRIGGER update_customer_updated_at
  BEFORE UPDATE ON public.customer
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Step 5: Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
BEGIN
    -- Common profile creation for all users
    INSERT INTO public.customer (id, email, full_name, plan_type)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'free')
    ON CONFLICT (id) DO NOTHING;

    -- Check if it's an employee signup
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
        -- Create employee record
        INSERT INTO public.employees (
            user_id, 
            email, 
            status, 
            approval_status,
            role_employees_id
        )
        VALUES (
            new.id, 
            new.email, 
            'active', 
            'pending', -- Pending approval
            NULL       -- Role will be assigned by Admin
        )
        RETURNING id INTO new_employee_id;

        -- Create employee profile if employee record was created
        IF new_employee_id IS NOT NULL THEN
            INSERT INTO public.employees_profile (
                employees_id,
                first_name,
                last_name,
                aptitude,
                birthday_at
            )
            VALUES (
                new_employee_id,
                new.raw_user_meta_data->>'first_name',
                new.raw_user_meta_data->>'last_name',
                new.raw_user_meta_data->>'aptitude',
                CASE 
                    WHEN new.raw_user_meta_data->>'birthday' IS NOT NULL 
                    AND new.raw_user_meta_data->>'birthday' != '' 
                    THEN (new.raw_user_meta_data->>'birthday')::date
                    ELSE NULL
                END
            );
        END IF;

    ELSE
        -- Default customer flow (existing logic)
        INSERT INTO public.profile_customers (user_id, first_name, last_name, display_name)
        VALUES (
            new.id,
            new.raw_user_meta_data->>'first_name',
            new.raw_user_meta_data->>'last_name',
            COALESCE(new.raw_user_meta_data->>'full_name', new.email)
        );
    END IF;
    
    RETURN new;
END;
$$;

-- Note: PostgreSQL automatically updates foreign key constraints when renaming tables
-- so user_payment_methods and other tables referencing profiles will still work
