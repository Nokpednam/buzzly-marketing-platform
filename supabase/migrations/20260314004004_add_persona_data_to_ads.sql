-- Phase Persona Analytics — add persona_data JSONB column to ads
-- Stores audience demographic breakdown ingested from platform ad APIs.
-- Structure: { age_distribution, gender, top_locations, interests, device_type }

ALTER TABLE ads
  ADD COLUMN IF NOT EXISTS persona_data JSONB DEFAULT NULL;

-- Optional GIN index for fast JSON queries (e.g. filter by interest/location)
CREATE INDEX IF NOT EXISTS idx_ads_persona_data
  ON ads USING GIN (persona_data)
  WHERE persona_data IS NOT NULL;
