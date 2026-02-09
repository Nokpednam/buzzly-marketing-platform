#!/bin/bash

# Buzzly Owner Account Setup Script
# This script creates the initial owner account for local development

echo "🔐 Creating Owner Account for Buzzly..."
echo ""

# Find Supabase DB container
DB_CONTAINER=$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -n 1)

if [ -z "$DB_CONTAINER" ]; then
    echo "❌ Error: Supabase database container not found!"
    echo "   Please make sure Supabase is running: npx supabase start"
    exit 1
fi

echo "📦 Found database container: $DB_CONTAINER"
echo ""

# Run the SQL script
echo "🔧 Creating owner user account..."
cat supabase/script/create-owner-user.sql | docker exec -i $DB_CONTAINER psql -U postgres -d postgres

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Owner account created successfully!"
    echo ""
    echo "📋 Login Credentials:"
    echo "   URL:      http://localhost:5173/admin/login"
    echo "   Email:    hachikonoluna@gmail.com"
    echo "   Password: owner123"
    echo ""
    echo "🔒 Please change the password after first login!"
else
    echo ""
    echo "❌ Error: Failed to create owner account"
    echo "   Check the error messages above for details"
    exit 1
fi
