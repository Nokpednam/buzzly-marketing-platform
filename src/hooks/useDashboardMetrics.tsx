import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";

export interface DashboardMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  avgCtr: number;
  avgCpc: number;
  avgCpm: number;
  avgRoas: number;
  trendData: { date: string; impressions: number; clicks: number; spend: number }[];
}

function parseDateRange(dateRange: string): { start: string; end: string } {
  const now = new Date();
  const toYMD = (d: Date) => d.toISOString().split("T")[0]!;

  if (dateRange.startsWith("week:")) {
    const m = dateRange.match(/^week:(\d{4}-\d{2}-\d{2})$/);
    if (m) {
      const start = new Date(m[1]!);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start: toYMD(start), end: toYMD(end) };
    }
  }
  if (dateRange.startsWith("month:")) {
    const m = dateRange.match(/^month:(\d{4}-\d{2})$/);
    if (m) {
      const [y, mo] = m[1]!.split("-").map(Number);
      const start = new Date(y!, mo! - 1, 1);
      const end = new Date(y!, mo!, 0);
      return { start: toYMD(start), end: toYMD(end) };
    }
  }
  if (dateRange.startsWith("year:")) {
    const m = dateRange.match(/^year:(\d{4})$/);
    if (m) {
      const y = parseInt(m[1]!, 10);
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    }
  }
  if (dateRange.startsWith("custom:")) {
    const parts = dateRange.split(":");
    if (parts.length === 3 && parts[1] && parts[2]) {
      const start = parts[1];
      const end = parts[2];
      if (/^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end)) {
        return { start, end };
      }
    }
  }

  let startDate = new Date(now);
  switch (dateRange) {
    case "today":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      return { start: toYMD(startDate), end: toYMD(now) };
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      return { start: toYMD(startDate), end: toYMD(now) };
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      return { start: toYMD(startDate), end: toYMD(now) };
    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      return { start: toYMD(startDate), end: toYMD(now) };
    default:
      startDate.setDate(startDate.getDate() - 30);
      return { start: toYMD(startDate), end: toYMD(now) };
  }
}

