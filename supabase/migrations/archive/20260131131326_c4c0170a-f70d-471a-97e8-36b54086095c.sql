-- =====================================================
-- Phase 1: เพิ่ม columns ใหม่เข้าตาราง teams 
-- (Merge จาก workspaces schema ใน SQL ที่ออกแบบไว้)
-- =====================================================

-- เพิ่ม columns สำหรับ Workspace info
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS workspace_url text,
ADD COLUMN IF NOT EXISTS status character varying(50) DEFAULT 'active';

-- =====================================================
-- Phase 2: สร้างตาราง business_types (หมวดหมู่ธุรกิจ)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.business_types (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(255) NOT NULL,
    slug character varying(255),
    is_active boolean DEFAULT true,
    description text,
    icon_url text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.business_types ENABLE ROW LEVEL SECURITY;

-- RLS: ทุกคนสามารถอ่านได้ (Reference data)
CREATE POLICY "Anyone can view business types" 
ON public.business_types FOR SELECT 
USING (true);

-- RLS: เฉพาะ Admin/Owner เท่านั้นที่จัดการได้
CREATE POLICY "Admins can manage business types" 
ON public.business_types FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- =====================================================
-- Phase 3: สร้างตาราง industries (อุตสาหกรรม)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.industries (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(255) NOT NULL,
    slug character varying(255),
    is_active boolean DEFAULT true,
    description text,
    icon_url text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

-- RLS: ทุกคนสามารถอ่านได้ (Reference data)
CREATE POLICY "Anyone can view industries" 
ON public.industries FOR SELECT 
USING (true);

-- RLS: เฉพาะ Admin/Owner เท่านั้นที่จัดการได้
CREATE POLICY "Admins can manage industries" 
ON public.industries FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- =====================================================
-- Phase 4: เพิ่ม FK columns เข้า teams
-- =====================================================
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS business_type_id uuid REFERENCES public.business_types(id),
ADD COLUMN IF NOT EXISTS industries_id uuid REFERENCES public.industries(id);

-- =====================================================
-- Phase 5: สร้างตาราง platform_categories
-- =====================================================
CREATE TABLE IF NOT EXISTS public.platform_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    icon_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.platform_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platform categories" 
ON public.platform_categories FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage platform categories" 
ON public.platform_categories FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- =====================================================
-- Phase 6: สร้างตาราง platforms
-- =====================================================
CREATE TABLE IF NOT EXISTS public.platforms (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    platform_category_id uuid REFERENCES public.platform_categories(id),
    name character varying(255) NOT NULL,
    slug character varying(255),
    icon_url text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platforms" 
ON public.platforms FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage platforms" 
ON public.platforms FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner'));

-- =====================================================
-- Phase 7: สร้างตาราง workspace_api_keys (เก็บ API keys ของแต่ละ workspace/team)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workspace_api_keys (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    platform_id uuid NOT NULL REFERENCES public.platforms(id),
    api_key_encrypted text,
    api_secret_encrypted text,
    access_token text,
    refresh_token text,
    token_expires_at timestamp with time zone,
    scopes text,
    account_id_on_platform character varying(255),
    webhook_url text,
    last_synced_at timestamp with time zone,
    sync_status character varying(50) DEFAULT 'pending',
    is_active boolean DEFAULT true,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(team_id, platform_id)
);

ALTER TABLE public.workspace_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS: ดูได้เฉพาะสมาชิกในทีม
CREATE POLICY "Team members can view their API keys" 
ON public.workspace_api_keys FOR SELECT 
USING (is_team_member(auth.uid(), team_id));

-- RLS: เฉพาะ Manager (owner/admin) ของทีมจัดการได้
CREATE POLICY "Team managers can manage API keys" 
ON public.workspace_api_keys FOR ALL 
USING (can_manage_team(auth.uid(), team_id));

-- =====================================================
-- Phase 8: Insert ข้อมูลพื้นฐาน business_types
-- =====================================================
INSERT INTO public.business_types (name, slug, description, display_order) VALUES
('E-Commerce', 'e-commerce', 'Online retail and digital stores', 1),
('SaaS', 'saas', 'Software as a Service businesses', 2),
('Agency', 'agency', 'Marketing and advertising agencies', 3),
('Retail', 'retail', 'Physical retail stores', 4),
('Services', 'services', 'Professional services businesses', 5),
('Manufacturing', 'manufacturing', 'Manufacturing and production', 6),
('Healthcare', 'healthcare', 'Healthcare and medical services', 7),
('Education', 'education', 'Educational institutions and EdTech', 8),
('Finance', 'finance', 'Financial services and FinTech', 9),
('Other', 'other', 'Other business types', 99)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Phase 9: Insert ข้อมูลพื้นฐาน industries
-- =====================================================
INSERT INTO public.industries (name, slug, description, display_order) VALUES
('Technology', 'technology', 'Technology and IT industry', 1),
('Consumer Goods', 'consumer-goods', 'Consumer packaged goods', 2),
('Fashion & Apparel', 'fashion-apparel', 'Fashion, clothing, and accessories', 3),
('Food & Beverage', 'food-beverage', 'Food and beverage industry', 4),
('Travel & Hospitality', 'travel-hospitality', 'Travel, hotels, and tourism', 5),
('Real Estate', 'real-estate', 'Real estate and property', 6),
('Automotive', 'automotive', 'Automotive industry', 7),
('Entertainment', 'entertainment', 'Entertainment and media', 8),
('Sports & Fitness', 'sports-fitness', 'Sports and fitness industry', 9),
('Beauty & Personal Care', 'beauty-personal-care', 'Beauty and cosmetics', 10),
('Other', 'other', 'Other industries', 99)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Phase 10: Insert ข้อมูลพื้นฐาน platform_categories
-- =====================================================
INSERT INTO public.platform_categories (name, slug, description) VALUES
('Social Media', 'social-media', 'Social media advertising platforms'),
('Search', 'search', 'Search engine advertising platforms'),
('E-Commerce', 'e-commerce', 'E-commerce and marketplace platforms'),
('Analytics', 'analytics', 'Analytics and tracking platforms'),
('Email', 'email', 'Email marketing platforms'),
('CRM', 'crm', 'Customer relationship management')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Phase 11: Insert ข้อมูลพื้นฐาน platforms
-- =====================================================
INSERT INTO public.platforms (name, slug, icon_url, description, platform_category_id) VALUES
('Meta Ads', 'meta-ads', 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png', 'Facebook and Instagram advertising', 
  (SELECT id FROM public.platform_categories WHERE slug = 'social-media' LIMIT 1)),
('Google Ads', 'google-ads', 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Ads_logo.svg', 'Google Search and Display advertising', 
  (SELECT id FROM public.platform_categories WHERE slug = 'search' LIMIT 1)),
('TikTok Ads', 'tiktok-ads', 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg', 'TikTok advertising platform', 
  (SELECT id FROM public.platform_categories WHERE slug = 'social-media' LIMIT 1)),
('LinkedIn Ads', 'linkedin-ads', 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png', 'LinkedIn B2B advertising', 
  (SELECT id FROM public.platform_categories WHERE slug = 'social-media' LIMIT 1)),
('Twitter/X Ads', 'twitter-ads', 'https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png', 'Twitter/X advertising platform', 
  (SELECT id FROM public.platform_categories WHERE slug = 'social-media' LIMIT 1)),
('Shopee Ads', 'shopee-ads', 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopee_logo.svg', 'Shopee marketplace advertising', 
  (SELECT id FROM public.platform_categories WHERE slug = 'e-commerce' LIMIT 1)),
('Lazada Ads', 'lazada-ads', 'https://upload.wikimedia.org/wikipedia/commons/9/94/Lazada.svg', 'Lazada marketplace advertising', 
  (SELECT id FROM public.platform_categories WHERE slug = 'e-commerce' LIMIT 1)),
('LINE Ads', 'line-ads', 'https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg', 'LINE advertising platform', 
  (SELECT id FROM public.platform_categories WHERE slug = 'social-media' LIMIT 1)),
('Google Analytics', 'google-analytics', 'https://upload.wikimedia.org/wikipedia/commons/8/89/Logo_Google_Analytics.svg', 'Google Analytics tracking', 
  (SELECT id FROM public.platform_categories WHERE slug = 'analytics' LIMIT 1))
ON CONFLICT DO NOTHING;

-- =====================================================
-- Phase 12: Create update trigger for new tables
-- =====================================================
CREATE TRIGGER update_business_types_updated_at
BEFORE UPDATE ON public.business_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_industries_updated_at
BEFORE UPDATE ON public.industries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_categories_updated_at
BEFORE UPDATE ON public.platform_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platforms_updated_at
BEFORE UPDATE ON public.platforms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_api_keys_updated_at
BEFORE UPDATE ON public.workspace_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();