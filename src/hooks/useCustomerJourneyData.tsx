import { useMemo } from "react";
import { useFunnelData } from "@/hooks/useFunnelData";

export interface JourneyStage {
  id: string;
  name: string;
  value: number;
  retentionRate: number;
  metrics: Record<string, number | string>;
  isEstimated: boolean;
}

const STAGE_IDS = ["awareness", "consideration", "acquisition", "intent", "conversion"] as const;

/**
 * Customer Journey data from ad platform API (ad_insights).
 * Marketing funnel: impressions → clicks → leads → adds_to_cart → conversions.
 * Shows "Estimated" when ad platform doesn't report leads/adds_to_cart and we use fallback.
 */
export function useCustomerJourneyData(period: string, platformId?: string) {
  const { funnelStages, usedFallback, isLoading } = useFunnelData(period, platformId);

  const journeyStages = useMemo((): JourneyStage[] => {
    if (!funnelStages || funnelStages.length === 0) return [];

    const values = STAGE_IDS.map((_, index) => funnelStages[index]?.value ?? 0);

    return STAGE_IDS.map((id, index) => {
      const value = values[index] ?? 0;
      const prevValue = index > 0 ? (values[index - 1] ?? 0) : 0;
      const retentionRate = prevValue > 0 ? (value / prevValue) * 100 : 0;

      let isEstimated = false;
      if (id === "acquisition") isEstimated = usedFallback.leads;
      else if (id === "intent") isEstimated = usedFallback.adds_to_cart;
      else if (id === "conversion") isEstimated = usedFallback.conversions;

      return {
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        value,
        retentionRate,
        metrics: { users: value },
        isEstimated,
      };
    });
  }, [funnelStages, usedFallback.leads, usedFallback.adds_to_cart, usedFallback.conversions]);

  return {
    journeyStages,
    isLoading,
  };
}
