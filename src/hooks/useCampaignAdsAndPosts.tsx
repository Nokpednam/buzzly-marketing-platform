import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import type { Database } from "@/integrations/supabase/types";

type AdRow = Database["public"]["Tables"]["ads"]["Row"];
type SocialPostRow = Database["public"]["Tables"]["social_posts"]["Row"];

export interface CampaignAd extends AdRow {
  ad_groups?: { id: string; name: string | null } | null;
}

export interface CampaignPost extends SocialPostRow {
  ad_groups?: { name: string | null } | null;
}

/**
 * Fetches ads and social posts associated with a campaign.
 * - Ads: from campaign_ads junction (ad_ids)
 * - Posts: social_posts in the same ad_groups as the campaign's ads
 */
export function useCampaignAdsAndPosts(
  campaignId: string | null | undefined,
  adIds: string[] | undefined
) {
  const { workspace } = useWorkspace();
  const workspaceId = workspace.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaign_ads_and_posts", campaignId, adIds?.join(",") ?? ""],
    enabled: !!workspaceId && !!campaignId && (adIds?.length ?? 0) > 0,
    queryFn: async () => {
      if (!workspaceId || !campaignId || !adIds?.length) {
        return { ads: [], posts: [] };
      }

      // 1. Fetch ads assigned to campaign
      const { data: adsData, error: adsError } = await supabase
        .from("ads")
        .select("*, ad_groups(id, name)")
        .in("id", adIds)
        .eq("team_id", workspaceId);

      if (adsError) throw adsError;
      const ads = (adsData ?? []) as CampaignAd[];

      // 2. Get ad_group_ids from campaign's ads
      const adGroupIds = [...new Set(ads.map((a) => a.ad_group_id).filter(Boolean))] as string[];

      if (adGroupIds.length === 0) {
        return { ads, posts: [] };
      }

      // 3. Fetch social_posts in those ad groups
      const { data: postsData, error: postsError } = await supabase
        .from("social_posts")
        .select("*, ad_groups(name)")
        .in("ad_group_id", adGroupIds)
        .eq("team_id", workspaceId)
        .order("scheduled_at", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      const posts = (postsData ?? []) as CampaignPost[];

      return { ads, posts };
    },
  });

  return {
    ads: data?.ads ?? [],
    posts: data?.posts ?? [],
    isLoading,
    error,
  };
}
