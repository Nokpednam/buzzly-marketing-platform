import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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

export function useAdInsights(dateRange?: string) {
  // Calculate date filter based on dateRange
  const getDateFilter = () => {
    if (!dateRange) return null;
    const days = parseInt(dateRange);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  const { data: insights = [], isLoading, error } = useQuery({
    queryKey: ["ad_insights", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("ad_insights")
        .select("*")
        .order("date", { ascending: true });

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte("date", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AdInsight[];
    },
  });

  // Calculate summary metrics
  const summary: AdInsightsSummary = {
    totalImpressions: insights.reduce((sum, i) => sum + (i.impressions || 0), 0),
    totalClicks: insights.reduce((sum, i) => sum + (i.clicks || 0), 0),
    totalSpend: insights.reduce((sum, i) => sum + Number(i.spend || 0), 0),
    totalConversions: insights.reduce((sum, i) => sum + (i.conversions || 0), 0),
    totalReach: insights.reduce((sum, i) => sum + (i.reach || 0), 0),
    avgRoas: insights.length > 0 
      ? insights.reduce((sum, i) => sum + Number(i.roas || 0), 0) / insights.length 
      : 0,
    avgCtr: insights.length > 0 
      ? insights.reduce((sum, i) => sum + Number(i.ctr || 0), 0) / insights.length 
      : 0,
    avgCpc: insights.length > 0 
      ? insights.reduce((sum, i) => sum + Number(i.cpc || 0), 0) / insights.length 
      : 0,
    avgCpm: insights.length > 0 
      ? insights.reduce((sum, i) => sum + Number(i.cpm || 0), 0) / insights.length 
      : 0,
    dailyData: insights.map(i => ({
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
