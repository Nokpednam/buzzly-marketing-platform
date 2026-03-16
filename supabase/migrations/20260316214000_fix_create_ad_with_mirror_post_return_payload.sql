-- Ensure create_ad_with_mirror_post always returns the inserted ad row,
-- including a guaranteed non-null id for frontend persona-linking flows.
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
  v_ad_id   uuid;
  v_ad_row  public.ads%ROWTYPE;
BEGIN
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
  RETURNING * INTO v_ad_row;

  v_ad_id := v_ad_row.id;

  INSERT INTO public.social_posts (
    id, team_id, platform_id, post_type, post_channel,
    name, content, media_urls, status, scheduled_at, ad_group_id
  )
  VALUES (
    v_ad_id, p_team_id, p_platform_id, p_creative_type, 'ad',
    p_name, p_content, p_media_urls, p_status, p_scheduled_at, p_ad_group_id
  );

  RETURN row_to_json(v_ad_row);
END;
$$;
