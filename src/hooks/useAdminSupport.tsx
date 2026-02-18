import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ErrorLog {
    id: string;
    level: string;
    message: string;
    stack_trace: string | null;
    metadata: Record<string, any> | null;
    user_id: string | null;
    created_at: string;
}

export function useAdminErrorLogs(levelFilter: string) {
    return useQuery({
        queryKey: ["admin-error-logs", levelFilter],
        refetchInterval: 10000, // Auto-refresh every 10 seconds
        queryFn: async () => {
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
            return data as ErrorLog[];
        },
    });
}
