import { Outlet } from "react-router-dom";
import { OwnerSidebar } from "./OwnerSidebar";
import { OwnerHeader } from "./OwnerHeader";

export function OwnerLayout() {
  return (
    <div className="min-h-screen bg-background">
      <OwnerSidebar />
      <div className="pl-64 transition-all duration-300">
        <OwnerHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
