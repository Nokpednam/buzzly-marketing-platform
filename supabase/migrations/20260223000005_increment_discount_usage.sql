-- =======================================================================
-- RPC Function to Increment Discount Usage
-- =======================================================================

CREATE OR REPLACE FUNCTION public.increment_discount_usage(d_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.discounts
    SET usage_count = usage_count + 1,
        updated_at = now()
    WHERE id = d_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
