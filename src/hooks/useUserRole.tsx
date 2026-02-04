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

      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (rolesData && rolesData.length > 0) {
        // Check if user has admin or owner role
        const hasAdminRole = rolesData.some(
          (r) => r.role === "admin" || r.role === "owner"
        );
        
        if (hasAdminRole) {
          const adminRole = rolesData.find((r) => r.role === "admin" || r.role === "owner");
          setRole(adminRole!.role);
          setIsAdmin(true);
        } else {
          // Has other roles but not admin/owner
          setRole(rolesData[0].role);
          setIsAdmin(false);
        }
      } else {
        // No roles = regular customer
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
