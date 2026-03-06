# Buzzly — Project Context for AI Assistants

**B2B SaaS marketing platform** (demo/prototype stage). Campaigns, loyalty/rewards, social analytics, team ops — single workspace.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 5 (SWC) + TypeScript 5.8 |
| Styling | Tailwind CSS 3.4 + shadcn/ui + Radix UI |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Data | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Routing | React Router DOM v6 |
| Charts | Recharts 2.x |
| Icons | Lucide React 0.462 |
| Toasts | Sonner + Radix Toast |

**Dev server**: `npm run dev` (port 8080). Do **not** use `bun dev`.

---

## Directory Layout

```
src/
├── App.tsx                 # All routes defined here
├── main.tsx                # Entry point
├── index.css               # Global + Tailwind base
├── pages/                  # Page components
│   ├── *.tsx               # Customer pages
│   ├── dev/                # Dev panel: MonitorDashboard, AuditLogs, EmployeeManagement, DevSupport, DevWorkspaces
│   ├── support/            # Support panel: TierManagement, RewardsCampaigns, RewardsManagement, RedemptionRequests
│   ├── owner/              # Owner panel: ProductUsage, BusinessPerformance, UserFeedback, ExecutiveReport, CustomerTiers, OwnerDiscounts
│   └── employee/           # Shared auth: EmployeeLogin, EmployeeSignUp
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # MainLayout
│   ├── dev/                # DevLayout
│   ├── support/            # SupportLayout
│   ├── owner/              # OwnerLayout
│   └── sidebar/            # Sidebar navigation
├── hooks/                  # 53 custom hooks (see Key Hooks below)
├── contexts/PlanContext.tsx # Subscription plan gating (free/pro/team)
├── integrations/supabase/
│   ├── client.ts           # Supabase client
│   └── types.ts            # Auto-generated DB types (DO NOT hand-edit)
├── services/errorLogger.ts # Centralized error logging
├── lib/utils.ts            # cn() helper
└── constants/

supabase/migrations/        # 84+ SQL migration files
```

**Import alias**: `@/` → `src/`

---

## Routing (all in App.tsx)

### Public
`/` · `/auth` · `/signup` · `/employee/login` · `/employee/signup`

### Customer (wrapped in `CustomerProtectedRoute` + `MainLayout`)
`/dashboard` · `/campaigns` · `/campaigns/:id` · `/social-analytics` · `/rewards` · `/prospects` · `/analytics` · `/reports` · `/customer-journey` (Pro) · `/aarrr-funnel` (Pro) · `/api-keys` · `/team` · `/settings`

### Dev Employee (`EmployeeProtectedRoute` roles: `dev`, `owner` → `DevLayout`)
`/dev/monitor` · `/dev/audit-logs` · `/dev/employees` · `/dev/support`

### Support Employee (`EmployeeProtectedRoute` roles: `support`, `owner` → `SupportLayout`)
`/support/workspaces` · `/support/tier-management` · `/support/rewards-campaigns` · `/support/rewards-management` · `/support/redemption-requests` · `/support/discount-management`

### Owner Employee (`EmployeeProtectedRoute` roles: `owner` → `OwnerLayout`)
`/owner/product-usage` · `/owner/business-performance` · `/owner/user-feedback` · `/owner/executive-report` · `/owner/customer-tiers` · `/owner/discounts` (read-only analytics dashboard — CRUD is at `/support/discount-management`)

### Legacy
All `/admin/*` redirects to `/dev/*` or `/support/*`. **Never create new routes under `/admin`.**

---

## Auth

- **Customers**: Supabase Auth → `CustomerProtectedRoute` → redirects to `/dashboard`
- **Employees**: Stored in `employees` table (not `auth.users`). Uses `useEmployeeAuth` hook. Roles: `"dev"` | `"support"` | `"owner"`. Protected by `EmployeeProtectedRoute` with `allowedRoles` prop.

---

## Subscription Plans (PlanContext)

| Plan | Slug prefix |
|---|---|
| Free | `free-*` |
| Pro | `pro-*` |
| Team | `team-*` |

```tsx
const { hasFeature } = usePlanContext();
if (!hasFeature('aiInsights')) return <UpgradeRequiredDialog feature="aiInsights" />;
```

Adding a new gated feature: update `PlanFeatures` interface, `planFeatures` map, `featureRequiredPlan`, and `featureNames` in `PlanContext.tsx`.

---

## Database (Supabase)

**Client**: `import { supabase } from "@/integrations/supabase/client";`

### Core Tables

