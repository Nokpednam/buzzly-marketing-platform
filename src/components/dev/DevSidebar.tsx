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
    Bell,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { auditAuth } from "@/lib/auditLogger";

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
            className="border-r border-slate-100 bg-white transition-all duration-300 select-none"
        >
            <SidebarContent className="bg-white">
                {/* Branding Area */}
                <div className="flex items-center gap-3 px-8 py-10 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xl">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl tracking-tight text-slate-900 leading-none">Buzzly</h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Dev Console</span>
                    </div>
                </div>


                <SidebarGroup className="px-6 py-4">
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-2">
                            {devNavItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <NavLink
                                        to={item.href}
                                        className={({ isActive }) => cn(
                                            "group flex items-center justify-between px-5 py-4 rounded-[1.25rem] transition-all duration-300 border border-transparent w-full outline-none",
                                            isActive
                                                ? "bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] border-slate-800"
                                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={cn(
                                                "flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                                                location.pathname === item.href ? "bg-white/10" : "bg-slate-100 group-hover:bg-white group-hover:shadow-sm"
                                            )}>
                                                <item.icon className={cn(
                                                    "h-4 w-4 transition-colors",
                                                    location.pathname === item.href ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                                                )} />
                                            </div>
                                            <span className="font-semibold tracking-tight text-sm">{item.title}</span>
                                        </div>
                                        <ChevronRight className={cn(
                                            "h-4 w-4 transition-all duration-300",
                                            location.pathname === item.href ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                                        )} />
                                    </NavLink>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="sticky bottom-0 mt-auto p-5 bg-white border-t border-slate-100 shrink-0">
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
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>

                        {/* Bell Notification */}
                        <button className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-50">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-blue-500 rounded-full border-2 border-white" />
                        </button>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar >
    );
}
