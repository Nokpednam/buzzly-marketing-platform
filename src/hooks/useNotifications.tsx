import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NotificationType =
    | "critical_error"
    | "error_log"
    | "auth_failure"
    | "redemption_request"
    | "suspicious_activity";

export interface Notification {
    id: string;
    target_role: string;
    type: NotificationType;
    title: string;
    body: string | null;
    link: string | null;
    is_read: boolean;
    source_id: string | null;
    created_at: string;
}

const QUERY_KEY = (role: string) => ["notifications", role];

export function useNotifications(role: "dev" | "support" | "owner") {
    const queryClient = useQueryClient();

    // Fetch unread notifications for this role
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: QUERY_KEY(role),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .or(`target_role.eq.${role},target_role.eq.all`)
                .order("created_at", { ascending: false })
                .limit(100);
            if (error) throw error;
            return (data ?? []) as Notification[];
        },
        refetchInterval: 30_000, // fallback polling every 30s
    });

    // Realtime subscription — push new notifications instantly
    useEffect(() => {
        const channel = supabase
            .channel(`notifications:${role}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `target_role=eq.${role}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    queryClient.setQueryData<Notification[]>(
                        QUERY_KEY(role),
                        (old) => [newNotification, ...(old ?? [])]
                    );
                    queryClient.invalidateQueries({ queryKey: [...QUERY_KEY(role), "unreadCount"] });
                }
            )
            // Also catch 'all' target role notifications
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `target_role=eq.all`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    queryClient.setQueryData<Notification[]>(
                        QUERY_KEY(role),
                        (old) => {
                            const exists = old?.some(n => n.id === newNotification.id);
                            if (exists) return old;
                            return [newNotification, ...(old ?? [])];
                        }
                    );
                    queryClient.invalidateQueries({ queryKey: [...QUERY_KEY(role), "unreadCount"] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [role, queryClient]);

    // Mark single notification as read
    const markAsRead = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: (_, id) => {
            queryClient.setQueryData<Notification[]>(QUERY_KEY(role), (old) =>
                old?.map((n) => (n.id === id ? { ...n, is_read: true } : n)) ?? []
            );
            // Invalidate the unread count so it fetches the fresh number
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEY(role), "unreadCount"] });
        },
    });

    // Mark all notifications as read
    const markAllAsRead = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from("notifications")
                .update({ is_read: true })
                .or(`target_role.eq.${role},target_role.eq.all`)
                .eq("is_read", false);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.setQueryData<Notification[]>(QUERY_KEY(role), (old) =>
                old?.map((n) => ({ ...n, is_read: true })) ?? []
            );
            // Invalidate the unread count so it fetches the fresh number
            queryClient.invalidateQueries({ queryKey: [...QUERY_KEY(role), "unreadCount"] });
        },
    });

    // Fetch exact unread count from database
    const { data: dbUnreadCount = 0 } = useQuery({
        queryKey: [...QUERY_KEY(role), "unreadCount"],
        queryFn: async () => {
            const { count, error } = await supabase
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .or(`target_role.eq.${role},target_role.eq.all`)
                .eq("is_read", false);
            if (error) throw error;
            return count ?? 0;
        },
        refetchInterval: 30_000,
    });

    // Use the max of db count or local unread count in case of new realtime inserts
    const localUnreadCount = notifications.filter((n) => !n.is_read).length;
    const unreadCount = Math.max(dbUnreadCount, localUnreadCount);

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead: markAsRead.mutate,
        markAllAsRead: markAllAsRead.mutate,
        isMarkingAll: markAllAsRead.isPending,
    };
}
