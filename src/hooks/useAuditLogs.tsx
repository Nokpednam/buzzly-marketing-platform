import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  user_id: string | null;
  action_type_id: string | null;
  action_name?: string;
  display_action_name?: string;
  description: string | null;
  category: string | null;
  status: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
  user_email?: string | null;
  user_role?: string | null;
}

export function useAuditLogs(category?: string, page: number = 1, pageSize: number = 8, searchQuery: string = "", roleFilter: string = "all", statusFilter: string = "all", actionFilter: string = "all") {
  return useQuery({
    queryKey: ["audit-logs", category, page, pageSize, searchQuery, roleFilter, statusFilter, actionFilter],
    placeholderData: keepPreviousData,
    refetchInterval: 10000,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Query the unified view instead of the base table
      let query = supabase
        .from("audit_logs_view")
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
          user_email,
          user_role,
          display_action_name
        `, { count: 'exact' });

      if (category && category !== "all") {
        let categories: string[] = [category];

        // Map UI categories to DB categories
        switch (category) {
          case "authentication":
            categories = ["authentication", "auth", "login"];
            break;
          case "data":
            categories = ["data", "report", "export", "import"];
            break;
          case "security":
            categories = ["security", "subscription", "discount", "user_role_changed"];
            break;
          case "settings":
            categories = ["settings", "workspace", "api_key"];
            break;
          case "campaign":
            categories = ["campaign"];
            break;
          case "integration":
            categories = ["integration"];
            break;
          case "feature":
            categories = ["feature"];
            break;
          case "discount":
            categories = ["discount"];
            break;
          case "reward":
            categories = ["reward"];
            break;
          case "redemption":
            categories = ["redemption"];
            break;
          case "activity_code":
            categories = ["activity_code"];
            break;
          case "tier":
            categories = ["tier"];
            break;
        }

        query = query.in("category", categories);
      }

      // 1. Search filter
      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,ip_address.ilike.%${searchQuery}%,user_email.ilike.%${searchQuery}%`);
      }

      // 2. Status filter
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      // 3. Role filter (SERVER-SIDE)
      if (roleFilter && roleFilter !== "all") {
        query = query.ilike("user_role", `%${roleFilter}%`);
      }
      
      // 4. Action filter (SERVER-SIDE)
      if (actionFilter && actionFilter !== "all") {
        // Handle "Page View" which can have appended paths
         if (actionFilter === "Page View") {
             query = query.ilike("display_action_name", `Page View%`);
         } else {
             query = query.ilike("display_action_name", `${actionFilter}%`);
         }
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Map back to the expected format by the component
      const logs = (data || []).map(log => ({
          ...log,
          action_name: log.display_action_name // Map the view column to the property expected by UI
      }));

      return {
        logs: logs as AuditLog[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
  });
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: ["audit-log-stats"],
    refetchInterval: 10000,
    queryFn: async () => {
      // Fetch accurate counts for each category
      const [
        { count: totalLogins },
        { count: failedLogins },
        { count: dataExports },
        { count: securityActions },
        { count: settingsChanges },
        { count: featureViews }
      ] = await Promise.all([
        // Total Logins
        supabase
          .from("audit_logs_enhanced")
          .select("*", { count: 'exact', head: true })
          .in("category", ["authentication", "auth"]),
        
        // Failed Logins
        supabase
          .from("audit_logs_enhanced")
          .select("*", { count: 'exact', head: true })
          .in("category", ["authentication", "auth"])
          .in("status", ["failed", "error"]),
          
        // Data Exports
        supabase
          .from("audit_logs_enhanced")
          .select("*", { count: 'exact', head: true })
          .in("category", ["data", "report", "export", "import"]),
          
        // Security Actions
        supabase
          .from("audit_logs_enhanced")
          .select("*", { count: 'exact', head: true })
          .in("category", ["security", "subscription", "discount"]),
          
        // Settings Changes
        supabase
          .from("audit_logs_enhanced")
          .select("*", { count: 'exact', head: true })
          .in("category", ["settings", "workspace", "api_key"]),
          
        // Feature Views
        supabase
          .from("audit_logs_enhanced")
          .select("*", { count: 'exact', head: true })
          .eq("category", "feature")
      ]);

      return {
        totalLogins: totalLogins || 0,
        failedLogins: failedLogins || 0,
        dataExports: dataExports || 0,
        securityActions: securityActions || 0,
        settingsChanges: settingsChanges || 0,
        featureViews: featureViews || 0,
      };
    },
  });
}
