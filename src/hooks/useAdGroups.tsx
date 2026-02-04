import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export type AdGroup = Database["public"]["Tables"]["ad_groups"]["Row"];
export type AdGroupInsert = Database["public"]["Tables"]["ad_groups"]["Insert"];
export type AdGroupUpdate = Database["public"]["Tables"]["ad_groups"]["Update"];

// Extended type with ads count
export interface AdGroupWithCount extends AdGroup {
  ads_count: number;
}

export function useAdGroups() {
  const queryClient = useQueryClient();

  const { data: adGroups = [], isLoading, error } = useQuery({
    queryKey: ["ad_groups"],
    queryFn: async () => {
      // Get ad groups
      const { data: groups, error: groupsError } = await supabase
        .from("ad_groups")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (groupsError) throw groupsError;

      // Get ads count for each group
      const { data: ads, error: adsError } = await supabase
        .from("ads")
        .select("ad_group_id");
      
      if (adsError) throw adsError;

      // Count ads per group
      const adsCountMap = ads?.reduce((acc, ad) => {
        if (ad.ad_group_id) {
          acc[ad.ad_group_id] = (acc[ad.ad_group_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      return groups.map(group => ({
        ...group,
        ads_count: adsCountMap[group.id] || 0,
      })) as AdGroupWithCount[];
    },
  });

  const createAdGroup = useMutation({
    mutationFn: async (newGroup: AdGroupInsert) => {
      const { data, error } = await supabase
        .from("ad_groups")
        .insert(newGroup)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad_groups"] });
      toast.success("สร้างกลุ่มโฆษณาสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถสร้างกลุ่มโฆษณา: ${error.message}`);
    },
  });

  const updateAdGroup = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AdGroupUpdate }) => {
      const { data, error } = await supabase
        .from("ad_groups")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad_groups"] });
      toast.success("อัปเดตกลุ่มโฆษณาสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถอัปเดตกลุ่มโฆษณา: ${error.message}`);
    },
  });

  const deleteAdGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ad_groups")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad_groups"] });
      toast.success("ลบกลุ่มโฆษณาสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถลบกลุ่มโฆษณา: ${error.message}`);
    },
  });

  return {
    adGroups,
    isLoading,
    error,
    createAdGroup,
    updateAdGroup,
    deleteAdGroup,
  };
}
