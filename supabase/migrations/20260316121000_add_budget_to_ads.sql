ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS budget numeric(12,2);
