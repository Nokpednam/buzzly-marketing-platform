import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import type { SocialComment } from "@/hooks/useSocialComments";

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
}

// Raw row type returned from Supabase join
interface RawCommentRow {
  id: string;
  post_id: string;
  team_id: string;
  platform_id: string | null;
  platform_comment_id: string | null;
  author_name: string;
  author_avatar_url: string | null;
  author_platform_id: string | null;
  content: string;
  sentiment: string | null;
  is_read: boolean;
  is_replied: boolean;
  replied_at: string | null;
  reply_content: string | null;
  created_at: string;
  updated_at: string;
  social_posts: {
    content: string | null;
    platform_id: string | null;
    platforms: {
      name: string;
      slug: string | null;
    } | null;
  } | null;
}

function groupIntoThreads(rows: RawCommentRow[]): InboxThread[] {
  const threadMap = new Map<string, InboxThread>();

  for (const row of rows) {
    const existing = threadMap.get(row.post_id);
    const comment: SocialComment = {
      id: row.id,
      post_id: row.post_id,
      team_id: row.team_id,
      platform_id: row.platform_id,
      platform_comment_id: row.platform_comment_id,
      author_name: row.author_name,
      author_avatar_url: row.author_avatar_url,
      author_platform_id: row.author_platform_id,
      content: row.content,
      sentiment: row.sentiment as SocialComment["sentiment"],
      is_read: row.is_read,
      is_replied: row.is_replied,
      replied_at: row.replied_at,
      reply_content: row.reply_content,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    if (existing) {
      existing.comments.push(comment);
      if (!row.is_read) existing.unread_count += 1;
      if (row.created_at > existing.latest_comment_at) {
        existing.latest_comment_at = row.created_at;
      }
    } else {
      const postData = row.social_posts;
      const platformData = postData?.platforms ?? null;

      threadMap.set(row.post_id, {
        post_id: row.post_id,
        post_content: postData?.content ?? null,
        platform_id: postData?.platform_id ?? null,
        platform_name: platformData?.name ?? "Unknown",
        platform_slug: platformData?.slug ?? "",
        unread_count: row.is_read ? 0 : 1,
        latest_comment_at: row.created_at,
        comments: [comment],
      });
    }
  }

  return Array.from(threadMap.values()).sort(
    (a, b) => new Date(b.latest_comment_at).getTime() - new Date(a.latest_comment_at).getTime()
  );
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace.id, queryClient]);

  const { data: threads = [], isLoading, error } = useQuery({
    queryKey: ["social_inbox", workspace.id, filters],
    queryFn: async () => {
      // social_comments is not yet in the auto-generated types, so we cast to bypass type check
      let query = (
        supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> }
      )
        .from("social_comments")
        .select(
          `*,
          social_posts(
            content,
            platform_id,
            platforms(name, slug)
          )`
        )
        .eq("team_id", workspace.id)
        .order("created_at", { ascending: true });

      if (filters?.platform_ids && filters.platform_ids.length > 0) {
        query = query.in("platform_id", filters.platform_ids);
      }

      if (filters?.is_read !== undefined) {
        query = query.eq("is_read", filters.is_read);
      }

      if (filters?.sentiment) {
        query = query.eq("sentiment", filters.sentiment);
      }

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;

      let rows = (data ?? []) as RawCommentRow[];

      // Client-side search filter (content or author name)
      if (filters?.search) {
        const term = filters.search.toLowerCase();
        rows = rows.filter(
          (r) =>
            r.content.toLowerCase().includes(term) ||
            r.author_name.toLowerCase().includes(term)
        );
      }

      return groupIntoThreads(rows);
    },
    enabled: !!workspace.id,
  });

  return { threads, isLoading, error };
}
