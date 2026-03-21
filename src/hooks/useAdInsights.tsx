import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  USE_MOCK_DATA,
  MOCK_AD_INSIGHTS,
  getMockInsights,
} from "@/lib/mock-api-data";

export type AdInsight = Database["public"]["Tables"]["ad_insights"]["Row"];

export interface AdInsightsSummary {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  totalReach: number;
  avgRoas: number;
  avgCtr: number;
  avgCpc: number;
  avgCpm: number;
  dailyData: {
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  }[];
}

const toMetricNumber = (...values: Array<number | string | null | undefined>): number => {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

function normalizeInsightMetrics<T extends AdInsight>(insight: T): T {
  const impressions = toMetricNumber(insight.impressions);
  const clicks = Math.max(0, toMetricNumber(insight.clicks));
  const spend = Math.max(0, toMetricNumber(insight.spend));
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : toMetricNumber(insight.ctr);
  const cpc = clicks > 0 ? spend / clicks : toMetricNumber(insight.cpc);
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : toMetricNumber(insight.cpm);

  return {
    ...insight,
    impressions,
    clicks,
    spend,
    ctr: Number(ctr.toFixed(2)),
    cpc: Number(cpc.toFixed(4)),
    cpm: Number(cpm.toFixed(2)),
  };
}

interface AdInsightWithJoins extends AdInsight {
  ad_accounts?: { platform_id: string; team_id?: string | null } | null;
  ads?: {
    id?: string | null;
    ad_group_id: string | null;
    ad_groups?: { name: string | null } | null;
  } | null;
  total_cost?: number | string | null;
}

// ---------------------------------------------------------------------------
// useAdInsights
// ---------------------------------------------------------------------------

export function useAdInsights(
  dateRange?: string,
  activePlatforms?: string[],
  workspaceId?: string | null,
  adGroupId?: string | null
) {
  const getDateFilter = () => {
    if (!dateRange) return null;
    const days = parseInt(dateRange);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  };

  const { data: insights = [], isLoading, error } = useQuery({
    queryKey: [
      "ad_insights",
      workspaceId,
      dateRange,
      activePlatforms,
      adGroupId,
      USE_MOCK_DATA ? "mock" : "live",
    ],
    queryFn: async () => {
      // ── MOCK MODE ────────────────────────────────────────────────────────
      if (USE_MOCK_DATA) {
        if (activePlatforms && activePlatforms.length === 0) return [];

        let rows = getMockInsights(workspaceId) as Array<AdInsight & { ad_group_id?: string | null }>;

        const dateFilter = getDateFilter();
        if (dateFilter) {
          rows = rows.filter((r) => r.date >= dateFilter);
        }

        if (activePlatforms && activePlatforms.length > 0) {
          // Mock account IDs encode the platform: "mock-acc-shop-a-facebook"
          rows = rows.filter((r) =>
            activePlatforms.some((p) => r.ad_account_id?.includes(p)),
          );
        }

        if (adGroupId) {
          rows = rows.filter((r) => r.ad_group_id === adGroupId);
        }

        return rows.map((row) => normalizeInsightMetrics(row as AdInsight));
      }

      // ── LIVE MODE ────────────────────────────────────────────────────────
      if (activePlatforms && activePlatforms.length === 0) return [];

      let query = supabase
        .from("ad_insights")
        .select("*, ad_accounts!inner(platform_id, team_id), ads!inner(id, ad_group_id, ad_groups(name))")
        .order("date", { ascending: true });

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte("date", dateFilter);
      }

      if (activePlatforms && activePlatforms.length > 0) {
        query = query.in("ad_accounts.platform_id", activePlatforms);
      }

      if (workspaceId) {
        query = query.eq("ad_accounts.team_id", workspaceId);
      }

      if (adGroupId) {
        query = query.eq("ads.ad_group_id", adGroupId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("DASHBOARD FETCH ERROR (useAdInsights):", error);
        throw error;
      }
      console.log(`DASHBOARD FETCH SUCCESS (useAdInsights): Found ${data?.length || 0} rows`);
      return (data ?? []).map((row) => normalizeInsightMetrics(row as unknown as AdInsight));
    },
  });

  const insightRows = insights as AdInsightWithJoins[];
  const totalImpressions = insightRows.reduce((sum, insight) => sum + (insight.impressions || 0), 0);
  const totalClicks = insightRows.reduce((sum, insight) => sum + (insight.clicks || 0), 0);
  const totalSpend = insightRows.reduce(
    (sum, insight) => sum + toMetricNumber(insight.spend, insight.total_cost),
    0
  );
  const totalConversions = insightRows.reduce((sum, insight) => sum + (insight.conversions || 0), 0);
  const totalReach = insightRows.reduce((sum, insight) => sum + (insight.reach || 0), 0);

  const summary: AdInsightsSummary = {
    totalImpressions,
    totalClicks,
    totalSpend,
    totalConversions,
    totalReach,
    avgRoas:
      insightRows.length > 0
        ? insightRows.reduce((sum, i) => sum + Number(i.roas || 0), 0) / insightRows.length
        : 0,
    avgCtr:
      insightRows.length > 0
        ? insightRows.reduce((sum, i) => sum + Number(i.ctr || 0), 0) / insightRows.length
        : 0,
    avgCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
    avgCpm:
      insightRows.length > 0
        ? insightRows.reduce((sum, i) => sum + Number(i.cpm || 0), 0) / insightRows.length
        : 0,
    dailyData: insightRows.map((i) => ({
      date: i.date,
      impressions: i.impressions || 0,
      clicks: i.clicks || 0,
      spend: toMetricNumber(i.spend, i.total_cost),
      conversions: i.conversions || 0,
    })),
  };

  return {
    insights,
    summary,
    isLoading,
    error,
  };
}

// ---------------------------------------------------------------------------
// CampaignDailyInsight
// ---------------------------------------------------------------------------

export interface CampaignDailyInsight {
  date: string;
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  spend: number;
}

/**
 * Fetches real daily ad_insights rows for a specific campaign.
 * In mock mode, filters MOCK_AD_INSIGHTS by the encoded campaign_id.
 */
export function useCampaignInsights(campaignId: string | null | undefined) {
  const { data: dailyInsights = [], isLoading } = useQuery({
    queryKey: ["campaign_insights", campaignId, USE_MOCK_DATA ? "mock" : "live"],
    enabled: !!campaignId,
    queryFn: async () => {
      // ── MOCK MODE ──────────────────────────────────────────────────────
      if (USE_MOCK_DATA) {
        const rows = MOCK_AD_INSIGHTS.filter(
          (r) => r.campaign_id === campaignId || r.campaign_id === `mock-campaign-${campaignId}`,
        );

        const byDate = new Map<string, CampaignDailyInsight>();
        for (const row of rows) {
          const key = row.date;
          if (!byDate.has(key)) {
            byDate.set(key, { date: key, impressions: 0, reach: 0, clicks: 0, conversions: 0, spend: 0 });
          }
          const entry = byDate.get(key)!;
          entry.impressions += row.impressions || 0;
          entry.reach += row.reach || 0;
          entry.clicks += row.clicks || 0;
          entry.conversions += row.conversions || 0;
          entry.spend += Number(row.spend || 0);
        }
        return Array.from(byDate.values());
      }

      // ── LIVE MODE ──────────────────────────────────────────────────────
      // Two paths (same as useCampaigns): (1) direct campaign_id, (2) via campaign_ads → ads_id
      // Use only one path to avoid double-counting; prefer direct when present
      const byDate = new Map<string, CampaignDailyInsight>();

      const aggregate = (rows: Array<{ date: string; impressions?: number; reach?: number; clicks?: number; conversions?: number; spend?: number }>) => {
        for (const row of rows) {
          const key = row.date;
          if (!byDate.has(key)) {
            byDate.set(key, { date: key, impressions: 0, reach: 0, clicks: 0, conversions: 0, spend: 0 });
          }
          const entry = byDate.get(key)!;
          entry.impressions += row.impressions || 0;
          entry.reach += row.reach || 0;
          entry.clicks += row.clicks || 0;
          entry.conversions += row.conversions || 0;
          entry.spend += Number(row.spend || 0);
        }
      };

      // Path 1: Direct campaign_id (legacy)
      const { data: directData } = await supabase
        .from("ad_insights")
        .select("date, impressions, reach, clicks, conversions, spend")
        .eq("campaign_id", campaignId!)
        .order("date", { ascending: true });

      if ((directData ?? []).length > 0) {
        aggregate(directData ?? []);
      } else {
        // Path 2: Via campaign_ads (ads assigned to campaign) — primary when campaign_id is null
        const { data: campaignAds } = await supabase
          .from("campaign_ads")
          .select("ad_id")
          .eq("campaign_id", campaignId!);

        const adIds = (campaignAds ?? []).map((r) => r.ad_id).filter(Boolean);
        if (adIds.length > 0) {
          const { data: adsData } = await supabase
            .from("ad_insights")
            .select("date, impressions, reach, clicks, conversions, spend")
            .in("ads_id", adIds)
            .order("date", { ascending: true });
          aggregate(adsData ?? []);
        }
      }

      return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    },
  });

  return { dailyInsights, isLoading };
}
