ALTER TABLE public.social_posts
  ADD COLUMN ad_group_id uuid REFERENCES public.ad_groups(id) ON DELETE SET NULL;

CREATE INDEX idx_social_posts_ad_group_id ON public.social_posts(ad_group_id);
