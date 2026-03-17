-- ============================================================================
-- RPC: send_promo_to_customer
-- Allows employees (owner, dev, support) to send a discount code directly
-- to a customer's notification center. Customer will see it in their bell.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.send_promo_to_customer(
    p_customer_id UUID,
    p_discount_id UUID,
    p_context TEXT DEFAULT 'promo'  -- 'promo' | 're_engage'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller_id    UUID := auth.uid();
    v_discount     RECORD;
    v_title        TEXT;
    v_message      TEXT;
BEGIN
    -- 1. Caller must be an employee (owner, dev, support)
    IF v_caller_id IS NULL OR NOT public.is_employee(v_caller_id) THEN
        RAISE EXCEPTION 'not_authorized';
    END IF;

    -- 2. Validate customer exists (profile_customers.user_id = auth.users.id)
    IF NOT EXISTS (SELECT 1 FROM public.profile_customers WHERE user_id = p_customer_id) THEN
        RAISE EXCEPTION 'customer_not_found';
    END IF;

    -- 3. Fetch discount
    SELECT id, code, discount_type, discount_value, published_at
    INTO v_discount
    FROM public.discounts
    WHERE id = p_discount_id;

    IF v_discount.id IS NULL THEN
        RAISE EXCEPTION 'discount_not_found';
    END IF;

    -- 4. Publish discount if not yet published (so customer can collect)
    IF v_discount.published_at IS NULL THEN
        UPDATE public.discounts
        SET published_at = now(), updated_at = now()
        WHERE id = p_discount_id;
    END IF;

    -- 5. Build notification content based on context
    IF p_context = 're_engage' THEN
        v_title := 'We miss you! Special offer inside';
        v_message := 'Welcome back! Use code «' || v_discount.code || '» for '
            || CASE WHEN v_discount.discount_type = 'percent'
                THEN v_discount.discount_value::TEXT || '% off'
                ELSE '฿' || v_discount.discount_value::TEXT || ' off'
            END || '. Valid for one use.';
    ELSE
        v_title := 'Exclusive Promo Just For You!';
        v_message := 'You''re so close to the next tier! Use code «' || v_discount.code || '» for '
            || CASE WHEN v_discount.discount_type = 'percent'
                THEN v_discount.discount_value::TEXT || '% off'
                ELSE '฿' || v_discount.discount_value::TEXT || ' off'
            END || '. Collect it now!';
    END IF;

    -- 6. Insert into customer_notifications (customer sees in bell)
    INSERT INTO public.customer_notifications (
        customer_id,
        title,
        message,
        type,
        related_id
    ) VALUES (
        p_customer_id,
        v_title,
        v_message,
        'discount',
        p_discount_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Promo sent to customer notification center'
    );
END;
$$;
