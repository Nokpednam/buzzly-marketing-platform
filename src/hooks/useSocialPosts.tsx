import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { invalidateSocialRealtimeQueries } from "@/lib/socialQueryInvalidation";
import { getSocialPostDisplayTitle } from "@/lib/socialPostDisplay";

type SocialPostRow = Database["public"]["Tables"]["social_posts"]["Row"];
export type SocialPost = SocialPostRow & {
  ad_groups?: { name: string | null } | null;
  ad_group_name?: string | null;
  display_title: string;
  persona_ids: string[];
  persona_names: string[];
};
export type SocialPostInsert = Database["public"]["Tables"]["social_posts"]["Insert"];
export type SocialPostUpdate = Database["public"]["Tables"]["social_posts"]["Update"];

interface SocialPostsOptions {
  adGroupId?: string;
  dateRange?: string;
  postType?: string;
  postChannel?: string;
  postChannels?: string[];
  /** When true and adGroupId is set, include organic posts (post_channel=social) regardless of ad_group_id */
  includeOrganicWhenFilteringAdGroup?: boolean;
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
  const { adGroupId, dateRange, postChannel, postChannels, postType, includeOrganicWhenFilteringAdGroup } =
    getNormalizedOptions(options);
  const normalizedPostChannels = postChannels
    ?.filter(Boolean)
    .filter((channel, index, channels) => channels.indexOf(channel) === index);

  // Calculate date filter based on dateRange
  const getDateFilter = () => {
    if (!dateRange) return null;
    const days = parseInt(dateRange);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: [
      "social_posts",
      workspaceId,
      dateRange,
      postChannel ?? "all",
      normalizedPostChannels?.join(",") ?? "all-channels",
      postType ?? "all",
      adGroupId ?? "all-groups",
      includeOrganicWhenFilteringAdGroup ?? false,
    ],
    enabled: !!workspaceId,
    queryFn: async () => {
      if (!workspaceId) {
        return [];
      }

      let query = supabase
        .from("social_posts")
        .select("*, ad_groups(name), post_personas(persona_id, customer_personas(persona_name))")
        .eq("team_id", workspaceId)
        .order("scheduled_at", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false });

      if (postType) {
        query = query.eq("post_type", postType);
      }

      if (normalizedPostChannels && normalizedPostChannels.length > 0) {
        query = query.in("post_channel", normalizedPostChannels);
      } else if (postChannel) {
        query = query.eq("post_channel", postChannel);
      }

      if (adGroupId) {
        if (includeOrganicWhenFilteringAdGroup) {
          query = query.or(`ad_group_id.eq.${adGroupId},post_channel.eq.social`);
        } else {
          query = query.eq("ad_group_id", adGroupId);
        }
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
        display_title: getSocialPostDisplayTitle(post),
        persona_ids: (post.post_personas ?? [])
          .map((postPersona) => postPersona.persona_id ?? "")
          .filter(Boolean),
        persona_names: (post.post_personas ?? [])
          .map((postPersona) => postPersona.customer_personas?.persona_name ?? "")
          .filter(Boolean),
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
