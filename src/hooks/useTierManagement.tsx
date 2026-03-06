import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TierHistoryEntry {
    id: string;
    user_id: string;
    previous_tier_id: string | null;
    new_tier_id: string;
    change_reason: string | null;
    changed_by: string | null;
    is_manual_override: boolean;
    created_at: string;
    // Joined
    customer?: { full_name: string | null; email: string | null };
    previous_tier?: { name: string } | null;
    new_tier?: { name: string };
    changer?: { full_name: string | null } | null;
}

export interface PointsTransaction {
    id: string;
    user_id: string;
    transaction_type: string;
    points_amount: number | null;
    balance_after: number | null;
    description: string | null;
    reference_id: string | null;
    created_at: string;
    // Joined
    customer?: { full_name: string | null; email: string | null };
}

export interface SuspiciousActivity {
    id: string;
    user_id: string;
    activity_type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string | null;
    metadata: Record<string, unknown> | null;
    is_resolved: boolean;
    resolved_by: string | null;
    resolved_at: string | null;
    resolution_notes: string | null;
    created_at: string;
    // Joined
    customer?: { full_name: string | null; email: string | null };
}

export interface CustomerSearchResult {
    id: string;
    full_name: string | null;
    email: string | null;
    loyalty_tier: string | null;
    loyalty_points_balance: number | null;
    total_spend: number | null;
    created_at: string;
}

export const ADMIN_PAGE_SIZE = 8;
export const ALERTS_PAGE_SIZE = 5;

// ─── Tier History ─────────────────────────────────────────────────────────────

export function useTierHistory(page = 0) {
    return useQuery({
        queryKey: ["tier-history", page],
        queryFn: async () => {
            const from = page * ADMIN_PAGE_SIZE;
            const to = from + ADMIN_PAGE_SIZE; // Fetch one extra to check if next exists

            // FKs to customer were added in migration 20260224000002_add_loyalty_fks.sql.
            // Try the full query with customer join first; fall back to tier-only query if
            // the FK relationship is not found in PostgREST's schema cache (PGRST200).
            const { data, error } = await supabase
                .from("tier_history")
                .select(
                    `*,
                    previous_tier:loyalty_tiers!tier_history_previous_tier_id_fkey(name),
                    new_tier:loyalty_tiers!tier_history_new_tier_id_fkey(name),
                    customer:customer!tier_history_user_id_fkey(full_name, email),
                    changer:customer!tier_history_changed_by_fkey(full_name)`
                )
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) {
                // PGRST200 = "Could not find a relationship" — FK not yet in schema cache
                if (error.code === "PGRST200" || error.message?.includes("Could not find a relationship")) {
                    const { data: fallback, error: fallbackError } = await supabase
                        .from("tier_history")
                        .select(
                            `*,
                            previous_tier:loyalty_tiers!tier_history_previous_tier_id_fkey(name),
                            new_tier:loyalty_tiers!tier_history_new_tier_id_fkey(name)`
                        )
                        .order("created_at", { ascending: false })
                        .range(from, to);
                    if (fallbackError) throw fallbackError;
                    return (fallback as unknown as TierHistoryEntry[]) ?? [];
                }
                throw error;
            }
            return (data as unknown as TierHistoryEntry[]) ?? [];
        },
        placeholderData: keepPreviousData,
    });
}

// ─── Points Transactions ──────────────────────────────────────────────────────

