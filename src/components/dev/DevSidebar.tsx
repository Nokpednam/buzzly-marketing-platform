import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar";
import {
    Activity,
    ClipboardList,
    ShieldCheck,
    UserCog,
    LogOut,
    ChevronRight,
    HeadphonesIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { auditAuth } from "@/lib/auditLogger";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPanel } from "@/components/shared/NotificationPanel";

const devNavItems = [
    { title: "Monitor Dashboard", icon: Activity, href: "/dev/monitor" },
    { title: "Audit Logs", icon: ClipboardList, href: "/dev/audit-logs" },
    { title: "Employee Management", icon: UserCog, href: "/dev/employees" },
    { title: "Support Tickets", icon: HeadphonesIcon, href: "/dev/support" },
];

export function DevSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const { notifications, unreadCount, isMarkingAll, markAsRead, markAllAsRead } = useNotifications("dev");

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserEmail(user.email || null);
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await auditAuth.logout(user.id, "Dev", user.email || "unknown");
            await supabase.auth.signOut({ scope: 'local' });
            toast({ title: "Signed Out", description: "Dev session closed." });
            window.location.href = "/";
        } catch { }
    };

    return (
        <Sidebar
            collapsible="none"
            className="transition-all duration-300 select-none"
            style={{
                background: "#ffffff",
                borderRight: "1px solid #e2e8f0",
                boxShadow: "4px 0 20px rgba(0,0,0,0.04)",
            }}
        >
            <SidebarContent style={{ background: "transparent" }}>
                {/* Branding */}
                <div className="flex items-center gap-3 px-7 py-8 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-md"
                        style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl tracking-tight leading-none" style={{ color: "#0f172a" }}>Buzzly</h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5 block"
                            style={{ color: "#94a3b8" }}>Dev Console</span>
                    </div>
                </div>

                {/* Label */}
                <div className="px-7 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#cbd5e1" }}>
                        Navigation
                    </span>
                </div>

                <SidebarGroup className="px-4 py-1">
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                            {devNavItems.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <NavLink
                                            to={item.href}
                                            className={() => cn(
                                                "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 w-full outline-none active:scale-[0.98]",
                                                isActive
                                                    ? "text-white shadow-md"
                                                    : "hover:bg-slate-50"
                                            )}
                                            style={() => isActive ? {
                                                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                                                boxShadow: "0 4px 14px rgba(59,130,246,0.30)",
                                            } : { color: "#64748b" }}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                                                    isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"
                                                )}>
                                                    <item.icon className={cn(
                                                        "h-4 w-4 transition-colors",
                                                        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                                                    )} />
                                                </div>
                                                <span className={cn(
                                                    "font-semibold tracking-tight text-sm",
                                                    isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                                                )}>{item.title}</span>
                                            </div>
                                            <ChevronRight className={cn(
                                                "h-4 w-4 transition-all duration-200",
                                                isActive ? "text-white opacity-80 translate-x-0.5" : "text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5"
                                            )} />
                                        </NavLink>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="sticky bottom-0 mt-auto px-4 py-4 shrink-0"
                style={{ borderTop: "1px solid #f1f5f9", background: "#fafbfc" }}>
                <div className="flex items-center justify-between px-2 py-2">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9 border-2 shadow-sm" style={{ borderColor: "#bfdbfe" }}>
                            <AvatarFallback className="font-bold text-sm text-white"
                                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                                {userEmail?.[0]?.toUpperCase() || "D"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:block">
                            <p className="text-xs font-semibold text-slate-700 truncate max-w-[100px]">
                                {userEmail?.split("@")[0] || "Developer"}
                            </p>
                            <p className="text-[10px] text-slate-400">Dev Console</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            className="p-2 rounded-lg transition-all duration-150 active:scale-90 text-slate-400 hover:text-red-500 hover:bg-red-50"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                        <NotificationPanel
                            notifications={notifications}
                            unreadCount={unreadCount}
                            isMarkingAll={isMarkingAll}
                            onMarkAsRead={markAsRead}
                            onMarkAllAsRead={markAllAsRead}
                            accentColor="bg-blue-500"
                            badgeColor="bg-cyan-500"
                        />
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
