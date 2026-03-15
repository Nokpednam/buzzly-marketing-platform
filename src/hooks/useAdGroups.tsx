import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { useWorkspace } from "./useWorkspace";

export type AdGroup = Database["public"]["Tables"]["ad_groups"]["Row"];
export type AdGroupInsert = Database["public"]["Tables"]["ad_groups"]["Insert"];
export type AdGroupUpdate = Database["public"]["Tables"]["ad_groups"]["Update"];

export interface AdGroupWithCount extends AdGroup {
  ads_count: number;
  posts_count: number;
}

export function useAdGroups() {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();

  const { data: adGroups = [], isLoading, error } = useQuery({
    queryKey: ["ad_groups", workspace?.id],
    enabled: !!workspace?.id,
    queryFn: async () => {
      if (!workspace?.id) return [];

      // Get ad groups
      const { data: groups, error: groupsError } = await supabase
        .from("ad_groups")
        .select("*")
        .eq("team_id", workspace.id)
        .order("created_at", { ascending: false });

      if (groupsError) throw groupsError;

      const [{ data: ads, error: adsError }, { data: posts, error: postsError }] =
        await Promise.all([
          supabase
            .from("ads")
            .select("ad_group_id")
            .eq("team_id", workspace.id),
          supabase
            .from("social_posts")
            .select("ad_group_id")
            .eq("team_id", workspace.id)
            .not("ad_group_id", "is", null),
        ]);

      if (adsError) throw adsError;
      if (postsError) throw postsError;

      const buildCountMap = (rows: { ad_group_id: string | null }[]) =>
        rows.reduce((acc, row) => {
          if (row.ad_group_id) {
            acc[row.ad_group_id] = (acc[row.ad_group_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

      const adsCountMap = buildCountMap(ads ?? []);
      const postsCountMap = buildCountMap(posts ?? []);

      return groups.map((group) => ({
        ...group,
        ads_count: adsCountMap[group.id] ?? 0,
        posts_count: postsCountMap[group.id] ?? 0,
      })) as AdGroupWithCount[];
    },
  });

  const createAdGroup = useMutation({
    mutationFn: async (newGroup: AdGroupInsert) => {
      if (!workspace?.id) throw new Error("No active workspace");
      const { data, error } = await supabase
        .from("ad_groups")
        .insert({ ...newGroup, team_id: workspace.id })
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

  const linkItemsToGroup = useMutation({
    mutationFn: async ({
      groupId,
      adIds,
      postIds,
    }: {
      groupId: string;
      adIds?: string[];
      postIds?: string[];
    }) => {
      const ops: Promise<unknown>[] = [];
      if (adIds && adIds.length > 0) {
        ops.push(
          supabase
            .from("ads")
            .update({ ad_group_id: groupId })
            .in("id", adIds)
            .then(({ error }) => { if (error) throw error; })
        );
      }
      if (postIds && postIds.length > 0) {
        ops.push(
          supabase
            .from("social_posts")
            .update({ ad_group_id: groupId })
            .in("id", postIds)
            .then(({ error }) => { if (error) throw error; })
        );
      }
      await Promise.all(ops);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad_groups"] });
      queryClient.invalidateQueries({ queryKey: ["social_posts"] });
      queryClient.invalidateQueries({ queryKey: ["social_calendar"] });
      toast.success("เชื่อมโยงรายการสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถเชื่อมโยงรายการ: ${error.message}`);
    },
  });

  const unlinkItemFromGroup = useMutation({
    mutationFn: async ({
      table,
      itemId,
    }: {
      table: "ads" | "social_posts";
      itemId: string;
    }) => {
      const { error } = await supabase
        .from(table)
        .update({ ad_group_id: null })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad_groups"] });
      queryClient.invalidateQueries({ queryKey: ["social_posts"] });
      queryClient.invalidateQueries({ queryKey: ["social_calendar"] });
      toast.success("ยกเลิกการเชื่อมโยงสำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถยกเลิกการเชื่อมโยง: ${error.message}`);
    },
  });

  return {
    adGroups,
    isLoading,
    error,
    createAdGroup,
    updateAdGroup,
    deleteAdGroup,
    linkItemsToGroup,
    unlinkItemFromGroup,
  };
}
