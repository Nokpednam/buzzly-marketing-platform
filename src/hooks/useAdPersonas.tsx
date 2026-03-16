import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "./useWorkspace";

export interface PersonaData {
  age_distribution: Record<string, number>;
  gender: Record<string, number>;
  top_locations: { name: string; pct: number }[];
  interests: { name: string; pct: number }[];
  device_type: Record<string, number>;
}

export type AdAudienceMode = "all" | "ad" | "campaign";

interface AdPersonaFilter {
  mode: AdAudienceMode;
  adId?: string;
  campaignId?: string;
}

export function weightedAvg(ads: { persona_data: PersonaData; weight: number }[]): PersonaData | null {
  const totalWeight = ads.reduce((s, a) => s + a.weight, 0);
  if (totalWeight === 0 || ads.length === 0) return null;

  const locMap: Record<string, number> = {};
  const intMap: Record<string, number> = {};
  const ageKeys = new Set<string>();
  const genderKeys = new Set<string>();
  const deviceKeys = new Set<string>();

  for (const { persona_data: p, weight } of ads) {
    const w = weight / totalWeight;
    Object.keys(p.age_distribution ?? {}).forEach(k => ageKeys.add(k));
    Object.keys(p.gender ?? {}).forEach(k => genderKeys.add(k));
    Object.keys(p.device_type ?? {}).forEach(k => deviceKeys.add(k));
    (p.top_locations ?? []).forEach(l => { locMap[l.name] = (locMap[l.name] ?? 0) + l.pct * w; });
    (p.interests ?? []).forEach(i => { intMap[i.name] = (intMap[i.name] ?? 0) + i.pct * w; });
  }

  const aggRecord = (
    keys: Set<string>,
    field: "age_distribution" | "gender" | "device_type",
  ): Record<string, number> =>
    Object.fromEntries(
      [...keys].map(k => [
        k,
        ads.reduce((s, { persona_data: p, weight }) =>
          s + ((p[field] as Record<string, number>)?.[k] ?? 0) * weight, 0) / totalWeight,
      ])
    );

  return {
    age_distribution: aggRecord(ageKeys, "age_distribution"),
    gender: aggRecord(genderKeys, "gender"),
    device_type: aggRecord(deviceKeys, "device_type"),
    top_locations: Object.entries(locMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, pct]) => ({ name, pct })),
    interests: Object.entries(intMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, pct]) => ({ name, pct })),
  };
}

export function useAdPersonas({ mode, adId, campaignId }: AdPersonaFilter) {
  const { workspace } = useWorkspace();
  const workspaceId = workspace.id;

  // Fetch all workspace ads that have persona_data (minimal columns for performance)
  const { data: adsRaw = [], isLoading: adsLoading } = useQuery({
    queryKey: ["ad-personas-ads", workspaceId],
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ads")
        .select("id, persona_data, name, platform")
        .eq("team_id", workspaceId)
        .not("persona_data", "is", null);
      if (error) throw error;
      return data as { id: string; persona_data: PersonaData; name: string; platform: string | null }[];
    },
  });

  // Fetch impressions per ad (for weighting and total display).
  const { data: insightsRaw = [], isLoading: insightsLoading } = useQuery({
    queryKey: ["ad-personas-insights", workspaceId],
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ad_insights")
        .select("ads_id, impressions");
      if (error) throw error;
      return data as { ads_id: string | null; impressions: number | null }[];
    },
  });

  // Fetch campaign → ad assignments (only when campaign filter is active)
  const { data: campaignAdsRaw = [], isLoading: campaignAdsLoading } = useQuery({
    queryKey: ["ad-personas-campaign-ads", workspaceId],
    enabled: mode === "campaign",
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("campaign_ads")
        .select("campaign_id, ad_id");
      if (error) throw error;
      return data as { campaign_id: string; ad_id: string }[];
    },
  });

  // Aggregate impressions per ad for weighting
  const impressionsMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of insightsRaw) {
      if (row.ads_id) map[row.ads_id] = (map[row.ads_id] ?? 0) + (row.impressions ?? 0);
    }
    return map;
  }, [insightsRaw]);

  const personaData = useMemo((): PersonaData | null => {
    if (!adsRaw.length) return null;

    if (mode === "ad") {
      const ad = adsRaw.find(a => a.id === adId);
      return ad?.persona_data ?? null;
    }

    let targetAds = adsRaw;
    if (mode === "campaign" && campaignId) {
      const adIds = new Set(
        campaignAdsRaw.filter(r => r.campaign_id === campaignId).map(r => r.ad_id)
      );
      targetAds = adsRaw.filter(a => adIds.has(a.id));
    }

    return weightedAvg(
      targetAds.map(a => ({
        persona_data: a.persona_data,
        weight: impressionsMap[a.id] ?? 1, // fallback weight=1 so zero-impression ads still count
      }))
    );
  }, [mode, adId, campaignId, adsRaw, campaignAdsRaw, impressionsMap]);

  const totalImpressions = useMemo(() => {
    if (!personaData) return 0;
    if (mode === "ad" && adId) {
      return impressionsMap[adId] ?? 0;
    }
    if (mode === "campaign" && campaignId) {
      const adIds = new Set(
        campaignAdsRaw.filter(r => r.campaign_id === campaignId).map(r => r.ad_id)
      );
      return adsRaw
        .filter(a => adIds.has(a.id))
        .reduce((s, a) => s + (impressionsMap[a.id] ?? 0), 0);
    }
    return adsRaw.reduce((s, a) => s + (impressionsMap[a.id] ?? 0), 0);
  }, [mode, adId, campaignId, adsRaw, campaignAdsRaw, impressionsMap, personaData]);

  const isLoading =
    adsLoading ||
    (mode !== "ad" && insightsLoading) ||
    (mode === "campaign" && campaignAdsLoading);

  return { personaData, isLoading, adsWithPersona: adsRaw, totalImpressions };
}
