
-- 1. Drop the separate 'ad_posts' table (email) if it exists
DROP TABLE IF EXISTS public.ad_posts CASCADE;

-- 2. Add 'post_channel' column to 'social_posts' to distinguish between Social and Email
-- Default existing rows to 'social'
ALTER TABLE public.social_posts 
ADD COLUMN IF NOT EXISTS post_channel TEXT NOT NULL DEFAULT 'social' CHECK (post_channel IN ('social', 'email'));

-- 3. Add Email-specific columns to 'social_posts'
ALTER TABLE public.social_posts
ADD COLUMN IF NOT EXISTS subject TEXT,
ADD COLUMN IF NOT EXISTS name TEXT, -- For internal campaign name
ADD COLUMN IF NOT EXISTS recipient_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- 4. Re-create RLS policies ensures they cover the new columns appropriately
-- (Previous policies on social_posts likely sufficient, but good to be explicit if logic changes)
-- For now, existing workspace policies should hold, as they check team_id.
-- We might need to ensure 'subject' etc are readable. RLS is row-based, so usually fine.

-- 5. Add index for post_channel for performance
CREATE INDEX IF NOT EXISTS idx_social_posts_channel ON public.social_posts(post_channel);
