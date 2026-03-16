import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import type { SocialComment } from "@/hooks/useSocialComments";
import type { Database } from "@/integrations/supabase/types";

export interface InboxThread {
  post_id: string;
  post_content: string | null;
  platform_id: string | null;
  platform_name: string;
  platform_slug: string;
  unread_count: number;
  latest_comment_at: string;
  comments: SocialComment[];
}

export interface InboxFiltersState {
  platform_ids?: string[];
  is_read?: boolean;
  sentiment?: string;
  search?: string;
  showArchived?: boolean;
}

type SocialPostRow = Database["public"]["Tables"]["social_posts"]["Row"];

interface RawInboxPostRow
  extends Pick<
    SocialPostRow,
    "id" | "comments" | "content" | "created_at" | "name" | "platform_id" | "published_at" | "team_id" | "updated_at"
  > {
  platforms: {
    name: string;
    slug: string | null;
  } | null;
  social_comments: SocialComment[] | null;
}

function toSortedComments(comments: SocialComment[] | null): SocialComment[] {
  return [...(comments ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

function buildThread(row: RawInboxPostRow): InboxThread {
  const comments = toSortedComments(row.social_comments);
  const latestComment = comments[comments.length - 1];

  return {
    post_id: row.id,
    post_content: row.name ?? row.content ?? null,
    platform_id: row.platform_id ?? null,
    platform_name: row.platforms?.name ?? "Unknown",
    platform_slug: row.platforms?.slug ?? "",
    unread_count:
      comments.length > 0
        ? comments.filter((comment) => !comment.is_read).length
        : row.comments ?? 0,
    latest_comment_at:
      latestComment?.created_at ??
      row.published_at ??
      row.updated_at ??
      row.created_at ??
      new Date().toISOString(),
    comments,
  };
}

function matchesFilters(thread: InboxThread, filters?: InboxFiltersState) {
  if (!filters) {
    return true;
  }

  if (filters.is_read === false && thread.unread_count === 0) {
    return false;
  }

  if (filters.is_read === true && thread.unread_count > 0) {
    return false;
  }

  if (filters.sentiment) {
    const hasSentiment = thread.comments.some((comment) => comment.sentiment === filters.sentiment);
    if (!hasSentiment) {
      return false;
    }
  }

  if (filters.search) {
    const term = filters.search.toLowerCase();
    const searchableValues = [
      thread.post_content ?? "",
      ...thread.comments.map((comment) => comment.content),
      ...thread.comments.map((comment) => comment.author_name),
    ];

    if (!searchableValues.some((value) => value.toLowerCase().includes(term))) {
      return false;
    }
  }

  return true;
}

export function useSocialInbox(filters?: InboxFiltersState) {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();

  // Supabase Realtime subscription for live comment updates
  useEffect(() => {
    if (!workspace.id) return;

    const channel = supabase
      .channel(`social_comments:${workspace.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "social_comments",
          filter: `team_id=eq.${workspace.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["social_inbox", workspace.id] });
          queryClient.invalidateQueries({ queryKey: ["social_comments", workspace.id] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "social_posts",
          filter: `team_id=eq.${workspace.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["social_inbox", workspace.id] });
          queryClient.invalidateQueries({ queryKey: ["social_posts", workspace.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace.id, queryClient]);

  const { data: threads = [], isLoading, error } = useQuery({
    queryKey: ["social_inbox", workspace.id, filters],
    queryFn: async () => {
      let query = supabase
        .from("social_posts")
        .select(
          `id,
          team_id,
          platform_id,
          name,
          content,
          comments,
          created_at,
          updated_at,
          published_at,
          platforms(name, slug),
          social_comments(*)`
        )
        .eq("team_id", workspace.id)
        .eq("post_type", "chat")
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false });

      if (filters?.platform_ids && filters.platform_ids.length > 0) {
        query = query.in("platform_id", filters.platform_ids);
      }

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;

      return ((data ?? []) as RawInboxPostRow[])
        .map(buildThread)
        .filter((thread) => matchesFilters(thread, filters))
        .sort(
          (a, b) =>
            new Date(b.latest_comment_at).getTime() - new Date(a.latest_comment_at).getTime()
        );
    },
    enabled: !!workspace.id,
  });

  return { threads, isLoading, error };
}
