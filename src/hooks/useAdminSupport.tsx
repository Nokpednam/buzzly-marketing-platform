import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ErrorLog {
    id: string;
    level: string;
    message: string;
    stack_trace: string | null;
    metadata: Record<string, any> | null;
    user_id: string | null;
    user_email?: string;
    user_role?: string;
    created_at: string;
    request_id?: string;
}

const fetchUserMap = async (userIds: string[]) => {
    if (userIds.length === 0) return new Map();

    // 1. Fetch Employees
    const { data: employees } = await supabase
        .from('employees')
        .select('user_id, email, role_employees(role_name)')
        .in('user_id', userIds);

    // 2. Fetch Customers
    // Note: Assuming 'customer' table has id, email. Adjust if table name/columns differ.
    // Based on schema search, 'public.customer' exists with 'id' and 'email'.
    const { data: customers } = await supabase
        .from('customer')
        .select('id, email')
        .in('id', userIds);

    const map = new Map();

    // specific handling: Employees override customers if duplicate (unlikely)
    employees?.forEach(emp => {
        map.set(emp.user_id, {
            email: emp.email,
            role: (emp.role_employees as any)?.role_name || 'Employee'
        });
    });

    customers?.forEach(cust => {
        if (!map.has(cust.id)) {
            map.set(cust.id, {
                email: cust.email,
                role: 'Customer'
            });
        }
    });

    return map;
};

export function useAdminErrorLogs(levelFilter: string) {
    return useQuery({
        queryKey: ["admin-error-logs", levelFilter],
        refetchInterval: 10000,
        queryFn: async () => {
            // 1. Get total count first
            let countQuery = supabase
                .from("error_logs")
                .select("*", { count: 'exact', head: true });

            if (levelFilter !== "all") {
                countQuery = countQuery.eq("level", levelFilter);
            }

            const { count } = await countQuery;

            // 2. Get data
            let query = supabase
                .from("error_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(500);

            if (levelFilter !== "all") {
                query = query.eq("level", levelFilter);
            }

            const { data, error } = await query;
            if (error) throw error;

            // 3. Enrich with user details
            const logs = data || [];
            const userIds = [...new Set(logs.map(l => l.user_id).filter(Boolean))] as string[];
            const userMap = await fetchUserMap(userIds);

            const enrichedLogs = logs.map(log => {
                const userInfo = log.user_id ? userMap.get(log.user_id) : null;
                return {
                    ...log,
                    user_email: userInfo?.email,
                    user_role: userInfo?.role
                };
            });

            return { logs: enrichedLogs as ErrorLog[], totalCount: count || 0 };
        },
    });
}

export function useAdminLogStats() {
    return useQuery({
        queryKey: ["admin-error-stats"],
        refetchInterval: 30000, // Refresh stats every 30s
        queryFn: async () => {
            // We'll run parallel queries to get counts for each level
            // This is not the most efficient way (a single aggregation query would be better),
            // but for now it avoids a migration and is strictly typed.

            const levels = ["critical", "error", "warning", "info"];
            const promises = levels.map(level =>
                supabase
                    .from("error_logs")
                    .select("*", { count: 'exact', head: true })
                    .eq("level", level)
            );

            // Also get total count
            const totalPromise = supabase
                .from("error_logs")
                .select("*", { count: 'exact', head: true });

            const results = await Promise.all([...promises, totalPromise]);

            const stats = {
                critical: results[0].count || 0,
                error: results[1].count || 0,
                warning: results[2].count || 0,
                info: results[3].count || 0,
                total: results[4].count || 0
            };

            return stats;
        }
    });
}