export function usePointsTransactions(page = 0) {
    return useQuery({
        queryKey: ["points-transactions-admin", page],
        queryFn: async () => {
            const from = page * ADMIN_PAGE_SIZE;
            const to = from + ADMIN_PAGE_SIZE; // Fetch one extra to check if next exists

            // FK to customer added in migration 20260224000002_add_loyalty_fks.sql.
            // Fall back to basic query if the FK relationship is not in PostgREST schema cache.
            const { data, error } = await supabase
                .from("points_transactions")
                .select(`*, customer:customer!points_transactions_user_id_fkey(full_name, email)`)
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) {
                if (error.code === "PGRST200" || error.message?.includes("Could not find a relationship")) {
                    const { data: fallback, error: fallbackError } = await supabase
                        .from("points_transactions")
                        .select("*")
                        .order("created_at", { ascending: false })
                        .range(from, to);
                    if (fallbackError) throw fallbackError;
                    return (fallback as unknown as PointsTransaction[]) ?? [];
                }
                throw error;
            }
            return (data as unknown as PointsTransaction[]) ?? [];
        },
        placeholderData: keepPreviousData,
    });
}

// ─── Suspicious Activities ────────────────────────────────────────────────────

export function useSuspiciousActivities(page = 0) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["suspicious-activities", page],
        queryFn: async () => {
            const from = page * ALERTS_PAGE_SIZE;
            const to = from + ALERTS_PAGE_SIZE; // Fetch one extra to check if next exists

            // No FK from user_id to customer — fetch without join.
            const { data, error } = await supabase
                .from("suspicious_activities")
                .select("*")
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) throw error;
            return (data as unknown as SuspiciousActivity[]) ?? [];
        },
        placeholderData: keepPreviousData,
    });

    const { data: unresolvedCount = 0 } = useQuery({
        queryKey: ["unresolved-activities-count"],
        queryFn: async () => {
            const { count, error } = await supabase
                .from("suspicious_activities")
                .select("*", { count: 'exact', head: true })
                .eq("is_resolved", false);

            if (error) throw error;
            return count ?? 0;
        },
    });

    const resolveActivity = useMutation({
        mutationFn: async ({
            activityId,
            notes,
        }: {
            activityId: string;
            notes?: string;
        }) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            const { error } = await supabase
                .from("suspicious_activities")
                .update({
                    is_resolved: true,
                    resolved_by: user?.id ?? null,
                    resolved_at: new Date().toISOString(),
                    resolution_notes: notes ?? "Resolved by admin",
                })
                .eq("id", activityId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suspicious-activities"] });
            queryClient.invalidateQueries({ queryKey: ["unresolved-activities-count"] });
            toast.success("ทำเครื่องหมายว่าแก้ไขแล้ว");
        },
        onError: (error: Error) => {
            toast.error("เกิดข้อผิดพลาด", { description: error.message });
        },
    });

    const suspendCustomer = useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await supabase
                .from("customer")
                .update({ status: "suspended" } as any)
                .eq("id", userId);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("ระงับบัญชีผู้ใช้แล้ว");
        },
        onError: (error: Error) => {
            toast.error("ไม่สามารถระงับบัญชีได้", { description: error.message });
        },
    });

    return { ...query, unresolvedCount, resolveActivity, suspendCustomer };
}

// ─── Customer Search ──────────────────────────────────────────────────────────

export function useCustomerSearch() {
    const [query, setQuery] = useState("");

    const searchResult = useQuery({
        queryKey: ["customer-search", query],
        queryFn: async () => {
            if (!query || query.trim().length < 2) return [];

            // Query customer table directly — has loyalty_tier_id FK to loyalty_tiers,
            // loyalty_points_balance, and total_spend_amount as direct columns.
            // Avoid id.eq.${query} which crashes Postgres when query is not a valid UUID.
            const { data, error } = await supabase
                .from("customer")
                .select(`
                    id, full_name, email, created_at,
                    loyalty_points_balance, total_spend_amount,
                    loyalty_tier:loyalty_tiers!profiles_loyalty_tier_id_fkey(name)
                `)
                .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
                .limit(10);

            if (error) throw error;

            const results: CustomerSearchResult[] = (data ?? []).map(c => ({
                id: c.id,
                full_name: c.full_name,
                email: c.email,
                created_at: c.created_at,
                loyalty_tier: (c.loyalty_tier as any)?.name ?? null,
                loyalty_points_balance: c.loyalty_points_balance ?? 0,
                total_spend: c.total_spend_amount ?? 0,
            }));

            return results;
        },
        enabled: query.trim().length >= 2,
    });

    return { query, setQuery, ...searchResult };
}

