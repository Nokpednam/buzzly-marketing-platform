# Buzzly — AI Assistant Project Guide

This document gives AI assistants (Claude, Gemini, Cursor, etc.) the full context needed to work effectively in this codebase. Read this before making any changes.

---

## 1. Project Overview

**Buzzly** is a **B2B SaaS marketing platform** that helps businesses manage marketing campaigns, customer loyalty (rewards/tiers), social media analytics, and team operations — all from a single workspace. It is a **demo/prototype-stage product** with rich mock data seeded into the database.

- **Frontend**: React 18 + Vite + TypeScript, served at `http://localhost:8080`
- **Backend**: Supabase (PostgreSQL + Auth + Row-Level Security)
- **UI Library**: shadcn/ui + Radix UI + Tailwind CSS v3
- **State Management**: TanStack React Query v5
- **Routing**: React Router DOM v6

---

## 2. Tech Stack & Key Libraries

| Category | Library | Version |
|---|---|---|
| Framework | React | 18.3 |
| Build Tool | Vite + SWC | 5.4 |
| Language | TypeScript | 5.8 |
| Styling | Tailwind CSS | 3.4 |
| UI Components | shadcn/ui + Radix UI | latest |
| Backend / DB | Supabase JS | 2.x |
| Data Fetching | TanStack React Query | 5.x |
| Forms | React Hook Form + Zod | latest |
| Charts | Recharts | 2.x |
| Testing (unit) | Vitest + Testing Library | latest |
| Testing (e2e) | Playwright | 1.x |
| Icons | Lucide React | 0.462 |
| Notifications | Sonner + Radix Toast | latest |

**Always use** `npm run dev` to start the dev server, **not** `bun dev`. The `bun.lockb` file is present but npm is the primary runner for scripts.

---

## 3. Directory Structure

```
BuzzlyDev/
├── src/
│   ├── App.tsx                    # Root router — all routes defined here
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Global styles + Tailwind base
│   ├── pages/                     # All page-level components
│   │   ├── *.tsx                  # Customer-facing pages
│   │   ├── admin/                 # Legacy admin UI (now redirects to /dev/*)
│   │   ├── dev/                   # Dev employee pages (monitor, audit, etc.)
│   │   ├── employee/              # Shared employee auth (login/signup)
│   │   ├── owner/                 # Owner-only analytics pages
│   │   └── dev/                   # Dev tool pages
│   ├── components/                # Reusable components
│   │   ├── ui/                    # Base shadcn/ui primitives
│   │   ├── layout/                # MainLayout, DevLayout, OwnerLayout
│   │   ├── sidebar/               # Sidebar navigation
│   │   ├── team/                  # Team management components
│   │   ├── social/                # Social media components
│   │   ├── support/               # SupportLayout
│   │   └── ...                    # Feature-specific component folders
│   ├── hooks/                     # All custom React hooks (51 hooks)
│   ├── contexts/
│   │   └── PlanContext.tsx        # Subscription plan gate (free/pro/team)
│   ├── integrations/supabase/
│   │   ├── client.ts              # Supabase client instance
│   │   └── types.ts               # Auto-generated DB type definitions (133KB)
│   ├── services/
│   │   └── errorLogger.ts         # Centralized error logging to Supabase
│   ├── lib/                       # Utility helpers (cn, etc.)
│   └── constants/                 # App-wide constants
├── supabase/
│   ├── migrations/                # 71+ migration files (schema + RLS + seed)
│   ├── config.toml                # Supabase local config
│   └── *.sql                      # Diagnostic/debug SQL scripts
├── e2e/                           # Playwright end-to-end tests
├── guide/                         # Documentation for specific features
│   ├── TESTING.md                 # Test strategy guide
│   ├── Audit_Logs.md
│   ├── Monitor_Dashboard.md
│   └── Support_Dashboard.md
├── scripts/                       # Seed scripts (tsx)
├── docker-compose.yml             # Local PostgreSQL container (port 5432)
├── setup-full.sh                  # Full environment setup script
├── vite.config.ts                 # Vite config — alias `@/` = `src/`
└── tailwind.config.ts             # Tailwind config with custom design tokens
```

