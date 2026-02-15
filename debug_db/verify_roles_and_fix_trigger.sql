-- Check Roles
SELECT * FROM role_employees;

-- Force update the trigger function to be absolutely sure it's correct
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_employee_id uuid;
    default_employee_role_id uuid;
BEGIN
    RAISE NOTICE 'handle_new_user trigger fired for user: %', new.email;
    
    -- Get the default 'Employee' role ID (Case Insensitive)
    SELECT id INTO default_employee_role_id
    FROM public.role_employees
    WHERE LOWER(role_name) = 'employee'
    LIMIT 1;
    
    -- Fallback: If not found, try 'Employee' case sensitive? 
    -- Or just log warning.
    
    IF (new.raw_user_meta_data->>'is_employee_signup')::boolean IS TRUE THEN
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
            'pending',
            default_employee_role_id
        )
        ON CONFLICT (user_id) DO UPDATE
        SET email = EXCLUDED.email,
            role_employees_id = COALESCE(employees.role_employees_id, EXCLUDED.role_employees_id),
            updated_at = NOW();
    END IF;
    
    RETURN new;
END;
$$;
