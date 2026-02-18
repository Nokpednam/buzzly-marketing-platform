-- Insert Buzzly Tiers
INSERT INTO public.buzzly_tiers (name, description) VALUES 
('Bronze', 'เริ่มต้นสมาชิก - ได้รับทันทีเมื่อสมัคร'),
('Silver', 'สมาชิกประจำ - สมัครมากกว่า 6 เดือน หรือยอดใช้จ่าย 10,000+ หรือ 500+ points'),
('Gold', 'สมาชิกระดับสูง - สมัครมากกว่า 1 ปี หรือยอดใช้จ่าย 50,000+ หรือ 1,500+ points'),
('Platinum', 'สมาชิกพิเศษ - สมัครมากกว่า 2 ปี หรือยอดใช้จ่าย 200,000+ หรือ 5,000+ points');

-- Insert Loyalty Tiers with criteria
INSERT INTO public.loyalty_tiers (
  buzzly_tier_id, name, description, badge_color, icon_url, 
  min_points, min_spend_amount, retention_period_days, 
  discount_percentage, point_multiplier, priority_level, benefits_summary, is_active
) 
SELECT 
  bt.id, 'Bronze', 'ระดับเริ่มต้น - ได้รับทันทีเมื่อสมัครสมาชิก', '#CD7F32', 'bronze',
  0, 0, 0, 2.00, 1.0, 1, 'ส่วนลด 2% ทุกการสั่งซื้อ, สะสมแต้ม 1x', true
FROM public.buzzly_tiers bt WHERE bt.name = 'Bronze';

INSERT INTO public.loyalty_tiers (
  buzzly_tier_id, name, description, badge_color, icon_url, 
  min_points, min_spend_amount, retention_period_days, 
  discount_percentage, point_multiplier, priority_level, benefits_summary, is_active
) 
SELECT 
  bt.id, 'Silver', 'สมาชิกประจำ - ใช้งานต่อเนื่อง 6+ เดือน', '#C0C0C0', 'silver',
  500, 10000, 180, 5.00, 1.5, 2, 'ส่วนลด 5%, สะสมแต้ม 1.5x, โปรโมชั่นพิเศษ', true
FROM public.buzzly_tiers bt WHERE bt.name = 'Silver';

INSERT INTO public.loyalty_tiers (
  buzzly_tier_id, name, description, badge_color, icon_url, 
  min_points, min_spend_amount, retention_period_days, 
  discount_percentage, point_multiplier, priority_level, benefits_summary, is_active
) 
SELECT 
  bt.id, 'Gold', 'สมาชิกระดับสูง - ใช้งานต่อเนื่อง 1+ ปี', '#FFD700', 'gold',
  1500, 50000, 365, 10.00, 2.0, 3, 'ส่วนลด 10%, สะสมแต้ม 2x, Priority Support', true
FROM public.buzzly_tiers bt WHERE bt.name = 'Gold';

INSERT INTO public.loyalty_tiers (
  buzzly_tier_id, name, description, badge_color, icon_url, 
  min_points, min_spend_amount, retention_period_days, 
  discount_percentage, point_multiplier, priority_level, benefits_summary, is_active
) 
SELECT 
  bt.id, 'Platinum', 'สมาชิกพิเศษสุด - ใช้งานต่อเนื่อง 2+ ปี', '#E5E4E2', 'platinum',
  5000, 200000, 730, 15.00, 3.0, 4, 'ส่วนลด 15%, สะสมแต้ม 3x, VIP Support, เข้าถึงฟีเจอร์ใหม่ก่อนใคร', true
FROM public.buzzly_tiers bt WHERE bt.name = 'Platinum';

-- Create tier history table for tracking tier changes
CREATE TABLE IF NOT EXISTS public.tier_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_tier_id UUID REFERENCES public.loyalty_tiers(id),
  new_tier_id UUID NOT NULL REFERENCES public.loyalty_tiers(id),
  change_reason TEXT,
  changed_by UUID REFERENCES auth.users(id),
  is_manual_override BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create points transaction table for detailed tracking
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loyalty_points_id UUID REFERENCES public.loyalty_points(id),
  transaction_type VARCHAR NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'expire', 'adjustment', 'bonus')),
  points_amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type VARCHAR,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create suspicious activity table for fraud detection
CREATE TABLE IF NOT EXISTS public.suspicious_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR NOT NULL,
  severity VARCHAR DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  metadata JSONB,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add user_loyalty_tier_id to profiles for quick tier lookup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS loyalty_tier_id UUID REFERENCES public.loyalty_tiers(id),
ADD COLUMN IF NOT EXISTS loyalty_points_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_spend_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS member_since TIMESTAMP WITH TIME ZONE DEFAULT now();


-- Enable RLS
ALTER TABLE public.tier_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buzzly_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_tiers (public read)
CREATE POLICY "Anyone can view loyalty tiers" ON public.loyalty_tiers 
FOR SELECT USING (true);

-- RLS Policies for buzzly_tiers (public read)
CREATE POLICY "Anyone can view buzzly tiers" ON public.buzzly_tiers 
FOR SELECT USING (true);

-- RLS Policies for loyalty_points
CREATE POLICY "Users can view own loyalty points" ON public.loyalty_points 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.loyalty_tier_id = loyalty_points.loyalty_tier_id
  )
);

CREATE POLICY "Employees can view all loyalty points" ON public.loyalty_points 
FOR SELECT USING (is_employee(auth.uid()));

CREATE POLICY "Employees can manage loyalty points" ON public.loyalty_points 
FOR ALL USING (is_employee(auth.uid()));

-- RLS Policies for tier_history
CREATE POLICY "Users can view own tier history" ON public.tier_history 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Employees can view all tier history" ON public.tier_history 
FOR SELECT USING (is_employee(auth.uid()));

CREATE POLICY "Employees can manage tier history" ON public.tier_history 
FOR ALL USING (is_employee(auth.uid()));

-- RLS Policies for points_transactions
CREATE POLICY "Users can view own transactions" ON public.points_transactions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Employees can view all transactions" ON public.points_transactions 
FOR SELECT USING (is_employee(auth.uid()));

CREATE POLICY "Employees can manage transactions" ON public.points_transactions 
FOR ALL USING (is_employee(auth.uid()));

-- RLS Policies for suspicious_activities
CREATE POLICY "Employees can view suspicious activities" ON public.suspicious_activities 
FOR SELECT USING (is_employee(auth.uid()));

CREATE POLICY "Employees can manage suspicious activities" ON public.suspicious_activities 
FOR ALL USING (is_employee(auth.uid()));