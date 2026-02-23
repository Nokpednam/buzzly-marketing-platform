import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CustomerNotification {
    id: string;
    customer_id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    related_id: string | null;
    created_at: string;
}

export interface CollectedCoupon {
    id: string;
    customer_id: string;
    discount_id: string;
    collected_at: string;
    used_at: string | null;
    discounts?: {
        code: string;
        name: string | null;
        description: string | null;
        discount_type: "percent" | "fixed";
        discount_value: number;
        min_order_value: number;
        start_date: string | null;
        end_date: string | null;
    };
}

export function useCustomerCoupons() {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading: isLoadingNotifications } = useQuery({
        queryKey: ["customer_notifications"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await (supabase as any)
                .from("customer_notifications")
                .select("*")
                .eq("customer_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as CustomerNotification[];
        },
    });

    const { data: collectedCoupons = [], isLoading: isLoadingCoupons } = useQuery({
        queryKey: ["customer_coupons"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await (supabase as any)
                .from("customer_coupons")
                .select(`
                    *,
                    discounts (
                        code,
                        name,
                        description,
                        discount_type,
                        discount_value,
                        min_order_value,
                        start_date,
                        end_date
                    )
                `)
                .eq("customer_id", user.id)
                .order("collected_at", { ascending: false });

            if (error) throw error;
            return data as CollectedCoupon[];
        },
    });

    const markNotificationRead = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any)
                .from("customer_notifications")
                .update({ is_read: true })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customer_notifications"] });
        },
    });

    const collectCoupon = useMutation({
        mutationFn: async ({ discountId, notificationId }: { discountId: string, notificationId?: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Insert collection record directly.
            // The DB unique constraint on (customer_id, discount_id) prevents double-collect.
            // We skip the pre-flight SELECT because RLS might block customers from seeing
            // certain discount fields before collection.
            const { error: insertErr } = await (supabase as any)
                .from("customer_coupons")
                .insert({
                    customer_id: user.id,
                    discount_id: discountId,
                });

            // 23505 = already collected
            if (insertErr?.code === "23505") {
                throw new Error("You have already collected this coupon.");
            }
            // 23503 = foreign key violation (discount doesn't exist)
            if (insertErr?.code === "23503") {
                throw new Error("This discount is no longer available.");
            }
            if (insertErr) throw insertErr;

            // Mark notification as read
            if (notificationId) {
                await (supabase as any)
                    .from("customer_notifications")
                    .update({ is_read: true })
                    .eq("id", notificationId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customer_coupons"] });
            queryClient.invalidateQueries({ queryKey: ["customer_notifications"] });
            toast.success("Coupon collected successfully!");
        },
        onError: (err: any) => {
            toast.error(err.message ?? "Failed to collect coupon.");
        }
    });

    return {
        notifications,
        isLoadingNotifications,
        collectedCoupons,
        isLoadingCoupons,
        markNotificationRead,
        collectCoupon,
    };
}
