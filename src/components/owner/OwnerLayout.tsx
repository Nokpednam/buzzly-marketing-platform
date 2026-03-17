import { useState } from "react";
import { Outlet } from "react-router-dom";
import { OwnerSidebar } from "./OwnerSidebar";
import { useEmployeeAuth } from "@/hooks/useEmployeeAuth";
import { cn } from "@/lib/utils";

export function OwnerLayout() {
  useEmployeeAuth(); // Trigger last_active update logic
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <OwnerSidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      <div className={cn("transition-all duration-300", collapsed ? "pl-20" : "pl-64")}>
        <main className="flex-1 overflow-y-auto bg-background px-8 pt-6 pb-10 container-cinema animate-in fade-in duration-700">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
