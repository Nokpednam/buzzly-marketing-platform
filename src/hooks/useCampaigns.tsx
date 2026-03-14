import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { useWorkspace } from "@/hooks/useWorkspace";

// ─── Client-side progress calculator (mirrors supabase/functions/_shared/campaignProgress.ts) ──

export interface ProgressResult {
  timeProgress:    number;
  kpiProgress:     number;
  overallProgress: number;
  kpiLabel:        string;
  kpiActual:       number;
  kpiTarget:       number;
}

export function calculateCampaignProgress(
  c: Pick<
    CampaignWithInsights,
    | "start_date" | "end_date"
    | "target_kpi_metric" | "target_kpi_value"
    | "clicks" | "spend" | "conversions" | "impressions"
  >,
  nowMs?: number,
): ProgressResult {
  const now = nowMs ?? Date.now();

  const start = c.start_date ? new Date(c.start_date).getTime() : null;
  const end   = c.end_date   ? new Date(c.end_date).getTime()   : null;

  let timeProgress = 0;
  if (start !== null && end !== null && end > start) {
    if (now >= end)       timeProgress = 100;
    else if (now > start) timeProgress = Math.min(100, Math.round(((now - start) / (end - start)) * 100));
  }

  const KPI_MAP: Record<string, { label: string; value: number }> = {
    clicks:      { label: "Clicks",      value: c.clicks      ?? 0 },
    spend:       { label: "Spend",       value: c.spend       ?? 0 },
    conversions: { label: "Conversions", value: c.conversions ?? 0 },
    impressions: { label: "Impressions", value: c.impressions ?? 0 },
  };

  const kpiTarget  = c.target_kpi_value  ?? 0;
  const kpiDef     = c.target_kpi_metric ? KPI_MAP[c.target_kpi_metric] : null;
  const kpiActual  = kpiDef?.value ?? 0;
  const kpiLabel   = kpiDef?.label ?? "No KPI set";
  const kpiProgress = kpiTarget > 0
    ? Math.min(100, Math.round((kpiActual / kpiTarget) * 100))
    : 0;

  const overallProgress = Math.round((kpiProgress * 0.5) + (timeProgress * 0.5));

  return { timeProgress, kpiProgress, overallProgress, kpiLabel, kpiActual, kpiTarget };
}

export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type CampaignInsert = Database["public"]["Tables"]["campaigns"]["Insert"];
export type CampaignUpdate = Database["public"]["Tables"]["campaigns"]["Update"];

// Extended campaign with insights
import { Tag } from "./useTags";

export interface CampaignWithInsights extends Campaign {
  impressions: number;
  reach: number;
  clicks: number;
  conversions: number;
  spend: number;
  tags: Tag[];
  ad_account_name?: string | null;
  // team_id added by migration — cast via any until types.ts is regenerated
  team_id?: string | null;
  // Phase 3 — from migration 20260314000002 (not yet in types.ts)
  target_kpi_metric?: string | null;
  target_kpi_value?: number | null;
  ad_ids?: string[];
}

export function useCampaigns() {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();
  const workspaceId = workspace.id;

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ["campaigns", workspaceId],
    enabled: !!workspaceId,
    queryFn: async () => {
      // Get campaigns with tags and ad account name
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select(`
          *,
          ad_accounts(account_name),
          campaign_tags (
            tag_id,
            tags (
              id,
              name,
              color_code,
              entity_type
            )
          )
        `)
        .or(`team_id.eq.${workspaceId},team_id.is.null`)
        .order("created_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      // Get campaign → ad assignments
      const { data: campaignAdsData } = await (supabase as any)
        .from("campaign_ads")
        .select("campaign_id, ad_id");

      const campaignAdsMap = ((campaignAdsData ?? []) as { campaign_id: string; ad_id: string }[])
        .reduce<Record<string, string[]>>((acc, row) => {
          if (!acc[row.campaign_id]) acc[row.campaign_id] = [];
          acc[row.campaign_id].push(row.ad_id);
          return acc;
        }, {});

      // Aggregate insights via campaign_ads → ad_insights.ads_id
      // This ensures campaign KPIs always reflect the currently assigned ads' actual performance.
      const { data: insights, error: insightsError } = await (supabase as any)
        .from("ad_insights")
        .select("ads_id, impressions, reach, clicks, conversions, spend");

      if (insightsError) throw insightsError;

      const adInsightsMap = ((insights ?? []) as any[]).reduce<
        Record<string, { impressions: number; reach: number; clicks: number; conversions: number; spend: number }>
      >((acc, row) => {
        if (row.ads_id) {
          if (!acc[row.ads_id]) acc[row.ads_id] = { impressions: 0, reach: 0, clicks: 0, conversions: 0, spend: 0 };
          acc[row.ads_id].impressions += row.impressions || 0;
          acc[row.ads_id].reach += row.reach || 0;
          acc[row.ads_id].clicks += row.clicks || 0;
          acc[row.ads_id].conversions += row.conversions || 0;
          acc[row.ads_id].spend += Number(row.spend || 0);
        }
        return acc;
      }, {});

      const zero = { impressions: 0, reach: 0, clicks: 0, conversions: 0, spend: 0 };

      return (campaignsData ?? []).map((campaign: any) => {
        const adIds = campaignAdsMap[campaign.id] ?? [];
        const agg = adIds.reduce(
          (sum, adId) => {
            const m = adInsightsMap[adId];
            if (!m) return sum;
            return {
              impressions: sum.impressions + m.impressions,
              reach: sum.reach + m.reach,
              clicks: sum.clicks + m.clicks,
              conversions: sum.conversions + m.conversions,
              spend: sum.spend + m.spend,
            };
          },
          { ...zero },
        );
        return {
          ...campaign,
          ...agg,
          tags: campaign.campaign_tags?.map((ct: any) => ct.tags).filter(Boolean) || [],
          ad_account_name: (campaign.ad_accounts as any)?.account_name ?? null,
          ad_ids: adIds,
        };
      }) as CampaignWithInsights[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (input: CampaignInsert & { adIds?: string[] }) => {
      const { adIds = [], ...newCampaign } = input as any;

      const { data, error } = await supabase
        .from("campaigns")
        .insert({ ...newCampaign, team_id: workspaceId } as any)
        .select()
        .single();
      if (error) throw error;

      if (adIds.length > 0) {
        const { error: junctionError } = await (supabase as any)
          .from("campaign_ads")
          .insert(adIds.map((adId: string) => ({ campaign_id: data.id, ad_id: adId })));
        if (junctionError) throw junctionError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
      toast.success("สร้างแคมเปญสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถสร้างแคมเปญ: ${error.message}`);
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({
      id,
      updates,
      adIds,
    }: {
      id: string;
      updates: CampaignUpdate;
      adIds?: string[];
    }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      // Replace ad assignments when adIds is explicitly provided
      if (adIds !== undefined) {
        const { error: deleteError } = await (supabase as any)
          .from("campaign_ads")
          .delete()
          .eq("campaign_id", id);
        if (deleteError) throw deleteError;

        if (adIds.length > 0) {
          const { error: insertError } = await (supabase as any)
            .from("campaign_ads")
            .insert(adIds.map((adId) => ({ campaign_id: id, ad_id: adId })));
          if (insertError) throw insertError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
      toast.success("อัปเดตแคมเปญสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถอัปเดตแคมเปญ: ${error.message}`);
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", workspaceId] });
      toast.success("ลบแคมเปญสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถลบแคมเปญ: ${error.message}`);
    },
  });

  return {
    campaigns,
    isLoading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}
