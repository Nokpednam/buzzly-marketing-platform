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

export function useAuditLogs(category?: string, page: number = 1, pageSize: number = 8, searchQuery: string = "", roleFilter: string = "all", statusFilter: string = "all", actionFilter: string = "all") {
  return useQuery({
    queryKey: ["audit-logs", category, page, pageSize, searchQuery, roleFilter, statusFilter, actionFilter],
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

      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,ip_address.ilike.%${searchQuery}%,user_id.ilike.%${searchQuery}%`);
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
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

      const getPageLabel = (path: string | undefined): string => {
        if (!path) return path || "";
        const map: Record<string, string> = {
          "/dashboard": "Dashboard",
          "/personas": "Personas",
          "/campaigns": "Campaigns",
          "/social/planner": "Social Planner",
          "/social/analytics": "Social Analytics",
          "/social/inbox": "Social Inbox",
          "/social/integrations": "Social Integrations",
          "/customer-journey": "Customer Journey",
          "/aarrr-funnel": "AARRR Funnel",
          "/api-keys": "API Keys",
          "/analytics": "Analytics",
          "/reports": "Reports",
          "/settings": "Settings",
          "/team": "Team Management",
          "/support/workspaces": "Support: Workspaces",
          "/support/tier-management": "Support: Tier Management",
          "/support/rewards-management": "Support: Rewards",
          "/support/redemption-requests": "Support: Redemption Requests",
          "/support/discount-management": "Support: Discount Management",
          "/support/activity-codes": "Support: Activity Codes",
        };
        if (map[path]) return map[path];
        if (/^\/campaigns\/[^/]+/.test(path)) return "Campaign Detail";
        return path;
      };

      const enrichedLogs = logs.map((log: any) => {
        const userInfo = log.user_id ? userMap.get(log.user_id) : null;
        const metadata = log.metadata as any || {};
        const pageUrl = metadata?.page_url;
        const baseAction = log.action_type?.action_name || metadata.action_name || "Unknown";
        const isPageView = log.category === "feature" && (baseAction === "Page View" || metadata.action_name === "Page View");
        const displayAction = isPageView && pageUrl
          ? `เข้าหน้า ${getPageLabel(pageUrl)}`
          : baseAction;

        return {
          ...log,
          action_name: displayAction,
          user_email: userInfo?.email || metadata.email || "Unknown",
          user_role: userInfo?.role || metadata.role || "User",
        };
      });

      // Apply role filter client-side after enrichment
      const roleFiltered = roleFilter && roleFilter !== "all"
        ? enrichedLogs.filter((log: any) =>
            (log.user_role || '').toLowerCase().includes(roleFilter.toLowerCase())
          )
        : enrichedLogs;

      // Apply action filter client-side
      const filteredLogs = actionFilter && actionFilter !== "all"
        ? roleFiltered.filter((log: any) => {
            const name = (log.action_name || '').toLowerCase();
            const filter = actionFilter.toLowerCase();
            return name === filter || name.startsWith(filter + ' ');
          })
        : roleFiltered;

      return {
        logs: filteredLogs as AuditLog[],
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
