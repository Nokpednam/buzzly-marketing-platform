-- ============================================================
-- Migration: Drop Unused / Redundant Tables
-- Date: 2026-02-18
-- Description: Remove 18 tables that have no UI/UX references
--              and are either unused or redundant with other tables.
--              CASCADE is used to automatically drop dependent FK constraints.
-- ============================================================

-- 1. action_type_employees
--    Reason: Schema identical to action_type, no UI usage at all.
DROP TABLE IF EXISTS public.action_type_employees CASCADE;

-- 2. ai_parameters
--    Reason: No UI references. No admin panel to manage these.
DROP TABLE IF EXISTS public.ai_parameters CASCADE;

-- 3. audit_log_employees
--    Reason: Redundant with audit_logs_enhanced. No UI usage.
DROP TABLE IF EXISTS public.audit_log_employees CASCADE;

-- 4. budgets
--    Reason: No UI references. Budget management not yet implemented.
DROP TABLE IF EXISTS public.budgets CASCADE;

-- 5. change_type
--    Reason: No UI references. Lookup table with no consumer.
DROP TABLE IF EXISTS public.change_type CASCADE;

-- 6. conversion_items
--    Reason: No UI references. conversion_events is used but not this.
DROP TABLE IF EXISTS public.conversion_items CASCADE;

-- 7. creative_types
--    Reason: No UI references. ads table has creative_type_id FK but UI doesn't use it.
DROP TABLE IF EXISTS public.creative_types CASCADE;

-- 8. customer_insights
--    Reason: Redundant with profile_customers (salary_range overlap).
--            No UI references after Settings page was fixed to use profile_customers.
DROP TABLE IF EXISTS public.customer_insights CASCADE;

-- 9. event_categories
--    Reason: No UI references. event_types is used but not this parent category.
DROP TABLE IF EXISTS public.event_categories CASCADE;

-- 10. event_definition
--     Reason: No UI references. Lookup table with no consumer.
DROP TABLE IF EXISTS public.event_definition CASCADE;

-- 11. loyalty_points
--     Reason: Redundant with customer.loyalty_points_balance and points_transactions.
--             No UI references.
DROP TABLE IF EXISTS public.loyalty_points CASCADE;

-- 12. mapping_categories
--     Reason: No UI references. Internal mapping infrastructure not yet used.
DROP TABLE IF EXISTS public.mapping_categories CASCADE;

-- 13. mapping_groups
--     Reason: No UI references. Internal mapping infrastructure not yet used.
DROP TABLE IF EXISTS public.mapping_groups CASCADE;

-- 14. product_categories
--     Reason: No UI references. E-commerce features not yet implemented.
DROP TABLE IF EXISTS public.product_categories CASCADE;

-- 15. role_customers
--     Reason: Redundant with user_roles (app_role enum). No UI references.
DROP TABLE IF EXISTS public.role_customers CASCADE;

-- 16. scheduled_reports
--     Reason: No UI references. Reports scheduling not yet implemented.
DROP TABLE IF EXISTS public.scheduled_reports CASCADE;

-- 17. variant_products
--     Reason: No UI references. E-commerce features not yet implemented.
DROP TABLE IF EXISTS public.variant_products CASCADE;

-- 18. team_role_permissions
--     Reason: Redundant with workspace_members.custom_permissions (jsonb).
--             No UI references.
DROP TABLE IF EXISTS public.team_role_permissions CASCADE;

-- ============================================================
-- Summary of what was dropped:
--   - 2 duplicate action type tables (action_type_employees)
--   - 2 redundant user data tables (customer_insights, role_customers)
--   - 2 redundant audit/log tables (audit_log_employees)
--   - 2 redundant loyalty tables (loyalty_points)
--   - 1 redundant permissions table (team_role_permissions)
--   - 9 unused feature tables (ai_parameters, budgets, change_type,
--     conversion_items, creative_types, event_categories, event_definition,
--     mapping_categories, mapping_groups, product_categories,
--     scheduled_reports, variant_products)
-- ============================================================
