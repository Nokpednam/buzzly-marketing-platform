-- =======================================================================
-- Allow customers to read active/published discounts
-- Previously customers had NO SELECT policy on discounts at all,
-- causing "discount not found" error when trying to collect a coupon.
-- =======================================================================

-- Customers (any authenticated user) can read discounts that are active and published
CREATE POLICY "Customers can view active published discounts"
ON public.discounts
FOR SELECT
TO authenticated
USING (is_active = true AND published_at IS NOT NULL);
