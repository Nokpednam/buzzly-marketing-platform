import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  user_id: string | null;
  action_type_id: string | null;
  action_name?: string;
  description: string | null;
  category: string | null;
  status: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  user_email?: string | null;
  user_role?: string | null;
}

export function useAuditLogs(category?: string) {
  return useQuery({
    queryKey: ["audit-logs", category],
    queryFn: async (): Promise<AuditLog[]> => {
      let query = supabase
        .from("audit_logs_enhanced")
        .select(`
          id,
          user_id,
          action_type_id,
          description,
          category,
          status,
          ip_address,
          metadata,
          created_at,
          action_type:action_type_id (action_name)
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user details for each log
      const logs = data || [];
      const userIds = [...new Set(logs.map(log => log.user_id).filter(Boolean))] as string[];

      // Get user emails and roles from employees table
      const { data: employees } = await supabase
        .from('employees')
        .select('user_id, email, role_employees(role_name)')
        .in('user_id', userIds);

      // Create a map of user_id -> { email, role }
      const userMap = new Map(
        (employees || []).map(emp => [
          emp.user_id,
          {
            email: emp.email,
            role: (emp.role_employees as any)?.role_name || 'Employee'
          }
        ])
      );

      return logs.map((log: any) => {
        const userInfo = log.user_id ? userMap.get(log.user_id) : null;
        const metadata = log.metadata as any || {};

        return {
          ...log,
          action_name: log.action_type?.action_name || metadata.action_name || "Unknown",
          user_email: userInfo?.email || metadata.email || 'Unknown',
          user_role: userInfo?.role || metadata.role || 'User',
        };
      });
    },
  });
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: ["audit-log-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs_enhanced")
        .select("category, status, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      const logs = data || [];

      // Calculate stats
      const authLogs = logs.filter((l) => l.category === "authentication");
      const successfulLogins = authLogs.filter(
        (l) => l.status === "success"
      ).length;
      const failedLogins = authLogs.filter((l) => l.status === "failed").length;

      const dataExports = logs.filter((l) => l.category === "data").length;
      const securityActions = logs.filter((l) => l.category === "security").length;
      const settingsChanges = logs.filter((l) => l.category === "settings").length;

      return {
        totalLogins: authLogs.length,
        successfulLogins,
        failedLogins,
        dataExports,
        securityActions,
        settingsChanges,
      };
    },
  });
}
