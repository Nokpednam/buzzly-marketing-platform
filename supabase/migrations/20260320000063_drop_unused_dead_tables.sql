-- ============================================================
-- Migration: Drop Unused Dead Tables
-- Date: 2026-03-20
-- Description: Remove tables that have no code references:
--   1. api_configurations — replaced by workspace_api_keys
--   2. app_features — using PlanContext/hasFeature() instead
--   3. priority_level — loyalty_tiers uses column priority_level, not this table
--   (change_type was already dropped in 20260218000003)
-- ============================================================

-- 1. api_configurations
--    Reason: Replaced by workspace_api_keys. No FK references.
DROP TABLE IF EXISTS public.api_configurations CASCADE;

-- 2. app_features
--    Reason: Using PlanContext/hasFeature() for plan-based features.
--    event_definition (which had FK to this) was already dropped in 20260218000003.
DROP TABLE IF EXISTS public.app_features CASCADE;

-- 3. priority_level
--    Reason: loyalty_tiers uses its own priority_level column (integer).
--    change_type (which had FK to this) was already dropped in 20260218000003.
DROP TABLE IF EXISTS public.priority_level CASCADE;
