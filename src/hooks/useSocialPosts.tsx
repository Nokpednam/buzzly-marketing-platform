import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export type SocialPost = Database["public"]["Tables"]["social_posts"]["Row"];
export type SocialPostInsert = Database["public"]["Tables"]["social_posts"]["Insert"];
export type SocialPostUpdate = Database["public"]["Tables"]["social_posts"]["Update"];

export function useSocialPosts(dateRange?: string) {
  const queryClient = useQueryClient();

  // Calculate date filter based on dateRange
  const getDateFilter = () => {
    if (!dateRange) return null;
    const days = parseInt(dateRange);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["social_posts", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("social_posts")
        .select("*")
        .order("created_at", { ascending: false });

      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SocialPost[];
    },
  });

  const createPost = useMutation({
    mutationFn: async (newPost: SocialPostInsert) => {
      const { data, error } = await supabase
        .from("social_posts")
        .insert(newPost)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social_posts"] });
      toast.success("สร้างโพสต์สำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถสร้างโพสต์: ${error.message}`);
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SocialPostUpdate }) => {
      const { data, error } = await supabase
        .from("social_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social_posts"] });
      toast.success("อัปเดตโพสต์สำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถอัปเดตโพสต์: ${error.message}`);
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("social_posts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social_posts"] });
      toast.success("ลบโพสต์สำเร็จ");
    },
    onError: (error: Error) => {
      toast.error(`ไม่สามารถลบโพสต์: ${error.message}`);
    },
  });

  return {
    posts,
    isLoading,
    error,
    createPost,
    updatePost,
    deletePost,
  };
}
