-- Create Employee records for existing users (for testing)
-- Owner employee (hachikonoluna@gmail.com)
INSERT INTO employees (user_id, email, status, approval_status, role_employees_id)
SELECT 
    '15b96bdd-41dd-4d38-83a4-a6577b57eec3',
    'hachikonoluna@gmail.com',
    'active',
    'approved',
    (SELECT id FROM role_employees WHERE role_name = 'owner')
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE user_id = '15b96bdd-41dd-4d38-83a4-a6577b57eec3'
);

-- Admin employee (panuwatjr2@gmail.com)  
INSERT INTO employees (user_id, email, status, approval_status, role_employees_id)
SELECT 
    '58f097eb-1ed6-4b8d-8718-bdde0ecca367',
    'panuwatjr2@gmail.com',
    'active',
    'approved',
    (SELECT id FROM role_employees WHERE role_name = 'admin')
WHERE NOT EXISTS (
    SELECT 1 FROM employees WHERE user_id = '58f097eb-1ed6-4b8d-8718-bdde0ecca367'
);

-- Create employee profiles
INSERT INTO employees_profile (employees_id, first_name, last_name, aptitude)
SELECT 
    e.id,
    'Prem',
    'Zaazaa',
    'Owner/Business Intelligence'
FROM employees e 
WHERE e.email = 'hachikonoluna@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM employees_profile ep WHERE ep.employees_id = e.id
);

INSERT INTO employees_profile (employees_id, first_name, last_name, aptitude)
SELECT 
    e.id,
    'Poom',
    'JR',
    'System Administrator'
FROM employees e 
WHERE e.email = 'panuwatjr2@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM employees_profile ep WHERE ep.employees_id = e.id
);