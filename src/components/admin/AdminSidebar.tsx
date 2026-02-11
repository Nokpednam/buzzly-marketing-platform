import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Activity,
  ClipboardList,
  ShieldCheck,
  Building2,
  Award,
  UserCog,
  LogOut,
  ChevronRight,
  HeadphonesIcon,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    title: "Monitor Dashboard",
    icon: Activity,
    href: "/admin/monitor",
  },
  {
    title: "Audit Logs",
    icon: ClipboardList,
    href: "/admin/audit-logs",
  },
  {
    title: "Workspaces",
    icon: Building2,
    href: "/admin/workspaces",
  },
  {
    title: "Employee Management",
    icon: UserCog,
    href: "/admin/employees",
  },
  {
    title: "Support Tickets",
    icon: HeadphonesIcon,
    href: "/admin/support",
  },
  {
    title: "Tier Management",
    icon: Award,
    href: "/admin/tier-management",
  },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      toast({
        title: "Signed Out",
        description: "Admin session closed.",
      });
      window.location.href = "/";
    } catch {
      // Ignore errors
    }
  };

  return (
    <Sidebar className="border-r border-slate-100 bg-white transition-all duration-300">
      <SidebarContent className="bg-white">
        {/* Branding Area */}
        <div className="flex items-center gap-3 px-8 py-10 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-xl tracking-tight text-slate-900 leading-none">Buzzly</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Systems Admin</span>
          </div>
        </div>

        {/* Global Search Mock (Outstaff Style) */}
        <div className="px-6 mb-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="text"
              placeholder="System Search..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all"
              readOnly
            />
          </div>
        </div>

        <SidebarGroup className="px-6">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    className={cn(
                      "group flex items-center justify-between px-4 py-7 rounded-2xl transition-all duration-300 border-none outline-none",
                      location.pathname === item.href
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <NavLink to={item.href} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <item.icon className={cn(
                          "h-5 w-5 transition-colors",
                          location.pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                        )} />
                        <span className="font-bold tracking-tight text-sm">{item.title}</span>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-all duration-300 transform",
                        location.pathname === item.href ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                      )} />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 bg-transparent">
        <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 relative group transition-all hover:shadow-lg">
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white shadow-sm border border-slate-100 hover:text-red-500 hover:bg-red-50"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-white shadow-md ring-1 ring-slate-100">
                <AvatarFallback className="bg-slate-200 text-slate-700 font-bold">
                  {userEmail?.[0].toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
            </div>

            <div className="text-center w-full px-2">
              <p className="font-bold text-slate-900 text-sm tracking-tight truncate">Administrator</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{userEmail}</p>
            </div>

            <Button
              variant="outline"
              className="w-full mt-2 rounded-2xl bg-white border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-xs font-bold py-6 group"
              onClick={() => navigate("/")}
            >
              System Tools
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
