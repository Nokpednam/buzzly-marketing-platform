import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type EmployeeRole = "owner" | "admin" | "support" | "developer" | null;

interface EmployeeAuthState {
  user: User | null;
  session: Session | null;
  isEmployee: boolean;
  employeeRole: EmployeeRole;
  employeeId: string | null;
  approvalStatus: string | null;
  loading: boolean;
}

export function useEmployeeAuth() {
  const [state, setState] = useState<EmployeeAuthState>({
    user: null,
    session: null,
    isEmployee: false,
    employeeRole: null,
    employeeId: null,
    approvalStatus: null,
    loading: true,
  });

  useEffect(() => {
    checkEmployeeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setTimeout(() => {
            checkEmployeeAuth();
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkEmployeeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setState({
          user: null,
          session: null,
          isEmployee: false,
          employeeRole: null,
          employeeId: null,
          approvalStatus: null,
          loading: false,
        });
        return;
      }

      // Check if user is an employee
      const { data: employeeData } = await supabase
        .from("employees")
        .select(`
          id,
          status,
          approval_status,
          role_employees_id,
          role_employees (
            role_name
          )
        `)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (employeeData && employeeData.status === 'active' && employeeData.approval_status === 'approved') {
        const roleName = (employeeData.role_employees as any)?.role_name as EmployeeRole;
        
        setState({
          user: session.user,
          session: session,
          isEmployee: true,
          employeeRole: roleName,
          employeeId: employeeData.id,
          approvalStatus: employeeData.approval_status,
          loading: false,
        });
      } else if (employeeData) {
        // Employee exists but not approved or inactive
        setState({
          user: session.user,
          session: session,
          isEmployee: false,
          employeeRole: null,
          employeeId: employeeData.id,
          approvalStatus: employeeData.approval_status,
          loading: false,
        });
      } else {
        // Not an employee
        setState({
          user: session.user,
          session: session,
          isEmployee: false,
          employeeRole: null,
          employeeId: null,
          approvalStatus: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error checking employee auth:", error);
      setState(prev => ({
        ...prev,
        isEmployee: false,
        employeeRole: null,
        loading: false,
      }));
    }
  };

  return {
    ...state,
    refetch: checkEmployeeAuth,
  };
}
