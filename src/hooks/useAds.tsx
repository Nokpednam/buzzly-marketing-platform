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

  const deleteAd = useMutation({
    mutationFn: async (id: string) => {
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
    updateAd,
    deleteAd,
    publishAd,
    linkPersonas,
  };
}
