-- =======================================================================
-- Discount Collection System Migration
-- Adds draft/publish state for discounts, collection tracking, and notifications.
-- =======================================================================

-- 1. ADD published_at TO discounts
ALTER TABLE public.discounts ADD COLUMN published_at timestamp with time zone;

-- Update existing discounts to be published immediately so they don't break existing logic
UPDATE public.discounts SET published_at = created_at WHERE is_active = true;

-- 2. CREATE customer_notifications TABLE
CREATE TABLE IF NOT EXISTS public.customer_notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL, -- e.g., 'discount', 'system', 'campaign'
    is_read boolean DEFAULT false NOT NULL,
    related_id uuid, -- e.g., discount_id
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for notifications
ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.customer_notifications
    FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can update their own notifications" ON public.customer_notifications
    FOR UPDATE USING (auth.uid() = customer_id);

-- 3. CREATE customer_coupons TABLE (Collection System)
CREATE TABLE IF NOT EXISTS public.customer_coupons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    discount_id uuid REFERENCES public.discounts(id) ON DELETE CASCADE NOT NULL,
    collected_at timestamp with time zone DEFAULT now() NOT NULL,
    used_at timestamp with time zone,
    UNIQUE(customer_id, discount_id) -- One collection per discount per user
);

-- Enable RLS for coupons
ALTER TABLE public.customer_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their collected coupons" ON public.customer_coupons
    FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can collect coupons themselves" ON public.customer_coupons
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 4. TRIGGER FUNCTION: AUTO-NOTIFY ON PUBLISH
CREATE OR REPLACE FUNCTION public.handle_discount_publish()
RETURNS TRIGGER AS $$
DECLARE
    cust RECORD;
BEGIN
    -- Only trigger if published_at transitions from NULL to NOT NULL
    IF OLD.published_at IS NULL AND NEW.published_at IS NOT NULL THEN
        -- Find all active customers to notify (or maybe based on some segment logic, but all for now)
        FOR cust IN SELECT id FROM public.customer LOOP
            INSERT INTO public.customer_notifications (
                customer_id,
                title,
                message,
                type,
                related_id
            ) VALUES (
                cust.id,
                'New Promotional Code Available!',
                'A new code "' || NEW.code || '" has been dropped. Collect it before it runs out!',
                'discount',
                NEW.id
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_discount_published
    AFTER UPDATE ON public.discounts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_discount_publish();

-- =======================================================================
