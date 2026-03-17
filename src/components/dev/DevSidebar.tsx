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
    {
        title: "Monitor Dashboard",
        icon: Activity,
        href: "/dev/monitor",
    },
    {
        title: "Audit Logs",
        icon: ClipboardList,
        href: "/dev/audit-logs",
    },
    {
        title: "Employee Management",
        icon: UserCog,
        href: "/dev/employees",
    },
    {
        title: "Support Tickets",
        icon: HeadphonesIcon,
        href: "/dev/support",
    },
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
            if (user) {
                setUserEmail(user.email || null);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await auditAuth.logout(user.id, "Dev", user.email || "unknown");
            }
            await supabase.auth.signOut({ scope: 'local' });
            toast({
                title: "Signed Out",
                description: "Dev session closed.",
            });
            window.location.href = "/";
        } catch {
            // Ignore errors
        }
    };

    return (
        <Sidebar
            collapsible="none"
            className="border-r border-slate-800 bg-[#0B0F1A] transition-all duration-300 select-none shadow-xl"
        >
            <SidebarContent className="bg-[#0B0F1A]">
                {/* Branding Area */}
                <div className="flex items-center gap-3 px-8 py-10 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xl">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl tracking-tight text-white leading-none">Buzzly</h2>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">Dev Console</span>
                    </div>
                </div>


                <SidebarGroup className="px-6 py-4">
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-2">
                            {devNavItems.map((item, index) => (
                                <SidebarMenuItem
                                    key={item.href}
                                    className={cn(
                                        "animate-slide-in-left",
                                        index === 0 && "stagger-1",
                                        index === 1 && "stagger-2",
                                        index === 2 && "stagger-3",
                                        index === 3 && "stagger-4",
                                    )}
                                >
                                    <NavLink
                                        to={item.href}
                                        className={({ isActive }) => cn(
                                            "group flex items-center justify-between px-5 py-4 rounded-[1.25rem] transition-all duration-200 border border-transparent w-full outline-none active:scale-[0.97]",
                                            isActive
                                                ? "bg-blue-600/10 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.1)] border-blue-500/20 w-full"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                                                location.pathname === item.href
                                                    ? "bg-white/10 scale-105"
                                                    : "bg-white/5 group-hover:bg-white/10 group-hover:shadow-sm group-hover:scale-105"
                                            )}>
                                                <item.icon className={cn(
                                                    "h-4 w-4 transition-colors duration-200",
                                                    location.pathname === item.href ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                                                )} />
                                            </div>
                                            <span className="font-semibold tracking-tight text-sm">{item.title}</span>
                                        </div>
                                        <ChevronRight className={cn(
                                            "h-4 w-4 transition-all duration-200",
                                            location.pathname === item.href
                                                ? "opacity-100 translate-x-0.5"
                                                : "opacity-30 group-hover:opacity-80 group-hover:translate-x-0.5"
                                        )} />
                                    </NavLink>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="sticky bottom-0 mt-auto p-5 bg-[#0B0F1A] border-t border-slate-800 shrink-0">
                <div className="flex items-center justify-between px-2 py-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 border-2 border-blue-500 shadow-sm">
                        <AvatarFallback className="bg-blue-500 text-white font-bold text-sm">
                            {userEmail?.[0]?.toUpperCase() || "D"}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-2">
                        {/* Logout Button */}
                        <button
                            className="p-2 text-slate-500 hover:text-red-400 transition-all duration-150 rounded-lg hover:bg-red-500/10 active:scale-90"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>

                        {/* Live Notification Bell */}
                        <NotificationPanel
                            notifications={notifications}
                            unreadCount={unreadCount}
                            isMarkingAll={isMarkingAll}
                            onMarkAsRead={markAsRead}
                            onMarkAllAsRead={markAllAsRead}
                            accentColor="bg-blue-500"
                            badgeColor="bg-blue-500"
                        />
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar >
    );
}
