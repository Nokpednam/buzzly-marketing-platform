import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { invalidateSocialRealtimeQueries } from "@/lib/socialQueryInvalidation";

type SocialPostRow = Database["public"]["Tables"]["social_posts"]["Row"];
export type SocialPost = SocialPostRow & {
  ad_groups?: { name: string | null } | null;
  ad_group_name?: string | null;
};
export type SocialPostInsert = Database["public"]["Tables"]["social_posts"]["Insert"];
export type SocialPostUpdate = Database["public"]["Tables"]["social_posts"]["Update"];

interface SocialPostsOptions {
  dateRange?: string;
  postType?: string;
  postChannel?: string;
}

function getNormalizedOptions(options?: string | SocialPostsOptions): SocialPostsOptions {
  if (typeof options === "string") {
    return { dateRange: options };
  }

  return options ?? {};
}

export function useSocialPosts(options?: string | SocialPostsOptions) {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();
  const workspaceId = workspace.id;
  const { dateRange, postChannel, postType } = getNormalizedOptions(options);

  // Calculate date filter based on dateRange
  const getDateFilter = () => {
    if (!dateRange) return null;
    const days = parseInt(dateRange);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["social_posts", workspaceId, dateRange, postChannel ?? "all", postType ?? "all"],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) {
        return [];
      }

      let query = supabase
        .from("social_posts")
        .select("*, ad_groups(name)")
        .eq("team_id", workspaceId)
        .order("scheduled_at", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false });

      if (postType) {
        query = query.eq("post_type", postType);
      }

      if (postChannel) {
        query = query.eq("post_channel", postChannel);
      }

      const dateFilter = getDateFilter();
      if (dateFilter) {
        // Include posts that are scheduled OR published within the window,
        // regardless of whether the other timestamp is set. This ensures a post
        // scheduled long ago but published recently (status="published") is not
        // silently excluded from the analytics post count.
        query = query.or(
          `scheduled_at.gte.${dateFilter},published_at.gte.${dateFilter},and(scheduled_at.is.null,published_at.is.null,created_at.gte.${dateFilter})`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((post) => ({
        ...post,
        ad_group_name: post.ad_groups?.name ?? null,
      })) as SocialPost[];
    },
  });

  const createPost = useMutation({
    mutationFn: async (newPost: SocialPostInsert) => {
      if (!workspace.id) throw new Error("No workspace found");

      const { data, error } = await supabase
        .from("social_posts")
        .insert({
          ...newPost,
          team_id: workspace.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await invalidateSocialRealtimeQueries(queryClient);
      toast.success("สร้างโพสต์สำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถสร้างโพสต์: ${error.message}`);
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SocialPostUpdate }) => {
      const { data, error } = await supabase
        .from("social_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await invalidateSocialRealtimeQueries(queryClient);
      toast.success("อัปเดตโพสต์สำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถอัปเดตโพสต์: ${error.message}`);
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("social_posts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateSocialRealtimeQueries(queryClient);
      toast.success("ลบโพสต์สำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถลบโพสต์: ${error.message}`);
    },
  });

  return {
    posts,
    isLoading,
    error,
    createPost,
    updatePost,
    deletePost,
  };
}
