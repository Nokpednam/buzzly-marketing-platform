-- Add phone column to customer_insights table
ALTER TABLE customer_insights 
ADD COLUMN phone text;

-- Add index for better query performance
CREATE INDEX idx_customer_insights_phone ON customer_insights(phone);