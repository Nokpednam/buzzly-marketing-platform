import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { subMonths, format } from "date-fns";

export interface AARRRMonthlyStageData {
  month: string;
  monthLabel: string;
  acquisition: number;
  activation: number;
  retention: number;
  revenue: number;
  referral: number;
}

interface MonthlyRow {
  month: string;
  month_label: string;
  awareness: number;
  consideration: number;
  acquisition: number;
  intent: number;
  conversion: number;
}

/**
 * Fetches ad_insights aggregated by month and maps to AARRR categories.
 * Reuses get_customer_journey_monthly_data RPC:
 *   acquisition (AARRR) = impressions (awareness)
 *   activation (AARRR) = clicks (consideration)
 *   retention (AARRR) = leads (acquisition)
 *   revenue (AARRR) = conversions
 *   referral (AARRR) = conversions * 0.15
 */
export function useAARRRMonthlyData(monthsBack: number = 6, platformId?: string) {
  const dateFrom = format(subMonths(new Date(), monthsBack), "yyyy-MM-dd");

  const { data: rawRows = [], isLoading } = useQuery({
    queryKey: ["aarrr_monthly", monthsBack, platformId],
    queryFn: async (): Promise<MonthlyRow[]> => {
      const { data, error } = await supabase.rpc("get_customer_journey_monthly_data", {
        p_months_back: monthsBack,
        p_platform_id: platformId ?? null,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data as MonthlyRow[];
      }

      if (error && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
        console.warn("[useAARRRMonthlyData] RPC fallback:", error.message);
      }

      let query = supabase
        .from("ad_insights")
        .select("date, impressions, clicks, leads, adds_to_cart, conversions, ad_accounts!inner(is_active, platform_id)")
        .eq("ad_accounts.is_active", true)
        .gte("date", dateFrom);

      if (platformId) {
        query = query.eq("ad_accounts.platform_id", platformId);
      }

      const { data: rows, error: queryError } = await query;
      if (queryError) throw queryError;

      const byMonth = new Map<
        string,
        { impressions: number; clicks: number; leads: number; adds_to_cart: number; conversions: number }
      >();

      for (const row of (rows ?? []) as Array<{
        date: string;
        impressions: number | null;
        clicks: number | null;
        leads: number | null;
        adds_to_cart: number | null;
        conversions: number | null;
      }>) {
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

      const result: MonthlyRow[] = [];
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
          month_label: format(d, "MMM yy"),
          awareness: agg.impressions,
          consideration: agg.clicks,
          acquisition: leads,
          intent: adds_to_cart,
          conversion: conversions,
        });
      }

      return result;
    },
  });

  const monthlyData = useMemo((): AARRRMonthlyStageData[] => {
    return rawRows.map((row) => ({
      month: row.month,
      monthLabel: row.month_label,
      acquisition: Number(row.awareness),
      activation: Number(row.consideration),
      retention: Number(row.acquisition),
      revenue: Number(row.conversion),
      referral: Math.round(Number(row.conversion) * 0.15),
    }));
  }, [rawRows]);

  return {
    monthlyData,
    isLoading,
  };
}
