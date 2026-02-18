-- Migration: Auto-assign Admin Role on Employee Approval
-- Description: When an employee's approval_status is changed to 'approved', automatically assign them the 'Admin' role

-- Drop trigger if exists
DROP TRIGGER IF EXISTS assign_role_on_approval ON public.employees;

-- Drop function if exists
DROP FUNCTION IF EXISTS public.assign_admin_role_on_approval();

-- Create function to assign admin role when approved
CREATE OR REPLACE FUNCTION public.assign_admin_role_on_approval()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_role_id UUID;
BEGIN
    -- Check if approval_status changed to 'approved'
    IF NEW.approval_status = 'approved' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
        -- Get the Admin role ID (case-insensitive)
        SELECT id INTO v_admin_role_id 
        FROM public.role_employees 
        WHERE role_name ILIKE 'admin' 
        LIMIT 1;
        
        -- If admin role exists, assign it
        IF v_admin_role_id IS NOT NULL THEN
            NEW.role_employees_id := v_admin_role_id;
            NEW.status := 'active';
            
            RAISE NOTICE 'Admin role (%) assigned to employee: %', v_admin_role_id, NEW.email;
        ELSE
            RAISE WARNING 'Admin role not found in role_employees table';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER assign_role_on_approval
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    WHEN (NEW.approval_status = 'approved' AND OLD.approval_status != 'approved')
    EXECUTE FUNCTION public.assign_admin_role_on_approval();

-- Verify trigger was created
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'assign_role_on_approval';
