-- Migration to add mid-funnel event columns to ad_insights for Customer Journey tracking

ALTER TABLE public.ad_insights
ADD COLUMN IF NOT EXISTS leads integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS adds_to_cart integer DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.ad_insights.leads IS 'Number of leads generated (e.g., from lead gen campaigns)';
COMMENT ON COLUMN public.ad_insights.adds_to_cart IS 'Number of add to cart events';