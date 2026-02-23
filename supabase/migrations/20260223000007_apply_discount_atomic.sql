-- =======================================================================
-- RPC: apply_collected_discount
-- Atomically validates and marks a collected coupon as USED.
-- Must be called at payment confirmation time (inside the purchase flow).
--
-- Returns a JSON object with either:
--   { error: '...' }  — on any failure (already_used, expired, etc.)
--   { id, code, discount_type, discount_value, min_order_value, max_discount_amount }
--     — on success; at this point used_at is already set (atomic)
--
-- Uses SECURITY DEFINER to bypass RLS, but enforces ownership via customer_coupons.
-- =======================================================================

CREATE OR REPLACE FUNCTION public.apply_collected_discount(p_code text)
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

  -- Lock the coupon row FOR UPDATE to prevent race conditions (double-spend)
  SELECT cc.* INTO v_coupon
  FROM public.customer_coupons cc
  JOIN public.discounts d ON d.id = cc.discount_id
  WHERE d.code = upper(p_code)
    AND cc.customer_id = v_user_id
  FOR UPDATE;  -- Serialize concurrent requests for the same coupon

  IF NOT FOUND THEN
    -- Distinguish between "code not in system" vs "not collected by this user"
    -- by checking if the discount exists at all
    PERFORM 1 FROM public.discounts WHERE code = upper(p_code) AND is_active = true;
    IF FOUND THEN
      RETURN json_build_object('error', 'not_collected');
    ELSE
      RETURN json_build_object('error', 'invalid_code');
    END IF;
  END IF;

  -- Check already used (single-use per customer enforced here)
  IF v_coupon.used_at IS NOT NULL THEN
    RETURN json_build_object('error', 'already_used');
  END IF;

  -- Fetch discount details (SECURITY DEFINER bypasses RLS)
  SELECT * INTO v_discount FROM public.discounts WHERE id = v_coupon.discount_id;

  -- Check discount still active
  IF NOT v_discount.is_active THEN
    RETURN json_build_object('error', 'invalid_code');
  END IF;

  -- Check expiry
  IF v_discount.end_date IS NOT NULL AND v_discount.end_date < now() THEN
    RETURN json_build_object('error', 'expired');
  END IF;

  -- Check global usage limit
  IF v_discount.usage_limit IS NOT NULL AND v_discount.usage_count >= v_discount.usage_limit THEN
    RETURN json_build_object('error', 'exhausted');
  END IF;

  -- ✅ All checks passed. Atomically mark as used.
  UPDATE public.customer_coupons
  SET used_at = now()
  WHERE id = v_coupon.id;

  -- Increment global usage counter
  UPDATE public.discounts
  SET usage_count = usage_count + 1,
      updated_at  = now()
  WHERE id = v_discount.id;

  RETURN json_build_object(
    'id',                  v_discount.id,
    'code',                v_discount.code,
    'discount_type',       v_discount.discount_type,
    'discount_value',      v_discount.discount_value,
    'min_order_value',     COALESCE(v_discount.min_order_value, 0),
    'max_discount_amount', v_discount.max_discount_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
