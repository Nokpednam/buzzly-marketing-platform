-- ============================================================
-- Migration: Robust Employee Profiles & Constraints
-- ============================================================

-- 1. Add Unique constraint to employees_profile(employees_id) if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'employees_profile_employees_id_key'
    ) THEN
        ALTER TABLE public.employees_profile ADD CONSTRAINT employees_profile_employees_id_key UNIQUE (employees_id);
    END IF;
END $$;

-- 2. Improve handle_user_sign_in to be profile-aware (upsert)
-- This ensures that when an employee signs in, their profile is correctly updated or created.
CREATE OR REPLACE FUNCTION public.handle_user_sign_in()
RETURNS TRIGGER AS $$
DECLARE
  v_emp_id uuid;
  v_role_id uuid;
BEGIN
  -- Find the employee linkage
  SELECT id, role_employees_id INTO v_emp_id, v_role_id 
  FROM public.employees 
  WHERE user_id = NEW.id;
  
  IF v_emp_id IS NOT NULL THEN
    -- Upsert the profile to ensure last_active is synced
    INSERT INTO public.employees_profile (employees_id, last_active, updated_at, role_employees_id)
    VALUES (v_emp_id, NEW.last_sign_in_at, NOW(), v_role_id)
    ON CONFLICT (employees_id) DO UPDATE SET
      last_active = EXCLUDED.last_active,
      updated_at = EXCLUDED.updated_at;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
