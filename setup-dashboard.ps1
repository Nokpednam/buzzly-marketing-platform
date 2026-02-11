# Automatic Dashboard Setup Script (PowerShell)
# This script runs all required migrations in the correct order

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "BuzzlyDev Dashboard Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "supabase\config.toml")) {
    Write-Host "❌ Error: Please run this script from the BuzzlyDev directory" -ForegroundColor Red
    exit 1
}

Write-Host "Starting setup..." -ForegroundColor Green
Write-Host ""

# Function to run SQL file
function Run-Migration {
    param(
        [string]$File,
        [string]$Description
    )
    
    Write-Host "→ Running: $Description" -ForegroundColor Yellow
    
    npx supabase db execute --file $File
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Success" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed - Please check the error above" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Step 1: Registration Fixes
Write-Host "Step 1/5: Fixing registration system..." -ForegroundColor Cyan
Run-Migration "supabase\migrations\20260211183000_update_handle_new_user_extended.sql" "Extend user signup trigger"
Run-Migration "supabase\migrations\20260211184500_seed_genders_and_fix_rls.sql" "Seed gender options"
Run-Migration "supabase\migrations\20260211185500_fix_handle_new_user_strict.sql" "Add error isolation"

# Step 2: Generate Sample Data
Write-Host "Step 2/5: Creating sample dashboard data..." -ForegroundColor Cyan
Run-Migration "supabase\migrations\20260211210000_reseed_dashboard_data.sql" "Generate 30 days of data"

# Step 3: Disable RLS
Write-Host "Step 3/5: Disabling RLS for development..." -ForegroundColor Cyan
Run-Migration "supabase\migrations\20260211213000_disable_rls_debug.sql" "Disable Row Level Security"

Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start your dev server: npm run dev"
Write-Host "2. Create a new user account"
Write-Host "3. Check your dashboard - you should see data!"
Write-Host ""
Write-Host "⚠️  Note: RLS is disabled for development." -ForegroundColor Yellow
Write-Host "    For production, run FUTURE_rls_clean_setup.sql"
Write-Host ""
