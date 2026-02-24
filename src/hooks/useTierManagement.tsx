import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// ─── Tier History ─────────────────────────────────────────────────────────────

export function useTierHistory() {
    return useQuery({
        queryKey: ["tier-history"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tier_history")
                .select(
                    `
          *,
          customer:customer!tier_history_user_id_fkey(full_name, email),
          previous_tier:loyalty_tiers!tier_history_previous_tier_id_fkey(name),
          new_tier:loyalty_tiers!tier_history_new_tier_id_fkey(name),
          changer:customer!tier_history_changed_by_fkey(full_name)
        `
                )
                .order("created_at", { ascending: false })
                .limit(100);

            if (error) {
                // Fallback: fetch without joins if FK names differ
                const { data: fallback, error: fallbackError } = await supabase
                    .from("tier_history")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(100);
                if (fallbackError) throw fallbackError;
                return (fallback ?? []) as TierHistoryEntry[];
            }

            return (data ?? []) as TierHistoryEntry[];
        },
    });
}

// ─── Points Transactions ──────────────────────────────────────────────────────

export function usePointsTransactions() {
    return useQuery({
        queryKey: ["points-transactions-admin"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("points_transactions")
                .select("*, customer:customer!points_transactions_user_id_fkey(full_name, email)")
                .order("created_at", { ascending: false })
                .limit(200);

            if (error) {
                // Fallback without join
                const { data: fallback, error: fallbackError } = await supabase
                    .from("points_transactions")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(200);
                if (fallbackError) throw fallbackError;
                return (fallback ?? []) as PointsTransaction[];
            }

            return (data ?? []) as PointsTransaction[];
        },
    });
}

// ─── Suspicious Activities ────────────────────────────────────────────────────

export function useSuspiciousActivities() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["suspicious-activities"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("suspicious_activities")
                .select("*, customer:customer!suspicious_activities_user_id_fkey(full_name, email)")
                .order("created_at", { ascending: false })
                .limit(100);

            if (error) {
                const { data: fallback, error: fallbackError } = await supabase
                    .from("suspicious_activities")
                    .select("*")
                    .order("created_at", { ascending: false })
                    .limit(100);
                if (fallbackError) throw fallbackError;
                return (fallback ?? []) as SuspiciousActivity[];
            }

            return (data ?? []) as SuspiciousActivity[];
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

    return { ...query, resolveActivity, suspendCustomer };
}

// ─── Customer Search ──────────────────────────────────────────────────────────

export function useCustomerSearch() {
    const [query, setQuery] = useState("");

    const searchResult = useQuery({
        queryKey: ["customer-search", query],
        queryFn: async () => {
            if (!query || query.trim().length < 2) return [];

            const { data: customers, error } = await supabase
                .from("customer")
                .select("id, full_name, email, created_at")
                .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,id.eq.${query}`)
                .limit(10);

            if (error) throw error;
            if (!customers || customers.length === 0) return [];

            const customerIds = customers.map(c => c.id);

            // Fetch loyalty info
            const { data: loyaltyData } = await supabase
                .from("profile_customers")
                .select(`
                    user_id,
                    loyalty_points (
                        point_balance,
                        loyalty_tiers (name)
                    )
                `)
                .in("user_id", customerIds);

            // Fetch spend info
            const { data: txs } = await supabase
                .from("payment_transactions")
                .select("user_id, amount")
                .in("user_id", customerIds);

            const results: CustomerSearchResult[] = customers.map(c => {
                const lpInfo = loyaltyData?.find(l => l.user_id === c.id)?.loyalty_points as any;
                const activeLp = Array.isArray(lpInfo) ? lpInfo[0] : lpInfo;
                const spend = txs?.filter(t => t.user_id === c.id).reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;

                return {
                    id: c.id,
                    full_name: c.full_name,
                    email: c.email,
                    created_at: c.created_at,
                    loyalty_tier: activeLp?.loyalty_tiers?.name || "Bronze",
                    loyalty_points_balance: activeLp?.point_balance || 0,
                    total_spend: spend
                };
            });

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

            // Get the tier ID from loyalty_tiers
            const { data: tierData, error: tierError } = await supabase
                .from("loyalty_tiers")
                .select("id")
                .eq("name", newTierName)
                .maybeSingle();

            if (tierError) throw tierError;

            // Get current tier from profile_customers -> loyalty_points
            const { data: profile } = await supabase
                .from("profile_customers")
                .select(`
                    id,
                    loyalty_points (
                        id,
                        loyalty_tier_id
                    )
                `)
                .eq("user_id", userId)
                .maybeSingle();

            const lpInfo = profile?.loyalty_points as any;
            const lpRecord = Array.isArray(lpInfo) ? lpInfo[0] : lpInfo;

            // Update loyalty_tier
            if (lpRecord?.id && tierData?.id) {
                const { error: updateError } = await supabase
                    .from("loyalty_points")
                    .update({ loyalty_tier_id: tierData.id })
                    .eq("id", lpRecord.id);
                if (updateError) throw updateError;
            } else if (profile?.id && tierData?.id) {
                const { error: insertError } = await supabase
                    .from("loyalty_points")
                    .insert({
                        profile_customer_id: profile.id,
                        loyalty_tier_id: tierData.id,
                        point_balance: 0,
                        total_points_earned: 0
                    });
                if (insertError) throw insertError;
            }

            // Log to tier_history
            if (tierData?.id) {
                await supabase.from("tier_history").insert({
                    user_id: userId,
                    previous_tier_id: lpRecord?.loyalty_tier_id ?? null,
                    new_tier_id: tierData.id,
                    change_reason: reason,
                    changed_by: adminUser?.id ?? null,
                    is_manual_override: true,
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tier-history"] });
            queryClient.invalidateQueries({ queryKey: ["customer-search"] });
            toast.success("เปลี่ยน Tier สำเร็จ");
        },
        onError: (error: Error) => {
            toast.error("ไม่สามารถเปลี่ยน Tier ได้", { description: error.message });
        },
    });
}
