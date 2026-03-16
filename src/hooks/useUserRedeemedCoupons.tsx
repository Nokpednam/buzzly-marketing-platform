import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RedeemedCoupon {
    id: string;
    user_id: string;
    reward_item_id: string;
    coupon_code: string;
    status: "unused" | "used";
    redeemed_at: string;
    // Denormalized at insert time by the redeem_reward RPC
    user_email: string | null;
    customer_name: string | null;
    // Joined
    reward_item?: {
        name: string;
        description: string | null;
        points_cost: number;
        reward_type: string;
    };
}

// ─── Customer Hook ────────────────────────────────────────────────────────────

/**
 * Fetches the current (logged-in) customer's redeemed coupons.
 * RLS guarantees only their own rows are returned.
 */
export function useUserRedeemedCoupons() {
    return useQuery({
        queryKey: ["user-redeemed-coupons"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await (supabase as any)
                .from("user_redeemed_coupons")
                .select(`
                    *,
                    reward_item:reward_items (
                        name,
                        description,
                        points_cost,
                        reward_type
                    )
                `)
                .eq("user_id", user.id)
                .order("redeemed_at", { ascending: false });

            if (error) {
                console.error("[useUserRedeemedCoupons] Error:", error);
                return [];
            }
            return (data as RedeemedCoupon[]) ?? [];
        },
    });
}

// ─── Admin Hook ───────────────────────────────────────────────────────────────

/**
 * Admin-only: fetches ALL redeemed coupons across every customer.
 * Uses denormalized user_email + customer_name columns written by the RPC
 * so no complex auth.users join is required.
 * RLS allows employees to SELECT all rows.
 */
export function useAllRedeemedCoupons() {
    return useQuery({
        queryKey: ["admin-all-redeemed-coupons"],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from("user_redeemed_coupons")
                .select(`
                    *,
                    reward_item:reward_items (
                        name,
                        description,
                        points_cost,
                        reward_type
                    )
                `)
                .order("redeemed_at", { ascending: false });

            if (error) {
                console.error("[useAllRedeemedCoupons] Error:", error);
                throw error;
            }
            return (data as RedeemedCoupon[]) ?? [];
        },
    });
}
