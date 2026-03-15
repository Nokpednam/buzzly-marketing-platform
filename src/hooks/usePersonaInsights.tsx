import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PersonaInsightsSummary {
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  conversions: number;
  roas: number;
}

export interface PersonaInsightsDailyPoint {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export interface PersonaLinkedAd {
  id: string;
  name: string;
  creative_type: string | null;
  status: string | null;
  platform: string | null;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  conversions: number;
}

interface AdPersonaLinkRow {
  ad_id: string;
  ads: {
    id: string;
    name: string;
    creative_type: string | null;
    status: string | null;
    platform: string | null;
  } | null;
}

interface AdInsightRow {
  ads_id: string | null;
  date: string;
  impressions: number | null;
  clicks: number | null;
  spend: string | null;
  conversions: number | null;
  roas: string | null;
}

export function usePersonaInsights(personaId: string | undefined) {
  // Step 1: Fetch ads linked to this persona via junction table
  const { data: adPersonaLinks = [], isLoading: linksLoading } = useQuery({
    queryKey: ["persona-ad-links", personaId],
    enabled: !!personaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_personas")
        .select("ad_id, ads(id, name, creative_type, status, platform)")
        .eq("persona_id", personaId!);
      if (error) throw error;
      return (data ?? []) as AdPersonaLinkRow[];
    },
  });

  const adIds = useMemo(
    () => adPersonaLinks.map((l) => l.ad_id),
    [adPersonaLinks]
  );

  // Step 2: Fetch ad_insights for linked ads
  const { data: insightsRaw = [], isLoading: insightsLoading } = useQuery({
    queryKey: ["persona-insights-data", personaId, adIds.join(",")],
    enabled: !!personaId && adIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_insights")
        .select("ads_id, date, impressions, clicks, spend, conversions, roas")
        .in("ads_id", adIds)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AdInsightRow[];
    },
  });

  // Aggregate summary KPIs
  const summary = useMemo((): PersonaInsightsSummary => {
    const totalImpressions = insightsRaw.reduce(
      (s, r) => s + (r.impressions ?? 0),
      0
    );
    const totalClicks = insightsRaw.reduce((s, r) => s + (r.clicks ?? 0), 0);
    const totalSpend = insightsRaw.reduce(
      (s, r) => s + Number(r.spend ?? 0),
      0
    );
    const totalConversions = insightsRaw.reduce(
      (s, r) => s + (r.conversions ?? 0),
      0
    );
    const roasSum = insightsRaw.reduce((s, r) => s + Number(r.roas ?? 0), 0);
    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      spend: totalSpend,
      conversions: totalConversions,
      roas: insightsRaw.length > 0 ? roasSum / insightsRaw.length : 0,
    };
  }, [insightsRaw]);

  // Group insights by date for daily chart
  const dailyData = useMemo((): PersonaInsightsDailyPoint[] => {
    const byDate = new Map<string, PersonaInsightsDailyPoint>();
    for (const row of insightsRaw) {
      const key = row.date;
      if (!byDate.has(key)) {
        byDate.set(key, {
          date: key,
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
        });
      }
      const entry = byDate.get(key)!;
      entry.impressions += row.impressions ?? 0;
      entry.clicks += row.clicks ?? 0;
      entry.spend += Number(row.spend ?? 0);
      entry.conversions += row.conversions ?? 0;
    }
    return Array.from(byDate.values());
  }, [insightsRaw]);

  // Per-ad metrics for linked ads table
  const linkedAds = useMemo((): PersonaLinkedAd[] => {
    return adPersonaLinks.map((link) => {
      const ad = link.ads;
      const adInsights = insightsRaw.filter((r) => r.ads_id === link.ad_id);
      const impressions = adInsights.reduce(
        (s, r) => s + (r.impressions ?? 0),
        0
      );
      const clicks = adInsights.reduce((s, r) => s + (r.clicks ?? 0), 0);
      const spend = adInsights.reduce(
        (s, r) => s + Number(r.spend ?? 0),
        0
      );
      const conversions = adInsights.reduce(
        (s, r) => s + (r.conversions ?? 0),
        0
      );
      return {
        id: link.ad_id,
        name: ad?.name ?? "Untitled Ad",
        creative_type: ad?.creative_type ?? null,
        status: ad?.status ?? null,
        platform: ad?.platform ?? null,
        impressions,
        clicks,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        spend,
        conversions,
      };
    });
  }, [adPersonaLinks, insightsRaw]);

  return {
    summary,
    dailyData,
    linkedAds,
    isLoading: linksLoading || (adIds.length > 0 && insightsLoading),
    hasLinkedAds: adIds.length > 0,
  };
}
