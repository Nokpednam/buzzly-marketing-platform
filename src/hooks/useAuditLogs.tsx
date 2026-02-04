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

      return (data || []).map((log: any) => ({
        ...log,
        action_name: log.action_type?.action_name || "Unknown",
      }));
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
