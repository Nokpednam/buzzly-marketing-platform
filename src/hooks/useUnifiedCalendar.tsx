import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";
import { USE_MOCK_DATA, MOCK_CALENDAR_DAYS } from "@/lib/mock-api-data";
import { getSocialPostDisplayTitle } from "@/lib/socialPostDisplay";

export interface CalendarItem {
  ad_group_id: string | null;
  ad_group_name: string | null;
  created_at: string | null;
  id: string;
  type: "post" | "ad";
  /** Raw value of `post_channel` from the DB — e.g. "social", "organic", "ad". */
  post_channel: string;
  title: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  platform_name: string;
  platform_slug: string;
  platform_icon_url: string | null;
  media_urls: string[] | null;
  creative_type: string | null;
  persona_names: string[];
  persona_ids: string[];
  // Post-specific fields (populated for type === "post")
  platform_id: string | null;
  content: string | null;
  post_type: string | null;
  hashtags: string[] | null;
}

export interface UnifiedCalendarDay {
  date: string;
  items: CalendarItem[];
}

function getStartDate(dateRange: string): string {
  const days = parseInt(dateRange, 10);
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/**
 * Returns the earlier of:
 *  - the rolling dateRange start (now - N days)
 *  - the first moment of the viewed calendar month
 * This ensures every item in the currently displayed month is always fetched,
 * regardless of how the global dateRange filter is set.
 */
function getEffectiveStartDate(dateRange: string, viewYear: number, viewMonth: number): string {
  const rollingStart = getStartDate(dateRange);
  const monthStart = new Date(viewYear, viewMonth, 1, 0, 0, 0, 0).toISOString();
  // ISO strings are lexicographically comparable — pick the earlier date
  return monthStart < rollingStart ? monthStart : rollingStart;
}

function toDateString(isoString: string): string {
  return isoString.slice(0, 10);
}

function normalizeCalendarTimestamp(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function getCalendarAnchorDate(item: Pick<CalendarItem, "scheduled_at" | "published_at">): string | null {
  return normalizeCalendarTimestamp(item.scheduled_at) ?? normalizeCalendarTimestamp(item.published_at);
}

function groupByDate(items: CalendarItem[]): UnifiedCalendarDay[] {
  const map = new Map<string, CalendarItem[]>();
  for (const item of items) {
    const anchorDate = getCalendarAnchorDate(item);
    const dateStr = anchorDate ? toDateString(anchorDate) : null;
    if (!dateStr) continue;
    const existing = map.get(dateStr) ?? [];
    map.set(dateStr, [...existing, item]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayItems]) => ({ date, items: dayItems }));
}

export function useUnifiedCalendar(dateRange: string, viewYear?: number, viewMonth?: number) {
  const { workspace } = useWorkspace();
  const { activePlatforms } = useSocialFilters();

  const today = new Date();
  const resolvedYear = viewYear ?? today.getFullYear();
  const resolvedMonth = viewMonth ?? today.getMonth();

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "unified_calendar",
      workspace?.id,
      dateRange,
      resolvedYear,
      resolvedMonth,
      activePlatforms,
      USE_MOCK_DATA ? "mock" : "live",
    ],
    // In mock mode we don't need a workspace — run unconditionally
    enabled: USE_MOCK_DATA ? true : !!workspace?.id,
    queryFn: async () => {
      // ── MOCK MODE ──────────────────────────────────────────────────────
      if (USE_MOCK_DATA) {
        // If no platforms are selected, show nothing — same behaviour as useAdInsights
        if (activePlatforms.length === 0) return [];

        const startDate = getEffectiveStartDate(dateRange, resolvedYear, resolvedMonth);
        const startDateStr = startDate.slice(0, 10);

        // Filter mock calendar to the requested date window and normalise items
        // to the full CalendarItem shape (MockCalendarItem is a subset).
        const filtered: UnifiedCalendarDay[] = MOCK_CALENDAR_DAYS
          .filter((day) => day.date >= startDateStr)
          .map((day) => ({
            date: day.date,
            items: day.items
              .map((mockItem) => ({
                ...mockItem,
                scheduled_at: normalizeCalendarTimestamp(mockItem.scheduled_at),
                published_at: normalizeCalendarTimestamp(mockItem.published_at),
                post_channel: mockItem.type === "ad" ? "ad" : "social",
                ad_group_id: mockItem.ad_group_id ?? null,
                ad_group_name: null,
                created_at: null,
              }))
              .filter((item) => {
                if (!Boolean(getCalendarAnchorDate(item))) return false;
                // Filter by active platforms:
                // Posts have platform_id; ads fall back to platform_slug.
                const matchesById = item.platform_id
                  ? activePlatforms.includes(item.platform_id)
                  : false;
                const matchesBySlug = item.platform_slug
                  ? activePlatforms.some((p) => p.toLowerCase().includes(item.platform_slug.toLowerCase()))
                  : false;
                return matchesById || matchesBySlug;
              }) as CalendarItem[],
          }));

        return filtered;
      }

      // ── LIVE MODE ──────────────────────────────────────────────────────
      // If no platforms are selected, show nothing — same behaviour as useAdInsights
      if (activePlatforms.length === 0) return [];

      if (!workspace?.id) return [];

      const startDate = getEffectiveStartDate(dateRange, resolvedYear, resolvedMonth);
      const postsResult = await supabase
        .from("social_posts")
        .select(
          "*, ad_groups(name), platforms(name, slug, icon_url), post_personas(persona_id, customer_personas(persona_name))"
        )
        .eq("team_id", workspace.id)
        .in("post_channel", ["social", "ad"])
        // Only fetch posts that have an explicit scheduled_at or published_at.
        // Drafts without either date are not relevant for the calendar view.
        .or(`scheduled_at.gte.${startDate},published_at.gte.${startDate}`)
        .order("scheduled_at", { ascending: true, nullsFirst: false })
        .order("published_at", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true, nullsFirst: false });

      if (postsResult.error) throw postsResult.error;

      const items: CalendarItem[] = (postsResult.data ?? [])
        .filter((row) => {
          if (row.post_type === "chat") {
            return false;
          }

          // Apply platform filter — only show posts whose platform is active
          if (row.platform_id && !activePlatforms.includes(row.platform_id)) {
            return false;
          }

          return Boolean(
            normalizeCalendarTimestamp(row.scheduled_at) ?? normalizeCalendarTimestamp(row.published_at)
          );
        })
        .map((row) => {
          const platform = row.platforms as
            | { name: string; slug: string | null; icon_url: string | null }
            | null;
          const postPersonas = row.post_personas as
            | Array<{ persona_id?: string; customer_personas: { persona_name: string } | null }>
            | null;
          const isAd = row.post_channel === "ad";

          return {
            id: row.id,
            ad_group_id: row.ad_group_id ?? null,
            ad_group_name: row.ad_groups?.name ?? null,
            created_at: row.created_at ?? null,
            type: isAd ? ("ad" as const) : ("post" as const),
            post_channel: row.post_channel,
            title: getSocialPostDisplayTitle(row),
            status: row.status ?? "draft",
            scheduled_at: normalizeCalendarTimestamp(row.scheduled_at),
            published_at: normalizeCalendarTimestamp(row.published_at),
            platform_name: platform?.name ?? "Unknown",
            platform_slug: platform?.slug ?? "",
            platform_icon_url: platform?.icon_url ?? null,
            media_urls: row.media_urls,
            creative_type: isAd ? row.post_type ?? null : null,
            persona_names: (postPersonas ?? [])
              .map((pp) => pp.customer_personas?.persona_name ?? "")
              .filter(Boolean),
            persona_ids: (postPersonas ?? [])
              .map((pp) => pp.persona_id ?? "")
              .filter(Boolean),
            platform_id: row.platform_id ?? null,
            content: row.content ?? null,
            post_type: row.post_type ?? null,
            hashtags: (row.hashtags as string[] | null) ?? null,
          };
        });

      return groupByDate(items);
    },
  });

  return { calendarDays: data ?? [], isLoading, error };
}