---

## 4. Routing Architecture

All routes are defined centrally in `src/App.tsx`. There are **four distinct user roles**:

### 4.1 Public Routes
| Path | Component |
|---|---|
| `/` | `Landing` |
| `/auth` | `Auth` (login) |
| `/signup` | `SignUp` |
| `/employee/login` | `EmployeeLogin` |
| `/employee/signup` | `EmployeeSignUp` |

### 4.2 Customer Routes (protected by `CustomerProtectedRoute`)
Wrapped in `MainLayout`. Requires Supabase `auth.users` session.

| Path | Page |
|---|---|
| `/dashboard` | Main business dashboard |
| `/campaigns` | Campaign list |
| `/campaigns/:id` | Campaign detail |
| `/social-analytics` | Social media stats |
| `/rewards` | Loyalty rewards center |
| `/prospects` | Prospect/lead list |
| `/analytics` | General analytics |
| `/reports` | Reports & exports |
| `/customer-journey` | Customer journey view (Pro+) |
| `/aarrr-funnel` | AARRR funnel (Pro+) |
| `/api-keys` | API key management |
| `/team` | Team management |
| `/settings` | Workspace/user settings |

### 4.3 Employee Routes (protected by `EmployeeProtectedRoute`)
**Employee roles** are stored in the `employees` table (`role` column: `"dev"`, `"support"`, `"owner"`).

| Role | Layout | Paths |
|---|---|---|
| `dev` or `owner` | `DevLayout` | `/dev/monitor`, `/dev/audit-logs`, `/dev/employees`, `/dev/support`, `/dev/members` |
| `support` or `owner` | `SupportLayout` | `/support/workspaces`, `/support/tier-management`, `/support/rewards-*`, `/support/redemption-requests` |
| `owner` only | `OwnerLayout` | `/owner/product-usage`, `/owner/business-performance`, `/owner/user-feedback`, `/owner/executive-report`, `/owner/customer-tiers`, `/owner/discounts` |

### 4.4 Legacy Admin Routes (auto-redirect)
All `/admin/*` paths redirect to their new equivalents (`/dev/*` or `/support/*`). **Do not create new routes under `/admin`.**

---

## 5. Authentication System

### Customer Auth
- Uses **Supabase Auth** (`supabase.auth`)
- Protected by `CustomerProtectedRoute` component
- After login, user is redirected to `/dashboard`
- Sign-up triggers a database trigger (`handle_new_user`) that creates a `workspaces` row and links data

### Employee Auth
- Employees are stored in the `employees` table (separate from `auth.users`)
- Uses `useEmployeeAuth` hook for session management
- Protected by `EmployeeProtectedRoute` with `allowedRoles` prop
- Employee role values: `"dev"` | `"support"` | `"owner"`

---

## 6. Subscription Plan System

Plans are managed via `PlanContext` (`src/contexts/PlanContext.tsx`).

### Plan Tiers
| Plan | Slug | UUID |
|---|---|---|
| Free | `free-*` | `5b000001-...` |
| Pro | `pro-*` | `5b000002-...` |
| Team | `team-*` | `5b000003-...` |

### Plan-Gated Features
| Feature | Required Plan |
|---|---|
| AI Insights | Pro |
| Advanced Analytics | Pro |
| Custom Reports | Pro |
| Customer Journey | Pro |
| AARRR Funnel | Pro |
| Unlimited Platforms | Pro |
| Priority Support | Pro |
| Team Collaboration | Team |

### Usage Pattern
```tsx
const { hasFeature, currentPlan } = usePlanContext();

// Check access
if (!hasFeature('aiInsights')) {
  return <UpgradeRequiredDialog feature="aiInsights" />;
}
```

When adding **new plan-gated features**, always:
1. Add the feature key to `PlanFeatures` interface in `PlanContext.tsx`
2. Add it to `planFeatures` map (free/pro/team values)
3. Add to `featureRequiredPlan` and `featureNames`
4. Use `<PlanRestrictedPage>` or `hasFeature()` check in the component

