import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { navGroups } from "./AppSidebar";

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { currentPlan } = usePlanAccess();
  const { canAccess } = useTeamPermissions();

  const hasPlanAccess = (requiresPlan: "pro" | "team" | null) => {
    if (!requiresPlan) return true;
    if (requiresPlan === "pro") return currentPlan === "pro" || currentPlan === "team";
    if (requiresPlan === "team") return currentPlan === "team";
    return true;
  };

  const isItemAccessible = (requiresPlan: "pro" | "team" | null, requiresPermission: any) => {
    return canAccess(requiresPermission) && hasPlanAccess(requiresPlan);
  };

  const isPlanLockedOnly = (requiresPlan: "pro" | "team" | null, requiresPermission: any) => {
    return canAccess(requiresPermission) && !hasPlanAccess(requiresPlan);
  };

  return (
    <header className="md:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm">
          <Zap className="h-4 w-4 text-primary-foreground fill-current" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">BUZZLY</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex h-16 items-center px-5 shrink-0 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Zap className="h-5 w-5 text-primary-foreground fill-current" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">BUZZLY</span>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <h4 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h4>
                <div className="space-y-0.5">
                  {group.items.filter((item) => canAccess(item.requiresPermission)).map((item) => {
                    const accessible = isItemAccessible(item.requiresPlan, item.requiresPermission);
                    const planLockedOnly = isPlanLockedOnly(item.requiresPlan, item.requiresPermission);
                    const isActive =
                      location.pathname === item.url ||
                      location.pathname.startsWith(item.url + "/");

                    if (!accessible && planLockedOnly) {
                      return (
                        <button
                          key={item.title}
                          className="group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium w-full text-left transition-all duration-200 text-muted-foreground opacity-60 cursor-not-allowed"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/50">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="flex-1 truncate tracking-tight">{item.title}</span>
                          <div className="bg-muted p-1 rounded-md">
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </button>
                      );
                    }

                    return (
                      <NavLink
                        key={item.title}
                        to={item.url}
                        onClick={() => setOpen(false)}
                        className={({ isActive: isLinkActive }) => cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                          isLinkActive
                            ? "bg-muted/60 text-foreground border-l-2 border-l-primary"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        <div className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                          isActive ? "bg-primary/10 text-primary" : "bg-muted/50 group-hover:bg-muted text-muted-foreground group-hover:text-foreground"
                        )}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1 truncate">{item.title}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
