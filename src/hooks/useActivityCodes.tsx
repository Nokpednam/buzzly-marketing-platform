import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ActivityCode {
  id: string;
  action_code: string;
  name: string;
  description: string | null;
  reward_points: number;
  usage_limit: number | null;
  is_active: boolean;
  created_at: string;
}

export type CreateActivityCodeInput = Omit<ActivityCode, "id" | "created_at">;
export type UpdateActivityCodeInput = Partial<Omit<ActivityCode, "id" | "created_at" | "action_code">>;

const QUERY_KEY = "loyalty-activity-codes";

// ─── Read: fetch all (admin sees all, customer sees only active) ──────────────

export function useActivityCodes() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_activity_codes" as any)
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data as unknown as ActivityCode[]) ?? [];
    },
  });
}

// ─── Read: public (active only, for customer mission board) ──────────────────

export function useActiveActivityCodes() {
  return useQuery({
    queryKey: [QUERY_KEY, "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loyalty_activity_codes" as any)
        .select("*")
        .eq("is_active", true)
        .order("reward_points", { ascending: true });

      if (error) throw error;
      return (data as unknown as ActivityCode[]) ?? [];
    },
  });
}

// ─── Create ──────────────────────────────────────────────────────────────────

export function useCreateActivityCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateActivityCodeInput) => {
      const { data, error } = await supabase
        .from("loyalty_activity_codes" as any)
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ActivityCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Activity code created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create activity code", { description: error.message });
    },
  });
}

// ─── Update ──────────────────────────────────────────────────────────────────

export function useUpdateActivityCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateActivityCodeInput }) => {
      const { data, error } = await supabase
        .from("loyalty_activity_codes" as any)
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ActivityCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Activity code updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update activity code", { description: error.message });
    },
  });
}

// ─── Toggle active/inactive ───────────────────────────────────────────────────

export function useToggleActivityCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("loyalty_activity_codes" as any)
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(variables.is_active ? "Activity code enabled" : "Activity code disabled");
    },
    onError: (error: Error) => {
      toast.error("Failed to toggle activity code", { description: error.message });
    },
  });
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export function useDeleteActivityCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("loyalty_activity_codes" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Activity code deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete activity code", { description: error.message });
    },
  });
}
