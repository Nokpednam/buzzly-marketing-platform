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
                background: "#020617",
                borderRight: "1px solid #1e293b",
                boxShadow: "none",
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
                        <h2 className="font-bold text-xl tracking-tight leading-none text-white">Buzzly</h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5 block text-slate-500"
                        >Dev Console</span>
                    </div>
                </div>

                {/* Label */}
                <div className="px-7 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
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
                                                    ? "text-white shadow-lg"
                                                    : "hover:bg-slate-900/50"
                                            )}
                                            style={() => isActive ? {
                                                background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                                                boxShadow: "0 4px 20px rgba(37,99,235,0.25)",
                                            } : { color: "#94a3b8" }}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                                                    isActive ? "bg-white/20" : "bg-slate-900 group-hover:bg-slate-800"
                                                )}>
                                                    <item.icon className={cn(
                                                        "h-4 w-4 transition-colors",
                                                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                                                    )} />
                                                </div>
                                                <span className={cn(
                                                    "font-semibold tracking-tight text-sm",
                                                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                                                )}>{item.title}</span>
                                            </div>
                                            <ChevronRight className={cn(
                                                "h-4 w-4 transition-all duration-200",
                                                isActive ? "text-white opacity-80 translate-x-0.5" : "text-slate-700 group-hover:text-slate-500 group-hover:translate-x-0.5"
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
                style={{ borderTop: "1px solid #1e293b", background: "#020617" }}>
                <div className="flex items-center justify-between px-2 py-2">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9 border-2 shadow-sm border-slate-800">
                            <AvatarFallback className="font-bold text-sm text-white"
                                style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)" }}>
                                {userEmail?.[0]?.toUpperCase() || "D"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:block">
                            <p className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                                {userEmail?.split("@")[0] || "Developer"}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Dev Console</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            className="p-2 rounded-lg transition-all duration-150 active:scale-90 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
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
                            theme="dark"
                        />
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
