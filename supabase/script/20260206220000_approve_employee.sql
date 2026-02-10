DO $$
DECLARE
    admin_role_id uuid;
BEGIN
    -- Get the ID for the 'admin' role
    SELECT id INTO admin_role_id FROM public.role_employees WHERE role_name = 'admin';

    -- Update the employee record
    UPDATE public.employees
    SET 
        approval_status = 'approved',
        status = 'active',
        role_employees_id = admin_role_id
    WHERE email = 'kittikornt01@gmail.com';
END $$;
