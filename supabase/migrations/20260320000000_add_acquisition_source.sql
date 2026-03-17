-- Add acquisition_source to customer table
-- Tracks how customers discovered Buzzly (e.g. Facebook, Google, Referral)
-- Used for Acquisition analytics in Product Usage / AARRR funnel

ALTER TABLE public.customer
ADD COLUMN IF NOT EXISTS acquisition_source TEXT;

COMMENT ON COLUMN public.customer.acquisition_source IS 'How the customer discovered Buzzly: platform/channel (e.g. facebook, google, referral)';

-- Backfill existing customers with random acquisition source (for mock/seed data)
UPDATE public.customer
SET acquisition_source = (ARRAY['google', 'facebook', 'instagram', 'tiktok', 'referral', 'advertisement'])[1 + floor(random() * 6)::int]
WHERE acquisition_source IS NULL;
