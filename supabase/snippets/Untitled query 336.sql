SELECT 
    sa.id,
    sa.created_at AS "Date",
    c.full_name AS "Customer Name",
    c.email AS "Customer Email",
    sa.activity_type AS "Type",
    sa.severity AS "Severity",
    sa.description AS "Description",
    sa.is_resolved AS "Is Resolved"
FROM 
    public.suspicious_activities sa
JOIN 
    public.customer c ON sa.user_id = c.id
ORDER BY 
    sa.created_at DESC; -- ตัวอย่างสำหรับการดึงข้อมูลหน้าแรก (Page Size = 5)
