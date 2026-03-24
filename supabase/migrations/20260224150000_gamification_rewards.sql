-- Create point_earning_rules table
CREATE TABLE IF NOT EXISTS public.point_earning_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_code VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    description TEXT,
    points_reward INTEGER NOT NULL,
    max_times_per_user INTEGER, -- NULL means unlimited
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Note: Enforcing RLS on point_earning_rules
ALTER TABLE public.point_earning_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active point earning rules"
    ON public.point_earning_rules FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage point earning rules"
    ON public.point_earning_rules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND re.role_name IN ('admin', 'owner', 'dev')
        )
    );

-- Create user_completed_rules table
CREATE TABLE IF NOT EXISTS public.user_completed_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.customer(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES public.point_earning_rules(id) ON DELETE CASCADE,
    points_transaction_id UUID REFERENCES public.points_transactions(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying user completions
CREATE INDEX IF NOT EXISTS idx_user_completed_rules_user_id ON public.user_completed_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_completed_rules_rule_id ON public.user_completed_rules(rule_id);

ALTER TABLE public.user_completed_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completed rules"
    ON public.user_completed_rules FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user completed rules"
    ON public.user_completed_rules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND re.role_name IN ('admin', 'owner', 'dev')
        )
    );

-- Create reward_items table
CREATE TABLE IF NOT EXISTS public.reward_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    reward_type VARCHAR NOT NULL, -- e.g., 'system_quota', 'service', 'partner_perk', 'digital_asset'
    points_cost INTEGER NOT NULL,
    stock_quantity INTEGER, -- NULL means unlimited
    image_url VARCHAR,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reward_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active reward items"
    ON public.reward_items FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage reward items"
    ON public.reward_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND re.role_name IN ('admin', 'owner', 'dev')
        )
    );


-- Create reward_redemptions table
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.customer(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES public.reward_items(id) ON DELETE CASCADE,
    points_transaction_id UUID REFERENCES public.points_transactions(id) ON DELETE SET NULL,
    status VARCHAR DEFAULT 'pending', -- 'pending', 'fulfilled', 'rejected'
    redemption_code VARCHAR,
    admin_notes TEXT,
    redeemed_at TIMESTAMPTZ DEFAULT now(),
    fulfilled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON public.reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON public.reward_redemptions(status);

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own redemptions"
    ON public.reward_redemptions FOR SELECT
    USING (user_id = auth.uid());
    
CREATE POLICY "Users can insert their own redemptions"
    ON public.reward_redemptions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage reward redemptions"
    ON public.reward_redemptions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.employees e
            JOIN public.role_employees re ON e.role_employees_id = re.id
            WHERE e.user_id = auth.uid()
            AND re.role_name IN ('admin', 'owner', 'dev')
        )
    );

-- Add updated_at triggers
CREATE TRIGGER set_timestamp_point_earning_rules
BEFORE UPDATE ON public.point_earning_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_timestamp_reward_items
BEFORE UPDATE ON public.reward_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Mock Data
INSERT INTO public.point_earning_rules (id, action_code, name, description, points_reward, max_times_per_user, is_active)
VALUES 
    ('d9a0ae2e-00ae-41a4-a483-9da1b968887f', 'first_campaign', 'สร้างแคมเปญแรกสำเร็จ', 'รับแต้มพิเศษเมื่อสร้างและปล่อยแคมเปญแรกของคุณ', 500, 1, true),
    ('a364e133-75ea-4475-871c-3d6cdc14a1fa', 'referral_signup', 'ชวนเพื่อนสมัครสมาชิก', 'รับแต้มเมื่อเพื่อนที่คุณชวนสมัครสมาชิกและยืนยันอีเมลสำเร็จ', 200, NULL, true),
    ('368a8786-9fb5-4e1c-b0cd-fe6f49c46fa4', 'connect_line_oa', 'เชื่อมต่อ LINE OA', 'รับแต้มเมื่อเชื่อมต่อ LINE Official Account กับระบบสำเร็จ', 300, 1, true),
    ('cb42aac6-c0be-48e0-9885-6483fb22fc8f', 'yearly_sub_bonus', 'โบนัสเปลี่ยนเป็นรายปี', 'รับแต้มพิเศษเมื่อเปลี่ยนรูปแบบการจ่ายเงินเป็นรายปี', 5000, 1, true),
    ('80a704a6-9674-447f-a628-cf1427538ed6', 'survey_completion', 'ทำแบบสอบถาม', 'รับแต้มเมื่อให้ความร่วมมือในการทำแบบสอบถามความพึงพอใจ', 100, 5, true)
ON CONFLICT (action_code) DO NOTHING;

INSERT INTO public.reward_items (id, name, description, reward_type, points_cost, stock_quantity, image_url, is_active)
VALUES
    ('dd23789c-13e2-4547-981d-090743fc6829', 'คูปองส่วนลด 20%', 'โค้ดส่วนลด 20% สำหรับการสั่งซื้อ (จำกัด 1 สิทธิ์ต่อผู้ใช้)', 'DISCOUNT', 400, 1, NULL, true)
ON CONFLICT DO NOTHING;
