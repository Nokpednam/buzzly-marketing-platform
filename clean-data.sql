-- Clean up existing sample data (optional - use only if you want to start fresh)

-- Delete all prospects
DELETE FROM prospects;

-- Delete all customer insights
DELETE FROM customer_insights;

-- Optional: Delete all user roles (except the first admin/owner)
-- DELETE FROM user_roles WHERE role = 'customer';

-- Optional: Delete all profiles (except admin)
-- DELETE FROM profiles WHERE plan_type = 'free';
