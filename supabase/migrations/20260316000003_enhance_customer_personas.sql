-- TL-2: Template personas are readable across workspaces but not editable
ALTER TABLE public.customer_personas
  ADD COLUMN IF NOT EXISTS is_template boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS psychographics jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ad_targeting_mapping jsonb DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_personas_is_template
  ON public.customer_personas(is_template)
  WHERE is_template = true;

COMMENT ON COLUMN public.customer_personas.is_template IS
  'When true, persona is a read-only template visible to all workspaces but owned/editable only by the creating workspace.';
COMMENT ON COLUMN public.customer_personas.psychographics IS
  '{ values: [], lifestyle: [], buying_behavior: string, brand_affinity: [], content_preferences: [] }';
COMMENT ON COLUMN public.customer_personas.ad_targeting_mapping IS
  '{ facebook: { interests: [], behaviors: [], custom_audiences: [] }, google: { keywords: [], in_market: [], affinity: [] }, tiktok: { interest_categories: [], behavior_categories: [] } }';
