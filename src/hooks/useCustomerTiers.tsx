import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths } from "date-fns";
import { th } from "date-fns/locale";

export interface TierDistribution {
    name: string;
    value: number;
    color: string;
}

export interface RevenueByTier {
    name: string;
    revenue: number;
    avgSpend: number;
}

export interface TierMovement {
    month: string;
    upgrades: number;
    downgrades: number;
}

export interface TopPerformer {
    id: string;
    name: string;
    tier: string;
    totalSpend: number;
    points: number;
}

export interface CustomerTiersData {
    tierDistribution: TierDistribution[];
    revenueByTier: RevenueByTier[];
    tierMovement: TierMovement[];
    topPerformers: TopPerformer[];
    totalCustomers: number;
    totalRevenue: number;
    avgSpendAll: number;
    platinumCount: number;
}

const TIER_COLORS: Record<string, string> = {
    Bronze: "#A85823",
    Silver: "#94A3B8",
    Gold: "#F59E0B",
    Platinum: "#6366F1",
};

async function fetchCustomerTiersData(): Promise<CustomerTiersData> {
    const [tiersRes, customersRes, txsRes] = await Promise.all([
        supabase.from("loyalty_tiers").select("*").order("min_points"),
        supabase.from("profile_customers").select(`
      user_id,
      first_name,
      last_name,
      loyalty_point_id,
      loyalty_points(
        point_balance,
        total_points_earned,
        loyalty_tier_id,
        status,
        loyalty_tiers(name, badge_color)
      )
    `),
        supabase
            .from("payment_transactions")
            .select("amount, user_id, created_at")
            .order("created_at", { ascending: true }),
    ]);

    const tiers = tiersRes.data ?? [];
    const customers = customersRes.data ?? [];
    const txs = txsRes.data ?? [];

    // Deduplicate tiers by name
    const uniqueTiers = new Map<string, (typeof tiers)[0]>();
    tiers.forEach((t) => {
        if (!uniqueTiers.has(t.name)) uniqueTiers.set(t.name, t);
    });
    const masterTiers = Array.from(uniqueTiers.values()).sort(
        (a, b) => a.min_points - b.min_points
    );

    // A. Tier distribution
    const tierCounts = new Map<string, number>();
    let totalCustomers = 0;
    let platinumCount = 0;

    customers.forEach((c) => {
        const lp = c.loyalty_points as any;
        // Relaxed check: Count if ANY loyalty record exists, effectively all customers in the system
        // Only exclude if explicitly 'banned' or 'archived' if those statuses existed, but 'active' check was too strict
        if (lp) {
            const tName = lp.loyalty_tiers?.name || "Bronze";
            tierCounts.set(tName, (tierCounts.get(tName) || 0) + 1);
            totalCustomers++;
            if (tName === "Platinum") platinumCount++;
        }
    });

    const tierDistribution: TierDistribution[] = masterTiers.map((t) => ({
        name: t.name,
        value: tierCounts.get(t.name) || 0,
        color: TIER_COLORS[t.name] ?? "#94A3B8",
    }));

    // B. Revenue
    const userSpendMap = new Map<string, number>();
    let totalRevenue = 0;
    txs.forEach((tx) => {
        userSpendMap.set(tx.user_id, (userSpendMap.get(tx.user_id) || 0) + (Number(tx.amount) || 0));
        totalRevenue += (Number(tx.amount) || 0);
    });

    // Safety check for avgSpend
    const avgSpendAll = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

    const userTierNameMap = new Map<string, string>();
    customers.forEach((c) => {
        const lp = c.loyalty_points as any;
        userTierNameMap.set(c.user_id, lp?.loyalty_tiers?.name || "Bronze");
    });

    const tierRevenueMap = new Map<string, number>();
    userSpendMap.forEach((spend, userId) => {
        const tName = userTierNameMap.get(userId);
        if (tName) tierRevenueMap.set(tName, (tierRevenueMap.get(tName) || 0) + spend);
    });

    const revenueByTier: RevenueByTier[] = masterTiers.map((t) => {
        const rev = tierRevenueMap.get(t.name) || 0;
        const count = tierCounts.get(t.name) || 1;
        // Prevent division by zero if count is somehow 0 (though we set default 1 above, logic holds)
        // If revenue is 0, avgSpend is 0.
        return { name: t.name, revenue: rev, avgSpend: count > 0 ? Math.round(rev / count) : 0 };
    });

    // C. Top performers
    const topPerformers: TopPerformer[] = customers
        .map((c) => {
            const lp = c.loyalty_points as any;
            return {
                id: c.user_id,
                name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Unknown Customer",
                tier: lp?.loyalty_tiers?.name || "Bronze",
                points: lp?.total_points_earned || 0,
                totalSpend: userSpendMap.get(c.user_id) || 0,
            };
        })
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 5);

    // D. Tier movement (last 6 months)
    const endDate = new Date();
    const startDate = subMonths(endDate, 6);
    const trendsMap = new Map<string, { up: number; down: number }>();
    for (let i = 5; i >= 0; i--) {
        const d = subMonths(endDate, i);
        trendsMap.set(format(d, "MMM", { locale: th }), { up: 0, down: 0 });
    }

    const sortedLogicTiers = [...masterTiers].sort(
        (a, b) => a.min_spend_amount - b.min_spend_amount
    );
    const defaultLogicTier = sortedLogicTiers[0];
    const replayUserSpend = new Map<string, number>();

    txs.forEach((tx) => {
        const txDate = new Date(tx.created_at);
        const currentSpend = replayUserSpend.get(tx.user_id) || 0;
        const newSpend = currentSpend + tx.amount;
        replayUserSpend.set(tx.user_id, newSpend);

        let oldTier = defaultLogicTier;
        let newTier = defaultLogicTier;
        for (const t of sortedLogicTiers) {
            if (currentSpend >= t.min_spend_amount) oldTier = t;
            if (newSpend >= t.min_spend_amount) newTier = t;
        }

        if (newTier.min_spend_amount > oldTier.min_spend_amount && txDate >= startDate) {
            const key = format(txDate, "MMM", { locale: th });
            if (trendsMap.has(key)) trendsMap.get(key)!.up++;
        }
    });

    const tierMovement: TierMovement[] = Array.from(trendsMap.entries()).map(
        ([month, data]) => ({ month, upgrades: data.up, downgrades: data.down })
    );

    return {
        tierDistribution,
        revenueByTier,
        tierMovement,
        topPerformers,
        totalCustomers,
        totalRevenue,
        avgSpendAll,
        platinumCount,
    };
}

export function useCustomerTiers() {
    return useQuery({
        queryKey: ["customer-tiers"],
        queryFn: fetchCustomerTiersData,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
