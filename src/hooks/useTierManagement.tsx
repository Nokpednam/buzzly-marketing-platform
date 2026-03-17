import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

export const ADMIN_PAGE_SIZE = 8;
export const ALERTS_PAGE_SIZE = 5;

/** Row from the new loyalty_tier_history table (simple denormalized log) */
export interface LoyaltyTierHistoryEntry {
    id: string;
    profile_customer_id: string;
    old_tier: string | null;
    new_tier: string;
    changed_at: string;
    /** 'auto' = written by system trigger; 'manual' = written by admin override */
    change_type: 'auto' | 'manual';
    change_reason?: string | null;
    changer_id?: string | null;
    // Joined
    customer?: { full_name: string | null; email: string | null } | null;
    changer?: { full_name: string | null; email: string | null } | null;
}


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
    previous_tier?: { name: string; priority_level: number } | null;
    new_tier?: { name: string; priority_level: number };
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


// ─── Loyalty Tier History (new simple table) ──────────────────────────────────

export function useLoyaltyTierHistory(page = 0) {
    return useQuery({
        queryKey: ["loyalty-tier-history", page],
        queryFn: async () => {
            const from = page * ADMIN_PAGE_SIZE;
            const to = from + ADMIN_PAGE_SIZE;

            // Only show auto-logged changes (change_type='auto') in the Auto-Log section.
            const { data, error } = await (supabase as any)
                .from("loyalty_tier_history")
                .select('*, customer:profile_customers!loyalty_tier_history_profile_customer_id_fkey(first_name, last_name, user_id)')
                .eq('change_type', 'auto')
                .order("changed_at", { ascending: false })
                .range(from, to);

            if (error) throw error;
            return (data as unknown as LoyaltyTierHistoryEntry[]) ?? [];
        },
        placeholderData: keepPreviousData,
    });
}

// ─── Loyalty Tier History (Manual Overrides) ──────────────────────────────────

export function useLoyaltyTierHistoryManual(page = 0) {
    return useQuery({
        queryKey: ["loyalty-tier-history-manual", page],
        queryFn: async () => {
            const from = page * ADMIN_PAGE_SIZE;
            const to = from + ADMIN_PAGE_SIZE;

            const { data, error } = await (supabase as any)
                .from("loyalty_tier_history")
                .select('*, customer:profile_customers!loyalty_tier_history_profile_customer_id_fkey(first_name, last_name, user_id)')
                .eq('change_type', 'manual')
                .order("changed_at", { ascending: false })
                .range(from, to);

            if (error) throw error;
            return (data as unknown as LoyaltyTierHistoryEntry[]) ?? [];
        },
        placeholderData: keepPreviousData,
    });
}



