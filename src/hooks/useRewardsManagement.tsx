import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RewardItem {
    id: string;
    name: string;
    description: string | null;
    reward_type: string;
    points_cost: number;
    stock_quantity: number | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export function useRewardsManagement() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["rewards-management"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("reward_items")
                .select("*")
                .order("created_at", { ascending: false })
                .order("id", { ascending: true });

            if (error) {
                toast.error("An error occurred while fetching rewards catalog", {
                    description: error.message
                });
                throw error;
            }
            return (data as unknown as RewardItem[]) ?? [];
        },
    });

    const toggleRewardStatus = useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { error } = await supabase
                .from("reward_items")
                .update({ is_active })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rewards-management"] });
        },
        onError: (error: Error) => {
            toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ", { description: error.message });
        },
    });

    const updateRewardItem = useMutation({
        mutationFn: async ({
            id,
            points_cost,
            stock_quantity
        }: {
            id: string;
            points_cost: number;
            stock_quantity: number | null;
        }) => {
            const { error } = await supabase
                .from("reward_items")
                .update({ points_cost, stock_quantity })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rewards-management"] });
            toast.success("อัปเดตของรางวัลสำเร็จ");
        },
        onError: (error: Error) => {
            toast.error("เกิดข้อผิดพลาดในการอัปเดต", { description: error.message });
        },
    });

    return {
        ...query,
        toggleRewardStatus,
        updateRewardItem,
    };
}
