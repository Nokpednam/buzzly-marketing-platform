import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TeamMemberWithProfile {
    id: string;
    team_id: string;
    user_id: string;
    role: string;
    status: string;
    joined_at: string;
    profile: {
        id: string;
        full_name: string | null;
        email: string | null;
    } | null;
    team: {
        id: string;
        name: string;
    } | null;
}

export interface InvitationWithDetails {
    id: string;
    team_id: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    expires_at: string | null;
    team: { id: string; name: string } | null;
    inviter: { full_name: string | null; email: string | null } | null;
}

export function useAdminAllMembers() {
    return useQuery({
        queryKey: ["admin-all-members"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("workspace_members")
                .select("id, team_id, user_id, role, status, joined_at")
                .order("joined_at", { ascending: false });

            if (error) throw error;
            if (!data || data.length === 0) return [] as TeamMemberWithProfile[];

            const userIds = data.map((m) => m.user_id);
            const teamIds = [...new Set(data.map((m) => m.team_id))];

            const [profilesRes, teamsRes] = await Promise.all([
                supabase.from("customer").select("id, full_name, email").in("id", userIds),
                supabase.from("workspaces").select("id, name").in("id", teamIds),
            ]);

            const profileMap = new Map(
                (profilesRes.data ?? []).map((p: any) => [p.id, p])
            );
            const teamMap = new Map(
                (teamsRes.data ?? []).map((t: any) => [t.id, t])
            );

            return data.map((m) => ({
                ...m,
                profile: profileMap.get(m.user_id) || null,
                team: teamMap.get(m.team_id) || null,
            })) as TeamMemberWithProfile[];
        },
    });
}

export function useAdminAllInvitations() {
    return useQuery({
        queryKey: ["admin-all-invitations"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("team_invitations")
                .select("id, team_id, email, role, status, created_at, expires_at, invited_by")
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (!data || data.length === 0) return [] as InvitationWithDetails[];

            const teamIds = [...new Set(data.map((i) => i.team_id))];
            const inviterIds = data.map((i) => i.invited_by).filter(Boolean) as string[];

            const [teamsRes, invitersRes] = await Promise.all([
                supabase.from("workspaces").select("id, name").in("id", teamIds),
                inviterIds.length > 0
                    ? supabase.from("customer").select("id, full_name, email").in("id", inviterIds)
                    : Promise.resolve({ data: [] }),
            ]);

            const teamMap = new Map(
                (teamsRes.data ?? []).map((t: any) => [t.id, t])
            );
            const inviterMap = new Map(
                ((invitersRes as any).data ?? []).map((p: any) => [p.id, p])
            );

            return data.map((i) => ({
                ...i,
                team: teamMap.get(i.team_id) || null,
                inviter: i.invited_by ? inviterMap.get(i.invited_by) || null : null,
            })) as InvitationWithDetails[];
        },
    });
}

export function useUpdateMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            id,
            role,
            status,
        }: {
            id: string;
            role?: string;
            status?: string;
        }) => {
            const { error } = await supabase
                .from("workspace_members")
                .update({ role: role as any, status: status as any })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-all-members"] });
            toast.success("Member updated");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to update member");
        },
    });
}

export function useDeleteMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("workspace_members")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-all-members"] });
            toast.success("Member removed");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to remove member");
        },
    });
}

export function useDeleteInvitation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("team_invitations")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-all-invitations"] });
            toast.success("Invitation deleted");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to delete invitation");
        },
    });
}
