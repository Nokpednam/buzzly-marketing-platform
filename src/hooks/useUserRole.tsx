import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export function useUserRole() {
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check employees table
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

      if (employeeData && employeeData.status === 'active' && employeeData.approval_status === 'approved') {
        const roleEmployee = employeeData.role_employees as any;
        const roleName = roleEmployee?.role_name as AppRole;

        setRole(roleName);
        setIsAdmin(["owner", "admin"].includes(roleName));
      } else {
        // Not an active/approved employee -> Regular customer
        setRole(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      setRole(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { role, isAdmin, loading };
}
