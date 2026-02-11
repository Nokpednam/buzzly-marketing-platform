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
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { Badge } from "@/components/ui/badge";
import { SidebarBottomSection } from "@/components/sidebar/SidebarBottomSection";
import { useSidebarState } from "@/hooks/useSidebarState";

const navGroups = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requiresPlan: null },
      { title: "Campaigns", url: "/campaigns", icon: Megaphone, requiresPlan: null },
      { title: "Customer Persona", url: "/prospects", icon: Users, requiresPlan: null },
      { title: "Social Analytics", url: "/social-analytics", icon: Share2, requiresPlan: null },
    ]
  },
  {
    label: "Intelligence",
    items: [
      { title: "Customer Journey", url: "/customer-journey", icon: Route, requiresPlan: "pro" as const },
      { title: "AARRR Funnel", url: "/aarrr-funnel", icon: TrendingUp, requiresPlan: "pro" as const },
      { title: "Analytics", url: "/analytics", icon: BarChart3, requiresPlan: "pro" as const },
    ]
  },
  {
    label: "Organization",
    items: [
      { title: "Team Management", url: "/team", icon: UsersRound, requiresPlan: "team" as const },
      { title: "Reports", url: "/reports", icon: FileText, requiresPlan: "pro" as const },
    ]
  },
  {
    label: "System",
    items: [
      { title: "API Keys", url: "/api-keys", icon: Key, requiresPlan: null },
      { title: "Settings", url: "/settings", icon: Settings, requiresPlan: null },
    ]
  }
];

export function AppSidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const { currentPlan } = usePlanAccess();

  const isItemAccessible = (requiresPlan: "pro" | "team" | null) => {
    if (!requiresPlan) return true;
    if (requiresPlan === "pro") return currentPlan === "pro" || currentPlan === "team";
    if (requiresPlan === "team") return currentPlan === "team";
    return true;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar/50 backdrop-blur-xl transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-72",
      )}
    >
      {/* 1. BRANDING */}
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Zap className="h-5 w-5 text-primary-foreground fill-current" />
          </div>
          {!collapsed && (
            <span className="text-xl font-black tracking-tighter text-foreground">BUZZLY</span>
          )}
        </div>
      </div>

      {/* 2. WORKSPACE & PLAN INDICATOR */}
      {!collapsed && (
        <div className="px-4 mb-4">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 transition-all hover:bg-muted/60 group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white font-bold shadow-sm">
                M
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Marketing Ops</p>
                <div className="flex items-center gap-1.5">
                   <div className={cn("h-1.5 w-1.5 rounded-full", currentPlan === 'free' ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse')} />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{currentPlan} Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SCROLLABLE NAVIGATION */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
                {group.label}
              </h4>
            )}
            {group.items.map((item) => {
              const accessible = isItemAccessible(item.requiresPlan);
              const isActive = location.pathname === item.url;
              
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1",
                    collapsed && "justify-center px-0 h-11 w-11 mx-auto",
                    !accessible && "opacity-50 cursor-not-allowed grayscale"
                  )}
                >
                  {/* Active Indicator Bar */}
                  {isActive && !collapsed && (
                    <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                  )}

                  <item.icon className={cn(
                    "h-5 w-5 shrink-0 transition-transform",
                    isActive ? "text-primary" : "group-hover:scale-110"
                  )} />
                  
                  {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                  
                  {!collapsed && !accessible && (
                    <div className="bg-muted p-1 rounded-md">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all origin-left bg-popover text-popover-foreground text-xs font-bold py-2 px-3 rounded-lg shadow-xl border z-50 whitespace-nowrap">
                      {item.title} {!accessible && "🔒"}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}

        {/* Upgrade Banner for non-team users */}
        {!collapsed && currentPlan !== 'team' && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden group">
            <Sparkles className="absolute -right-2 -top-2 h-16 w-16 opacity-20 rotate-12 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold mb-1 opacity-90">Scale your team</p>
            <p className="text-[10px] leading-relaxed opacity-70 mb-3">Unlock collaboration and advanced AARRR analytics.</p>
            <Button size="sm" variant="secondary" className="w-full h-8 text-[10px] font-bold uppercase tracking-wider group-hover:bg-white transition-colors">
              Upgrade Now <ArrowUpRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </nav>

      {/* 4. FOOTER SECTION */}
      <div className="mt-auto border-t border-sidebar-border/50 p-4">
        <SidebarBottomSection collapsed={collapsed} />
      </div>

      {/* 5. FLOATING COLLAPSE TOGGLE */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="absolute -right-4 top-10 h-8 w-8 rounded-xl border border-border bg-background shadow-xl hover:bg-primary hover:text-white transition-all z-50"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </aside>
  );
}