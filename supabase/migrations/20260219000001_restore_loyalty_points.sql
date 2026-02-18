-- =========================================================
-- RESTORE LOYALTY POINTS TABLE
-- Missing from previous migrations, required for Customer Tiers
-- =========================================================

-- 1. Create Table
CREATE TABLE IF NOT EXISTS public.loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_customer_id UUID REFERENCES public.profile_customers(id) ON DELETE CASCADE,
    loyalty_tier_id UUID REFERENCES public.loyalty_tiers(id),
    point_balance INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, banned
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_customer_id)
);

-- 2. Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Admins can manage loyalty_points" ON public.loyalty_points
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees r ON e.role_employees_id = r.id
            WHERE e.user_id = auth.uid()
            AND r.role_name IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can view own loyalty points" ON public.loyalty_points
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profile_customers pc
            WHERE pc.id = loyalty_points.profile_customer_id
            AND pc.user_id = auth.uid()
        )
    );

-- 4. Backfill Data for Existing Customers
DO $$
DECLARE
    rec RECORD;
    v_tier_id UUID;
    v_points INT;
BEGIN
    RAISE NOTICE 'Backfilling Loyalty Points...';
    
    FOR rec IN SELECT id FROM public.profile_customers LOOP
        -- Random Points (0 - 5000)
        v_points := floor(random() * 5000)::INT;
        
        -- Determine Tier based on points (Logic from useCustomerTiers approx)
        -- Bronze < 1000, Silver < 2500, Gold < 4000, Platinum >= 4000
        -- Need to get IDs from loyalty_tiers
        
        -- Default Bronze
        SELECT id INTO v_tier_id FROM public.loyalty_tiers WHERE name = 'Bronze' LIMIT 1;
        
        IF v_points >= 1000 AND v_points < 2500 THEN
             SELECT id INTO v_tier_id FROM public.loyalty_tiers WHERE name = 'Silver' LIMIT 1;
        ELSIF v_points >= 2500 AND v_points < 4000 THEN
             SELECT id INTO v_tier_id FROM public.loyalty_tiers WHERE name = 'Gold' LIMIT 1;
        ELSIF v_points >= 4000 THEN
             SELECT id INTO v_tier_id FROM public.loyalty_tiers WHERE name = 'Platinum' LIMIT 1;
        END IF;
        
        -- Fallback if tier not found (should exist)
        IF v_tier_id IS NULL THEN
            SELECT id INTO v_tier_id FROM public.loyalty_tiers ORDER BY min_points ASC LIMIT 1;
        END IF;

        INSERT INTO public.loyalty_points (
            profile_customer_id,
            loyalty_tier_id,
            point_balance,
            total_points_earned,
            status
        ) VALUES (
            rec.id,
            v_tier_id,
            v_points, -- Balance
            v_points + floor(random() * 1000)::INT, -- Total earned >= balance
            'active'
        ) ON CONFLICT (profile_customer_id) DO NOTHING;
        
        -- Update profile_customers to link back (if needed by app logic, though usually one-way or foreign key is on loyalty_points)
        -- The schema suggests profile_customers has loyalty_point_id
        UPDATE public.profile_customers
        SET loyalty_point_id = (SELECT id FROM public.loyalty_points WHERE profile_customer_id = rec.id)
        WHERE id = rec.id;
        
    END LOOP;
END $$;
