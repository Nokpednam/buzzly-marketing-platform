-- =====================================================
-- 1. Add unique constraint on role_name and missing columns
-- =====================================================
ALTER TABLE public.role_employees 
ADD COLUMN IF NOT EXISTS permission_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add unique constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'role_employees_role_name_key'
    ) THEN
        ALTER TABLE public.role_employees ADD CONSTRAINT role_employees_role_name_key UNIQUE (role_name);
    END IF;
END $$;

-- Delete existing roles and insert fresh ones
DELETE FROM public.role_employees WHERE role_name IN ('owner', 'admin', 'support', 'developer');

INSERT INTO public.role_employees (role_name, description, permission_level) VALUES
    ('owner', 'เจ้าของ Buzzly - สิทธิ์สูงสุด ดูข้อมูล Business Intelligence', 100),
    ('admin', 'ผู้ดูแลระบบ - จัดการ Workspaces, Users, System Settings', 80),
    ('support', 'ฝ่ายสนับสนุน - ดู Error Logs, ช่วยเหลือ Customer', 50),
    ('developer', 'นักพัฒนา - ดู API Status, Data Pipelines, Audit Logs', 60);

-- Enable RLS
ALTER TABLE public.role_employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view employee roles" ON public.role_employees;
DROP POLICY IF EXISTS "Owner/Admin can manage employee roles" ON public.role_employees;

-- Anyone can read roles
CREATE POLICY "Anyone can view employee roles"
ON public.role_employees FOR SELECT
USING (true);

-- =====================================================
-- 2. Update employees table - add columns for approval workflow
-- =====================================================
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invited_by UUID,
ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on employees
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Employees can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update own employee" ON public.employees;
DROP POLICY IF EXISTS "Owner/Admin can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Allow employee self-registration" ON public.employees;

-- Employees can view all employees
CREATE POLICY "Employees can view all employees"
ON public.employees FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees e 
        WHERE e.user_id = auth.uid()
    )
);

-- Users can update their own employee record
CREATE POLICY "Users can update own employee"
ON public.employees FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Allow insert for self-registration
CREATE POLICY "Allow employee self-registration"
ON public.employees FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 3. Update employees_profile table RLS
-- =====================================================
ALTER TABLE public.employees_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees can view all employee profiles" ON public.employees_profile;
DROP POLICY IF EXISTS "Users can update own employee profile" ON public.employees_profile;
DROP POLICY IF EXISTS "Owner/Admin can manage employee profiles" ON public.employees_profile;
DROP POLICY IF EXISTS "Allow employee profile creation" ON public.employees_profile;

CREATE POLICY "Employees can view all employee profiles"
ON public.employees_profile FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees e 
        WHERE e.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own employee profile"
ON public.employees_profile FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees e 
        WHERE e.id = employees_id AND e.user_id = auth.uid()
    )
);

CREATE POLICY "Allow employee profile creation"
ON public.employees_profile FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employees e 
        WHERE e.id = employees_id AND e.user_id = auth.uid()
    )
);

-- =====================================================
-- 4. Create profile_customers table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profile_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    phone VARCHAR(20),
    avatar_url TEXT,
    gender_id UUID REFERENCES public.genders(id),
    location_id UUID REFERENCES public.locations(id),
    date_of_birth DATE,
    preferred_language VARCHAR(10) DEFAULT 'th',
    timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profile_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own customer profile" ON public.profile_customers;
DROP POLICY IF EXISTS "Users can update own customer profile" ON public.profile_customers;
DROP POLICY IF EXISTS "Users can insert own customer profile" ON public.profile_customers;
DROP POLICY IF EXISTS "Admins can view all customer profiles" ON public.profile_customers;

CREATE POLICY "Users can view own customer profile"
ON public.profile_customers FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own customer profile"
ON public.profile_customers FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own customer profile"
ON public.profile_customers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all customer profiles"
ON public.profile_customers FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.employees e
        JOIN public.role_employees r ON e.role_employees_id = r.id
        WHERE e.user_id = auth.uid() 
        AND r.role_name IN ('owner', 'admin')
    )
);

-- =====================================================
-- 5. Create helper functions
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_employee(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.employees
        WHERE user_id = _user_id
        AND status = 'active'
        AND approval_status = 'approved'
    )
$$;

CREATE OR REPLACE FUNCTION public.get_employee_role(_user_id uuid)
RETURNS VARCHAR
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT r.role_name 
    FROM public.employees e
    JOIN public.role_employees r ON e.role_employees_id = r.id
    WHERE e.user_id = _user_id
    AND e.status = 'active'
    AND e.approval_status = 'approved'
    LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_employee_role(_user_id uuid, _role_name varchar)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.employees e
        JOIN public.role_employees r ON e.role_employees_id = r.id
        WHERE e.user_id = _user_id
        AND e.status = 'active'
        AND e.approval_status = 'approved'
        AND r.role_name = _role_name
    )
$$;

-- =====================================================
-- 6. Update trigger for customer registration only
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create profile with free plan
    INSERT INTO public.profiles (id, email, full_name, plan_type)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'free');
    
    -- Create customer profile
    INSERT INTO public.profile_customers (user_id, first_name, last_name, display_name)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        COALESCE(new.raw_user_meta_data->>'full_name', new.email)
    );
    
    RETURN new;
END;
$$;

-- =====================================================
-- 7. Add triggers for updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_role_employees_updated_at ON public.role_employees;
CREATE TRIGGER update_role_employees_updated_at
    BEFORE UPDATE ON public.role_employees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profile_customers_updated_at ON public.profile_customers;
CREATE TRIGGER update_profile_customers_updated_at
    BEFORE UPDATE ON public.profile_customers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();