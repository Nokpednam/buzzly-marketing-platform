# Buzzly Development Setup Guide

## Prerequisites

- Node.js & npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Docker Desktop (for Supabase local development)

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <YOUR_GIT_URL>
cd BuzzlyDev
npm install
```

### 2. Start Supabase Local Development

```bash
# Start Supabase services (PostgreSQL, Auth, etc.)
npx supabase start

# This will start:
# - PostgreSQL database on localhost:54322
# - Supabase Studio on http://localhost:54323
# - Auth service on localhost:54321
```

Wait for all services to start. You should see output with API URLs and keys.

### 3. Create Owner Account

**IMPORTANT:** You need to create an owner account to access the admin/owner dashboard.

#### Option 1: Automated Script (Recommended)

```bash
./setup-owner.sh
```

This will automatically:
- Find your Supabase database container
- Create the owner account
- Show you the login credentials

#### Option 2: Manual Setup

```bash
# Find your Supabase DB container
docker ps --filter "name=.*db.*"

# Run the script (replace <YOUR_DB_CONTAINER_NAME>)
cat supabase/script/create-owner-user.sql | docker exec -i <YOUR_DB_CONTAINER_NAME> psql -U postgres -d postgres
```

**Default Owner Credentials:**
- Email: `hachikonoluna@gmail.com`
- Password: `owner123`
- Login URL: `http://localhost:5173/admin/login`

> **Note:** You can modify the email/password in `supabase/script/create-owner-user.sql` before running

### 4. Configure Environment Variables (Auto-Generated)

The `.env` file is **automatically created** when you run `npx supabase start`. No manual configuration needed for local development!

If you need to customize:
```bash
# Copy the example file
cp .env.example .env

# Edit if needed (default values work for local development)
nano .env
```

### 5. (Optional) Load Sample Data

Want to see the app with realistic data? Load the sample dataset:

```bash
# Find your database container
DB_CONTAINER=$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -n 1)

# Load sample data
cat sample-data/sample-data.sql | docker exec -i $DB_CONTAINER psql -U postgres -d postgres
```

This adds:
- 🎯 365 days of ad performance data
- 📊 Cohort analysis data  
- 💬 Customer feedback
- 🏢 Business types & industries
- 📱 Social media posts
- And much more!

### 6. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

## Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm test -- --watch
```

See [TESTING.md](./guide/TESTING.md) for detailed testing documentation.

## Project Structure

```
BuzzlyDev/
├── src/                  # React application source
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── hooks/           # Custom React hooks
│   └── integrations/    # External integrations (Supabase)
├── supabase/
│   ├── migrations/      # Database migrations (auto-applied)
│   └── script/          # Manual scripts (seed data, fixes)
├── e2e/                 # Playwright E2E tests
└── guide/               # Documentation
```

## User Roles

The system has 3 types of users:

### 1. **Customer** (ลูกค้า)
- Login: `http://localhost:5173/auth`
- Sign up creates customer account automatically
- Routes: `/dashboard`, `/campaigns`, `/analytics`

### 2. **Employee** (พนักงาน: admin, support, developer)
- Login: `http://localhost:5173/admin/login`
- Sign up: `http://localhost:5173/admin/signup` (requires approval)
- Routes: `/admin/*`

### 3. **Owner** (เจ้าของระบบ)
- Login: `http://localhost:5173/admin/login`
- Created via seed script (see step 3 above)
- Routes: `/owner/*`

## Troubleshooting

### "Cannot connect to Supabase"
- Make sure `npx supabase start` is running
- Check `.env` file has correct Supabase URL and key

### "Login returns 500 error"
- Run the owner seed script (Step 3)
- Check Supabase logs: `docker logs <auth_container_name>`

### "Migrations not applied"
- Reset database: `npx supabase db reset`
- This will re-run all migrations from scratch

## Database Access

### Via Supabase Studio
Navigate to http://localhost:54323 for a web-based database UI

### Via psql
```bash
docker exec -it <db_container_name> psql -U postgres -d postgres
```

## Common Commands

```bash
# Start all services
npx supabase start

# Stop all services
npx supabase stop

# Reset database (re-run all migrations)
npx supabase db reset

# View logs
docker logs <container_name>

# Development server
npm run dev

# Run tests
npm test
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Testing Guide](./guide/TESTING.md)
- [System Audit Report](./SYSTEM_AUDIT_REPORT.md)
