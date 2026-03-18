-- ============================================================================
-- Migration: Support Tier Override Takes Precedence — never overwrite
-- Timestamp: 20260320000062
--
-- Problem: When Support Adjusts Tier for a customer (including custom-created),
--          the tier does not persist. handle_auto_tier_update trigger runs on
--          every loyalty_points UPDATE and overwrites Support's choice based on
--          total_points_earned (e.g. 0 pts → Bronze).
--
-- Fix: In handle_auto_tier_update, skip auto tier logic when:
--      1. _override_changer_id IS NOT NULL (Support is overriding right now)
--      2. manual_override_at IS NOT NULL (Support overrode before — never overwrite)
--      Support's adjustment must override ALL rules as intended.
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_auto_tier_update()
RETURNS TRIGGER AS $$
DECLARE
    v_new_tier_id UUID;
    v_user_id UUID;
    v_point_diff INT;
BEGIN
    -- 1. จัดการเรื่อง Total Points (บวกเพิ่มให้ตามส่วนต่างที่เพิ่มขึ้น)
    v_point_diff := NEW.point_balance - OLD.point_balance;
    IF v_point_diff > 0 THEN
        NEW.total_points_earned := COALESCE(NEW.total_points_earned, 0) + v_point_diff;
    END IF;

    -- 2. Support manual override: NEVER overwrite tier. Support's choice takes precedence.
    IF NEW._override_changer_id IS NOT NULL OR OLD.manual_override_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- 3. ค้นหา Tier ที่เหมาะสมตามแต้มสะสมทั้งหมด (total_points_earned)
    SELECT id
    INTO v_new_tier_id
    FROM public.loyalty_tiers
    WHERE min_points <= NEW.total_points_earned
      AND is_active = true
    ORDER BY priority_level DESC
    LIMIT 1;

    -- 4. ถ้าผลลัพธ์คือต้องเปลี่ยน Tier
    IF v_new_tier_id IS NOT NULL AND (OLD.loyalty_tier_id IS NULL OR v_new_tier_id != OLD.loyalty_tier_id) THEN
        NEW.loyalty_tier_id := v_new_tier_id;

        SELECT user_id INTO v_user_id
        FROM public.profile_customers
        WHERE id = NEW.profile_customer_id;

        IF v_user_id IS NOT NULL THEN
            INSERT INTO public.tier_history (
                user_id,
                previous_tier_id,
                new_tier_id,
                change_reason,
                is_manual_override
            ) VALUES (
                v_user_id,
                OLD.loyalty_tier_id,
                v_new_tier_id,
                'System: Tier adjustment based on total points earned (' || NEW.total_points_earned || ' pts)',
                false
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION handle_auto_tier_update() IS
    'BEFORE UPDATE on loyalty_points. Skips auto tier logic when Support has manually overridden (_override_changer_id or manual_override_at). Support override takes precedence over all rules.';

NOTIFY pgrst, 'reload schema';