---

## 7. Database (Supabase)

### Connection
- Client is at `src/integrations/supabase/client.ts`
- Auto-generated TypeScript types at `src/integrations/supabase/types.ts` (133KB — do not hand-edit)
- Import: `import { supabase } from "@/integrations/supabase/client";`

### Key Database Tables
| Table | Purpose |
|---|---|
| `workspaces` | Each customer business workspace |
| `workspace_members` | Workspace ↔ user membership |
| `subscriptions` | Active plan subscriptions |
| `subscription_plans` | Plan definitions (slug, price) |
| `campaigns` | Marketing campaigns |
| `ad_groups`, `ads` | Ad hierarchy |
| `ad_insights` | Ad performance metrics |
| `social_posts` | Social media posts |
| `email_campaigns`, `email_messages` | Email marketing |
| `customer_personas` | Customer segments |
| `loyalty_tiers` | Tier definitions (Bronze, Silver, Gold, etc.) |
| `customer_loyalty_points` | Customer point balances |
| `discounts` | Discount/coupon campaigns |
| `customer_discount_notifications` | Discount delivery log |
| `employees` | Internal staff (dev/support/owner roles) |
| `error_logs` | App errors logged via `errorLogger.ts` |
| `audit_logs` | Admin action audit trail |
| `reports` | Generated report records |
| `api_keys` | Customer API key management |
| `platforms` | Connected social/ad platforms |
| `platform_connections` | Workspace ↔ platform links |

### Row-Level Security (RLS)
- **RLS is enabled on all tables**
- Customer data is scoped to workspace via `workspace_members`
- Employee data access is role-based
- Never bypass RLS without explicit reason. Test RLS policies when modifying tables.
- Key helper: `is_team_member(workspace_id)` PostgreSQL function used in RLS policies

### Migration Convention
- All schema changes go in `supabase/migrations/` as `.sql` files
- Naming: `YYYYMMDDHHMMSS_descriptive_name.sql`
- The consolidated schema is `20260218000000_consolidated_schema.sql`
- **Never modify existing migration files** — always add new migrations

---

## 8. Custom Hooks

All data fetching logic lives in `src/hooks/`. Each hook wraps Supabase queries with TanStack React Query.

### Key Hooks Reference

| Hook | Purpose |
|---|---|
| `useWorkspace` | Current workspace info and membership |
| `useWorkspaceMembers` | List members of a workspace |
| `useCampaigns` | Campaign CRUD |
| `useSubscription` | Subscription details + upgrade flow |
| `usePlatformConnections` | Social/ad platform connections |
| `usePlatformsDB` | Platform master list |
| `useCustomerPersonas` | Customer segment management |
| `useCustomerTiers` | Loyalty tier configuration |
| `useCustomerRewards` | Customer reward redemption |
| `useCustomerCoupons` | Coupon/discount management |
| `useDiscounts` | Discount campaign CRUD |
| `useTeamManagement` | Team invite/remove/role management |
| `useTierManagement` | Admin tier CRUD |
| `useEmployees` | Employee list + approval |
| `useEmployeeAuth` | Employee session |
| `useAdminMonitor` | Dev monitor dashboard data |
| `useAdminSupport` | Support ticket data |
| `useAdminWorkspaces` | Workspace admin management |
| `useAuditLogs` | Audit log viewer |
| `useOwnerMetrics` | Owner analytics aggregation |
| `useLoyaltyTier` | Loyalty tier for current user |
| `useScheduledReports` | Report scheduling |
| `useAnalyticsData` | General analytics |
| `useFunnelData` | AARRR funnel metrics |
| `useAdInsights` | Ad performance data |
| `useSocialPosts` | Social post management |
| `useDashboardMetrics` | Main dashboard KPIs |
| `useUserRole` | Current user's role in workspace |
| `usePlanAccess` | Quick plan access check |
| `useReports` | Report list and generation |