| Table | Purpose |
|---|---|
| `workspaces` | Customer business workspaces |
| `workspace_members` | Workspace ↔ user links |
| `subscriptions` / `subscription_plans` | Plan subscriptions |
| `campaigns` / `ad_groups` / `ads` / `ad_insights` | Marketing campaigns |
| `social_posts` | Social media |
| `email_campaigns` / `email_messages` | Email marketing |
| `customer_personas` | Customer segments |
| `loyalty_tiers` / `customer_loyalty_points` / `tier_history` | Loyalty system |
| `reward_items` / `reward_redemptions` / `point_earning_rules` | Gamification rewards |
| `discounts` / `customer_discount_notifications` | Discount system |
| `employees` | Internal staff (dev/support/owner) |
| `error_logs` / `audit_logs` | Logging |
| `notifications` | Real-time notification system |
| `reports` / `api_keys` / `platforms` / `platform_connections` | Misc |

### RLS Rules
- RLS enabled on all tables. Customer data scoped via `workspace_members`.
- Helper function: `is_team_member(workspace_id)`
- Never bypass RLS without documenting why.

### Migrations
- Path: `supabase/migrations/YYYYMMDDHHMMSS_descriptive_name.sql`
- Consolidated base: `20260218000000_consolidated_schema.sql`
- **Never modify existing migrations** — always add new ones.

---

## Key Hooks (src/hooks/)

All hooks wrap Supabase queries with React Query. Pattern:

```tsx
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

**Always throw errors** — never swallow them. React Query handles retries.

| Hook | For |
|---|---|
| `useWorkspace` / `useWorkspaceMembers` | Workspace data |
| `useCampaigns` / `useAdGroups` / `useAds` / `useAdInsights` | Campaigns |
| `useSocialPosts` / `usePlatformConnections` / `usePlatformsDB` | Social |
| `useSubscription` / `usePlanAccess` | Plans |
| `useCustomerTiers` / `useLoyaltyTier` / `useTierManagement` | Loyalty tiers |
| `useCustomerRewards` / `useRewardsManagement` / `useRewardsCampaigns` / `useRedemptionRequests` | Rewards |
| `useDiscounts` / `useCustomerCoupons` | Discounts |
| `useEmployees` / `useEmployeeAuth` | Employee management |
| `useAdminMonitor` / `useDevMonitor` | Dev monitor |
| `useAuditLogs` | Audit logs |
| `useAdminWorkspaces` / `useDevWorkspaces` | Workspace admin |
| `useNotifications` | Notification system |
| `useTeamManagement` / `useUserRole` | Team |
| `useOwnerMetrics` | Owner analytics |
| `useDashboardMetrics` / `useAnalyticsData` / `useFunnelData` | Analytics |
| `useReports` / `useScheduledReports` | Reports |

---

## Key Patterns

1. **Data fetching** — Always React Query hooks, never raw `useState`+`useEffect`. Mutations invalidate relevant queries on success.
2. **Plan gating** — Always through `PlanContext` with `hasFeature()`. Show `<UpgradeRequiredDialog>` or `<PlanRestrictedPage>`.
3. **Workspace scoping** — `const { workspaceId } = useWorkspace()`, pass as query key dependency.
4. **Forms** — `react-hook-form` + `zod` schema validation.
5. **Error handling** — `logError()` from `@/services/errorLogger` logs to `error_logs` table. Use `toast.error()` / `toast.success()` from `sonner` for user feedback.
6. **Components** — shadcn/ui primitives in `components/ui/`. Use `cn()` from `@/lib/utils` for conditional classes.

---

## Loyalty & Support System Notes

- **Point redemption** must use Supabase RPC (`redeem_reward`) — never update `customer_loyalty_points` directly from frontend.
- **Tier upgrades** should use database triggers on `customer_loyalty_points` updates.
- **RLS for support role**: Ensure `SELECT`/`INSERT`/`UPDATE` on `loyalty_tiers`, `customer_loyalty_points`, `tier_history`, `reward_items`, `reward_redemptions`.
- **Foreign keys**: `tier_history`, `points_transactions`, etc. must have correct FKs to avoid `PGRST200` errors.

---

## Don'ts

- ❌ Create routes under `/admin/*`
- ❌ Hand-edit `types.ts` (auto-generated)
- ❌ Modify existing migration files
- ❌ Bypass RLS without documentation
- ❌ Use raw `fetch()` for Supabase ops
- ❌ Add new state management (use React Query + Context)
- ❌ Swallow Supabase errors silently
- ❌ Mix customer/employee page references
- ❌ Commit `.env` files
- ❌ Skip tests — Tests are not required for this project. Focus on building features.

---

## Commands

```bash
npm run dev          # Dev server (port 8080)
npm run build        # Production build
npm run lint         # ESLint
npm run seed         # Seed mock data
```

---

*Last updated: March 2026*
