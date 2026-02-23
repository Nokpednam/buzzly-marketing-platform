-- =======================================================================
-- Notify New Customers of Active Discounts
-- =======================================================================

CREATE OR REPLACE FUNCTION public.handle_new_customer_discounts()
RETURNS TRIGGER AS $$
DECLARE
    disc RECORD;
BEGIN
    -- For every newly created customer, find all ACTIVE and PUBLISHED discounts
    -- and send them a notification so they can collect it.
    FOR disc IN 
        SELECT id, code 
        FROM public.discounts 
        WHERE is_active = true 
          AND published_at IS NOT NULL 
          AND (end_date IS NULL OR end_date > now())
    LOOP
        INSERT INTO public.customer_notifications (
            customer_id,
            title,
            message,
            type,
            related_id
        ) VALUES (
            NEW.id,
            'New Promotional Code Available!',
            'A new code "' || disc.code || '" has been dropped. Collect it before it runs out!',
            'discount',
            disc.id
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on public.customer
DROP TRIGGER IF EXISTS on_customer_created_notify_discounts ON public.customer;
CREATE TRIGGER on_customer_created_notify_discounts
    AFTER INSERT ON public.customer
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_customer_discounts();
