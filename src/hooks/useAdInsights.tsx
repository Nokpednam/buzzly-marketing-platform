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

interface AdInsightWithJoins extends AdInsight {
  ad_accounts?: { platform_id: string; team_id?: string | null } | null;
  ads?: {
    ad_group_id: string | null;
    ad_groups?: { name: string | null } | null;
  } | null;
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

        let rows = getMockInsights(workspaceId);

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

        return rows as unknown as AdInsight[];
      }

      // ── LIVE MODE ────────────────────────────────────────────────────────
      if (activePlatforms && activePlatforms.length === 0) return [];

      let query = supabase
        .from("ad_insights")
        .select("*, ad_accounts!inner(platform_id, team_id), ads!inner(ad_group_id, ad_groups(name))")
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
      if (error) throw error;
      return data as unknown as AdInsight[];
    },
  });

  const insightRows = insights as AdInsightWithJoins[];
  const totalImpressions = insightRows.reduce((sum, insight) => sum + (insight.impressions || 0), 0);
  const totalClicks = insightRows.reduce((sum, insight) => sum + (insight.clicks || 0), 0);
  const totalSpend = insightRows.reduce((sum, insight) => sum + Number(insight.spend || 0), 0);
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
      spend: Number(i.spend || 0),
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
      const { data, error } = await supabase
        .from("ad_insights")
        .select("date, impressions, reach, clicks, conversions, spend")
        .eq("campaign_id", campaignId!)
        .order("date", { ascending: true });

      if (error) throw error;

      const byDate = new Map<string, CampaignDailyInsight>();
      for (const row of data ?? []) {
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
    },
  });

  return { dailyInsights, isLoading };
}
