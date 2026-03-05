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

    const updateCampaignReward = useMutation({
        mutationFn: async ({ id, points_reward }: { id: string; points_reward: number }) => {
            const { error } = await supabase
                .from("point_earning_rules")
                .update({ points_reward })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rewards-campaigns"] });
            toast.success("อัปเดตแต้มรางวัลสำเร็จ");
        },
        onError: (error: Error) => {
            toast.error("เกิดข้อผิดพลาดในการอัปเดต", { description: error.message });
        },
    });

    return {
        ...query,
        toggleCampaignStatus,
        updateCampaignReward,
    };
}
