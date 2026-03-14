import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { useWorkspace } from "./useWorkspace";

export type Ad = Database["public"]["Tables"]["ads"]["Row"];
export type AdInsert = Database["public"]["Tables"]["ads"]["Insert"];
export type AdUpdate = Database["public"]["Tables"]["ads"]["Update"];

// Extends Ad with fields added by migration 20260314000001 (not yet in generated types.ts)
export type AdWithPublishStatus = Ad & {
  platform: string | null;
  external_status: "pending" | "published" | "failed" | null;
  external_error: string | null;
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
        .select("*")
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
      queryClient.invalidateQueries({ queryKey: ["ads"] }); // refresh to show 'failed' state
      toast.error(`ไม่สามารถเผยแพร่โฆษณา: ${error.message}`);
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
  };
}
