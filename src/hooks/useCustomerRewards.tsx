import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type RewardItem } from "./useRewardsManagement";
import { type PointEarningRule } from "./useRewardsCampaigns";

export interface CustomerLoyaltyStats {
    id: string;
    point_balance: number;
    tier_name: string;
    total_points_earned: number;
}

export function useCustomerRewards() {
    const queryClient = useQueryClient();

    const activeCatalogQuery = useQuery({
        queryKey: ["customer-rewards-catalog"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("reward_items")
                .select("*")
                .eq("is_active", true)
                .order("points_cost", { ascending: true });

            if (error) throw error;
            return (data as unknown as RewardItem[]) ?? [];
        },
    });

    const activeCampaignsQuery = useQuery({
        queryKey: ["customer-active-campaigns"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("point_earning_rules")
                .select("*")
                .eq("is_active", true)
                .order("points_reward", { ascending: false });

            if (error) throw error;
            return (data as unknown as PointEarningRule[]) ?? [];
        },
    });

    const customerStatsQuery = useQuery({
        queryKey: ["customer-loyalty-stats"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data: profile } = await supabase
                .from("profile_customers")
                .select(`
          loyalty_points (
            id,
            point_balance,
            total_points_earned,
            loyalty_tiers (name)
          )
        `)
                .eq("user_id", user.id)
                .maybeSingle();

            if (!profile?.loyalty_points) return null;

            const lpInfo = Array.isArray(profile.loyalty_points) ? profile.loyalty_points[0] : profile.loyalty_points;

            return {
                id: lpInfo.id,
                point_balance: lpInfo.point_balance ?? 0,
                total_points_earned: lpInfo.total_points_earned ?? 0,
                tier_name: lpInfo.loyalty_tiers?.name ?? "Bronze",
            } as CustomerLoyaltyStats;
        },
    });

    const redeemReward = useMutation({
        mutationFn: async (rewardItem: RewardItem) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Verify balance
            const stats = queryClient.getQueryData<CustomerLoyaltyStats | null>(["customer-loyalty-stats"]);
            if (!stats) throw new Error("Could not find loyalty stats");
            if (stats.point_balance < rewardItem.points_cost) {
                throw new Error("คะแนนสะสมไม่เพียงพอ");
            }

            // Check stock
            if (rewardItem.stock_quantity !== null && rewardItem.stock_quantity <= 0) {
                throw new Error("ของรางวัลชิ้นนี้หมดแล้ว");
            }

            // 1. Log points_transactions (deduction)
            const { data: tx, error: txError } = await supabase
                .from("points_transactions")
                .insert({
                    user_id: user.id,
                    loyalty_points_id: stats.id,
                    transaction_type: "spend",
                    points_amount: rewardItem.points_cost,
                    balance_after: stats.point_balance - rewardItem.points_cost,
                    description: `Redeemed: ${rewardItem.name}`,
                })
                .select("id")
                .single();

            if (txError) throw txError;

            // 2. Create reward_redemptions
            const { error: redemptionError } = await supabase
                .from("reward_redemptions")
                .insert({
                    user_id: user.id,
                    reward_id: rewardItem.id,
                    points_transaction_id: tx.id,
                    status: "pending",
                });

            if (redemptionError) throw redemptionError;

            // 3. Deduct stock quantity if limited
            if (rewardItem.stock_quantity !== null) {
                const { error: updateError } = await supabase
                    .from("reward_items")
                    .update({ stock_quantity: rewardItem.stock_quantity - 1 })
                    .eq("id", rewardItem.id);

                if (updateError) throw updateError;
            }

            // NOTE: Database Trigger or Backend service should ultimately be responsible for
            // deducting point_balance in loyalty_points table concurrently safely, 
            // but for optimistic approach we can let the backend handle the reduction of point balance
            // We will trigger a refetch of stats
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customer-loyalty-stats"] });
            queryClient.invalidateQueries({ queryKey: ["customer-rewards-catalog"] });
            toast.success("แลกของรางวัลสำเร็จ โปรดรอแอดมินดำเนินการ");
        },
        onError: (error: Error) => {
            toast.error("เกิดข้อผิดพลาดในการแลกของรางวัล", { description: error.message });
        },
    });

    const completedRulesQuery = useQuery({
        queryKey: ["customer-completed-rules"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from("user_completed_rules")
                .select("rule_id")
                .eq("user_id", user.id);

            if (error) throw error;

            // Group by rule_id to get times_completed
            const ruleCounts: Record<string, number> = {};
            data.forEach(row => {
                ruleCounts[row.rule_id] = (ruleCounts[row.rule_id] || 0) + 1;
            });

            return Object.entries(ruleCounts).map(([rule_id, times_completed]) => ({
                rule_id,
                times_completed,
            }));
        },
    });

    return {
        catalog: activeCatalogQuery,
        campaigns: activeCampaignsQuery,
        stats: customerStatsQuery,
        completedRules: completedRulesQuery,
        redeemReward,
    };
}
