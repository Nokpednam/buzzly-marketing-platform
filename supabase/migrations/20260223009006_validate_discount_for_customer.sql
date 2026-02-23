-- =======================================================================
-- RPC: validate_collected_discount
-- Allows customers to validate a discount code they have collected.
-- Uses SECURITY DEFINER to bypass RLS on the discounts table,
-- but enforces that the user must own the coupon in customer_coupons.
-- =======================================================================

CREATE OR REPLACE FUNCTION public.validate_collected_discount(p_code text)
RETURNS json AS $$
DECLARE
  v_discount record;
  v_coupon   record;
  v_user_id  uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'not_authenticated');
  END IF;

  -- Find the discount by code (bypasses RLS via SECURITY DEFINER)
  SELECT * INTO v_discount
  FROM public.discounts
  WHERE code = upper(p_code)
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'invalid_code');
  END IF;

  -- Verify the calling user has actually collected this coupon
  SELECT * INTO v_coupon
  FROM public.customer_coupons
  WHERE customer_id = v_user_id
    AND discount_id = v_discount.id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'not_collected');
  END IF;

  -- Check if already used
  IF v_coupon.used_at IS NOT NULL THEN
    RETURN json_build_object('error', 'already_used');
  END IF;

  -- Check expiry
  IF v_discount.end_date IS NOT NULL AND v_discount.end_date < now() THEN
    RETURN json_build_object('error', 'expired');
  END IF;

  -- Check usage limit (global)
  IF v_discount.usage_limit IS NOT NULL AND v_discount.usage_count >= v_discount.usage_limit THEN
    RETURN json_build_object('error', 'exhausted');
  END IF;

  -- All checks passed — return discount details
  RETURN json_build_object(
    'id',                 v_discount.id,
    'code',               v_discount.code,
    'discount_type',      v_discount.discount_type,
    'discount_value',     v_discount.discount_value,
    'min_order_value',    COALESCE(v_discount.min_order_value, 0),
    'max_discount_amount', v_discount.max_discount_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
