import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";

export interface LinkablePost {
  id: string;
  name: string | null;
  content: string | null;
  platform_id: string | null;
  status: string | null;
  scheduled_at: string | null;
  ad_group_id: string | null;
  post_channel: string | null;
}

export interface LinkableAd {
  id: string;
  name: string;
  status: string | null;
  headline: string | null;
  ad_group_id: string | null;
}

export function useLinkableItems(groupId: string) {
  const { workspace } = useWorkspace();

  const unlinkedPosts = useQuery({
    queryKey: ["linkable_posts_unlinked", workspace?.id],
    enabled: !!workspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_posts")
        .select("id, name, content, platform_id, status, scheduled_at, ad_group_id, post_channel")
        .eq("team_id", workspace!.id)
        .in("post_channel", ["social", "ad"])
        .is("ad_group_id", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LinkablePost[];
    },
  });

  const unlinkedAds = useQuery({
    queryKey: ["linkable_ads_unlinked", workspace?.id],
    enabled: !!workspace?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, name, status, headline, ad_group_id")
        .eq("team_id", workspace!.id)
        .is("ad_group_id", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LinkableAd[];
    },
  });

  const linkedPosts = useQuery({
    queryKey: ["linkable_posts_linked", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_posts")
        .select("id, name, content, platform_id, status, scheduled_at, ad_group_id, post_channel")
        .eq("team_id", workspace!.id)
        .eq("ad_group_id", groupId)
        .in("post_channel", ["social", "ad"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LinkablePost[];
    },
  });

  const linkedAds = useQuery({
    queryKey: ["linkable_ads_linked", groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, name, status, headline, ad_group_id")
        .eq("ad_group_id", groupId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LinkableAd[];
    },
  });

  return {
    unlinkedPosts: unlinkedPosts.data ?? [],
    unlinkedAds: unlinkedAds.data ?? [],
    linkedPosts: linkedPosts.data ?? [],
    linkedAds: linkedAds.data ?? [],
    isLoading:
      unlinkedPosts.isLoading ||
      unlinkedAds.isLoading ||
      linkedPosts.isLoading ||
      linkedAds.isLoading,
  };
}
