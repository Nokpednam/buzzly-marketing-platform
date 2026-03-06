import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { useSidebarState } from "@/hooks/useSidebarState";
import { cn } from "@/lib/utils";

export function MainLayout() {
  const { collapsed } = useSidebarState();

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
