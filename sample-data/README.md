# Sample Data Guide

## Overview

This directory contains SQL scripts to populate your local Buzzly database with realistic test data for development and testing.

## Quick Start

### Prerequisites

1. **Supabase running locally**: `npx supabase start`
2. **At least 3-10 auth users created** (see instructions below)
3. **Base migrations applied**: The database schema must be up to date

### Step-by-Step Setup

```bash
# 1. Start Supabase (if not already running)
npx supabase start

# 2. Reset database (optional, but recommended for fresh start)
npx supabase db reset

# 3. Create test users (see "Creating Test Users" section below)

# 4. Open Supabase Studio
# Navigate to: http://localhost:54323

# 5. Run sample data scripts in order:
#    a. In SQL Editor, run: sample-data/sample-data.sql
#    b. In SQL Editor, run: sample-data/comprehensive-sample-data.sql ⭐
#    c. (Optional) Run: sample-data/admin-mock-data.sql
```

## Creating Test Users

You need at least 3 users (recommended: 10 users) for the sample data to work properly.

### Option A: Via Application UI (Easiest)

1. Open your app: `http://localhost:3000`
2. Click "Sign up" and create 10 test accounts:
   - `test1@example.com` / password
   - `test2@example.com` / password
   - ... up to `test10@example.com`

### Option B: Via SQL (Faster)

Run this in Supabase Studio SQL Editor:

```sql
-- Create 10 test users
DO $$
DECLARE
  i INT;
  user_email TEXT;
  user_id UUID;
BEGIN
  FOR i IN 1..10 LOOP
    user_email := 'test' || i || '@example.com';
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      gen_random_uuid(),
      user_email,
      crypt('password123', gen_salt('bf')),  -- password: "password123"
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      'authenticated'
    )
    ON CONFLICT (email) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Created 10 test users (email: test1-10@example.com, password: password123)';
END $$;
```

## File Descriptions

### Core Files (Run in Order)

1. **`sample-data.sql`** ⚙️
   - Base reference data (AARRR categories, funnel stages, subscription plans, etc.)
   - Run this FIRST, only once
   - No user data required

2. **`comprehensive-sample-data.sql`** ⭐ **RECOMMENDED**
   - Complete sample data with proper relationships
   - Links: auth.users → profile_customers → subscriptions → payments
   - Creates workspaces with business types
   - Uses `setseed()` for consistent data across runs
   - **Requires**: At least 3 users in `auth.users`

3. **`admin-mock-data.sql`** 🔧 (Optional)
   - Additional data for admin panel testing
   - Teams, ad accounts, error logs
   - Run after comprehensive-sample-data.sql if needed

### Legacy Files (Not Recommended)

- **`subscription-churn-data.sql`** ⚠️ **DEPRECATED**
  - Old subscription data script with linking issues
  - Use `comprehensive-sample-data.sql` instead

## What Data Gets Created?

After running `comprehensive-sample-data.sql`, you'll have:

| Table | Records | Description |
|-------|---------|-------------|
| `workspaces` | 1 per user | Workspace for each user with business type |
| `workspace_members` | 1 per user | Links users to their workspaces |
| `profile_customers` | 1 per user | Customer profiles linked to auth.users ✅ |
| `subscriptions` | ~100 | Mix of active/cancelled subscriptions ✅ |
| `payment_transactions` | ~60-80 | Payment history for subscriptions |
| `customer_activities` | 300-1000 | User engagement events |

✅ = **Fixed! Now properly linked to auth.users**

## Verifying the Data

### Check in Database

```sql
-- 1. Verify profile_customers link to users
SELECT COUNT(*) FROM profile_customers WHERE user_id IS NOT NULL;
-- Should equal number of users

-- 2. Verify subscriptions link to real users
SELECT s.*, u.email 
FROM subscriptions s 
JOIN auth.users u ON s.user_id = u.id 
LIMIT 5;
-- Should show real email addresses

-- 3. Verify workspaces have business types
SELECT w.workspace_name, bt.name as business_type
FROM workspaces w
JOIN business_types bt ON w.business_type_id = bt.id;
-- Should show business type names

-- 4. Check MRR calculation
SELECT 
  COUNT(*) FILTER (WHERE status = 'active') as active_subs,
  SUM(sp.price_monthly) FILTER (WHERE s.status = 'active') as total_mrr
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id;
-- Should show active count and MRR value
```

### Check in Application

1. **Navigate to Product Usage**: `http://localhost:3000/owner/product-usage`
   - ✅ Total Users should be > 0
   - ✅ DAU/MAU should have values
   - ✅ **User Segments section should show business types** (Agency, Technology, etc.)
   - ✅ AARRR Funnel should display data

2. **Navigate to Business Performance**: `http://localhost:3000/owner/business-performance`
   - ✅ MRR should be > 0
   - ✅ Active Subscriptions count should match database
   - ✅ Revenue chart should show historical data
   - ✅ Cohort analysis should have rows

3. **Verify Data Linking** 🔗
   - The Total Users count should correlate with Active Subscriptions
   - User Segments business types should match workspace data
   - All pages should show consistent, non-empty data

## Troubleshooting

### "No Usage Data Detected" on Product Usage page

**Problem**: User Segments section is empty

**Solution**: Make sure you ran `comprehensive-sample-data.sql` which creates workspaces

### "No Performance Data" on Business Performance page

**Problem**: No subscriptions or MRR showing

**Solution**: 
1. Check if subscriptions were created: `SELECT COUNT(*) FROM subscriptions;`
2. Ensure users exist before running the script
3. Re-run `comprehensive-sample-data.sql`

### Different data on different machines

**Problem**: Random data varies between local environments

**Cause**: Old `subscription-churn-data.sql` doesn't use `setseed()`

**Solution**: Use `comprehensive-sample-data.sql` instead (includes `setseed(0.42)`)

### "Insufficient users" error

**Problem**: Script fails with not enough users

**Solution**: Create at least 3 users (see "Creating Test Users" section above)

## Best Practices

1. **Always reset before re-running**: Use `npx supabase db reset` for a clean slate
2. **Run scripts in order**: sample-data.sql → comprehensive-sample-data.sql
3. **Create users first**: Ensure you have 3-10 test users before running comprehensive script
4. **Use setseed() scripts**: For consistent data across team members
5. **Don't mix old and new**: Don't run both `subscription-churn-data.sql` AND `comprehensive-sample-data.sql`

## Need Help?

If you encounter issues:
1. Check the verification queries above
2. Look at the NOTICE messages when running SQL scripts
3. Ensure all prerequisites are met
4. Try resetting and running from scratch

---

**Updated**: 2026-02-17  
**Status**: ✅ Data linking issues FIXED