// ─── Tier History (legacy complex table) ─────────────────────────────────────

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
                    previous_tier:loyalty_tiers!tier_history_previous_tier_id_fkey(name, priority_level),
                    new_tier:loyalty_tiers!tier_history_new_tier_id_fkey(name, priority_level),
                    customer:customer!tier_history_user_id_fkey(full_name, email),
                    changer:customer!tier_history_changed_by_fkey(full_name)`
                )
                .not("previous_tier_id", "is", null)
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) {
                // PGRST200 = "Could not find a relationship" — FK not yet in schema cache
                if (error.code === "PGRST200" || error.message?.includes("Could not find a relationship")) {
                    const { data: fallback, error: fallbackError } = await supabase
                        .from("tier_history")
                        .select(
                            `*,
                            previous_tier:loyalty_tiers!tier_history_previous_tier_id_fkey(name, priority_level),
                            new_tier:loyalty_tiers!tier_history_new_tier_id_fkey(name, priority_level)`
                        )
                        .not("previous_tier_id", "is", null)
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

            // Query profile_customers table directly since it now has employee RLS.
            // This avoids complicated views that can cause schema cache misses (PGRST200).
            const { data, error } = await supabase
                .from("profile_customers")
                .select(`
                    id, 
                    user_id,
                    first_name, 
                    last_name, 
                    created_at,
                    loyalty_points(
                        point_balance,
                        loyalty_tiers(name)
                    )
                `)
                .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
                .limit(10);

            if (error) {
                console.error("customer search error", error);
                throw error;
            }

            const results: CustomerSearchResult[] = ((data ?? []) as any[]).map((c: any) => {
                const lp = c.loyalty_points?.[0] || c.loyalty_points;
                const tierName = lp?.loyalty_tiers?.name || null;
                const fullName = [c.first_name, c.last_name].filter(Boolean).join(" ") || null;

                return {
                    id: c.user_id, // Important: id must be user_id (UUID from auth) for the override RPC
                    full_name: fullName,
                    email: c.email || `${c.user_id.slice(0, 8)}@...`, // email not in profile_customers, fallback visually
                    created_at: c.created_at,
                    loyalty_tier: tierName,
                    loyalty_points_balance: lp?.point_balance ?? 0,
                    total_spend: 0, // Fallback, total spend not easily accessible here without a join
                };
            });

            return results;
        },
        enabled: query.trim().length >= 2,
    });

    return { query, setQuery, ...searchResult };
}

// ─── All Customers (God-Mode Dropdown) ───────────────────────────────────────

/**
 * Fetches ALL customers from profile_customers for the God-Mode Manual Tier
 * Adjustment dropdown. Employees only (enforced via RLS policy
 * "employees_can_read_all_profile_customers").
 * Returns up to 200 customers ordered by first name; the dropdown is
 * filtered client-side by the user's search input.
 */
export function useAllCustomers() {
    return useQuery({
        queryKey: ["all-customers-dropdown"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profile_customers")
                .select(`
                    id,
                    user_id,
                    first_name,
                    last_name,
                    created_at,
                    loyalty_points(
                        point_balance,
                        loyalty_tiers(name)
                    )
                `)
                .order("first_name", { ascending: true })
                .limit(200);

            if (error) {
                console.error("[useAllCustomers] Error:", error);
                throw error;
            }

            const results: CustomerSearchResult[] = ((data ?? []) as any[]).map((c: any) => {
                const lp = c.loyalty_points?.[0] || c.loyalty_points;
                const tierName = lp?.loyalty_tiers?.name || null;
                const fullName = [c.first_name, c.last_name].filter(Boolean).join(" ") || null;

                return {
                    id: c.user_id, // user_id (auth UUID) — required by manual_override_customer_tier RPC
                    full_name: fullName,
                    email: `${c.user_id.slice(0, 8)}@...`, // email not stored in profile_customers
                    created_at: c.created_at,
                    loyalty_tier: tierName,
                    loyalty_points_balance: lp?.point_balance ?? 0,
                    total_spend: 0,
                };
            });

            return results;
        },
        staleTime: 60_000, // cache for 1 min — this is a heavy query
    });
}

// ─── Manual Tier Override ─────────────────────────────────────────────────────

/**
 * Calls the manual_override_customer_tier RPC — atomic, employee-only.
 * The RPC updates loyalty_points.loyalty_tier_id and inserts a 'manual' row
 * into loyalty_tier_history in a single DB transaction.
 *
 * Parameters accepted by the hook:
 *   userId      — the target customer's auth.uid (= customer.id)
 *   newTierName — human-readable tier name ('Bronze' | 'Silver' | 'Gold' | 'Platinum')
 *   reason      — free-text override reason logged in tier_history
 */
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
            // 1. Resolve tier name → tier ID
            const { data: tierData, error: tierError } = await supabase
                .from("loyalty_tiers")
                .select("id")
                .eq("name", newTierName)
                .maybeSingle();

            if (tierError) throw tierError;
            if (!tierData) throw new Error(`Tier "${newTierName}" not found`);

            // 2. Call the atomic RPC — employee guard enforced server-side
            const { data, error: rpcError } = await (supabase as any).rpc(
                "manual_override_customer_tier",
                {
                    target_user_id:  userId,
                    new_tier_id:     tierData.id,
                    override_reason: reason.trim() || null,
                }
            );

            if (rpcError) throw rpcError;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customer-search"] });
            queryClient.invalidateQueries({ queryKey: ["tier-history"] });
            queryClient.invalidateQueries({ queryKey: ["loyalty-tier-history"] });
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
