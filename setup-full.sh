#!/bin/bash

# ========================================
# Buzzly Full Setup Script (Combined)
# ========================================
# Combines: setup-first-step.sh, owner_setup.txt, setup-dashboard.sh

set -e  # Exit on error

echo "🚀 Buzzly Full Setup (All-in-One)"
echo "=================================="
echo "⚠️  WARNING: This will RESET the database and DELETE all data."
echo "   You have 5 seconds to cancel (Ctrl+C)..."
sleep 5
echo ""

# Ensure we are in the project root
cd "$(dirname "$0")"

# ---------------------------------------------------------
# 1. Check/Start Supabase
# ---------------------------------------------------------
echo "Step 1: Checking Supabase status..."
# Check if supabase is running, if not start it
if ! npx --yes supabase status > /dev/null 2>&1; then
    echo "   Starting Supabase..."
    npx --yes supabase start
else
    echo "✅ Supabase is already running."
fi

# Get Container Name
DB_CONTAINER=$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -n 1)
if [ -z "$DB_CONTAINER" ]; then
    echo "❌ Failed to find Supabase DB container. Is it running?"
    exit 1
fi
echo "✅ DB Container found: $DB_CONTAINER"
echo ""

# ---------------------------------------------------------
# 2. Database Reset & Cleanup
# ---------------------------------------------------------
echo "Step 2: Resetting Database..."

# Cleanup old triggers (optional but good for safety before reset if persistent volumes are messy, 
# though db reset usually handles this. keeping from original script just in case)
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres <<'EOF'
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_profile();
EOF

npx --yes supabase db reset --local
echo "✅ Database reset complete."
echo ""

# ---------------------------------------------------------
# 3. Create Owner Account
# ---------------------------------------------------------
echo "Step 3: Creating Owner Account..."
if [ -f "supabase/script/create-owner-user.sql" ]; then
    cat supabase/script/create-owner-user.sql | docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres
    echo "✅ Owner account created."
else
    echo "❌ Error: supabase/script/create-owner-user.sql not found!"
    exit 1
fi
echo ""

# ---------------------------------------------------------
# 4. Assign Owner Role (from owner_setup.txt)
# ---------------------------------------------------------
echo "Step 4: Assigning Owner Role..."
# Execute the logic to link hachikonoluna@gmail.com as owner
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres <<'SQL_EOF'
DO $$
DECLARE
    owner_role_id uuid;
    target_email text := 'hachikonoluna@gmail.com';
    target_user_id uuid;
