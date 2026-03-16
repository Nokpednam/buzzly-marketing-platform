import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { useWorkspace } from "./useWorkspace";
import { invalidateSocialRealtimeQueries } from "@/lib/socialQueryInvalidation";

export type Ad = Database["public"]["Tables"]["ads"]["Row"];
export type AdInsert = Database["public"]["Tables"]["ads"]["Insert"];
export type AdUpdate = Database["public"]["Tables"]["ads"]["Update"];
export const adsKeys = {
  all: ["ads"] as const,
  list: (workspaceId?: string) => ["ads", workspaceId] as const,
};

export interface AdPersonaLink {
  persona_id: string;
  customer_personas: {
    id: string;
    persona_name: string;
    avatar_url: string | null;
  } | null;
}

export interface AdGroupSummary {
  id: string;
  name: string;
}

type ExtendedAdInsert = AdInsert & {
  budget?: number | null;
};

type ExtendedAdUpdate = AdUpdate & {
  budget?: number | null;
};

// Extends Ad with joined relations and fields not yet fully typed
export type AdWithPublishStatus = Ad & {
  ad_groups?: AdGroupSummary | null;
  ad_personas: AdPersonaLink[] | null;
  budget?: number | null;
};

export function useAds() {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  const { data: ads = [], isLoading, error } = useQuery({
    queryKey: adsKeys.list(workspace?.id),
    enabled: !!workspace?.id,
    queryFn: async () => {
      if (!workspace?.id) return [];

      const { data, error } = await supabase
        .from("ads")
        .select(
          "*, ad_groups(id, name), ad_personas(persona_id, customer_personas(id, persona_name, avatar_url))"
        )
        .eq("team_id", workspace.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdWithPublishStatus[];
    },
  });

  const createAd = useMutation({
    mutationFn: async (newAd: ExtendedAdInsert) => {
      if (!workspace?.id) throw new Error("No active workspace");
      const payload = { ...newAd, team_id: workspace.id } as unknown as AdInsert;
      const { data, error } = await supabase
        .from("ads")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void invalidateSocialRealtimeQueries(queryClient);
      toast.success("สร้างโฆษณาสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถสร้างโฆษณา: ${error.message}`);
    },
  });

  const updateAd = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ExtendedAdUpdate }) => {
      const payload = updates as unknown as AdUpdate;
      const { data, error } = await supabase
        .from("ads")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void invalidateSocialRealtimeQueries(queryClient);
      toast.success("อัปเดตโฆษณาสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถอัปเดตโฆษณา: ${error.message}`);
    },
  });

  const createAdWithMirrorPost = useMutation({
    mutationFn: async (
      input: ExtendedAdInsert & { platform_id?: string | null }
    ) => {
      if (!workspace?.id) throw new Error("No active workspace");
      const { platform_id, budget, ...adFields } = input as ExtendedAdInsert & {
        platform_id?: string | null;
      };
      const { data, error } = await (supabase as any).rpc(
        "create_ad_with_mirror_post",
        {
          p_team_id:        workspace.id,
          p_name:           adFields.name,
          p_status:         (adFields.status as string) ?? "draft",
          p_creative_type:  (adFields as any).creative_type ?? "image",
          p_headline:       (adFields as any).headline ?? null,
          p_ad_copy:        (adFields as any).ad_copy ?? null,
          p_call_to_action: (adFields as any).call_to_action ?? null,
          p_content:        adFields.content ?? null,
          p_media_urls:     adFields.media_urls ?? null,
          p_scheduled_at:   (adFields as any).scheduled_at ?? null,
          p_ad_group_id:    adFields.ad_group_id ?? null,
          p_platform_id:    platform_id ?? null,
          p_creative_url:   (adFields as any).creative_url ?? "/placeholder.svg",
          p_platform_ad_id: (adFields as any).platform_ad_id ?? null,
          p_preview_url:    (adFields as any).preview_url ?? null,
          p_budget:         budget ?? null,
        }
      ) as { data: Ad | null; error: { message: string } | null };
      if (error) throw new Error(error.message);
      return data as Ad;
    },
    onSuccess: () => {
      void invalidateSocialRealtimeQueries(queryClient);
      toast.success("สร้างโฆษณาสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถสร้างโฆษณา: ${error.message}`);
    },
  });

  const deleteAd = useMutation({
    mutationFn: async (id: string) => {
      // Delete the calendar mirror row first (no FK from social_posts → ads,
      // so order doesn't matter for integrity, but this is explicit cleanup).
      // Rows created before this fix won't have a mirror — the DELETE simply
      // affects 0 rows, which is not an error.
      await supabase
        .from("social_posts")
        .delete()
        .eq("id", id)
        .eq("post_channel", "ad");

      const { error } = await supabase
        .from("ads")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void invalidateSocialRealtimeQueries(queryClient);
      toast.success("ลบโฆษณาสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถลบโฆษณา: ${error.message}`);
    },
  });

  const publishAd = useMutation({
    mutationFn: async ({ adId, platform }: { adId: string; platform: string }) => {
      const { data, error } = await supabase.functions.invoke("create-platform-ad", {
        body: { ad_id: adId, platform },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data as { success: boolean; platform_ad_id: string; status: string };
    },
    onSuccess: (_data, { platform }) => {
      void invalidateSocialRealtimeQueries(queryClient);
      toast.success(`เผยแพร่โฆษณาบน ${platform} สำเร็จ`);
    },
    onError: (error: Error) => {
      void invalidateSocialRealtimeQueries(queryClient);
      toast.error(`ไม่สามารถเผยแพร่โฆษณา: ${error.message}`);
    },
  });

  /**
   * Replace all persona links for an ad in one operation.
   * Deletes existing rows then inserts the new set.
   */
  const linkPersonas = useMutation({
    mutationFn: async ({ adId, personaIds }: { adId: string; personaIds: string[] }) => {
      const { error: deleteError } = await supabase
        .from("ad_personas")
        .delete()
        .eq("ad_id", adId);
      if (deleteError) throw deleteError;

      if (personaIds.length === 0) return;

      const { error: insertError } = await supabase
        .from("ad_personas")
        .insert(personaIds.map((persona_id) => ({ ad_id: adId, persona_id })));
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      void invalidateSocialRealtimeQueries(queryClient);
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถลิงก์ Persona: ${error.message}`);
    },
  });

  return {
    ads,
    isLoading,
    error,
    createAd,
    createAdWithMirrorPost,
    updateAd,
    deleteAd,
    publishAd,
    linkPersonas,
  };
}