### Hook Patterns
```tsx
// All hooks follow this pattern:
export function useXxx() {
  return useQuery({
    queryKey: ['xxx', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase.from('table').select('...');
      if (error) throw error;
      return data;
    },
  });
}
```

**Rule**: Always throw errors from Supabase queries — don't silently swallow them. React Query will handle retries and error boundaries.

---

## 9. Component Architecture

### Layout Hierarchy
```
App.tsx (QueryClient, PlanProvider, PlatformConnectionsProvider, SidebarStateProvider)
  └── BrowserRouter
        ├── MainLayout          → Customer portal
        ├── DevLayout           → Dev employee panel
        ├── SupportLayout       → Support employee panel
        └── OwnerLayout         → Owner analytics panel
```

### shadcn/ui Usage
- All base UI primitives are in `src/components/ui/` (Button, Dialog, Table, etc.)
- Use `cn()` from `@/lib/utils` for conditional classes
- Import components from `@/components/ui/component-name`
- **Do not mix Tailwind arbitrary values** — use design tokens from `tailwind.config.ts`

### Component Naming Conventions
- Pages: `PascalCase.tsx` (e.g., `Dashboard.tsx`)
- Feature components: `PascalCase.tsx` inside feature folder (e.g., `components/team/EmployeesList.tsx`)
- Hooks: `useCamelCase.tsx` in `src/hooks/`
- Protected route wrappers: `XxxProtectedRoute.tsx`

---

## 10. Error Handling

### Error Logger
- Service: `src/services/errorLogger.ts`
- Logs to `error_logs` table in Supabase
- Import: `import { logError } from "@/services/errorLogger";`
- Usage:
```tsx
try {
  // risky operation
} catch (error) {
  logError('Context description', error as Error, { extraContext: 'value' });
}
```

### Error Boundary
- `ErrorBoundary` component wraps the entire app in `App.tsx`
- Also use `logError` inside React Query mutation `onError` callbacks

### Toast Notifications
- Use `sonner` (`toast.success(...)`, `toast.error(...)`) for user-facing feedback
- Import: `import { toast } from "sonner";`

---

## 11. Testing

### Unit Tests (Vitest)
```bash
npm run test                 # Run all unit tests
npm run test:ui              # Interactive UI mode
npm run test:coverage        # Coverage report
npm run test:monitor         # Monitor dashboard tests only
npm run test:audit           # Audit log tests only
npm run test:employee        # Employee management tests only
npm run test:support         # Support dashboard tests only
npm run test:logger          # Error logger tests only
npm run test:tier            # Tier management tests only
npm run test:loyalty         # Loyalty tier tests only
```

Unit tests live beside their source:
- `src/hooks/__tests__/` — hook tests
- `src/pages/admin/__tests__/` — admin page tests
- `src/pages/owner/__tests__/` — owner page tests
- `src/components/team/__tests__/` — team component tests
- `src/services/__tests__/` — service tests

### E2E Tests (Playwright)
```bash
npm run test:e2e             # Headless
npm run test:e2e:ui          # Interactive UI mode
npm run test:e2e:headed      # Headed browser
```

E2E tests are in `e2e/`.

### Test Rules
- Mock Supabase client in unit tests — never hit real DB
- Use `@testing-library/react` for component tests
- Follow `guide/TESTING.md` for the full testing strategy

---

## 12. Environment & Local Setup

### Environment Variables
Copy `.env.example` or `.env.local.example` to `.env` and fill in:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

### Local Dev Commands
```bash
npm run dev          # Start Vite dev server on port 8080
npm run build        # Production build
npm run lint         # ESLint check
npm run seed         # Seed business data (tsx scripts/seed-business-data.ts)
npm run seed:check   # Check seed status without writing
```

### Docker
```bash
docker-compose up -d       # Start local PostgreSQL on port 5432
```
The project uses **Supabase cloud** by default. The `docker-compose.yml` is for local PostgreSQL instances only (used alongside Supabase CLI local dev).

### Full Setup Script
```bash
bash setup-full.sh    # One-command full environment setup
```

---

## 13. Import Aliases

