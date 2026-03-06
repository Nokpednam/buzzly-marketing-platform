import { Outlet, Navigate, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const EXEMPT_PATHS = ["/api-keys", "/settings"];
const PLAN_LOCKED_PATHS = ["/customer-journey", "/aarrr-funnel", "/analytics", "/reports", "/team"];

export function MainLayout() {
  const { collapsed } = useSidebarState();
  const { state } = useOnboardingGuard();
  const { pathname } = useLocation();

  const isExempt = EXEMPT_PATHS.some((p) => pathname.startsWith(p));
  const isPlanLocked = PLAN_LOCKED_PATHS.some((p) => pathname.startsWith(p));

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state !== "ready" && !isExempt && !isPlanLocked) {
    return <Navigate to="/api-keys" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "pl-16" : "pl-64"
        )}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
