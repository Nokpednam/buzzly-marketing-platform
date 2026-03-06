import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DevLayout } from "@/components/dev/DevLayout";
import { OwnerLayout } from "@/components/owner/OwnerLayout";
import { CustomerProtectedRoute } from "@/components/CustomerProtectedRoute";
import { EmployeeProtectedRoute } from "@/components/EmployeeProtectedRoute";
import { PlatformConnectionsProvider } from "@/hooks/usePlatformConnections";
import { SidebarStateProvider } from "@/hooks/useSidebarState";
import { PlanProvider } from "@/contexts/PlanContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logError } from "@/services/errorLogger";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Prospects from "./pages/Prospects";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import SocialAnalytics from "./pages/SocialAnalytics";
import RewardsCenter from "./pages/RewardsCenter";

import CustomerJourney from "./pages/CustomerJourney";
import AARRRFunnel from "./pages/AARRRFunnel";
import APIKeys from "./pages/APIKeys";

import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MonitorDashboard from "./pages/dev/MonitorDashboard";
import AuditLogs from "./pages/dev/AuditLogs";
import EmployeeManagement from "./pages/dev/EmployeeManagement";
import TierManagement from "./pages/support/TierManagement";
import RewardsCampaigns from "./pages/support/RewardsCampaigns";
import RewardsManagement from "./pages/support/RewardsManagement";
import RedemptionRequests from "./pages/support/RedemptionRequests";
import DiscountManagement from "./pages/support/DiscountManagement";
import TeamManagement from "./pages/TeamManagement";
import ProductUsage from "./pages/owner/ProductUsage";
import BusinessPerformance from "./pages/owner/BusinessPerformance";
import UserFeedback from "./pages/owner/UserFeedback";
import ExecutiveReport from "./pages/owner/ExecutiveReport";
import CustomerTiers from "./pages/owner/CustomerTiers";
import OwnerDiscounts from "./pages/owner/OwnerDiscounts";

// Dev pages (renamed from admin)
import DevSupport from "./pages/dev/DevSupport";
import DevWorkspaces from "./pages/dev/DevWorkspaces";

// Employee shared auth
import EmployeeLogin from "./pages/employee/EmployeeLogin";
import EmployeeSignUp from "./pages/employee/EmployeeSignUp";

// Support layout
import { SupportLayout } from "./components/support/SupportLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: Error) => {
        // Log all mutation errors
        logError('React Query mutation failed', error, {
          queryType: 'mutation',
        });
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <PlanProvider>
        <PlatformConnectionsProvider>
          <SidebarStateProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/signup" element={<SignUp />} />

                  {/* Customer Routes */}
                  <Route element={<CustomerProtectedRoute><MainLayout /></CustomerProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/prospects" element={<Prospects />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/campaigns/:id" element={<CampaignDetail />} />
                    <Route path="/social-analytics" element={<SocialAnalytics />} />
                    <Route path="/rewards" element={<RewardsCenter />} />

                    <Route path="/customer-journey" element={<CustomerJourney />} />
                    <Route path="/aarrr-funnel" element={<AARRRFunnel />} />
                    <Route path="/api-keys" element={<APIKeys />} />

                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/team" element={<TeamManagement />} />
                  </Route>

                  {/* Legacy /admin/* routes → redirect to /dev/* */}
                  <Route path="/admin/login" element={<Navigate to="/employee/login" replace />} />
                  <Route path="/admin/signup" element={<Navigate to="/employee/signup" replace />} />
                  <Route path="/admin" element={<Navigate to="/dev/monitor" replace />} />
                  <Route path="/admin/dashboard" element={<Navigate to="/dev/monitor" replace />} />
                  <Route path="/admin/monitor" element={<Navigate to="/dev/monitor" replace />} />
                  <Route path="/admin/audit-logs" element={<Navigate to="/dev/audit-logs" replace />} />
                  <Route path="/admin/workspaces" element={<Navigate to="/support/workspaces" replace />} />
                  <Route path="/admin/employees" element={<Navigate to="/dev/employees" replace />} />
                  <Route path="/admin/support" element={<Navigate to="/dev/support" replace />} />
                  <Route path="/admin/tier-management" element={<Navigate to="/support/tier-management" replace />} />
                  <Route path="/admin/rewards-campaigns" element={<Navigate to="/support/rewards-campaigns" replace />} />
                  <Route path="/admin/rewards-management" element={<Navigate to="/support/rewards-management" replace />} />
                  <Route path="/admin/redemption-requests" element={<Navigate to="/support/redemption-requests" replace />} />

                  {/* Legacy /dev/login → /employee/login */}
                  <Route path="/dev/login" element={<Navigate to="/employee/login" replace />} />
                  <Route path="/dev/signup" element={<Navigate to="/employee/signup" replace />} />

                  {/* Shared Employee Auth Routes */}
                  <Route path="/employee/login" element={<EmployeeLogin />} />
                  <Route path="/employee/signup" element={<EmployeeSignUp />} />

                  {/* Dev Employee Routes — restricted to 4 pages */}
                  <Route element={<EmployeeProtectedRoute allowedRoles={["dev", "owner"]}><DevLayout /></EmployeeProtectedRoute>}>
                    <Route path="/dev" element={<Navigate to="/dev/monitor" replace />} />
                    <Route path="/dev/dashboard" element={<Navigate to="/dev/monitor" replace />} />
                    <Route path="/dev/monitor" element={<MonitorDashboard />} />
                    <Route path="/dev/audit-logs" element={<AuditLogs />} />
                    <Route path="/dev/employees" element={<EmployeeManagement />} />
                    <Route path="/dev/support" element={<DevSupport />} />
                  </Route>

                  {/* Support Employee Routes */}
                  <Route element={<EmployeeProtectedRoute allowedRoles={["support", "owner"]}><SupportLayout /></EmployeeProtectedRoute>}>
                    <Route path="/support" element={<Navigate to="/support/workspaces" replace />} />
                    <Route path="/support/workspaces" element={<DevWorkspaces />} />
                    <Route path="/support/tier-management" element={<TierManagement />} />
                    <Route path="/support/rewards-campaigns" element={<RewardsCampaigns />} />
                    <Route path="/support/rewards-management" element={<RewardsManagement />} />
                    <Route path="/support/redemption-requests" element={<RedemptionRequests />} />
                    <Route path="/support/discount-management" element={<DiscountManagement />} />
                  </Route>

                  {/* Owner Employee Routes */}
                  <Route element={<EmployeeProtectedRoute allowedRoles={["owner"]}><OwnerLayout /></EmployeeProtectedRoute>}>
                    <Route path="/owner" element={<Navigate to="/owner/product-usage" replace />} />
                    <Route path="/owner/product-usage" element={<ProductUsage />} />
                    <Route path="/owner/business-performance" element={<BusinessPerformance />} />
                    <Route path="/owner/user-feedback" element={<UserFeedback />} />
                    <Route path="/owner/executive-report" element={<ExecutiveReport />} />
                    <Route path="/owner/customer-tiers" element={<CustomerTiers />} />
                    <Route path="/owner/discounts" element={<OwnerDiscounts />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SidebarStateProvider>
        </PlatformConnectionsProvider>
      </PlanProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
