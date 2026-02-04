-- ==========================================
-- BUZZLY PLATFORM - COMPLETE DATABASE SCHEMA
-- Part 1: Core Tables & Reference Tables (Tables 1-40)
-- ==========================================

-- 1. aarrr_categories (AARRR Funnel)
CREATE TABLE IF NOT EXISTS public.aarrr_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(255) NOT NULL,
    display_order integer DEFAULT 0,
    description text,
    icon_url text,
    color_code varchar(7),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. action_type (for audit logs)
CREATE TABLE IF NOT EXISTS public.action_type (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action_name varchar(100) NOT NULL,
    description text,
    icon_url text,
    color_code varchar(7),
    created_at timestamptz DEFAULT now()
);

-- 3. action_type_employees
CREATE TABLE IF NOT EXISTS public.action_type_employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    action_name varchar(100) NOT NULL,
    description text,
    icon_url text,
    color_code varchar(7),
    created_at timestamptz DEFAULT now()
);

-- 4. ad_buying_types
CREATE TABLE IF NOT EXISTS public.ad_buying_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(255),
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. ad_groups
CREATE TABLE IF NOT EXISTS public.ad_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    status varchar(50),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 6. creative_types
CREATE TABLE IF NOT EXISTS public.creative_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(255),
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 7. ads
CREATE TABLE IF NOT EXISTS public.ads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_group_id uuid REFERENCES public.ad_groups(id),
    creative_type_id uuid REFERENCES public.creative_types(id),
    name varchar(255) NOT NULL,
    status varchar(50),
    creative_url text,
    platform_ad_id varchar(255),
    ad_copy text,
    preview_url text,
    headline varchar(255),
    call_to_action varchar(100),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 8. app_features
CREATE TABLE IF NOT EXISTS public.app_features (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255),
    slug varchar(255),
    description varchar(1000),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 9. buzzly_tiers
CREATE TABLE IF NOT EXISTS public.buzzly_tiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- 10. countries
CREATE TABLE IF NOT EXISTS public.countries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    code varchar(3),
    created_at timestamptz DEFAULT now()
);

-- 11. provinces
CREATE TABLE IF NOT EXISTS public.provinces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id uuid REFERENCES public.countries(id),
    province_name varchar(255) NOT NULL,
    postal_code varchar(10),
    created_at timestamptz DEFAULT now()
);

-- 12. locations
CREATE TABLE IF NOT EXISTS public.locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id uuid REFERENCES public.countries(id),
    province_id uuid REFERENCES public.provinces(id),
    district varchar(255),
    sub_district varchar(255),
    village_no varchar(50),
    house_no varchar(50),
    road varchar(255),
    alley varchar(255),
    created_at timestamptz DEFAULT now()
);

-- 13. time_zones
CREATE TABLE IF NOT EXISTS public.time_zones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id uuid REFERENCES public.countries(id),
    iana_name varchar(255) NOT NULL,
    utc_offset_sec integer,
    created_at timestamptz DEFAULT now()
);

-- 14. currencies
CREATE TABLE IF NOT EXISTS public.currencies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(3) NOT NULL,
    name varchar(100) NOT NULL,
    symbol varchar(10),
    decimal_places integer DEFAULT 2,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 15. genders
CREATE TABLE IF NOT EXISTS public.genders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name_gender varchar(50) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 16. priority_level
CREATE TABLE IF NOT EXISTS public.priority_level (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    priority_name varchar(50) NOT NULL,
    description text,
    color_code varchar(7),
    sla_hours numeric(5,2),
    created_at timestamptz DEFAULT now()
);

-- 17. security_level
CREATE TABLE IF NOT EXISTS public.security_level (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(50) NOT NULL,
    description text,
    icon_url text,
    color_code varchar(7),
    created_at timestamptz DEFAULT now()
);

-- 18. status_category
CREATE TABLE IF NOT EXISTS public.status_category (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    color_code varchar(7),
    icon_url text,
    created_at timestamptz DEFAULT now()
);

-- 19. status_code
CREATE TABLE IF NOT EXISTS public.status_code (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    status_category_id uuid REFERENCES public.status_category(id),
    name varchar(100) NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- 20. change_type
CREATE TABLE IF NOT EXISTS public.change_type (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    priority_level_id uuid REFERENCES public.priority_level(id),
    name varchar(100) NOT NULL,
    description text,
    color_code varchar(7),
    created_at timestamptz DEFAULT now()
);

-- 21. rating
CREATE TABLE IF NOT EXISTS public.rating (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100),
    icon_url varchar(255),
    color_code varchar(10),
    descriptions varchar(500),
    created_at timestamptz DEFAULT now()
);

-- 22. tags
CREATE TABLE IF NOT EXISTS public.tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    color_code varchar(7),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 23. role_customers
CREATE TABLE IF NOT EXISTS public.role_customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 24. role_employees
CREATE TABLE IF NOT EXISTS public.role_employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name varchar(100) NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- 25. roles (general)
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    descriptions text,
    created_at timestamptz DEFAULT now()
);

