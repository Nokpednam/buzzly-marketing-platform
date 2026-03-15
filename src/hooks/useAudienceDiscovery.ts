import { useQuery } from "@tanstack/react-query";
import {
  USE_MOCK_DATA,
  getMockAds,
  getMockLeads,
  type MockAdRecord,
  type MockLeadRecord,
} from "@/lib/mock-api-data";
import { weightedAvg, type PersonaData } from "@/hooks/useAdPersonas";

export interface PerformanceSummary {
  totalImpressions: number;
  avgCtr: number;
  avgRoas: number;
  totalLeads: number;
}

interface AudienceDiscoveryData {
  audienceData: PersonaData | null;
  performanceSummary: PerformanceSummary | null;
  filteredAds: MockAdRecord[];
  leads: MockLeadRecord[];
}

interface AudienceDiscoveryResult extends AudienceDiscoveryData {
  isLoading: boolean;
  error: Error | null;
}

export function useAudienceDiscovery(
  activePlatforms: string[],
  workspaceId?: string | null,
): AudienceDiscoveryResult {
  const { data, isLoading, error } = useQuery<AudienceDiscoveryData>({
    queryKey: ["audience-discovery", workspaceId, activePlatforms, USE_MOCK_DATA ? "mock" : "live"],
    enabled: activePlatforms.length > 0,
    queryFn: async (): Promise<AudienceDiscoveryData> => {
      if (activePlatforms.length === 0) {
        return { audienceData: null, performanceSummary: null, filteredAds: [] };
      }

      if (USE_MOCK_DATA) {
        const allAds = getMockAds(workspaceId);
        const filtered = allAds.filter((ad) =>
          activePlatforms.some((p) =>
            ad.platform.toLowerCase().includes(p.toLowerCase()),
          ),
        );

        // Include leads only when Facebook is among the selected platforms
        const includesFacebook = activePlatforms.some((p) =>
          p.toLowerCase().includes("facebook"),
        );
        const leads = includesFacebook ? getMockLeads(workspaceId) : [];

        if (filtered.length === 0) {
          return { audienceData: null, performanceSummary: null, filteredAds: [], leads };
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
          performanceSummary: { totalImpressions, avgCtr, avgRoas, totalLeads: leads.length },
          filteredAds: filtered,
          leads,
        };
      }

      // Live mode: not yet implemented
      return { audienceData: null, performanceSummary: null, filteredAds: [], leads: [] };
    },
  });

  return {
    audienceData: data?.audienceData ?? null,
    performanceSummary: data?.performanceSummary ?? null,
    filteredAds: data?.filteredAds ?? [],
    leads: data?.leads ?? [],
    isLoading,
    error: error as Error | null,
  };
}
