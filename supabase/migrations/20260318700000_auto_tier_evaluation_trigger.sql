-- ============================================================================
-- Migration: Auto Tier Evaluation Trigger
-- Timestamp: 20260318700000
--
-- Problem:  award_loyalty_points() updates point_balance but never sets
--           loyalty_tier_id, so trg_bulletproof_tier_change never fires
--           and loyalty_tier_history stays empty forever.
--
-- Fix:      A BEFORE UPDATE OF point_balance trigger on loyalty_points that:
--             1. Finds the highest eligible tier for NEW.point_balance
--             2. Sets NEW.loyalty_tier_id = that tier's id
--           Because this runs BEFORE the row write, the existing
--           trg_bulletproof_tier_change (also BEFORE UPDATE OF loyalty_tier_id)
--           will chain automatically and log the history entry.
-- ============================================================================

-- ── Trigger function ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.auto_evaluate_loyalty_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_tier_id UUID;
BEGIN
    -- Only evaluate when the balance actually changed
    IF NEW.point_balance IS NOT DISTINCT FROM OLD.point_balance THEN
        RETURN NEW;
    END IF;

    -- Find the highest tier the user now qualifies for.
    -- Tiers use min_points as the lower threshold.
    -- priority_level DESC ensures we pick the highest eligible tier.
    SELECT id
    INTO   v_new_tier_id
    FROM   public.loyalty_tiers
    WHERE  is_active = true
      AND  COALESCE(min_points, 0) <= NEW.point_balance
    ORDER  BY priority_level DESC
    LIMIT  1;

    -- Only touch loyalty_tier_id if we resolved a tier
    -- (avoids nulling it out if tiers table is empty)
    IF v_new_tier_id IS NOT NULL THEN
        NEW.loyalty_tier_id := v_new_tier_id;
    END IF;

    RETURN NEW;
END;
$$;

-- ── Attach trigger ───────────────────────────────────────────────────────────
-- Runs BEFORE the row is written, BEFORE trg_bulletproof_tier_change,
-- so the tier id change is visible to the history trigger in the same statement.
--
-- Trigger ordering within the same event on the same table is alphabetical
-- in Postgres, so we name this "trg_auto_evaluate_loyalty_tier" which sorts
-- BEFORE "trg_bulletproof_tier_change" — correct execution order guaranteed.
DROP TRIGGER IF EXISTS trg_auto_evaluate_loyalty_tier ON public.loyalty_points;
CREATE TRIGGER trg_auto_evaluate_loyalty_tier
    BEFORE UPDATE OF point_balance ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_evaluate_loyalty_tier();

-- ── Back-fill: fix any rows already in the wrong tier ────────────────────────
-- Touch every loyalty_points row so both triggers fire and history is seeded.
-- This is idempotent — running it again is safe.
DO $$
DECLARE
    r RECORD;
    v_correct_tier_id UUID;
BEGIN
    FOR r IN SELECT id, point_balance, loyalty_tier_id FROM public.loyalty_points LOOP
        -- Resolve the correct tier for current balance
        SELECT id
        INTO   v_correct_tier_id
        FROM   public.loyalty_tiers
        WHERE  is_active = true
          AND  COALESCE(min_points, 0) <= COALESCE(r.point_balance, 0)
        ORDER  BY priority_level DESC
        LIMIT  1;

        -- Only update if tier is wrong or missing (avoids unnecessary history noise)
        IF v_correct_tier_id IS NOT NULL
          AND (r.loyalty_tier_id IS DISTINCT FROM v_correct_tier_id)
        THEN
            UPDATE public.loyalty_points
            SET    loyalty_tier_id = v_correct_tier_id,
                   updated_at      = now()
            WHERE  id = r.id;
        END IF;
    END LOOP;
END;
$$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
