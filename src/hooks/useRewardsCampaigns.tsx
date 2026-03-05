import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PointEarningRule {
    id: string;
    action_code: string;
    name: string;
    description: string | null;
    points_reward: number;
    max_times_per_user: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export function useRewardsCampaigns() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["rewards-campaigns"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("point_earning_rules")
                .select("*")
                .order("created_at", { ascending: false })
                .order("id", { ascending: true });

            if (error) {
                toast.error("An error occurred while fetching campaigns", {
                    description: error.message
                });
                throw error;
            }
            return (data as unknown as PointEarningRule[]) ?? [];
        },
    });

    const toggleCampaignStatus = useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { error } = await supabase
                .from("point_earning_rules")
                .update({ is_active })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rewards-campaigns"] });
        },
        onError: (error: Error) => {
            toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ", { description: error.message });
        },
    });

    const createRule = useMutation({
        mutationFn: async (rule: {
            action_code: string;
            name: string;
            description: string | null;
            points_reward: number;
            max_times_per_user: number | null;
            is_active: boolean;
        }) => {
            const { error } = await supabase.from("point_earning_rules").insert(rule);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rewards-campaigns"] });
            toast.success("สร้างรหัสกิจกรรมสำเร็จ");
        },
        onError: (error: Error) => {
            const isDuplicate = error.message.includes("unique") || error.message.includes("duplicate");
            toast.error(
                isDuplicate ? "รหัสกิจกรรมนี้มีอยู่แล้วในระบบ" : "ไม่สามารถสร้างรหัสกิจกรรมได้",
                { description: isDuplicate ? "กรุณาใช้รหัสอื่น หรือกด Generate เพื่อสร้างรหัสใหม่" : error.message }
            );
        },
    });

    const updateRule = useMutation({
        mutationFn: async (rule: {
            id: string;
            name: string;
            description: string | null;
            points_reward: number;
            max_times_per_user: number | null;
            is_active: boolean;
        }) => {
            const { id, ...updates } = rule;
            const { error } = await supabase
                .from("point_earning_rules")
                .update(updates)
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rewards-campaigns"] });
            toast.success("อัปเดตรหัสกิจกรรมสำเร็จ");
        },
        onError: (error: Error) => {
            toast.error("เกิดข้อผิดพลาดในการอัปเดต", { description: error.message });
        },
    });

    const deleteRule = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("point_earning_rules")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rewards-campaigns"] });
            toast.success("ลบรหัสกิจกรรมสำเร็จ");
        },
        onError: (error: Error) => {
            toast.error("ไม่สามารถลบรหัสกิจกรรมได้", { description: error.message });
        },
    });

    return {
        ...query,
        toggleCampaignStatus,
        createRule,
        updateRule,
        deleteRule,
    };
}
