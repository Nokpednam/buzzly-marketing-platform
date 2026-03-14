-- Phase 2: Add external platform publishing fields to ads table
-- These columns track the state of an ad after it has been submitted
-- to an external platform (Facebook, Shopee, TikTok, etc.)

ALTER TABLE ads
  ADD COLUMN IF NOT EXISTS platform        TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS external_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS external_error  TEXT DEFAULT NULL;

COMMENT ON COLUMN ads.platform         IS 'External platform slug: facebook | shopee | tiktok | instagram | linkedin';
COMMENT ON COLUMN ads.external_status  IS 'Publish state returned by the platform API: pending | published | failed';
COMMENT ON COLUMN ads.external_error   IS 'Error detail from the external API when external_status = ''failed''';
