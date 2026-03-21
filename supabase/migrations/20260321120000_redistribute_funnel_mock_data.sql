-- Migration: Redistribute funnel mock data
-- Purpose: Spreads out the heavily concentrated mock data in ad_insights 
-- so that ~50% of the entries are backdated to a random date between 31 and 90 days ago.
-- This ensures the AARRR Funnel 30-day and 90-day chart comparisons look realistic for demonstrations.

UPDATE ad_insights
SET date = CURRENT_DATE - (floor(random() * 60) + 31)::int
WHERE random() < 0.5;
