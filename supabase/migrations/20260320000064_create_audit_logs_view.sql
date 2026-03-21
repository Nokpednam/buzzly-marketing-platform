-- Fix Audit Logs Filtering Count
-- 
-- Problem: Filtering by Role or Action in the UI only filters the current page of results,
--          meaning the total count remains unchanged, and pagination breaks.
-- Solution: Create a view combining `audit_logs_enhanced`, `employees`, `role_employees`, 
--           and `customer` tables so the UI can filter efficiently on the server-side.

-- 1. Create the unified view for audit logs
CREATE OR REPLACE VIEW public.audit_logs_view AS
SELECT 
    al.id,
    al.user_id,
    al.server_id,
    al.action_type_id,
    al.category,
    al.description,
    al.ip_address,
    al.status,
    al.error_id,
    al.metadata,
    al.created_at,
    
    -- Action Info
    atp.action_name AS base_action_name,
    
    -- User Info Resolution (Employees vs Customers)
    COALESCE(e.email, c.email) AS user_email,
    
    -- Role Resolution (Owner/Admin/Dev/Support vs Customer)
    COALESCE(re.role_name, 'Customer') AS user_role,

    -- Display Action Logic (similar to frontend transformation)
    CASE 
        WHEN al.category = 'feature' AND (atp.action_name = 'Page View' OR (al.metadata->>'action_name') = 'Page View' OR atp.action_name ILIKE '%เข้าหน้า%') THEN
             CASE 
                  WHEN al.metadata->>'page_url' IS NOT NULL THEN 'Page View ' || (al.metadata->>'page_url')
                  ELSE 'Page View'
             END
        ELSE COALESCE(atp.action_name, al.metadata->>'action_name', 'Unknown')
    END AS display_action_name

FROM public.audit_logs_enhanced al
LEFT JOIN public.action_type atp ON al.action_type_id = atp.id
LEFT JOIN public.employees e ON al.user_id = e.user_id
LEFT JOIN public.role_employees re ON e.role_employees_id = re.id
LEFT JOIN public.customer c ON al.user_id = c.id;

-- 2. Grant Permissions
GRANT SELECT ON public.audit_logs_view TO authenticated;
GRANT SELECT ON public.audit_logs_view TO service_role;
GRANT SELECT ON public.audit_logs_view TO anon;
