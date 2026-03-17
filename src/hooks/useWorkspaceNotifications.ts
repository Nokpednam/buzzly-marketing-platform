import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WorkspaceNotification {
  id: string;
  workspace_id: string;
  user_id: string;
  type: "budget_alert" | "weekly_digest" | "email_report_ready";
  title: string;
  body: string | null;
  link: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

const QUERY_KEY = ["workspace_notifications"];

export function useWorkspaceNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data ?? []) as WorkspaceNotification[];
    },
    staleTime: 30_000,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("workspace_notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
  };
}