// ─── Manual Tier Override ─────────────────────────────────────────────────────

export function useManualTierOverride() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            newTierName,
            reason,
        }: {
            userId: string;
            newTierName: string;
            reason: string;
        }) => {
            const {
                data: { user: adminUser },
            } = await supabase.auth.getUser();

            // Get the new tier ID
            const { data: tierData, error: tierError } = await supabase
                .from("loyalty_tiers")
                .select("id")
                .eq("name", newTierName)
                .maybeSingle();

            if (tierError) throw tierError;
            if (!tierData) throw new Error(`Tier "${newTierName}" not found`);

            // Get customer's current tier for history record
            const { data: currentCustomer } = await supabase
                .from("customer")
                .select("loyalty_tier_id")
                .eq("id", userId)
                .maybeSingle();

            // Update customer.loyalty_tier_id directly
            const { error: updateError } = await supabase
                .from("customer")
                .update({ loyalty_tier_id: tierData.id })
                .eq("id", userId);

            if (updateError) throw updateError;

            // Record tier change history
            const { error: historyError } = await supabase
                .from("tier_history")
                .insert({
                    user_id: userId,
                    previous_tier_id: currentCustomer?.loyalty_tier_id ?? null,
                    new_tier_id: tierData.id,
                    change_reason: reason,
                    changed_by: adminUser?.id ?? null,
                    is_manual_override: true,
                });

            if (historyError) throw historyError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customer-search"] });
            queryClient.invalidateQueries({ queryKey: ["tier-history"] });
            toast.success("อัปเดต Tier สำเร็จ");
        },
        onError: (error: Error) => {
            toast.error("อัปเดตไม่สำเร็จ", { description: error.message });
        },
    });
}

// ─── Manual Point Adjustment ──────────────────────────────────────────────────

export function useManualPointAdjustment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            pointsToAdjust,
            reason,
        }: {
            userId: string;
            pointsToAdjust: number;
            reason: string;
        }) => {
            if (pointsToAdjust === 0) throw new Error("คะแนนที่ปรับต้องไม่เป็น 0");

            const { data: profile } = await supabase
                .from("profile_customers")
                .select(`id, loyalty_points(id, point_balance)`)
                .eq("user_id", userId)
                .maybeSingle();

            if (!profile || !profile.loyalty_points) {
                throw new Error("ไม่พบข้อมูลคะแนนสะสมของลูกค้ารายนี้");
            }

            const lpInfo = Array.isArray(profile.loyalty_points) ? profile.loyalty_points[0] : profile.loyalty_points;

            // Adjust balance ensuring it does not drop below 0
            const newBalance = Math.max(0, (lpInfo.point_balance || 0) + pointsToAdjust);

            // Update balance
            const { error: updateError } = await supabase
                .from("loyalty_points")
                .update({ point_balance: newBalance })
                .eq("id", lpInfo.id);

            if (updateError) throw updateError;

            // Log point transaction
            const {
                data: { user: adminUser },
            } = await supabase.auth.getUser();

            const { error: txError } = await supabase
                .from("points_transactions")
                .insert({
                    user_id: userId,
                    loyalty_points_id: lpInfo.id,
                    transaction_type: pointsToAdjust > 0 ? "bonus" : "adjustment",
                    points_amount: Math.abs(pointsToAdjust),
                    balance_after: newBalance,
                    description: `Manual Adjustment: ${reason}`,
                    created_by_user_id: adminUser?.id ?? null,
                });

            if (txError) throw txError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customer-search"] });
            queryClient.invalidateQueries({ queryKey: ["points-transactions-admin"] });
            toast.success("อัปเดตคะแนนสะสมสำเร็จ");
        },
        onError: (error: Error) => {
            toast.error("แก้ไขคะแนนไม่สำเร็จ", { description: error.message });
        },
    });
}
