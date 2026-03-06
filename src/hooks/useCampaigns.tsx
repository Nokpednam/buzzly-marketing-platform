import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { useWorkspace } from "@/hooks/useWorkspace";

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

      // Get aggregated insights per campaign
      const { data: insights, error: insightsError } = await supabase
        .from("ad_insights")
        .select("campaign_id, impressions, reach, clicks, conversions, spend");

      if (insightsError) throw insightsError;

      // Aggregate insights by campaign
      const insightsMap = insights?.reduce((acc, insight) => {
        if (insight.campaign_id) {
          if (!acc[insight.campaign_id]) {
            acc[insight.campaign_id] = { impressions: 0, reach: 0, clicks: 0, conversions: 0, spend: 0 };
          }
          acc[insight.campaign_id].impressions += insight.impressions || 0;
          acc[insight.campaign_id].reach += insight.reach || 0;
          acc[insight.campaign_id].clicks += insight.clicks || 0;
          acc[insight.campaign_id].conversions += insight.conversions || 0;
          acc[insight.campaign_id].spend += Number(insight.spend || 0);
        }
        return acc;
      }, {} as Record<string, { impressions: number; reach: number; clicks: number; conversions: number; spend: number }>) || {};

      return (campaignsData ?? []).map((campaign: any) => ({
        ...campaign,
        impressions: insightsMap[campaign.id]?.impressions || 0,
        reach: insightsMap[campaign.id]?.reach || 0,
        clicks: insightsMap[campaign.id]?.clicks || 0,
        conversions: insightsMap[campaign.id]?.conversions || 0,
        spend: insightsMap[campaign.id]?.spend || 0,
        tags: campaign.campaign_tags?.map((ct: any) => ct.tags).filter(Boolean) || [],
        ad_account_name: (campaign.ad_accounts as any)?.account_name ?? null,
      })) as CampaignWithInsights[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (newCampaign: CampaignInsert) => {
      const { data, error } = await supabase
        .from("campaigns")
        .insert({ ...newCampaign, team_id: workspaceId } as any)
        .select()
        .single();
      if (error) throw error;
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
    mutationFn: async ({ id, updates }: { id: string; updates: CampaignUpdate }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
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
