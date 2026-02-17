import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";
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

import CustomerJourney from "./pages/CustomerJourney";
import AARRRFunnel from "./pages/AARRRFunnel";
import APIKeys from "./pages/APIKeys";

import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignUp from "./pages/admin/AdminSignUp";
import MonitorDashboard from "./pages/admin/MonitorDashboard";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminWorkspaces from "./pages/admin/AdminWorkspaces";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminSupport from "./pages/admin/AdminSupport";
import ProductUsage from "./pages/owner/ProductUsage";
import BusinessPerformance from "./pages/owner/BusinessPerformance";
import UserFeedback from "./pages/owner/UserFeedback";
import ExecutiveReport from "./pages/owner/ExecutiveReport";
import CustomerTiers from "./pages/owner/CustomerTiers";
import TeamManagement from "./pages/TeamManagement";
import TierManagement from "./pages/admin/TierManagement";
import EmployeeManagement from "./pages/admin/EmployeeManagement";

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

                    <Route path="/customer-journey" element={<CustomerJourney />} />
                    <Route path="/aarrr-funnel" element={<AARRRFunnel />} />
                    <Route path="/api-keys" element={<APIKeys />} />

                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/team" element={<TeamManagement />} />
                  </Route>

                  {/* Employee Auth Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/signup" element={<AdminSignUp />} />

                  {/* Admin Employee Routes (admin, support, developer) */}
                  <Route element={<EmployeeProtectedRoute allowedRoles={["admin", "support", "developer"]}><AdminLayout /></EmployeeProtectedRoute>}>
                    <Route path="/admin" element={<Navigate to="/admin/monitor" replace />} />
                    <Route path="/admin/dashboard" element={<Navigate to="/admin/monitor" replace />} />
                    <Route path="/admin/monitor" element={<MonitorDashboard />} />
                    <Route path="/admin/audit-logs" element={<AuditLogs />} />
                    <Route path="/admin/workspaces" element={<AdminWorkspaces />} />
                    <Route path="/admin/employees" element={<EmployeeManagement />} />
                    <Route path="/admin/support" element={<AdminSupport />} />
                    <Route path="/admin/tier-management" element={<TierManagement />} />
                  </Route>

                  {/* Owner Employee Routes */}
                  <Route element={<EmployeeProtectedRoute allowedRoles={["owner"]}><OwnerLayout /></EmployeeProtectedRoute>}>
                    <Route path="/owner" element={<Navigate to="/owner/product-usage" replace />} />
                    <Route path="/owner/product-usage" element={<ProductUsage />} />
                    <Route path="/owner/business-performance" element={<BusinessPerformance />} />
                    <Route path="/owner/user-feedback" element={<UserFeedback />} />
                    <Route path="/owner/executive-report" element={<ExecutiveReport />} />
                    <Route path="/owner/customer-tiers" element={<CustomerTiers />} />
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
