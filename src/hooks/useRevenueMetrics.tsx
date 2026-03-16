import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";

export interface RevenueMetricsRow {
  gross_revenue: number | null;
  net_revenue: number | null;
  profit: number | null;
  profit_margin: number | null;
  revenue_growth_percent: number | null;
  total_orders: number | null;
  new_customers: number | null;
  metric_date: string | null;
}

export interface DerivedRevenue {
  gross_revenue: number;
  net_revenue: number;
  profit_margin: number;
  revenue_growth_percent: number | null;
  total_orders: number;
  new_customers: number;
  metric_date: string;
  source: "revenue_metrics" | "ad_insights";
}

export function useRevenueMetrics(adMetrics?: {
  totalSpend: number;
  avgRoas: number;
  totalConversions: number;
}) {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id;

  const { data: revenueMetrics, isLoading } = useQuery({
    queryKey: ["revenue-metrics-dashboard", workspaceId],
    enabled: !!workspaceId,
    queryFn: async (): Promise<RevenueMetricsRow | null> => {
      if (!workspaceId) return null;

      const { data, error } = await supabase
        .from("revenue_metrics")
        .select("gross_revenue, net_revenue, profit, profit_margin, revenue_growth_percent, total_orders, new_customers, metric_date")
        .eq("team_id", workspaceId)
        .order("metric_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // When no revenue_metrics, derive from ad performance
  const derived: DerivedRevenue | null =
    !revenueMetrics && adMetrics && (adMetrics.totalSpend > 0 || adMetrics.totalConversions > 0)
      ? (() => {
          const estimatedRevenue = adMetrics.totalSpend * adMetrics.avgRoas;
          const gross = Math.round(estimatedRevenue);
          const net = Math.round(estimatedRevenue * 0.85); // rough estimate
          const profit = net - adMetrics.totalSpend;
          const margin = gross > 0 ? (profit / gross) * 100 : 0;
          return {
            gross_revenue: gross,
            net_revenue: net,
            profit_margin: margin,
            revenue_growth_percent: null, // ไม่มีข้อมูลช่วงก่อน — ไม่สามารถคำนวณได้
            total_orders: adMetrics.totalConversions,
            new_customers: Math.round(adMetrics.totalConversions * 0.6),
            metric_date: new Date().toISOString().split("T")[0],
            source: "ad_insights",
          };
        })()
      : null;

  const displayMetrics: DerivedRevenue | null = revenueMetrics
    ? {
        gross_revenue: Number(revenueMetrics.gross_revenue ?? 0),
        net_revenue: Number(revenueMetrics.net_revenue ?? 0),
        profit_margin: Number(revenueMetrics.profit_margin ?? 0),
        revenue_growth_percent: revenueMetrics.revenue_growth_percent != null ? Number(revenueMetrics.revenue_growth_percent) : null,
        total_orders: Number(revenueMetrics.total_orders ?? 0),
        new_customers: Number(revenueMetrics.new_customers ?? 0),
        metric_date: revenueMetrics.metric_date ?? "",
        source: "revenue_metrics",
      }
    : derived;

  return {
    revenueMetrics: displayMetrics,
    isLoading,
    isFromAdInsights: displayMetrics?.source === "ad_insights",
  };
}
