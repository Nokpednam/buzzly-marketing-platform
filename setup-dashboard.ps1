# Automatic Dashboard Setup Script for Windows
# This script runs all required migrations in the correct order

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "BuzzlyDev Dashboard Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "supabase/config.toml")) {
    Write-Host "Error: Please run this script from the BuzzlyDev directory" -ForegroundColor Red
    exit 1
}

Write-Host "Starting setup..." -ForegroundColor Yellow
Write-Host ""

# Function to run SQL file using Docker
function Run-Migration {
    param(
        [string]$File,
        [string]$Description
    )
    
    Write-Host "-> Running: $Description" -ForegroundColor White
    
    # Get Supabase DB container name
    $containerName = "supabase_db_xpmswnktazcjpqumrfsh"
    
    # Read SQL file content and execute via Docker
    $sqlContent = Get-Content $File -Raw
    
    # Execute SQL in container
    $result = $sqlContent | docker exec -i $containerName psql -U postgres -d postgres 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Success" -ForegroundColor Green
    }
    else {
        Write-Host "  Failed - Error details:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Step 1: Registration Fixes
Write-Host "Step 1/5: Fixing registration system..." -ForegroundColor Yellow
Run-Migration "supabase/migrations/20260211183000_update_handle_new_user_extended.sql" "Extend user signup trigger"
Run-Migration "supabase/migrations/20260211184500_seed_genders_and_fix_rls.sql" "Seed gender options"
Run-Migration "supabase/migrations/20260211185500_fix_handle_new_user_strict.sql" "Add error isolation"

# Step 2: Generate Sample Data
Write-Host "Step 2/5: Creating sample dashboard data..." -ForegroundColor Yellow
Run-Migration "supabase/migrations/20260211210000_reseed_dashboard_data.sql" "Generate 30 days of data"

# Step 3: Disable RLS
Write-Host "Step 3/5: Disabling RLS for development..." -ForegroundColor Yellow
Run-Migration "supabase/migrations/20260211213000_disable_rls_debug.sql" "Disable Row Level Security"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start your dev server: npm run dev"
Write-Host "2. Create a new user account"
Write-Host "3. Check your dashboard - you should see data!"
Write-Host ""
Write-Host "Note: RLS is disabled for development." -ForegroundColor Yellow
Write-Host "For production, run FUTURE_rls_clean_setup.sql" -ForegroundColor White
Write-Host ""
