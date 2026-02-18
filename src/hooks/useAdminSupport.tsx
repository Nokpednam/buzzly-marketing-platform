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

    const { data: employees } = await supabase
        .from('employees')
        .select('user_id, email, role_employees(role_name)')
        .in('user_id', userIds);

    const map = new Map();
    employees?.forEach(emp => {
        map.set(emp.user_id, {
            email: emp.email,
            role: (emp.role_employees as any)?.role_name || 'Employee'
        });
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
