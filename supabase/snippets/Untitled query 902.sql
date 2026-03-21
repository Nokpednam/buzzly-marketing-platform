SELECT 
    pt.created_at AS "Date",
    c.full_name AS "Customer",
    pt.transaction_type AS "Type",
    pt.points_amount AS "Amount",
    pt.balance_after AS "Balance After",
    pt.description AS "Description"
FROM public.points_transactions pt
LEFT JOIN public.customer c ON pt.user_id = c.id
ORDER BY pt.created_at DESC;