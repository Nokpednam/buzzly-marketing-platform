import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!checked) {
      checkAdminAccess();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only re-check on sign in/out events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setChecked(false);
          checkAdminAccess();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checked]);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsAdmin(false);
        setIsOwner(false);
        setLoading(false);
        setChecked(true);
        return;
      }

      setSession(session);
      setUser(session.user);

      // Check all user roles
      const { data: fetchedRolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (fetchedRolesData && fetchedRolesData.length > 0) {
        const hasOwnerRole = fetchedRolesData.some((r) => r.role === "owner");
        const hasAdminRole = fetchedRolesData.some((r) => r.role === "admin");
        
        setIsOwner(hasOwnerRole);
        // Only admin (not owner) can access admin panel
        setIsAdmin(hasAdminRole && !hasOwnerRole);
      } else {
        setIsAdmin(false);
        setIsOwner(false);
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      setIsAdmin(false);
      setIsOwner(false);
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in - redirect to admin login
  if (!user || !session) {
    return <Navigate to="/admin/login" replace />;
  }

  // Owner should go to owner panel, not admin
  if (isOwner) {
    return <Navigate to="/owner/product-usage" replace />;
  }

  // Logged in but not admin - redirect to customer dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin access granted
  return <>{children}</>;
}
