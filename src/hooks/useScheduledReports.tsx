import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScheduledReport {
    id: string;
    team_id: string;
    report_id: string | null;
    name: string;
    frequency: "daily" | "weekly" | "monthly";
    recipients: string[];
    next_run_at: string | null;
    last_run_at: string | null;
    is_active: boolean;
    format: "pdf" | "csv" | "excel";
    created_by: string | null;
    created_at: string;
    updated_at: string;
    // joined
    report_name?: string | null;
    report_type?: string | null;
}

export interface CreateScheduledReportInput {
    name: string;
    frequency: "daily" | "weekly" | "monthly";
    recipients: string[];
    format?: "pdf" | "csv" | "excel";
    report_id?: string | null;
    next_run_at?: string | null;
}

async function getTeamId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();
    if (data) return data.id;
    const { data: member } = await supabase
        .from("workspace_members")
        .select("team_id")
        .eq("user_id", user.id)
        .maybeSingle();
    return member?.team_id ?? null;
}

export function useScheduledReports() {
    const queryClient = useQueryClient();

    const { data: scheduledReports = [], isLoading } = useQuery({
        queryKey: ["scheduled-reports"],
        queryFn: async () => {
            const teamId = await getTeamId();
            if (!teamId) return [];

            const { data, error } = await (supabase as any)
                .from("scheduled_reports")
                .select(`
          *,
          reports(name, report_type)
        `)
                .eq("team_id", teamId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return (data ?? []).map((r: any) => ({
                ...r,
                recipients: Array.isArray(r.recipients) ? r.recipients : [],
                report_name: r.reports?.name ?? null,
                report_type: r.reports?.report_type ?? null,
            })) as ScheduledReport[];
        },
    });

    const createScheduledReport = useMutation({
        mutationFn: async (input: CreateScheduledReportInput) => {
            const teamId = await getTeamId();
            if (!teamId) throw new Error("No team found");
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await (supabase as any)
                .from("scheduled_reports")
                .insert({
                    team_id: teamId,
                    created_by: user?.id,
                    name: input.name,
                    frequency: input.frequency,
                    recipients: input.recipients,
                    format: input.format ?? "pdf",
                    report_id: input.report_id ?? null,
                    next_run_at: input.next_run_at ?? null,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
            toast.success("Report schedule created");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to create schedule");
        },
    });

    const toggleActive = useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { error } = await (supabase as any)
                .from("scheduled_reports")
                .update({ is_active, updated_at: new Date().toISOString() })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_, { is_active }) => {
            queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
            toast.success(is_active ? "Schedule activated" : "Schedule paused");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to update schedule");
        },
    });

    const deleteScheduledReport = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any).from("scheduled_reports").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
            toast.success("Schedule deleted");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to delete schedule");
        },
    });

    const updateRecipients = useMutation({
        mutationFn: async ({ id, recipients }: { id: string; recipients: string[] }) => {
            const { error } = await (supabase as any)
                .from("scheduled_reports")
                .update({ recipients, updated_at: new Date().toISOString() })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scheduled-reports"] });
            toast.success("Recipients updated");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to update recipients");
        },
    });

    return {
        scheduledReports,
        isLoading,
        createScheduledReport,
        toggleActive,
        deleteScheduledReport,
        updateRecipients,
    };
}
