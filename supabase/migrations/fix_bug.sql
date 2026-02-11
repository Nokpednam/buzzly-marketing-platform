ALTER TABLE public.subscription_plans
ADD COLUMN IF NOT EXISTS tier INTEGER NOT NULL DEFAULT 1,
ADD CONSTRAINT subscription_plans_tier_positive CHECK (tier >= 1);