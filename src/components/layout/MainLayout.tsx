import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { useSidebarState } from "@/hooks/useSidebarState";
import { cn } from "@/lib/utils";
import { USE_MOCK_DATA } from "@/lib/mock-api-data";

export function MainLayout() {
  const { collapsed } = useSidebarState();

  return (
    <div className="min-h-screen bg-background">
      {USE_MOCK_DATA && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-400 py-1 text-xs font-semibold text-amber-900">
          <span>⚠ MOCK MODE — data is simulated (VITE_USE_MOCK_DATA=true)</span>
        </div>
      )}
      <AppSidebar />
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "pl-16" : "pl-64",
          USE_MOCK_DATA && "pt-6",
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
