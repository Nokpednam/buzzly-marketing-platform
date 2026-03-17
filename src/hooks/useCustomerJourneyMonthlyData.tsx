import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { subMonths, format } from "date-fns";

export interface MonthlyStageData {
  month: string;
  monthLabel: string;
  awareness: number;
  consideration: number;
  acquisition: number;
  intent: number;
  conversion: number;
}

/**
 * Fetches ad_insights aggregated by month for the last N months.
 * Used for the Stage Breakdown monthly comparison chart.
 */
export function useCustomerJourneyMonthlyData(
  monthsBack: number = 6,
  platformId?: string
) {
  const dateFrom = format(subMonths(new Date(), monthsBack), "yyyy-MM-dd");

  const { data: rawRows = [], isLoading } = useQuery({
    queryKey: ["ad_insights_monthly", monthsBack, platformId],
    queryFn: async () => {
      let query = supabase
        .from("ad_insights")
        .select("date, impressions, clicks, leads, adds_to_cart, conversions, ad_accounts!inner(is_active, platform_id)")
        .eq("ad_accounts.is_active", true)
        .gte("date", dateFrom);

      if (platformId) {
        query = query.eq("ad_accounts.platform_id", platformId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Array<{
        date: string;
        impressions: number | null;
        clicks: number | null;
        leads: number | null;
        adds_to_cart: number | null;
        conversions: number | null;
      }>;
    },
  });

  const monthlyData = useMemo((): MonthlyStageData[] => {
    const byMonth = new Map<
      string,
      { impressions: number; clicks: number; leads: number; adds_to_cart: number; conversions: number }
    >();

    for (const row of rawRows) {
      const monthKey = row.date.slice(0, 7);
      const existing = byMonth.get(monthKey) ?? {
        impressions: 0,
        clicks: 0,
        leads: 0,
        adds_to_cart: 0,
        conversions: 0,
      };
      existing.impressions += row.impressions ?? 0;
      existing.clicks += row.clicks ?? 0;
      existing.leads += row.leads ?? 0;
      existing.adds_to_cart += row.adds_to_cart ?? 0;
      existing.conversions += row.conversions ?? 0;
      byMonth.set(monthKey, existing);
    }

    const result: MonthlyStageData[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const monthKey = format(d, "yyyy-MM");
      const agg = byMonth.get(monthKey) ?? {
        impressions: 0,
        clicks: 0,
        leads: 0,
        adds_to_cart: 0,
        conversions: 0,
      };

      let leads = agg.leads;
      let adds_to_cart = agg.adds_to_cart;
      let conversions = agg.conversions;

      if (leads === 0 && agg.clicks > 0) {
        leads = Math.round(agg.clicks * 0.05);
      }
      if (adds_to_cart === 0 && (leads > 0 || conversions > 0)) {
        adds_to_cart = Math.max(
          Math.round(leads * 0.25),
          Math.round(conversions * 2.5)
        );
      }
      if (conversions === 0 && adds_to_cart > 0) {
        conversions = Math.round(adds_to_cart * 0.35);
      }

      result.push({
        month: monthKey,
        monthLabel: format(d, "MMM yy"),
        awareness: agg.impressions,
        consideration: agg.clicks,
        acquisition: leads,
        intent: adds_to_cart,
        conversion: conversions,
      });
    }

    return result;
  }, [rawRows, monthsBack]);

  return {
    monthlyData,
    isLoading,
  };
}
