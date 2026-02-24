import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export function useDashboardMetrics(dateRange: string = "7d", platformId: string = "all") {
  return useQuery({
    queryKey: ["dashboard-metrics", dateRange, platformId],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      let query = supabase
        .from("ad_insights")
        .select(`
          *,
          ad_accounts!inner(platform_id)
        `)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (platformId !== "all") {
        query = query.eq("ad_accounts.platform_id", platformId);
      }

      const { data: insights, error } = await query;

      if (error) throw error;


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
        ...data,
      }));

      return {
        totalImpressions,
        totalClicks,
        totalSpend,
        totalConversions,
        avgCtr,
        avgCpc,
        avgCpm,
        avgRoas,
        trendData,
      };
    },
  });
}