export function useDashboardMetrics(dateRange: string = "7d", platformId: string = "all") {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id;

  return useQuery({
    queryKey: ["dashboard-metrics", dateRange, platformId, workspaceId],
    enabled: !!workspaceId,
    queryFn: async (): Promise<DashboardMetrics> => {
      const { start, end } = parseDateRange(dateRange);

      // 1. Fetch campaigns for this workspace
      const { data: campaigns, error: campaignsError } = await supabase
        .from("campaigns")
        .select("id")
        .eq("team_id", workspaceId!);

      if (campaignsError) {
        console.error("DASHBOARD FETCH ERROR (campaigns):", campaignsError);
        throw campaignsError;
      }

      // 2. If no campaigns exist, return all zeroes immediately
      if (!campaigns || campaigns.length === 0) {
        console.log("DASHBOARD: 0 campaigns, returning zeroes");
        return {
          totalImpressions: 0,
          totalClicks: 0,
          totalSpend: 0,
          totalConversions: 0,
          avgCtr: 0,
          avgCpc: 0,
          avgCpm: 0,
          avgRoas: 0,
          trendData: [],
        };
      }

      const campaignIds = campaigns.map((c) => c.id);

      // 3. Fetch all ad_ids linked to these campaigns
      const { data: campaignAds, error: campaignAdsError } = await (supabase as any)
        .from("campaign_ads")
        .select("ad_id")
        .in("campaign_id", campaignIds);

      if (campaignAdsError) {
        console.error("DASHBOARD FETCH ERROR (campaign_ads):", campaignAdsError);
        throw campaignAdsError;
      }

      const validAdIds = campaignAds?.map((ca: any) => ca.ad_id) ?? [];

      // 4. Then query standard ad_accounts for platform filtering
      const { data: adAccounts, error: adAccountsError } = await supabase
        .from("ad_accounts")
        .select("id, platform_id, team_id")
        .eq("team_id", workspaceId!);

      if (adAccountsError) {
        console.error("DASHBOARD FETCH ERROR (ad_accounts):", adAccountsError);
        throw adAccountsError;
      }

      console.log("DASHBOARD FETCH: Found ad accounts", adAccounts?.length);
      const validAccountIds = adAccounts?.map((a) => a.id) ?? [];

      // If there are no ad accounts but somehow campaigns exist (rare), we can't filter by platform properly
      // but let's proceed and just rely on campaign IDs for security.

      // Build the OR clause for insights linking: must match either directly by campaign_id OR via ads_id
      const insightLinkingOrs = [];
      if (campaignIds.length > 0) insightLinkingOrs.push(`campaign_id.in.(${campaignIds.join(",")})`);
      if (validAdIds.length > 0) insightLinkingOrs.push(`ads_id.in.(${validAdIds.join(",")})`);
      const linkingFilter = insightLinkingOrs.length > 0 ? insightLinkingOrs.join(",") : "id.is.null"; // fallback to nothing match if empty

      let query = supabase
        .from("ad_insights")
        .select("*")
        .gte("date", start)
        .lte("date", end)
        .or(linkingFilter)
        .order("date", { ascending: true });

      if (platformId !== "all" && validAccountIds.length > 0) {
        // filter accounts by platform
        const platformAccountIds = adAccounts
           .filter(a => a.platform_id === platformId)
           .map(a => a.id);
        
        if (platformAccountIds.length === 0) {
           // Platform requested has no accounts, so naturally no insights
           query = supabase.from("ad_insights").select("*").eq("id", "00000000-0000-0000-0000-000000000000"); 
        } else {
           query = query.in("ad_account_id", platformAccountIds);
        }
      }

      const { data: insights, error } = await query;

      if (error) {
        console.error("DASHBOARD FETCH ERROR (ad_insights):", error);
        throw error;
      }

      console.log(`DASHBOARD FETCH SUCCESS: Found ${insights?.length || 0} insights for ${start} to ${end}`);


      // Aggregate metrics
      const totalImpressions = insights?.reduce((sum, i) => sum + (i.impressions || 0), 0) || 0;
      const totalClicks = insights?.reduce((sum, i) => sum + (i.clicks || 0), 0) || 0;
      const totalSpend = insights?.reduce((sum, i) => sum + Number(i.spend || 0), 0) || 0;
      const totalConversions = insights?.reduce((sum, i) => sum + (i.conversions || 0), 0) || 0;

      const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
      const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;

      // Calculate ROAS
      const totalRoas = insights?.reduce((sum, i) => sum + Number(i.roas || 0), 0) || 0;
      const avgRoas = insights?.length ? totalRoas / insights.length : 0;

      // Group by date for trend data
      const trendMap: Record<string, { impressions: number; clicks: number; spend: number }> = {};
      insights?.forEach((i) => {
        const date = i.date;
        if (!trendMap[date]) {
          trendMap[date] = { impressions: 0, clicks: 0, spend: 0 };
        }
        trendMap[date].impressions += i.impressions || 0;
        trendMap[date].clicks += i.clicks || 0;
        trendMap[date].spend += Number(i.spend || 0);
      });

      const trendData = Object.entries(trendMap).map(([date, data]) => ({
        date,
        impressions: Number.isFinite(data.impressions) ? data.impressions : 0,
        clicks: Number.isFinite(data.clicks) ? data.clicks : 0,
        spend: Number.isFinite(data.spend) ? data.spend : 0,
      }));

      const safe = (n: number) => (Number.isFinite(n) ? n : 0);

      return {
        totalImpressions: safe(totalImpressions),
        totalClicks: safe(totalClicks),
        totalSpend: safe(totalSpend),
        totalConversions: safe(totalConversions),
        avgCtr: safe(avgCtr),
        avgCpc: safe(avgCpc),
        avgCpm: safe(avgCpm),
        avgRoas: safe(avgRoas),
        trendData,
      };
    },
  });
}
