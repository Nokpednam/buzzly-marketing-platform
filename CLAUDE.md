# Buzzly Context

**Stack:** React 18, Vite 5, TS 5.8, Tailwind 3.4, shadcn, Supabase, TanStack Query v5, Hook Form, Zod, React Router v6.
**Run:** `npm run dev` (port 8080). **NO `bun`**.

**Dirs:** `@/` = `src/`.
`pages/`: Customer, `dev/`, `support/`, `owner/`, `employee/`.
`components/ui/` (shadcn), `layout/`, `hooks/`, `integrations/supabase/`, `supabase/migrations/`.

**Routes (`App.tsx`):**
- **Public:** `/`, `/auth`, `/signup`, `/employee/login`, `/employee/signup`
- **Customer (`CustomerProtectedRoute`):** `/dashboard`, `/campaigns`, `/rewards`, `/analytics`, etc.
- **Employee (`EmployeeProtectedRoute`):** `/dev/*` (`dev`|`owner`), `/support/*` (`support`|`owner`), `/owner/*` (`owner`)
- **Legacy:** NO `/admin/*` routes (redirects to dev/support).

**Auth:** Customers: Supabase Auth. Employees: `employees` table + `useEmployeeAuth` (roles: `dev`, `support`, `owner`).
**Plans:** `PlanContext` (`hasFeature()`). Slugs: `free-*`, `pro-*`, `team-*`.

**Database (Supabase):** RLS ALWAYS enabled. Client: `import { supabase } from "@/integrations/supabase/client"`.
- *Tables:* workspaces, workspace_members, subscriptions, subscription_plans, campaigns, ad_groups, ads, ad_insights, social_posts, email_campaigns, email_messages, customer_personas, loyalty_tiers, customer_loyalty_points, tier_history, reward_items, reward_redemptions, point_earning_rules, discounts, customer_discount_notifications, employees, error_logs, audit_logs, notifications, reports, api_keys, platforms, platform_connections
- *Migrations:* `supabase/migrations/` (append-only, NEVER edit existing).

**Hooks (React Query):** Wrap Supabase calls. Throw errors.
- *List:* useWorkspace, useWorkspaceMembers, useCampaigns, useAdGroups, useAds, useAdInsights, useSocialPosts, usePlatformConnections, usePlatformsDB, useSubscription, usePlanAccess, useCustomerTiers, useLoyaltyTier, useTierManagement, useCustomerRewards, useRewardsManagement, useRewardsCampaigns, useRedemptionRequests, useDiscounts, useCustomerCoupons, useEmployees, useEmployeeAuth, useAdminMonitor, useDevMonitor, useAuditLogs, useAdminWorkspaces, useDevWorkspaces, useNotifications, useTeamManagement, useUserRole, useOwnerMetrics, useDashboardMetrics, useAnalyticsData, useFunnelData, useReports, useScheduledReports

**Patterns & Rules:**
1. React Query hooks ONLY for DB. No raw `fetch` or local state.
2. Log errors to `error_logs` (`logError`), notify via `toast`. Never swallow errors.
3. Scope queries by `workspaceId` (pass as query key).
4. Loyalty: Use RPC `redeem_reward` for points. Tier upgrades via DB triggers. Support needs RLS.
5. NEVER: Edit `types.ts`, bypass RLS silently, commit `.env`.
