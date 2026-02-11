#!/bin/bash
# Automatic Dashboard Setup Script
# This script runs all required migrations in the correct order

echo "========================================="
echo "BuzzlyDev Dashboard Setup"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Please run this script from the BuzzlyDev directory"
    exit 1
fi

echo "Starting setup..."
echo ""

# Function to run SQL file
run_migration() {
    local file=$1
    local description=$2
    echo "→ Running: $description"
    # Using psql for local execution as it's more reliable for single files
    # Local Supabase default: PGPASSWORD=postgres, Port 54322
    PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f "$file"
    if [ $? -eq 0 ]; then
        echo "  ✓ Success"
    else
        echo "  ✗ Failed - Please check the error above"
        exit 1
    fi
    echo ""
}

# Step 1: Registration Fixes
echo "Step 1/5: Fixing registration system..."
run_migration "supabase/migrations/20260211183000_update_handle_new_user_extended.sql" "Extend user signup trigger"
run_migration "supabase/migrations/20260211184500_seed_genders_and_fix_rls.sql" "Seed gender options"
run_migration "supabase/migrations/20260211185500_fix_handle_new_user_strict.sql" "Add error isolation"

# Step 2: Generate Sample Data
echo "Step 2/5: Creating sample dashboard data..."
run_migration "supabase/migrations/20260211210000_reseed_dashboard_data.sql" "Generate 30 days of data"

# Step 3: Disable RLS
echo "Step 3/5: Disabling RLS for development..."
run_migration "supabase/migrations/20260211213000_disable_rls_debug.sql" "Disable Row Level Security"

echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Start your dev server: npm run dev"
echo "2. Create a new user account"
echo "3. Check your dashboard - you should see data!"
echo ""
echo "⚠️  Note: RLS is disabled for development."
echo "    For production, run FUTURE_rls_clean_setup.sql"
echo ""
