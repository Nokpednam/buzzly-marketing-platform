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

# Ensure we are in the project root
cd "$(dirname "$0")/.."


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

# 2. Clean up potential conflicting triggers/functions (Requested by User)
echo "🧹 Cleaning up old triggers/functions..."
docker exec -i $DB_CONTAINER psql -U postgres -d postgres <<EOF
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_user_profile();
EOF

# 3. Reset database to ensure clean state
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
