import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { useSidebarState } from "@/hooks/useSidebarState";
import { logPageView } from "@/lib/auditLogger";
import { cn } from "@/lib/utils";
import { USE_MOCK_DATA } from "@/lib/mock-api-data";

export function MainLayout() {
  const { collapsed } = useSidebarState();
  const { pathname } = useLocation();
  const prevPathRef = useRef<string>("");

  useEffect(() => {
    if (pathname && pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      logPageView(pathname);
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background font-sans">
      {USE_MOCK_DATA && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-400 py-1 text-xs font-semibold text-amber-900">
          <span>⚠ MOCK MODE — data is simulated (VITE_USE_MOCK_DATA=true)</span>
        </div>
      )}
      <AppSidebar />
      <div
        className={cn(
          "transition-all duration-300 min-h-screen",
          collapsed ? "pl-20" : "pl-72",
          USE_MOCK_DATA && "pt-6",
        )}
      >
        <Header />
        <main className="px-6 pt-6 pb-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
