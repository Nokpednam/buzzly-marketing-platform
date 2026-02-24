import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function AdminLayout() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            navigate("/admin/login");
            return;
        }

        const { data: employeeData } = await supabase
            .from("employees")
            .select(`
        status,
        approval_status,
        role_employees (
          role_name
        )
      `)
            .eq("user_id", user.id)
            .maybeSingle();

        if (!employeeData || employeeData.status !== 'active' || employeeData.approval_status !== 'approved') {
            // Check legacy user_roles as fallback only if absolutely necessary, but we should probably migrate fully.
            // For now, let's assume we want to enforce the new system.

            // Double check legacy just in case (optional, maybe remove this later)
            const { data: roleData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id)
                .in("role", ["admin", "owner"])
                .maybeSingle();

            if (!roleData) {
                toast({
                    title: "Access Denied",
                    description: "You don't have admin privileges",
                    variant: "destructive",
                });
                navigate("/dashboard");
                return;
            }
            // If they have legacy role, allow them (or migrate them?)
            // For this fix, let's allow if legacy role exists OR new employee record exists.
        }

        // Strict check: if no employee record AND no legacy role (handled above), deny.
        // If employee record exists but not active/approved, deny?
        if (employeeData && (employeeData.status !== 'active' || employeeData.approval_status !== 'approved')) {
            toast({
                title: "Access Denied",
                description: "Your account is not active or approved.",
                variant: "destructive",
            });
            navigate("/admin/login");
            return;
        }

        setIsAuthorized(true);
    };

    if (!isAuthorized) {
        return null;
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto bg-background px-8 pt-6 pb-10">
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    );
}
