-- Run this in Supabase SQL Editor if migration hasn't been applied yet.
-- Creates the RPC and runs the backfill immediately.

-- 1. Create the function
CREATE OR REPLACE FUNCTION public.sync_tier_from_lifetime_points()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r              RECORD;
    v_correct_id   UUID;
    v_updated      INT := 0;
    v_backfilled   INT := 0;
BEGIN
    IF auth.uid() IS NOT NULL AND NOT public.is_employee(auth.uid()) THEN
        RAISE EXCEPTION 'permission_denied: employees only';
    END IF;

    FOR r IN
        SELECT lp.id, lp.profile_customer_id, lp.loyalty_tier_id, lp.lifetime_points
        FROM public.loyalty_points lp
    LOOP
        SELECT id INTO v_correct_id
        FROM public.loyalty_tiers
        WHERE is_active = true
          AND COALESCE(min_points, 0) <= COALESCE(r.lifetime_points, 0)
        ORDER BY priority_level DESC
        LIMIT 1;

        IF v_correct_id IS NOT NULL AND v_correct_id IS DISTINCT FROM r.loyalty_tier_id THEN
            UPDATE public.loyalty_points
            SET loyalty_tier_id = v_correct_id, updated_at = now()
            WHERE id = r.id;
            v_updated := v_updated + 1;
        END IF;
    END LOOP;

    INSERT INTO public.loyalty_tier_history (
        profile_customer_id, old_tier, new_tier, change_type, change_reason, changed_at
    )
    SELECT lp.profile_customer_id, 'Bronze', lt.name, 'auto',
           'System auto-evaluated tier (sync)', NOW()
    FROM public.loyalty_points lp
    JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
    WHERE lt.name IN ('Silver', 'Gold', 'Platinum')
      AND NOT EXISTS (
          SELECT 1 FROM public.loyalty_tier_history lth
          WHERE lth.profile_customer_id = lp.profile_customer_id
            AND lth.new_tier IN ('Silver', 'Gold', 'Platinum')
      );

    GET DIAGNOSTICS v_backfilled = ROW_COUNT;

    RETURN jsonb_build_object('updated_count', v_updated, 'backfilled_count', v_backfilled);
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_tier_from_lifetime_points() TO authenticated;

-- 2. Run the backfill immediately (insert Bronze→Silver for users already Silver+)
INSERT INTO public.loyalty_tier_history (
    profile_customer_id, old_tier, new_tier, change_type, change_reason, changed_at
)
SELECT lp.profile_customer_id, 'Bronze', lt.name, 'auto',
       'System auto-evaluated tier (sync)', NOW()
FROM public.loyalty_points lp
JOIN public.loyalty_tiers lt ON lt.id = lp.loyalty_tier_id
WHERE lt.name IN ('Silver', 'Gold', 'Platinum')
  AND NOT EXISTS (
      SELECT 1 FROM public.loyalty_tier_history lth
      WHERE lth.profile_customer_id = lp.profile_customer_id
        AND lth.new_tier IN ('Silver', 'Gold', 'Platinum')
  );
