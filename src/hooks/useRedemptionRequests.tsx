import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { auditReward } from "@/lib/auditLogger";

export interface RedemptionRequest {
    id: string;
    user_id: string;
    reward_id: string;
    points_transaction_id: string | null;
    status: string;
    redemption_code: string | null;
    admin_notes: string | null;
    redeemed_at: string;
    fulfilled_at: string | null;
    customer?: {
        email: string | null;
        full_name: string | null;
    };
    reward_item?: {
        name: string;
        reward_type: string;
        points_cost: number;
    };
}

export function useRedemptionRequests() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["redemption-requests"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("reward_redemptions")
                .select(`
          *,
          customer:user_id(email, full_name),
          reward_item:reward_id(name, reward_type, points_cost)
        `)
                .order("redeemed_at", { ascending: false });

            if (error) {
                toast.error("An error occurred while fetching redemptions", {
                    description: error.message
                });
                throw error;
            }
            return (data as unknown as RedemptionRequest[]) ?? [];
        },
    });

    const updateRedemptionStatus = useMutation({
        mutationFn: async ({
            id,
            status,
            redemption_code,
            admin_notes
        }: {
            id: string;
            status: string;
            redemption_code?: string;
            admin_notes?: string;
        }) => {
            const updateData: any = { status };
            if (redemption_code !== undefined) updateData.redemption_code = redemption_code;
            if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
            if (status === 'fulfilled' || status === 'rejected') {
                updateData.fulfilled_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from("reward_redemptions")
                .update(updateData)
                .eq("id", id);
            if (error) throw error;
            if (status === "fulfilled" || status === "rejected") {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    if (status === "fulfilled") auditReward.supportFulfilled(user.id, id);
                    else auditReward.supportRejected(user.id, id);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["redemption-requests"] });
            toast.success("อัปเดตสถานะการแลกรางวัลสำเร็จ");
        },
        onError: (error: Error) => {
            toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ", { description: error.message });
        },
    });

    return {
        ...query,
        updateRedemptionStatus,
    };
}
