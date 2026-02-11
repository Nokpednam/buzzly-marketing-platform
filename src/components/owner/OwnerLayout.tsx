import { Outlet } from "react-router-dom";
import { OwnerSidebar } from "./OwnerSidebar";

export function OwnerLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <OwnerSidebar />
      <div className="pl-64 transition-all duration-300">
        <main className="flex-1 overflow-y-auto bg-background px-8 pt-6 pb-10 container-cinema animate-in fade-in duration-700">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
