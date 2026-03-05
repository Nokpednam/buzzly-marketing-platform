import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DevSidebar } from "./DevSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function DevLayout() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        checkDevAccess();
    }, []);

    const checkDevAccess = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            navigate("/employee/login");
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
            const { data: roleData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id)
                .in("role", ["dev", "owner"])
                .maybeSingle();

            if (!roleData) {
                toast({
                    title: "Access Denied",
                    description: "You don't have dev privileges",
                    variant: "destructive",
                });
                navigate("/dashboard");
                return;
            }
        }

        if (employeeData && (employeeData.status !== 'active' || employeeData.approval_status !== 'approved')) {
            toast({
                title: "Access Denied",
                description: "Your account is not active or approved.",
                variant: "destructive",
            });
            navigate("/employee/login");
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
                <DevSidebar />
                <main className="flex-1 overflow-y-auto bg-background px-8 pt-6 pb-10">
                    <Outlet />
                </main>
            </div>
        </SidebarProvider>
    );
}
