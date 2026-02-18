import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmailCampaign {
    id: string;
    team_id: string;
    name: string;
    subject: string;
    status: "draft" | "scheduled" | "sent" | "paused";
    category: string | null;
    scheduled_at: string | null;
    sent_at: string | null;
    recipient_count: number;
    open_count: number;
    click_count: number;
    created_by: string | null;
    created_at: string;
    updated_at: string;
    // Computed
    openRate: number;
    clickRate: number;
}

export interface CreateEmailCampaignInput {
    name: string;
    subject: string;
    category?: string;
    scheduled_at?: string;
    status?: "draft" | "scheduled";
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

export function useEmailCampaigns() {
    const queryClient = useQueryClient();

    const { data: campaigns = [], isLoading } = useQuery({
        queryKey: ["email-campaigns"],
        queryFn: async () => {
            const teamId = await getTeamId();
            if (!teamId) return [];

            const { data, error } = await supabase
                .from("email_campaigns")
                .select("*")
                .eq("team_id", teamId)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return (data ?? []).map((c: any) => ({
                ...c,
                openRate: c.recipient_count > 0
                    ? Number(((c.open_count / c.recipient_count) * 100).toFixed(1))
                    : 0,
                clickRate: c.open_count > 0
                    ? Number(((c.click_count / c.open_count) * 100).toFixed(1))
                    : 0,
            })) as EmailCampaign[];
        },
    });

    // Computed stats
    const stats = {
        totalSent: campaigns.reduce((sum, c) => sum + (c.status === "sent" ? c.recipient_count : 0), 0),
        avgOpenRate: campaigns.length > 0
            ? Number((campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length).toFixed(1))
            : 0,
        avgClickRate: campaigns.length > 0
            ? Number((campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length).toFixed(1))
            : 0,
        scheduledCount: campaigns.filter((c) => c.status === "scheduled").length,
    };

    const createEmailCampaign = useMutation({
        mutationFn: async (input: CreateEmailCampaignInput) => {
            const teamId = await getTeamId();
            if (!teamId) throw new Error("No team found");
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from("email_campaigns")
                .insert({
                    team_id: teamId,
                    created_by: user?.id,
                    name: input.name,
                    subject: input.subject,
                    category: input.category ?? null,
                    scheduled_at: input.scheduled_at ?? null,
                    status: input.status ?? "draft",
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
            toast.success("Email campaign created");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to create campaign");
        },
    });

    const updateEmailCampaign = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailCampaign> }) => {
            const { error } = await supabase
                .from("email_campaigns")
                .update(updates)
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
            toast.success("Campaign updated");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to update campaign");
        },
    });

    const deleteEmailCampaign = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("email_campaigns")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
            toast.success("Campaign deleted");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to delete campaign");
        },
    });

    const duplicateEmailCampaign = useMutation({
        mutationFn: async (id: string) => {
            const original = campaigns.find((c) => c.id === id);
            if (!original) throw new Error("Campaign not found");
            const teamId = await getTeamId();
            if (!teamId) throw new Error("No team found");
            const { data: { user } } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from("email_campaigns")
                .insert({
                    team_id: teamId,
                    created_by: user?.id,
                    name: `${original.name} (Copy)`,
                    subject: original.subject,
                    category: original.category,
                    status: "draft",
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["email-campaigns"] });
            toast.success("Campaign duplicated");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to duplicate campaign");
        },
    });

    return {
        campaigns,
        isLoading,
        stats,
        createEmailCampaign,
        updateEmailCampaign,
        deleteEmailCampaign,
        duplicateEmailCampaign,
    };
}
