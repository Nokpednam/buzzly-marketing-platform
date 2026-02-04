-- ==========================================
-- BUZZLY PLATFORM - COMPLETE DATABASE SCHEMA
-- Part 2: Business Tables (Tables 41-75)
-- ==========================================

-- 41. platform_mapping_events
CREATE TABLE IF NOT EXISTS public.platform_mapping_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id uuid REFERENCES public.platforms(id),
    mapping_category_id uuid REFERENCES public.mapping_categories(id),
    platform_field_name varchar(255) NOT NULL,
    standard_field_name varchar(255),
    data_type varchar(50),
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 42. platform_standard_mappings
CREATE TABLE IF NOT EXISTS public.platform_standard_mappings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id uuid REFERENCES public.platforms(id),
    mapping_category_id uuid REFERENCES public.mapping_categories(id),
    platform_field_name varchar(255) NOT NULL,
    standard_field_name varchar(255),
    transform_formula text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 43. attribution_types
CREATE TABLE IF NOT EXISTS public.attribution_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_mapping_standard_id uuid REFERENCES public.platform_standard_mappings(id),
    name varchar(255) NOT NULL,
    attribution_window_days integer,
    slug varchar(255),
    description text,
    priority_score integer DEFAULT 0,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 44. event_types
CREATE TABLE IF NOT EXISTS public.event_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_category_id uuid REFERENCES public.event_categories(id),
    platform_mapping_event_id uuid REFERENCES public.platform_mapping_events(id),
    name varchar(255) NOT NULL,
    slug varchar(255),
    description text,
    priority_score integer DEFAULT 0,
    icon_url text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 45. ad_accounts
CREATE TABLE IF NOT EXISTS public.ad_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid REFERENCES public.teams(id),
    platform_id uuid REFERENCES public.platforms(id),
    account_name varchar(255) NOT NULL,
    platform_account_id varchar(255),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 46. campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_account_id uuid REFERENCES public.ad_accounts(id),
    ad_buying_type_id uuid REFERENCES public.ad_buying_types(id),
    mapping_groups_id uuid REFERENCES public.mapping_groups(id),
    name varchar(255) NOT NULL,
    status varchar(50),
    objective varchar(100),
    budget_amount numeric(15,2),
    start_date timestamptz,
    end_date timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 47. ad_insights
CREATE TABLE IF NOT EXISTS public.ad_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_account_id uuid REFERENCES public.ad_accounts(id),
    campaign_id uuid REFERENCES public.campaigns(id),
    ads_id uuid REFERENCES public.ads(id),
    date date NOT NULL,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    spend numeric(15,2) DEFAULT 0,
    roas numeric(15,2),
    conversions integer DEFAULT 0,
    reach integer DEFAULT 0,
    ctr numeric(8,4),
    cpc numeric(15,2),
    cpm numeric(15,2),
    created_at timestamptz DEFAULT now()
);

-- 48. conversion_items
CREATE TABLE IF NOT EXISTS public.conversion_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_category_id uuid REFERENCES public.product_categories(id),
    variant_product_id uuid REFERENCES public.variant_products(id),
    product_name varchar(255),
    quantity integer DEFAULT 1,
    unit_price numeric(15,2) DEFAULT 0.00,
    total_price numeric(15,2),
    created_at timestamptz DEFAULT now()
);

-- 49. conversion_events
CREATE TABLE IF NOT EXISTS public.conversion_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_account_id uuid REFERENCES public.ad_accounts(id),
    ads_id uuid REFERENCES public.ads(id),
    event_type_id uuid REFERENCES public.event_types(id),
    attribution_type_id uuid REFERENCES public.attribution_types(id),
    conversion_item_id uuid REFERENCES public.conversion_items(id),
    occurred_at timestamptz NOT NULL,
    platform_event_id varchar(255),
    event_name varchar(255),
    event_value numeric(15,2) DEFAULT 0,
    attribution_window integer,
    processing_status varchar(50) DEFAULT 'pending',
    meta_data jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 50. profile_customers
CREATE TABLE IF NOT EXISTS public.profile_customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    gender_id uuid REFERENCES public.genders(id),
    loyalty_point_id uuid REFERENCES public.loyalty_points(id),
    role_id uuid REFERENCES public.roles(id),
    subscription_order_id uuid REFERENCES public.subscription_orders(id),
    location_id uuid REFERENCES public.locations(id),
    first_name varchar(255),
    last_name varchar(255),
    phone_number varchar(50),
    birthday_at date,
    last_active timestamptz,
    profile_img text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 51. customer_activities
CREATE TABLE IF NOT EXISTS public.customer_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_customer_id uuid REFERENCES public.profile_customers(id),
    event_type_id uuid REFERENCES public.event_types(id),
    campaign_id uuid REFERENCES public.campaigns(id),
    session_id varchar(255),
    page_url text,
    referrer_url text,
    device_type varchar(50),
    browser varchar(100),
    ip_address varchar(45),
    event_data jsonb,
    created_at timestamptz DEFAULT now()
);

-- 52. feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rating_id uuid REFERENCES public.rating(id),
    customer_activities_id uuid REFERENCES public.customer_activities(id),
    user_id uuid,
    comment varchar(2000),
    created_at timestamptz DEFAULT now()
);

