import { useMemo } from "react";
import { useAdInsights, type AdInsight } from "@/hooks/useAdInsights";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";
import { useWorkspace } from "@/hooks/useWorkspace";

// ─── Analytics types ──────────────────────────────────────────────────────────

export interface CrossPlatformMetrics {
  totalImpressions: number;
  totalReach: number;
  totalClicks: number;
  totalEngagement: number;
  totalSpend: number;
  totalConversions: number;
  totalPostCount: number;
  organicPostCount: number;
  paidPostCount: number;
  avgEngagementRate: number;
  avgCtr: number;
  avgCpc: number;
  avgRoas: number;
}

export interface PlatformBreakdown {
  platform_id: string;
  platform_name: string;
  platform_slug: string;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  post_count: number;
  organic_post_count: number;
  paid_post_count: number;
}

export interface DailyTrendPoint {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  engagement: number;
}

export interface AnalyticsSummary {
  overview: CrossPlatformMetrics;
  platformBreakdown: PlatformBreakdown[];
  dailyTrend: DailyTrendPoint[];
}

// Supabase returns the joined ad_accounts object on each insight row,
// even though the base AdInsight type doesn't include it.
interface AdInsightWithAccount extends AdInsight {
  ad_accounts: { platform_id: string } | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSocialAnalyticsSummary(adGroupId?: string) {
  const { dateRange, activePlatforms } = useSocialFilters();
  const { workspace } = useWorkspace();
  const { insights, summary, isLoading: insightsLoading, error: insightsError } = useAdInsights(
    dateRange,
    activePlatforms,
    workspace?.id,
    adGroupId
  );
  const { posts, isLoading: postsLoading, error: postsError } = useSocialPosts({
    adGroupId,
    dateRange,
    postChannels: ["social", "ad"],
    includeOrganicWhenFilteringAdGroup: true,
  });
  const { connectedPlatforms } = usePlatformConnections();

  const platformLookup = useMemo(
    () =>
      new Map(
        connectedPlatforms.flatMap((platform) => [
          [platform.id, platform] as const,
          [platform.slug, platform] as const,
        ])
      ),
    [connectedPlatforms]
  );

  const analyticsSummary = useMemo<AnalyticsSummary>(() => {
    const rawInsights = insights as AdInsightWithAccount[];
    const normalizePlatformId = (
      platformId: string | null,
      fallbackSlug?: string | null
    ) => {
      const directMatch = platformId ? platformLookup.get(platformId) : undefined;
      if (directMatch) {
        return directMatch.id;
      }

      const fallbackMatch = fallbackSlug ? platformLookup.get(fallbackSlug) : undefined;
      if (fallbackMatch) {
        return fallbackMatch.id;
      }

      return platformId ?? fallbackSlug ?? null;
    };

    const matchesActivePlatforms = (
      platformId: string | null,
      fallbackSlug?: string | null
    ) => {
      if (activePlatforms.length === 0) {
        return true;
      }

       if (!platformId && !fallbackSlug) {
        return true;
      }

      const normalizedPlatformId = normalizePlatformId(platformId, fallbackSlug);
      return (
        (normalizedPlatformId !== null &&
          activePlatforms.includes(normalizedPlatformId)) ||
        (platformId !== null && activePlatforms.includes(platformId)) ||
        (!!fallbackSlug && activePlatforms.includes(fallbackSlug))
      );
    };

    const filteredPosts = posts.filter((post) => {
      if (post.post_type === "chat") {
        return false;
      }

      if (!matchesActivePlatforms(post.platform_id)) {
        return false;
      }

      if (adGroupId && post.ad_group_id !== adGroupId) {
        return false;
      }

      return true;
    });

    const organicPosts = filteredPosts.filter((post) => post.post_channel === "social");
    const paidPosts = filteredPosts.filter((post) => post.post_channel === "ad");

    // ── Per-platform aggregation ──────────────────────────────────────────────
    const byPlatform = new Map<string, Omit<PlatformBreakdown, "platform_name" | "platform_slug">>();

    for (const insight of rawInsights) {
      const platformId = insight.ad_accounts?.platform_id;
      if (!platformId) continue;

      const existing = byPlatform.get(platformId) ?? {
        platform_id: platformId,
        impressions: 0,
        reach: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        post_count: 0,
        ctr: 0,
        organic_post_count: 0,
        paid_post_count: 0,
      };

      existing.impressions += insight.impressions ?? 0;
      existing.reach += insight.reach ?? 0;
      existing.clicks += insight.clicks ?? 0;
      existing.spend += Number(insight.spend ?? 0);
      existing.conversions += insight.conversions ?? 0;
      byPlatform.set(platformId, existing);
    }

    // Count posts per platform
    for (const post of filteredPosts) {
      const platformId = normalizePlatformId(post.platform_id, post.post_channel);
      if (!platformId) continue;

      const entry = byPlatform.get(platformId) ?? {
        platform_id: platformId,
        impressions: 0,
        reach: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        post_count: 0,
        ctr: 0,
        organic_post_count: 0,
        paid_post_count: 0,
      };

      entry.post_count += 1;
      if (post.post_channel === "ad") {
        entry.paid_post_count += 1;
      } else {
        entry.organic_post_count += 1;
      }
      byPlatform.set(platformId, entry);
    }

    // Resolve platform name/slug and compute CTR from paid metrics.
    const platformBreakdown: PlatformBreakdown[] = Array.from(byPlatform.values()).map((entry) => {
      const platform = platformLookup.get(entry.platform_id);
      const ctr = entry.impressions > 0
        ? ((entry.clicks / entry.impressions) * 100)
        : 0;
      return {
        ...entry,
        platform_name: platform?.name ?? entry.platform_id,
        platform_slug: platform?.slug ?? entry.platform_id,
        ctr,
      };
    });

    // ── Daily trend ───────────────────────────────────────────────────────────
    const byDate = new Map<string, DailyTrendPoint>();

    for (const insight of rawInsights) {
      const date = insight.date;
      const existing = byDate.get(date) ?? {
        date,
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        engagement: 0,
      };
      existing.impressions += insight.impressions ?? 0;
      existing.clicks += insight.clicks ?? 0;
      existing.spend += Number(insight.spend ?? 0);
      existing.conversions += insight.conversions ?? 0;
      byDate.set(date, existing);
    }

    for (const post of organicPosts) {
      const anchorDate = (
        post.published_at ??
        post.scheduled_at ??
        post.created_at
      )?.slice(0, 10);

      if (!anchorDate) {
        continue;
      }

      const existing = byDate.get(anchorDate) ?? {
        date: anchorDate,
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        engagement: 0,
      };

      existing.engagement +=
        (post.likes ?? 0) +
        (post.comments ?? 0) +
        (post.shares ?? 0);

      byDate.set(anchorDate, existing);
    }

    const dailyTrend: DailyTrendPoint[] = Array.from(byDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // ── Overview (cross-platform totals) ─────────────────────────────────────
    const totalImpressions = summary.totalImpressions;
    const totalEngagement = organicPosts.reduce(
      (sum, post) => sum + (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0),
      0
    );
    const organicReach = organicPosts.reduce((sum, post) => sum + (post.reach ?? 0), 0);
    const overview: CrossPlatformMetrics = {
      totalImpressions,
      totalReach: summary.totalReach,
      totalClicks: summary.totalClicks,
      totalEngagement,
      totalSpend: summary.totalSpend,
      totalConversions: summary.totalConversions,
      totalPostCount: filteredPosts.length,
      organicPostCount: organicPosts.length,
      paidPostCount: paidPosts.length,
      avgEngagementRate: organicReach > 0 ? (totalEngagement / organicReach) * 100 : 0,
      avgCtr: summary.avgCtr,
      avgCpc: summary.avgCpc,
      avgRoas: summary.avgRoas,
    };

    return { overview, platformBreakdown, dailyTrend };
  }, [activePlatforms, adGroupId, insights, platformLookup, posts, summary]);

  return {
    ...analyticsSummary,
    isLoading: insightsLoading || postsLoading,
    error: insightsError ?? postsError,
  };
}
