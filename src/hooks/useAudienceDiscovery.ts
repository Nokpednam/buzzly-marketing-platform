import { useQuery } from "@tanstack/react-query";
import {
  USE_MOCK_DATA,
  getMockAds,
  type MockAdRecord,
} from "@/lib/mock-api-data";
import { weightedAvg, type PersonaData } from "@/hooks/useAdPersonas";

export interface PerformanceSummary {
  totalImpressions: number;
  avgCtr: number;
  avgRoas: number;
}

interface AudienceDiscoveryData {
  audienceData: PersonaData | null;
  performanceSummary: PerformanceSummary | null;
  filteredAds: MockAdRecord[];
}

interface AudienceDiscoveryResult extends AudienceDiscoveryData {
  isLoading: boolean;
  error: Error | null;
}

export function useAudienceDiscovery(
  activePlatforms: string[],
  teamName?: string | null,
): AudienceDiscoveryResult {
  const { data, isLoading, error } = useQuery<AudienceDiscoveryData>({
    queryKey: ["audience-discovery", activePlatforms, USE_MOCK_DATA ? "mock" : "live"],
    enabled: activePlatforms.length > 0,
    queryFn: async (): Promise<AudienceDiscoveryData> => {
      if (activePlatforms.length === 0) {
        return { audienceData: null, performanceSummary: null, filteredAds: [] };
      }

      if (USE_MOCK_DATA) {
        const allAds = getMockAds(teamName);
        const filtered = allAds.filter((ad) =>
          activePlatforms.some((p) =>
            ad.platform.toLowerCase().includes(p.toLowerCase()),
          ),
        );

        if (filtered.length === 0) {
          return { audienceData: null, performanceSummary: null, filteredAds: [] };
        }

        const audienceData = weightedAvg(
          filtered.map((ad) => ({
            persona_data: ad.persona_data,
            weight: ad.impressions,
          })),
        );

        const totalImpressions = filtered.reduce((s, a) => s + a.impressions, 0);
        const avgCtr =
          filtered.length > 0
            ? filtered.reduce((s, a) => s + a.ctr, 0) / filtered.length
            : 0;
        const avgRoas =
          filtered.length > 0
            ? filtered.reduce((s, a) => s + a.roas, 0) / filtered.length
            : 0;

        return {
          audienceData,
          performanceSummary: { totalImpressions, avgCtr, avgRoas },
          filteredAds: filtered,
        };
      }

      // Live mode: not yet implemented
      return { audienceData: null, performanceSummary: null, filteredAds: [] };
    },
  });

  return {
    audienceData: data?.audienceData ?? null,
    performanceSummary: data?.performanceSummary ?? null,
    filteredAds: data?.filteredAds ?? [],
    isLoading,
    error: error as Error | null,
  };
}
