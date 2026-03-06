-- Migration: Add table comments to clarify customer scope
-- Date: 2026-03-07
-- Purpose: Document the difference between customer tables for developers

-- B2B: Buzzly platform subscribers (business owners who use Buzzly)
COMMENT ON TABLE public.customer IS 
  'B2B: Buzzly platform subscribers. These are business owners / account holders who subscribe to Buzzly. Created automatically on auth.users signup via trigger.';

-- B2C: End-consumer profiles for loyalty/rewards system
COMMENT ON TABLE public.profile_customers IS 
  'B2C: End-consumer / loyalty member profiles. These are the customers of the businesses using Buzzly (e.g., shoppers who earn points). Created on auth.users signup via trigger. Primary source of truth for loyalty, rewards, and tier system.';

-- Marketing personas: not real users, but fictional archetypes
COMMENT ON TABLE public.customer_personas IS 
  'Marketing personas created by workspace teams. These are fictional customer archetypes used for campaign targeting — NOT real users. Scoped to team_id (workspace).';

-- customer_activities: behavioral tracking log
COMMENT ON TABLE public.customer_activities IS 
  'Behavioral activity log for profile_customers. Tracks page visits, events, clicks. Used by useFunnelData and useAnalyticsData hooks for AARRR funnel analysis.';

-- customer_insights: legacy/partially-used table
-- COMMENT ON TABLE public.customer_insights IS 
--  'LEGACY: Originally stored profession/salary info from signup form. Now partially superseded by profile_customers.salary_range and customer_personas fields. Do not add new features here without discussion.';

-- prospects: unused, kept for future lead management
COMMENT ON TABLE public.prospects IS 
  'UNUSED: Intended for prospective lead management (name, email, source, status). Currently not used by any frontend code. The /prospects route now redirects to /personas (customer_personas). Reserved for future CRM/lead pipeline feature.';
