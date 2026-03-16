import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServerHealth {
    id: string;
    hostname: string | null;
    status: string | null;
    cpu_usage_percent: number | null;
    used_memory: number | null;
    total_memory: number | null;
    disk_used: number | null;
    disk_total: number | null;
    ip_address: string | null;
}

export interface DataPipeline {
    id: string;
    name: string;
    status: string | null;
    schedule_cron: string | null;
    last_run_at: string | null;
    next_run_at: string | null;
}

export interface ExternalAPIStatus {
    id: string;
    platform_id: string | null;
    platform_name?: string;
    last_status_code: number | null;
    latency_ms: number | null;
    color_code: string | null;
}

export function useServerHealth() {
    return useQuery({
        queryKey: ["dev-server-health"],
        queryFn: async (): Promise<ServerHealth[]> => {
            const { data, error } = await supabase
                .from("server")
                .select("id, hostname, status, cpu_usage_percent, used_memory, total_memory, disk_used, disk_total, ip_address")
                .order("hostname");

            if (error) throw error;
            return data || [];
        },
    });
}

export function useDataPipelines() {
    return useQuery({
        queryKey: ["dev-data-pipelines"],
        queryFn: async (): Promise<DataPipeline[]> => {
            const { data, error } = await supabase
                .from("data_pipeline")
                .select("id, name, status, schedule_cron, last_run_at, next_run_at")
                .order("name");

            if (error) throw error;
            return data || [];
        },
    });
}

export function useExternalAPIStatus() {
    return useQuery({
        queryKey: ["dev-external-api-status"],
        queryFn: async (): Promise<ExternalAPIStatus[]> => {
            const { data, error } = await supabase
                .from("external_api_status")
                .select(`
          id, 
          platform_id, 
          last_status_code, 
          latency_ms, 
          color_code,
          platforms:platform_id (name)
        `);

            if (error) throw error;

            return (data || []).map((item: any) => ({
                ...item,
                platform_name: item.platforms?.name || "Unknown",
            }));
        },
    });
}

export function useErrorLogStats() {
    return useQuery({
        queryKey: ["dev-error-log-stats"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            console.log("Debug - Current Auth User:", user?.id, user?.email);

            if (user) {
                const { data: emp, error: empErr } = await supabase
                    .from("employees")
                    .select("*, role_employees(role_name)")
                    .eq("user_id", user.id);

                console.log("Debug - Employee Record:", emp);
                if (empErr) console.error("Debug - Employee Fetch Error:", empErr);
            }

            const { data, error } = await supabase
                .from("error_logs")
                .select("level, created_at")
                .order("created_at", { ascending: false })
                .limit(500);

            if (error) throw error;

            const logs = data || [];

            return {
                total: logs.length,
                critical: logs.filter((l) => l.level.toLowerCase() === "critical").length,
                errors: logs.filter((l) => l.level.toLowerCase() === "error").length,
                warnings: logs.filter((l) =>
                    ["warning", "warn"].includes(l.level.toLowerCase())
                ).length,
                info: logs.filter((l) => l.level.toLowerCase() === "info").length,
            };
        },
    });
}

export function usePerformanceMetrics() {
    return useQuery({
        queryKey: ["dev-performance-metrics"],
        queryFn: async () => {
            const { data: servers, error } = await supabase
                .from("server")
                .select("cpu_usage_percent, used_memory, total_memory, status");

            if (error) throw error;

            const activeServers = servers?.filter((s) => s.status === "healthy") || [];
            const avgCpu = activeServers.length
                ? activeServers.reduce((sum, s) => sum + (Number(s.cpu_usage_percent) || 0), 0) / activeServers.length
                : 0;

            const totalMemory = activeServers.reduce((sum, s) => sum + (Number(s.total_memory) || 0), 0);
            const usedMemory = activeServers.reduce((sum, s) => sum + (Number(s.used_memory) || 0), 0);
            const avgMemory = totalMemory > 0 ? (usedMemory / totalMemory) * 100 : 0;

            return {
                avgCpuUsage: Math.round(avgCpu),
                avgMemoryUsage: Math.round(avgMemory),
                totalServers: servers?.length || 0,
                healthyServers: activeServers.length,
                warningServers: servers?.filter((s) => s.status === "warning").length || 0,
                criticalServers: servers?.filter((s) => s.status === "critical").length || 0,
            };
        },
    });
}
