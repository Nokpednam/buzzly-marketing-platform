import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Share2,
  Route,
  TrendingUp,
  Key,
  FileText,
  Lock,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { Badge } from "@/components/ui/badge";
import { SidebarBottomSection } from "@/components/sidebar/SidebarBottomSection";
import { useSidebarState } from "@/hooks/useSidebarState";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiresPlan: null },
  { title: "Campaigns", url: "/campaigns", icon: Megaphone, requiresPlan: null },
  { title: "Customer Persona", url: "/prospects", icon: Users, requiresPlan: null },
  { title: "Social Analytics", url: "/social-analytics", icon: Share2, requiresPlan: null },
];

const exploreItems = [
  { title: "AI Insights", url: "/ai-insights", icon: Sparkles, requiresPlan: "pro" as const },
  { title: "Customer Journey", url: "/customer-journey", icon: Route, requiresPlan: "pro" as const },
  { title: "AARRR Funnel", url: "/aarrr-funnel", icon: TrendingUp, requiresPlan: "pro" as const },
  { title: "Analytics", url: "/analytics", icon: BarChart3, requiresPlan: "pro" as const },
];

const teamItems = [
  { title: "Team Management", url: "/team", icon: UsersRound, requiresPlan: "team" as const },
];

const settingsItems = [
  { title: "Reports", url: "/reports", icon: FileText, requiresPlan: "pro" as const },
  { title: "API Keys", url: "/api-keys", icon: Key, requiresPlan: null },
  { title: "Settings", url: "/settings", icon: Settings, requiresPlan: null },
];

export function AppSidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const { currentPlan, hasFeature } = usePlanAccess();

  // Helper to check if a menu item is accessible based on current plan
  const isItemAccessible = (requiresPlan: "pro" | "team" | null) => {
    if (!requiresPlan) return true;
    if (requiresPlan === "pro") return currentPlan === "pro" || currentPlan === "team";
    if (requiresPlan === "team") return currentPlan === "team";
    return true;
  };

  // Helper to check if lock icon should be shown
  const shouldShowLock = (requiresPlan: "pro" | "team" | null) => {
    if (!requiresPlan) return false;
    return !isItemAccessible(requiresPlan);
  };

  const getPlanDisplayName = () => {
    switch (currentPlan) {
      case "team": return "Team Plan";
      case "pro": return "Pro Plan";
      default: return "Free Plan";
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Buzzly</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Workspace */}
      {!collapsed && (
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground font-semibold">
              M
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">My Workspace</p>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  currentPlan === "team" && "bg-violet-500/20 text-violet-700 dark:text-violet-400",
                  currentPlan === "pro" && "bg-primary/20 text-primary"
                )}
              >
                {getPlanDisplayName()}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <div className="mb-2">
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Main</p>
          )}
          {mainNavItems.map((item) => {
            const accessible = isItemAccessible(item.requiresPlan);
            const showLock = shouldShowLock(item.requiresPlan);
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2",
                  !accessible && "opacity-60"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-primary"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
                {!collapsed && showLock && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
              </NavLink>
            );
          })}
        </div>

        <div className="pt-4">
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explore</p>
          )}
          {exploreItems.map((item) => {
            const accessible = isItemAccessible(item.requiresPlan);
            const showLock = shouldShowLock(item.requiresPlan);
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2",
                  !accessible && "opacity-60"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-primary"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
                {!collapsed && showLock && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
              </NavLink>
            );
          })}
        </div>

        {/* Team section - only for Team plan */}
        <div className="pt-4">
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</p>
          )}
          {teamItems.map((item) => {
            const accessible = isItemAccessible(item.requiresPlan);
            const showLock = shouldShowLock(item.requiresPlan);
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2",
                  !accessible && "opacity-60"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-primary"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
                {!collapsed && showLock && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
              </NavLink>
            );
          })}
        </div>

        {/* Settings section at bottom */}
        <div className="pt-4 border-t border-sidebar-border mt-4">
          {settingsItems.map((item) => {
            const accessible = isItemAccessible(item.requiresPlan);
            const showLock = shouldShowLock(item.requiresPlan);
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-2",
                  !accessible && "opacity-60"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-primary"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
                {!collapsed && showLock && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section - Lovable Style */}
      <SidebarBottomSection collapsed={collapsed} />

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background shadow-sm"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </aside>
  );
}