-- 26. loyalty_tiers
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    buzzly_tier_id uuid REFERENCES public.buzzly_tiers(id),
    name varchar(255) NOT NULL,
    min_points integer DEFAULT 0,
    point_multiplier numeric(5,2) DEFAULT 1.0,
    description text,
    min_spend_amount numeric(15,2) DEFAULT 0.00,
    discount_percentage numeric(5,2) DEFAULT 0.00,
    icon_url text,
    badge_color varchar(20),
    priority_level integer DEFAULT 0,
    retention_period_days integer,
    is_active boolean DEFAULT true,
    benefits_summary text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 27. loyalty_points
CREATE TABLE IF NOT EXISTS public.loyalty_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    loyalty_tier_id uuid REFERENCES public.loyalty_tiers(id),
    point_balance integer DEFAULT 0,
    status varchar(50),
    total_points_earned integer DEFAULT 0,
    total_points_spend integer DEFAULT 0,
    expiry_date timestamptz,
    last_earned_at timestamptz,
    last_spent_at timestamptz,
    is_blocked boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 28. discounts
CREATE TABLE IF NOT EXISTS public.discounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(50) NOT NULL UNIQUE,
    discount_type varchar(50),
    discount_value numeric(15,2) DEFAULT 0,
    min_order_value numeric(15,2) DEFAULT 0,
    max_discount_amount numeric(15,2),
    usage_limit integer,
    usage_count integer DEFAULT 0,
    start_date timestamptz,
    end_date timestamptz,
    is_active boolean DEFAULT true,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 29. payment_providers
CREATE TABLE IF NOT EXISTS public.payment_providers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(255),
    description text,
    icon_url text,
    api_endpoint text,
    is_active boolean DEFAULT true,
    supported_currencies text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 30. payment_methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id uuid REFERENCES public.payment_providers(id),
    name varchar(255) NOT NULL,
    slug varchar(255),
    description text,
    icon_url text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 31. subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    price_monthly numeric(15,2),
    price_yearly numeric(15,2),
    status varchar(50),
    description text,
    max_workspace integer,
    feature_active jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 32. subscription_orders
CREATE TABLE IF NOT EXISTS public.subscription_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id uuid REFERENCES public.subscription_plans(id),
    currency_id uuid REFERENCES public.currencies(id),
    payment_method_id uuid REFERENCES public.payment_methods(id),
    discount_code_id uuid REFERENCES public.discounts(id),
    user_id uuid,
    order_number varchar(100) NOT NULL,
    status varchar(50),
    start_date timestamptz,
    end_date timestamptz,
    tax_amount numeric(15,2) DEFAULT 0.00,
    is_recurring boolean DEFAULT false,
    cancelled_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 33. product_categories
CREATE TABLE IF NOT EXISTS public.product_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    parent_id uuid,
    created_at timestamptz DEFAULT now()
);

-- 34. variant_products
CREATE TABLE IF NOT EXISTS public.variant_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_category_id uuid REFERENCES public.product_categories(id),
    name varchar(255) NOT NULL,
    sku varchar(100),
    description text,
    price numeric(15,2),
    created_at timestamptz DEFAULT now()
);

-- 35. funnel_stages
CREATE TABLE IF NOT EXISTS public.funnel_stages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aarrr_categories_id uuid REFERENCES public.aarrr_categories(id),
    name varchar(200),
    slug varchar(200),
    display_order integer,
    description varchar(500),
    created_at timestamptz DEFAULT now()
);

-- 36. event_definition
CREATE TABLE IF NOT EXISTS public.event_definition (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    funnel_stages_id uuid REFERENCES public.funnel_stages(id),
    app_features_id uuid REFERENCES public.app_features(id),
    event_name varchar(255),
    display_name varchar(255),
    created_at timestamptz DEFAULT now()
);

-- 37. event_categories
CREATE TABLE IF NOT EXISTS public.event_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(255),
    description text,
    color_code varchar(7),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 38. mapping_categories
CREATE TABLE IF NOT EXISTS public.mapping_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(255),
    description text,
    target_table varchar(255),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 39. mapping_groups
CREATE TABLE IF NOT EXISTS public.mapping_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mapping_category_id uuid REFERENCES public.mapping_categories(id),
    name varchar(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 40. metric_templates
CREATE TABLE IF NOT EXISTS public.metric_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mapping_category_id uuid REFERENCES public.mapping_categories(id),
    metric_name varchar(255) NOT NULL,
    description text,
    data_type varchar(50),
    unit varchar(50),
    display_format varchar(100),
    is_calculated boolean DEFAULT false,
    calculation_formula text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables (will add policies later)
ALTER TABLE public.aarrr_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_type_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_buying_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buzzly_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priority_level ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_level ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_definition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapping_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapping_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_templates ENABLE ROW LEVEL SECURITY;