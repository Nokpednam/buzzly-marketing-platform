#!/bin/bash

# ========================================
# Buzzly First-Time Setup Script
# ========================================
# สคริปต์นี้สำหรับรันครั้งแรกหลัง git clone
# จะตั้งค่า database และสร้าง owner account

set -e  # Exit on error

echo "🚀 Buzzly First-Time Setup"
echo "=================================="
echo ""

# 1. Check if Supabase is running
echo "📡 Checking Supabase status..."
DB_CONTAINER=$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -n 1)

if [ -z "$DB_CONTAINER" ]; then
    echo "❌ Supabase is not running!"
    echo "   Starting Supabase..."
    npx supabase start
    
    # Wait and re-check
    sleep 5
    DB_CONTAINER=$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -n 1)
    
    if [ -z "$DB_CONTAINER" ]; then
        echo "❌ Failed to start Supabase. Please run 'npx supabase start' manually."
        exit 1
    fi
fi

echo "✅ Supabase is running: $DB_CONTAINER"
echo ""

# 2. Reset database to ensure clean state
echo "🔄 Resetting database to clean state..."
npx supabase db reset --local

if [ $? -ne 0 ]; then
    echo "❌ Database reset failed!"
    exit 1
fi

echo "✅ Database reset complete"
echo ""

# 3. Run migrations (already done by db reset, but we confirm)
echo "📦 All migrations have been applied"
echo ""

# 4. Create owner account
echo "👤 Creating owner account..."
cat supabase/script/create-owner-user.sql | docker exec -i $DB_CONTAINER psql -U postgres -d postgres

if [ $? -ne 0 ]; then
    echo "❌ Failed to create owner account!"
    exit 1
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "   1. Start dev server:"
echo "      npm run dev"
echo ""
echo "   2. Login with:"
echo "      URL:      http://localhost:5173/admin/login"
echo "      Email:    hachikonoluna@gmail.com"
echo "      Password: owner123"
echo ""
echo "🔒 Please change password after first login!"
echo ""
echo "📚 Optional: Load sample data with:"
echo "   DB_CONTAINER=\$(docker ps --filter \"name=supabase_db\" --format \"{{.Names}}\" | head -n 1)"
echo "   cat sample-data/sample-data.sql | docker exec -i \$DB_CONTAINER psql -U postgres -d postgres"
echo ""
