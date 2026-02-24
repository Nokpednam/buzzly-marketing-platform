-- =======================================================================
-- Dynamic Discount Notifications RPC
-- =======================================================================

CREATE OR REPLACE FUNCTION public.get_available_discounts(p_customer_id uuid)
RETURNS TABLE (
    id uuid,
    code text,
    name text,
    description text,
    publish_time timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.code,
        d.name,
        d.description,
        d.published_at AS publish_time
    FROM public.discounts d
    WHERE 
        -- 1. Is it active and published?
        d.is_active = true 
        AND d.published_at IS NOT NULL
        
        -- 2. Has it expired?
        AND (d.end_date IS NULL OR d.end_date > now())
        
        -- 3. Has the usage limit been reached? (Global across all customers)
        AND (
            d.usage_limit IS NULL 
            OR 
            (SELECT count(*) FROM public.customer_coupons WHERE discount_id = d.id) < d.usage_limit
        )

        -- 4. Did THIS specific customer already collect it?
        AND NOT EXISTS (
            SELECT 1 
            FROM public.customer_coupons cc 
            WHERE cc.discount_id = d.id 
              AND cc.customer_id = p_customer_id
        )
    ORDER BY d.published_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
