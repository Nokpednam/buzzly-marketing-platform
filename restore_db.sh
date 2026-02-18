#!/bin/bash
set -e

# Credentials from docker-compose.yml
export PGPASSWORD=eiei1234
DB_HOST=127.0.0.1
DB_USER=eiei
DB_NAME=buzzly_db

echo "Restoring Database Schema and Data..."

run_sql() {
    echo "Running $1..."
    psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$1"
}

# 0. Auth Schema (for local docker)
run_sql "setup_auth_schema.sql"

# 1. Schema
run_sql "supabase/migrations/20260218000000_consolidated_schema.sql"

# 2. Base Seed (if exists)
if [ -f "sample-data/unified-seed.sql" ]; then
    run_sql "sample-data/unified-seed.sql"
fi

# 3. Product Usage Seed (Schema Fix)
if [ -f "supabase/migrations/20260219000000_fix_product_usage_seed.sql" ]; then
    run_sql "supabase/migrations/20260219000000_fix_product_usage_seed.sql"
fi

# 4. Mock Data Scripts
for f in supabase/migrations/202602182000*.sql; do
    [ -e "$f" ] || continue
    run_sql "$f"
done

# 5. New Feedback Seed
run_sql "supabase/migrations/20260219000002_seed_realistic_feedback.sql"

echo "Database restored successfully."
