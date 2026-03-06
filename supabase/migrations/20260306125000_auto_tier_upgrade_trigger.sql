-- Create the trigger function (Improved: Using Lifetime Total Points)
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
        NEW.total_points_earned := NEW.total_points_earned + v_point_diff;
    END IF;

    -- 2. ค้นหา Tier ที่เหมาะสมตามแต้มสะสมทั้งหมด (total_points_earned)
    -- ใช้ Lifetime Points เป็นเกณฑ์ เพื่อให้การแลกของรางวัลไม่ส่งผลกระทบต่อระดับ Tier
    SELECT id
    INTO v_new_tier_id
    FROM public.loyalty_tiers
    WHERE min_points <= NEW.total_points_earned -- ใช้แต้มสะสมทั้งหมดตรงนี้
      AND is_active = true
    ORDER BY priority_level DESC
    LIMIT 1;

    -- 3. ถ้าผลลัพธ์คือต้องเปลี่ยน Tier
    IF v_new_tier_id IS NOT NULL AND (OLD.loyalty_tier_id IS NULL OR v_new_tier_id != OLD.loyalty_tier_id) THEN
        
        -- อัปเดต Tier ใหม่ลงใน record นี้
        NEW.loyalty_tier_id := v_new_tier_id;
        
        -- ค้นหา user_id เพื่อบันทึกประวัติ (จาก profile_customers)
        SELECT user_id INTO v_user_id
        FROM public.profile_customers
        WHERE id = NEW.profile_customer_id;

        -- บันทึกประวัติลง tier_history
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

-- Drop and Re-create Trigger
DROP TRIGGER IF EXISTS auto_tier_update_trigger ON public.loyalty_points;
CREATE TRIGGER auto_tier_update_trigger
    BEFORE UPDATE ON public.loyalty_points
    FOR EACH ROW
    EXECUTE FUNCTION handle_auto_tier_update();