BEGIN
    -- 1. Get the Owner Role ID
    SELECT id INTO owner_role_id FROM public.role_employees WHERE role_name = 'owner';
    
    IF owner_role_id IS NULL THEN
        RAISE EXCEPTION 'Owner role not found in role_employees table';
    END IF;

    -- 2. Get User ID from auth.users
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User % not found in auth.users', target_email;
    END IF;

    -- 3. Handle Email Conflict and Upsert
    UPDATE public.employees
    SET user_id = target_user_id,
        updated_at = now()
    WHERE email = target_email AND user_id != target_user_id;

    INSERT INTO public.employees (user_id, email, status, approval_status, role_employees_id, created_at, updated_at)
    VALUES (
        target_user_id, 
        target_email, 
        'active', 
        'approved', 
        owner_role_id,
        now(),
        now()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        email = EXCLUDED.email,
        status = 'active', 
        approval_status = 'approved',
        role_employees_id = owner_role_id,
        updated_at = now();

    RAISE NOTICE 'Successfully set % as Owner', target_email;
END $$;
SQL_EOF
echo "✅ Owner role assigned."
echo ""

# ---------------------------------------------------------
# 4.5. Create Default Dev Account
# ---------------------------------------------------------
echo "Step 4.5: Creating Default Dev Account (dev@buzzly.co)..."
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres <<'SQL_EOF'
DO $$
DECLARE
    dev_user_id uuid := 'd0000000-0000-0000-0000-000000000000';
    dev_email text := 'dev@buzzly.co';
    dev_password text := 'dev123';
    dev_role_id uuid;
BEGIN
    -- 1. Create Identity & User in Auth Schema
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        dev_user_id,
        'authenticated',
        'authenticated',
        dev_email,
        crypt(dev_password, gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"display_name":"Dev User", "is_employee_signup": true}'::jsonb,
        NOW(),
        NOW(),
        '', '', '', ''
    )
    ON CONFLICT (id) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = EXCLUDED.email_confirmed_at,
        updated_at = NOW();

    -- Create Identity
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE provider = 'email' AND user_id = dev_user_id) THEN
        INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            dev_user_id::text,
            dev_user_id,
            jsonb_build_object('sub', dev_user_id::text, 'email', dev_email),
            'email',
            NOW(),
            NOW(),
            NOW()
        );
    END IF;

    -- 2. Assign Dev Role & Approve
    SELECT id INTO dev_role_id FROM public.role_employees WHERE role_name = 'dev';

    IF dev_role_id IS NOT NULL THEN
        INSERT INTO public.employees (user_id, email, status, approval_status, role_employees_id, created_at, updated_at)
        VALUES (dev_user_id, dev_email, 'active', 'approved', dev_role_id, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            status = 'active',
            approval_status = 'approved',
            role_employees_id = dev_role_id,
            updated_at = NOW();
            
        RAISE NOTICE '✅ Created Dev User: % (Password: %)', dev_email, dev_password;
    ELSE
        RAISE WARNING '⚠️ Dev role not found! Employee record not created.';
    END IF;
END $$;
SQL_EOF
echo "✅ Dev account created."
echo ""

# ---------------------------------------------------------
# 4.6. Create Default Support Account
# ---------------------------------------------------------
echo "Step 4.6: Creating Default Support Account (support@buzzly.co)..."
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres <<'SQL_EOF'
DO $$
DECLARE
    support_user_id uuid := 'e0000000-0000-0000-0000-000000000000';
    support_email text := 'support@buzzly.co';
    support_password text := 'support123';
    support_role_id uuid;
BEGIN
    -- 1. Create Identity & User in Auth Schema
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        support_user_id,
        'authenticated',
        'authenticated',
        support_email,
        crypt(support_password, gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"display_name":"Support User", "is_employee_signup": true}'::jsonb,
        NOW(),
        NOW(),
        '', '', '', ''
    )
    ON CONFLICT (id) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = EXCLUDED.email_confirmed_at,
        updated_at = NOW();

    -- Create Identity
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE provider = 'email' AND user_id = support_user_id) THEN
        INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            support_user_id::text,
            support_user_id,
            jsonb_build_object('sub', support_user_id::text, 'email', support_email),
            'email',
            NOW(),
            NOW(),
            NOW()
        );
    END IF;

    -- 2. Assign Support Role & Approve
    SELECT id INTO support_role_id FROM public.role_employees WHERE role_name = 'support';

    IF support_role_id IS NOT NULL THEN
        INSERT INTO public.employees (user_id, email, status, approval_status, role_employees_id, created_at, updated_at)
        VALUES (support_user_id, support_email, 'active', 'approved', support_role_id, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            status = 'active',
            approval_status = 'approved',
            role_employees_id = support_role_id,
            updated_at = NOW();
            
        RAISE NOTICE '✅ Created Support User: % (Password: %)', support_email, support_password;
    ELSE
        RAISE WARNING '⚠️ Support role not found! Employee record not created.';
    END IF;
END $$;
SQL_EOF
echo "✅ Support account created."
echo ""

# ---------------------------------------------------------
# 5. Run Dashboard Fixes & Seeding (from setup-dashboard.sh)
# ---------------------------------------------------------
echo "Step 5: Running Dashboard Fixes & Seeds..."


run_sql_script() {
    local file=$1
    local description=$2
    echo "→ Running: $description ($file)"
    if [ -f "$file" ]; then
        cat "$file" | docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres > /dev/null
        echo "  ✓ Success"
    else
        echo "  ❌ File not found: $file"
        exit 1
    fi
}

run_sql_script "sample-data/unified-seed.sql" "Seeding Realistic Data (Users, Feedbacks, etc.)"

# ---------------------------------------------------------
# 5.5 Seed non-customer data (Owner/Employee side only)
# ---------------------------------------------------------
echo "Step 5.5: Seeding non-customer data (billing, team logs)..."
DB_CONTAINER=$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -n 1)

run_mock_sql() {
    local file=$1
    local description=$2
    echo "→ Running: $description"
    if [ -f "$file" ]; then
        cat "$file" | docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres > /dev/null 2>&1
        echo "  ✓ Done"
    else
        echo "  ⚠ Skipped (file not found): $file"
    fi
}

# NOTE: Customer-facing graph data (campaigns, ad_insights, social_posts,
# prospects, funnel activities, cohort analysis) is NO LONGER seeded here.
# That data must come from the user manually connecting platforms via /api-keys.
# Only non-customer seeds remain below:

run_mock_sql "supabase/migrations/20260218200007_mock_billing_reports.sql" "Discounts, Invoices, Reports"
run_mock_sql "supabase/migrations/20260218200008_mock_team_activity_logs.sql" "Team Activity Logs"
run_mock_sql "supabase/migrations/20260218200010_mock_owner_pages.sql" "Owner Pages (Subscriptions, Cohorts, Tiers)"

echo "✅ Non-customer data seeded."
echo ""

# ---------------------------------------------------------
# 5.7: Seed Business Performance — Payment Transactions
# ---------------------------------------------------------
echo "Step 5.7: Seeding Revenue Trends data (payment_transactions)..."
echo "   → Generates 12 months of realistic transaction history"
echo "   → Prices updated to THB (฿990 Pro / ฿2,490 Team)"
run_mock_sql "supabase/snippets/fix_payment_transactions_sync.sql" "Revenue Trends: 12-month payment transactions"
echo "✅ Payment transactions seeded — Revenue Trends chart ready."
echo ""

echo "========================================="
echo "✅✅ SETUP COMPLETE SUCCESSFULLY! ✅✅"
echo "========================================="
echo "Owner Login   : hachikonoluna@gmail.com / owner123"
echo "Dev Login     : dev@buzzly.co / dev123"
echo "Support Login : support@buzzly.co / support123"