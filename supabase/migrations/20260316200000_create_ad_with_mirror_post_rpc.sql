-- create_ad_with_mirror_post
-- Inserts into `ads` AND a mirror row in `social_posts` in a single transaction.
-- This ensures the calendar (which reads social_posts) always reflects ads created
-- via AdFormDialog, with no risk of a half-written state on network failure.
--
-- SECURITY INVOKER: runs as the calling user so all RLS policies on both tables
-- apply normally. The caller must be a workspace member.

CREATE OR REPLACE FUNCTION public.create_ad_with_mirror_post(
  p_team_id        uuid,
  p_name           text,
  p_status         text,
  p_creative_type  text,
  p_headline       text,
  p_ad_copy        text,
  p_call_to_action text,
  p_content        text,
  p_media_urls     text[],
  p_scheduled_at   timestamptz,
  p_ad_group_id    uuid,
  p_platform_id    uuid,
  p_creative_url   text,
  p_platform_ad_id text,
  p_preview_url    text,
  p_budget         numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_ad_id  uuid;
  v_result json;
BEGIN
  -- 1. Insert the canonical ads row.
  INSERT INTO public.ads (
    team_id, name, status, creative_type, headline, ad_copy, call_to_action,
    content, media_urls, scheduled_at, ad_group_id, creative_url, platform_ad_id,
    preview_url, budget, updated_at
  )
  VALUES (
    p_team_id, p_name, p_status, p_creative_type, p_headline, p_ad_copy, p_call_to_action,
    p_content, p_media_urls, p_scheduled_at, p_ad_group_id, p_creative_url, p_platform_ad_id,
    p_preview_url, p_budget, now()
  )
  RETURNING id INTO v_ad_id;

  -- 2. Insert the calendar mirror row into social_posts (same UUID, post_channel = 'ad').
  --    If the social_posts INSERT fails, the entire transaction rolls back — the ads row
  --    is also discarded, preventing an orphaned ad with no calendar entry.
  INSERT INTO public.social_posts (
    id, team_id, platform_id, post_type, post_channel,
    name, content, media_urls, status, scheduled_at, ad_group_id
  )
  VALUES (
    v_ad_id, p_team_id, p_platform_id, p_creative_type, 'ad',
    p_name, p_content, p_media_urls, p_status, p_scheduled_at, p_ad_group_id
  );

  -- 3. Return the full ads row so the client can use newAd.id (e.g. for linkPersonas).
  SELECT row_to_json(a)
  INTO v_result
  FROM public.ads a
  WHERE a.id = v_ad_id;

  RETURN v_result;
END;
$$;

-- Only authenticated users may call this function.
REVOKE EXECUTE ON FUNCTION public.create_ad_with_mirror_post(
  uuid, text, text, text, text, text, text, text, text[], timestamptz,
  uuid, uuid, text, text, text, numeric
) FROM public, anon;

GRANT EXECUTE ON FUNCTION public.create_ad_with_mirror_post(
  uuid, text, text, text, text, text, text, text, text[], timestamptz,
  uuid, uuid, text, text, text, numeric
) TO authenticated;
