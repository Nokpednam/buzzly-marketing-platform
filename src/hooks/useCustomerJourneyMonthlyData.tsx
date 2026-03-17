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

interface MonthlyRow {
  month: string;
  month_label: string;
  awareness: number;
  consideration: number;
  acquisition: number;
  intent: number;
  conversion: number;
  acquisition_is_estimated?: boolean;
  intent_is_estimated?: boolean;
  conversion_is_estimated?: boolean;
}

/**
 * Fetches ad_insights aggregated by month via Backend RPC.
 * Falls back to direct query when RPC is not available (migration not applied).
 * Estimation logic: backend RPC when available, else client-side.
 */
export function useCustomerJourneyMonthlyData(
  monthsBack: number = 6,
  platformId?: string
) {
  const dateFrom = format(subMonths(new Date(), monthsBack), "yyyy-MM-dd");

  const { data: rawRows = [], isLoading } = useQuery({
    queryKey: ["ad_insights_monthly", monthsBack, platformId],
    queryFn: async (): Promise<MonthlyRow[]> => {
      const { data, error } = await supabase.rpc("get_customer_journey_monthly_data", {
        p_months_back: monthsBack,
        p_platform_id: platformId ?? null,
      });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data as MonthlyRow[];
      }

      // Fallback: RPC not available or failed — use direct query (same logic as before migration)
      if (error) {
        // Log but don't throw — we'll use fallback
        if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
          console.warn("[useCustomerJourneyMonthlyData] RPC fallback:", error.message);
        }
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
        let acquisitionEst = false;
        let intentEst = false;
        let conversionEst = false;

        if (leads === 0 && agg.clicks > 0) {
          leads = Math.round(agg.clicks * 0.05);
          acquisitionEst = true;
        }
        if (adds_to_cart === 0 && (leads > 0 || conversions > 0)) {
          adds_to_cart = Math.max(
            Math.round(leads * 0.25),
            Math.round(conversions * 2.5)
          );
          intentEst = true;
        }
        if (conversions === 0 && adds_to_cart > 0) {
          conversions = Math.round(adds_to_cart * 0.35);
          conversionEst = true;
        }

        result.push({
          month: monthKey,
          month_label: format(d, "MMM yy"),
          awareness: agg.impressions,
          consideration: agg.clicks,
          acquisition: leads,
          intent: adds_to_cart,
          conversion: conversions,
          acquisition_is_estimated: acquisitionEst,
          intent_is_estimated: intentEst,
          conversion_is_estimated: conversionEst,
        });
      }

      return result;
    },
  });

  const { monthlyData, usedFallback } = useMemo(() => {
    const usedFallbackFlags = { acquisition: false, intent: false, conversion: false };
    const result: MonthlyStageData[] = rawRows.map((row) => {
      if (row.acquisition_is_estimated) usedFallbackFlags.acquisition = true;
      if (row.intent_is_estimated) usedFallbackFlags.intent = true;
      if (row.conversion_is_estimated) usedFallbackFlags.conversion = true;
      return {
        month: row.month,
        monthLabel: row.month_label,
        awareness: Number(row.awareness),
        consideration: Number(row.consideration),
        acquisition: Number(row.acquisition),
        intent: Number(row.intent),
        conversion: Number(row.conversion),
      };
    });
    return { monthlyData: result, usedFallback: usedFallbackFlags };
  }, [rawRows]);

  return {
    monthlyData,
    usedFallback,
    isLoading,
  };
}
