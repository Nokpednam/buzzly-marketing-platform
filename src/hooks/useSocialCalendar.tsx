import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";

export interface CalendarPost {
  id: string;
  content: string | null;
  created_at: string | null;
  platform_id: string | null;
  platform_name: string;
  platform_slug: string;
  platform_icon_url: string | null;
  post_type: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  scheduled_at: string | null;
  published_at: string | null;
  media_urls: string[] | null;
  hashtags: string[] | null;
}

export interface CalendarDay {
  date: string; // ISO date string YYYY-MM-DD
  posts: CalendarPost[];
}

function getStartDate(dateRange: string): string {
  const days = parseInt(dateRange, 10);
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function toDateString(isoString: string): string {
  return isoString.slice(0, 10);
}

function groupByDate(posts: CalendarPost[]): CalendarDay[] {
  const map = new Map<string, CalendarPost[]>();
  for (const post of posts) {
    const dateStr = post.scheduled_at
      ? toDateString(post.scheduled_at)
      : post.published_at
        ? toDateString(post.published_at)
        : post.created_at
          ? toDateString(post.created_at)
        : null;
    if (!dateStr) continue;
    const existing = map.get(dateStr) ?? [];
    map.set(dateStr, [...existing, post]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayPosts]) => ({ date, posts: dayPosts }));
}

export function useSocialCalendar(dateRange: string) {
  const { workspace } = useWorkspace();

  const { data, isLoading, error } = useQuery({
    queryKey: ["social_calendar", workspace.id, dateRange],
    queryFn: async () => {
      const startDate = getStartDate(dateRange);
      const { data: rawData, error: queryError } = await supabase
        .from("social_posts")
        .select("*, platforms(name, slug, icon_url)")
        .eq("team_id", workspace.id)
        .or(
          `scheduled_at.gte.${startDate},and(scheduled_at.is.null,published_at.gte.${startDate}),and(scheduled_at.is.null,published_at.is.null,created_at.gte.${startDate})`
        )
        .in("status", ["draft", "scheduled", "published", "active", "paused"])
        .order("scheduled_at", { ascending: true })
        .order("published_at", { ascending: true });

      if (queryError) throw queryError;

      const posts: CalendarPost[] = (rawData ?? []).map((row) => {
        const platform = row.platforms as
          | { name: string; slug: string | null; icon_url: string | null }
          | null;
        return {
          id: row.id,
          content: row.content,
          created_at: row.created_at ?? null,
          platform_id: row.platform_id,
          platform_name: platform?.name ?? "Unknown",
          platform_slug: platform?.slug ?? "",
          platform_icon_url: platform?.icon_url ?? null,
          post_type: row.post_type,
          status: (row.status ?? "draft") as CalendarPost["status"],
          scheduled_at: row.scheduled_at,
          published_at: row.published_at,
          media_urls: row.media_urls,
          hashtags: row.hashtags,
        };
      });

      return groupByDate(posts);
    },
    enabled: !!workspace.id,
  });

  return { calendarDays: data ?? [], isLoading, error };
}