-- 53. persona_definition
CREATE TABLE IF NOT EXISTS public.persona_definition (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    description text,
    characteristics jsonb,
    demographics jsonb,
    behaviors jsonb,
    icon_url text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 54. provider_server
CREATE TABLE IF NOT EXISTS public.provider_server (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    icon_url text,
    link_url text,
    created_at timestamptz DEFAULT now()
);

-- 55. server
CREATE TABLE IF NOT EXISTS public.server (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_server_id uuid REFERENCES public.provider_server(id),
    hostname varchar(255) NOT NULL,
    ip_address varchar(45),
    cpu_usage_percent numeric(5,2),
    total_memory bigint,
    used_memory bigint,
    disk_total bigint,
    disk_used bigint,
    system_boot_time timestamptz,
    status varchar(50),
    icon_url text,
    color_code varchar(7),
    last_update timestamptz DEFAULT now()
);

-- 56. employees
CREATE TABLE IF NOT EXISTS public.employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    role_employees_id uuid REFERENCES public.role_employees(id),
    email varchar(255) NOT NULL,
    password_hash text,
    status varchar(50),
    is_locked boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 57. employees_profile
CREATE TABLE IF NOT EXISTS public.employees_profile (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employees_id uuid REFERENCES public.employees(id),
    role_employees_id uuid REFERENCES public.role_employees(id),
    first_name varchar(100),
    last_name varchar(100),
    birthday_at date,
    last_active timestamptz,
    profile_img text,
    aptitude text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 58. audit_logs (enhanced)
CREATE TABLE IF NOT EXISTS public.audit_logs_enhanced (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    server_id uuid REFERENCES public.server(id),
    action_type_id uuid REFERENCES public.action_type(id),
    category varchar(100),
    description text,
    ip_address varchar(45),
    status varchar(50),
    error_id uuid,
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);

-- 59. audit_log_employees
CREATE TABLE IF NOT EXISTS public.audit_log_employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employees_id uuid REFERENCES public.employees(id),
    action_employees_id uuid REFERENCES public.action_type_employees(id),
    metadata jsonb,
    action_timestamp timestamptz DEFAULT now(),
    ip_address varchar(45),
    old_values jsonb,
    new_values jsonb,
    target_entity_id uuid
);

-- 60. external_api_status
CREATE TABLE IF NOT EXISTS public.external_api_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id uuid REFERENCES public.platforms(id),
    latency_ms integer,
    last_status_code integer,
    icon_url text,
    color_code varchar(7),
    created_at timestamptz DEFAULT now()
);

-- 61. pipeline_type
CREATE TABLE IF NOT EXISTS public.pipeline_type (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(100) NOT NULL,
    description text,
    icon_url text,
    color_code varchar(7),
    created_at timestamptz DEFAULT now()
);

-- 62. data_pipeline
CREATE TABLE IF NOT EXISTS public.data_pipeline (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_type_id uuid REFERENCES public.pipeline_type(id),
    name varchar(255) NOT NULL,
    status varchar(50),
    last_run_at timestamptz,
    next_run_at timestamptz,
    schedule_cron varchar(100),
    config jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 63. deployment_pipeline
CREATE TABLE IF NOT EXISTS public.deployment_pipeline (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_type_id uuid REFERENCES public.pipeline_type(id),
    name varchar(255) NOT NULL,
    status varchar(50),
    version varchar(50),
    deployed_at timestamptz,
    deployed_by uuid,
    config jsonb,
    created_at timestamptz DEFAULT now()
);

-- 64. request_logs
CREATE TABLE IF NOT EXISTS public.request_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id uuid REFERENCES public.server(id),
    status_code_id uuid REFERENCES public.status_code(id),
    method varchar(10),
    url text,
    duration_ms integer,
    request_header jsonb,
    request_body jsonb,
    response_body jsonb,
    timestamp timestamptz DEFAULT now()
);

-- 65. workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid REFERENCES public.teams(id),
    business_type_id uuid REFERENCES public.business_types(id),
    industries_id uuid REFERENCES public.industries(id),
    workspace_name varchar(255) NOT NULL,
    status varchar(50),
    workspace_url text,
    logo_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 66. workspace_members
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id uuid REFERENCES public.workspaces(id),
    user_id uuid,
    role_customer_id uuid REFERENCES public.role_customers(id),
    invitation_email varchar(255),
    status varchar(50),
    permissions_override jsonb,
    invitation_token varchar(255),
    invitation_expires_at timestamptz,
    joined_at timestamptz,
    last_accessed_at timestamptz,
    is_favourite boolean DEFAULT false,
    notification_setting jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 67. group_template_settings (junction table)
CREATE TABLE IF NOT EXISTS public.group_template_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mapping_groups_id uuid REFERENCES public.mapping_groups(id),
    metric_id uuid REFERENCES public.metric_templates(id),
    created_at timestamptz DEFAULT now()
);

-- 68-75: Add missing columns to existing tables for merge

-- Update business_types with new columns if not exist
ALTER TABLE public.business_types 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Update industries with new columns if not exist
ALTER TABLE public.industries 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Update platforms with new columns if not exist
ALTER TABLE public.platforms 
ADD COLUMN IF NOT EXISTS api_version varchar(50);

-- Update profiles with customer profile fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number varchar(50),
ADD COLUMN IF NOT EXISTS birthday_at date,
ADD COLUMN IF NOT EXISTS last_active timestamptz;

-- Update teams with additional workspace info
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS timezone varchar(100),
ADD COLUMN IF NOT EXISTS default_currency varchar(3) DEFAULT 'THB';

-- Enable RLS on new tables
ALTER TABLE public.platform_mapping_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_standard_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribution_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_definition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_server ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_api_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_template_settings ENABLE ROW LEVEL SECURITY;