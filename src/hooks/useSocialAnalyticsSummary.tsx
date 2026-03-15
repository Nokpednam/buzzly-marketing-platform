import { useMemo } from "react";
import { useAdInsights, type AdInsight } from "@/hooks/useAdInsights";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";

// ─── Analytics types ──────────────────────────────────────────────────────────

export interface CrossPlatformMetrics {
  totalImpressions: number;
  totalReach: number;
  totalClicks: number;
  totalEngagement: number;
  totalSpend: number;
  totalConversions: number;
  totalPostCount: number;
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
  engagement_rate: number;
  post_count: number;
}

export interface DailyTrendPoint {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  engagement_rate: number;
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

export function useSocialAnalyticsSummary() {
  const { dateRange, activePlatforms } = useSocialFilters();
  const { insights, summary, isLoading: insightsLoading, error: insightsError } = useAdInsights(dateRange, activePlatforms);
  const { posts, isLoading: postsLoading, error: postsError } = useSocialPosts(dateRange);
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

      const normalizedPlatformId = normalizePlatformId(platformId, fallbackSlug);
      return (
        (normalizedPlatformId !== null &&
          activePlatforms.includes(normalizedPlatformId)) ||
        (platformId !== null && activePlatforms.includes(platformId)) ||
        (!!fallbackSlug && activePlatforms.includes(fallbackSlug))
      );
    };

    const filteredPosts = posts.filter((post) =>
      matchesActivePlatforms(post.platform_id, post.post_channel)
    );

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
        engagement_rate: 0,
        post_count: 0,
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
        engagement_rate: 0,
        post_count: 0,
      };

      entry.post_count += 1;
      byPlatform.set(platformId, entry);
    }

    // Resolve platform name/slug and compute engagement_rate
    const platformBreakdown: PlatformBreakdown[] = Array.from(byPlatform.values()).map((entry) => {
      const platform = platformLookup.get(entry.platform_id);
      const engRate = entry.impressions > 0
        ? ((entry.clicks / entry.impressions) * 100)
        : 0;
      return {
        ...entry,
        platform_name: platform?.name ?? entry.platform_id,
        platform_slug: platform?.slug ?? entry.platform_id,
        engagement_rate: engRate,
      };
    });

    // ── Daily trend ───────────────────────────────────────────────────────────
    const byDate = new Map<string, Omit<DailyTrendPoint, "engagement_rate"> & { _impressions: number; _clicks: number }>();

    for (const insight of rawInsights) {
      const date = insight.date;
      const existing = byDate.get(date) ?? {
        date,
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        _impressions: 0,
        _clicks: 0,
      };
      existing.impressions += insight.impressions ?? 0;
      existing.clicks += insight.clicks ?? 0;
      existing.spend += Number(insight.spend ?? 0);
      existing.conversions += insight.conversions ?? 0;
      existing._impressions = existing.impressions;
      existing._clicks = existing.clicks;
      byDate.set(date, existing);
    }

    const dailyTrend: DailyTrendPoint[] = Array.from(byDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(({ _impressions, _clicks, ...rest }) => ({
        ...rest,
        engagement_rate: _impressions > 0 ? (_clicks / _impressions) * 100 : 0,
      }));

    // ── Overview (cross-platform totals) ─────────────────────────────────────
    const totalImpressions = summary.totalImpressions;
    const totalEngagement = summary.totalClicks; // proxy: clicks as engagement
    const overview: CrossPlatformMetrics = {
      totalImpressions,
      totalReach: summary.totalReach,
      totalClicks: summary.totalClicks,
      totalEngagement,
      totalSpend: summary.totalSpend,
      totalConversions: summary.totalConversions,
      totalPostCount: filteredPosts.length,
      avgEngagementRate: totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0,
      avgCtr: summary.avgCtr,
      avgCpc: summary.avgCpc,
      avgRoas: summary.avgRoas,
    };

    return { overview, platformBreakdown, dailyTrend };
  }, [activePlatforms, insights, platformLookup, posts, summary]);

  return {
    ...analyticsSummary,
    isLoading: insightsLoading || postsLoading,
    error: insightsError ?? postsError,
  };
}
