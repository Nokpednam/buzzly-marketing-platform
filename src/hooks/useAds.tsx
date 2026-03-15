import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { useWorkspace } from "./useWorkspace";

export type Ad = Database["public"]["Tables"]["ads"]["Row"];
export type AdInsert = Database["public"]["Tables"]["ads"]["Insert"];
export type AdUpdate = Database["public"]["Tables"]["ads"]["Update"];

export interface AdPersonaLink {
  persona_id: string;
  customer_personas: {
    id: string;
    persona_name: string;
    avatar_url: string | null;
  } | null;
}

// Extends Ad with joined relations and fields not yet fully typed
export type AdWithPublishStatus = Ad & {
  ad_personas: AdPersonaLink[] | null;
};

export function useAds() {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  const { data: ads = [], isLoading, error } = useQuery({
    queryKey: ["ads", workspace?.id],
    enabled: !!workspace?.id,
    queryFn: async () => {
      if (!workspace?.id) return [];

      const { data, error } = await supabase
        .from("ads")
        .select("*, ad_personas(persona_id, customer_personas(id, persona_name, avatar_url))")
        .eq("team_id", workspace.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AdWithPublishStatus[];
    },
  });

  const createAd = useMutation({
    mutationFn: async (newAd: AdInsert) => {
      if (!workspace?.id) throw new Error("No active workspace");
      const { data, error } = await supabase
        .from("ads")
        .insert({ ...newAd, team_id: workspace.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      toast.success("สร้างโฆษณาสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถสร้างโฆษณา: ${error.message}`);
    },
  });

  const updateAd = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AdUpdate }) => {
      const { data, error } = await supabase
        .from("ads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
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
      queryClient.invalidateQueries({ queryKey: ["ads"] });
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
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      toast.success(`เผยแพร่โฆษณาบน ${platform} สำเร็จ`);
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
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
      queryClient.invalidateQueries({ queryKey: ["ads"] });
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