The `@/` alias maps to `src/`:
```tsx
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCampaigns } from "@/hooks/useCampaigns";
import { logError } from "@/services/errorLogger";
import { cn } from "@/lib/utils";
```

---

## 14. Key Design Patterns

### Data Fetching
- **Always use React Query hooks** — never raw `useState` + `useEffect` for async data
- Query keys should be arrays: `['campaigns', workspaceId]`
- Mutations should invalidate relevant queries on success

### Plan Gating
- Use `usePlanContext().hasFeature('featureKey')` to check access
- Show `<UpgradeRequiredDialog>` or `<PlanRestrictedPage>` when access is denied
- **Never hard-code plan checks** — always go through `PlanContext`

### Workspace Scoping
- All customer data is scoped to `workspaceId`
- Get workspace: `const { workspaceId } = useWorkspace()`
- Pass `workspaceId` as dependency to query keys

### Form Validation
- Use `react-hook-form` + `zod` for all forms
- Schema validation first, then submit to Supabase

---

## 15. What NOT To Do

- **Do not** create new routes under `/admin/*` — use `/dev/*` or `/support/*`
- **Do not** hand-edit `src/integrations/supabase/types.ts` — it is auto-generated
- **Do not** modify existing migration files — always add new ones
- **Do not** bypass Supabase RLS unless absolutely necessary and documented
- **Do not** use raw `fetch()` for Supabase operations — always use the `supabase` client
- **Do not** add new state management solutions — use React Query for server state and React context for global UI state
- **Do not** swallow Supabase errors silently — always `throw error` or `logError()`
- **Do not** reference `/employee/*` pages from within customer layouts or vice versa
- **Do not** commit `.env` files — use `.env.example` as the template

---

## 16. Feature Areas Quick Reference

| Area | Pages | Primary Hooks |
|---|---|---|
| Dashboard | `/dashboard` | `useDashboardMetrics`, `useWorkspace` |
| Campaigns | `/campaigns`, `/campaigns/:id` | `useCampaigns`, `useAdGroups`, `useAds` |
| Social | `/social-analytics` | `useAdInsights`, `useSocialPosts`, `usePlatformsDB` |
| Email | (Email page) | `useSocialPosts` (email type) |
| Analytics | `/analytics`, `/reports` | `useAnalyticsData`, `useReports` |
| AARRR | `/aarrr-funnel` | `useFunnelData` |
| Customer Journey | `/customer-journey` | `useCustomerPersonas` |
| Rewards/Loyalty | `/rewards` | `useCustomerRewards`, `useLoyaltyTier`, `useCustomerTiers` |
| Discounts | `/discounts` (Discounts page) | `useDiscounts`, `useCustomerCoupons` |
| Team | `/team` | `useTeamManagement`, `useWorkspaceMembers` |
| Settings | `/settings` | `useSubscription`, `useUserPaymentMethods` |
| API Keys | `/api-keys` | (direct supabase queries) |
| Dev Monitor | `/dev/monitor` | `useAdminMonitor`, `useDevMonitor` |
| Dev Audit | `/dev/audit-logs` | `useAuditLogs` |
| Support Workspaces | `/support/workspaces` | `useAdminWorkspaces`, `useDevWorkspaces` |
| Support Tiers | `/support/tier-management` | `useTierManagement` |
| Support Rewards | `/support/rewards-*`, `/support/redemption-requests` | `useRewardsManagement`, `useRewardsCampaigns`, `useRedemptionRequests` |
| Owner Analytics | `/owner/*` | `useOwnerMetrics` |

---

## 17. Guide Documents

Additional documentation is in the `guide/` folder:
- `guide/README.md` — Overview
- `guide/TESTING.md` — Complete test strategy (read before writing tests)
- `guide/Monitor_Dashboard.md` — Dev monitor dashboard spec
- `guide/Audit_Logs.md` — Audit log system spec
- `guide/Support_Dashboard.md` — Support dashboard spec

---

*Last updated: March 2026. This file should be updated whenever major architectural changes are made.*
