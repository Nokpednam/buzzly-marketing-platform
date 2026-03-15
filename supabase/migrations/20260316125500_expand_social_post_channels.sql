ALTER TABLE public.social_posts
  DROP CONSTRAINT IF EXISTS social_posts_post_channel_check;

ALTER TABLE public.social_posts
  ADD CONSTRAINT social_posts_post_channel_check
  CHECK (post_channel = ANY (ARRAY['social'::text, 'email'::text, 'ad'::text]));
