import { useQuery, keepPreviousData } from "@tanstack/react-query";
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

export function useAuditLogs(category?: string, page: number = 1, pageSize: number = 8, searchQuery: string = "") {
  return useQuery({
    queryKey: ["audit-logs", category, page, pageSize, searchQuery],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

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
        }

        query = query.in("category", categories);
      }

      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,ip_address.ilike.%${searchQuery}%,user_id.ilike.%${searchQuery}%`);
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Fetch user details for each log
      const logs = data || [];
      const userIds = [...new Set(logs.map(log => log.user_id).filter(Boolean))] as string[];

      // Get user emails and roles from employees table
      const { data: employees } = await supabase
        .from('employees')
        .select('user_id, email, role_employees(role_name)')
        .in('user_id', userIds);

      const foundEmployeeIds = new Set((employees || []).map(e => e.user_id));
      const missingUserIds = userIds.filter(id => !foundEmployeeIds.has(id));

      // Get user details from customer table for missing IDs
      let customers: any[] = [];
      if (missingUserIds.length > 0) {
        const { data: customerData } = await supabase
          .from('customer')
          .select('id, email, full_name')
          .in('id', missingUserIds);
        customers = customerData || [];
      }

      // Create a map of user_id -> { email, role }
      const userMap = new Map();

      // Add employees
      (employees || []).forEach(emp => {
        if (emp.user_id) {
          userMap.set(emp.user_id, {
            email: emp.email,
            role: (emp.role_employees as any)?.role_name || 'Employee'
          });
        }
      });

      // Add customers
      customers.forEach(cust => {
        userMap.set(cust.id, {
          email: cust.email,
          role: 'Customer'
        });
      });

      const enrichedLogs = logs.map((log: any) => {
        const userInfo = log.user_id ? userMap.get(log.user_id) : null;
        const metadata = log.metadata as any || {};

        return {
          ...log,
          action_name: log.action_type?.action_name || metadata.action_name || "Unknown",
          user_email: userInfo?.email || metadata.email || 'Unknown',
          user_role: userInfo?.role || metadata.role || 'User',
        };
      });

      return {
        logs: enrichedLogs as AuditLog[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
  });
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: ["audit-log-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs_enhanced")
        .select("category, status, created_at, action_type_id, metadata")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      const logs = data || [];
      const total = logs.length;

      // Auth logs: category='authentication' OR any login/logout related
      const authLogs = logs.filter((l) =>
        l.category === "authentication" ||
        l.category === "auth"
      );
      const successfulLogins = authLogs.filter(
        (l) => l.status === "success" || l.status === "completed"
      ).length;
      const failedLogins = authLogs.filter(
        (l) => l.status === "failed" || l.status === "error"
      ).length;

      // Data exports: category='data' or 'report'
      const dataExports = logs.filter(
        (l) => l.category === "data" || l.category === "report"
      ).length;

      // Security actions: category='security' or 'subscription' or 'discount'
      const securityActions = logs.filter(
        (l) => l.category === "security" || l.category === "subscription"
      ).length;

      // Settings changes: category='settings' or 'workspace'
      const settingsChanges = logs.filter(
        (l) => l.category === "settings" || l.category === "workspace"
      ).length;

      return {
        total,
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
