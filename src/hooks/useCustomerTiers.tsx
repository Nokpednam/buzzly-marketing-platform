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

export interface NearUpgradeCustomer {
    id: string;
    name: string;
    currentTier: string;
    nextTier: string;
    spendNeeded: number;
}

export interface ChurnRiskCustomer {
    id: string;
    name: string;
    tier: string;
    daysInactive: number;
}

export interface CustomerTiersData {
    tierDistribution: TierDistribution[];
    revenueByTier: RevenueByTier[];
    tierMovement: TierMovement[];
    topPerformers: TopPerformer[];
    nearUpgradeCustomers: NearUpgradeCustomer[];
    churnRiskCustomers: ChurnRiskCustomer[];
    pointsBurnRate: number;
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

async function fetchCustomerTiersData(timePeriod: string): Promise<CustomerTiersData> {
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
    const allTxs = txsRes.data ?? [];

    const now = new Date();
    let filterStartDate = new Date(0);
    if (timePeriod === "7d") filterStartDate = new Date(now.setDate(now.getDate() - 7));
    else if (timePeriod === "30d") filterStartDate = new Date(now.setDate(now.getDate() - 30));
    else if (timePeriod === "90d") filterStartDate = new Date(now.setDate(now.getDate() - 90));
    else if (timePeriod === "1y") filterStartDate = new Date(now.setFullYear(now.getFullYear() - 1));

    const txs = allTxs.filter(tx => new Date(tx.created_at) >= filterStartDate);

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
    const sortedCustomers = customers.map((c) => {
        const lp = c.loyalty_points as any;
        return {
            id: c.user_id,
            name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Unknown Customer",
            tier: lp?.loyalty_tiers?.name || "Bronze",
            points: lp?.total_points_earned || 0,
            balance: lp?.point_balance || 0, // Added for burn rate
            totalSpend: userSpendMap.get(c.user_id) || 0,
        };
    });

    const topPerformers: TopPerformer[] = [...sortedCustomers]
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 5);

    // E. Near Upgrade Customers
    const sortedLogicTiers = [...masterTiers].sort(
        (a, b) => a.min_spend_amount - b.min_spend_amount
    );
    const nearUpgradeCustomers: NearUpgradeCustomer[] = [];
    sortedCustomers.forEach(c => {
        let currentTierIndex = sortedLogicTiers.findIndex(t => t.name === c.tier) || 0;
        if (currentTierIndex >= 0 && currentTierIndex < sortedLogicTiers.length - 1) {
            const nextTier = sortedLogicTiers[currentTierIndex + 1];
            const spendNeeded = nextTier.min_spend_amount - c.totalSpend;
            // E.g., any customer needing > 0 to hit the next tier
            if (spendNeeded > 0) {
                nearUpgradeCustomers.push({
                    id: c.id,
                    name: c.name,
                    currentTier: c.tier,
                    nextTier: nextTier.name,
                    spendNeeded,
                });
            }
        }
    });

    // F. Churn Risk Customers
    const churnRiskCustomers: ChurnRiskCustomer[] = [];
    const userLastTxMap = new Map<string, Date>();
    allTxs.forEach(tx => {
        const txDate = new Date(tx.created_at);
        const lastTxDate = userLastTxMap.get(tx.user_id);
        if (!lastTxDate || txDate > lastTxDate) {
            userLastTxMap.set(tx.user_id, txDate);
        }
    });

    sortedCustomers.forEach(c => {
        if (c.tier === "Platinum" || c.tier === "Gold") {
            const lastTxDate = userLastTxMap.get(c.id);
            if (lastTxDate) {
                const daysInactive = Math.floor((new Date().getTime() - lastTxDate.getTime()) / (1000 * 3600 * 24));
                if (daysInactive >= 60) {
                    churnRiskCustomers.push({
                        id: c.id,
                        name: c.name,
                        tier: c.tier,
                        daysInactive,
                    });
                }
            }
        }
    });
    // Sort logic for insights
    nearUpgradeCustomers.sort((a, b) => a.spendNeeded - b.spendNeeded).splice(5); // Only keep top 5 closest
    churnRiskCustomers.sort((a, b) => b.daysInactive - a.daysInactive).splice(5); // Only keep 5 most inactive VIPs

    // G. Points Burn Rate
    let totalPointsEarned = 0;
    let totalPointsBalance = 0;
    sortedCustomers.forEach(c => {
        totalPointsEarned += c.points;
        totalPointsBalance += c.balance;
    });
    const pointsBurnRate = totalPointsEarned > 0 ? ((totalPointsEarned - totalPointsBalance) / totalPointsEarned) * 100 : 0;

    // D. Tier movement (Dynamic based on timePeriod)
    const endDate = new Date();
    const trendsMap = new Map<string, { up: number; down: number }>();

    let chartStartDate = new Date();

    if (timePeriod === "7d") {
        chartStartDate = new Date(endDate.getTime() - 7 * 24 * 3600 * 1000);
        for (let i = 6; i >= 0; i--) {
            const d = new Date(endDate.getTime() - i * 24 * 3600 * 1000);
            trendsMap.set(format(d, "d MMM", { locale: th }), { up: 0, down: 0 });
        }
    } else if (timePeriod === "30d") {
        chartStartDate = new Date(endDate.getTime() - 30 * 24 * 3600 * 1000);
        for (let i = 29; i >= 0; i--) {
            const d = new Date(endDate.getTime() - i * 24 * 3600 * 1000);
            trendsMap.set(format(d, "d MMM", { locale: th }), { up: 0, down: 0 });
        }
    } else if (timePeriod === "90d") {
        chartStartDate = subMonths(endDate, 3);
        for (let i = 2; i >= 0; i--) {
            const d = subMonths(endDate, i);
            trendsMap.set(format(d, "MMM yy", { locale: th }), { up: 0, down: 0 });
        }
    } else { // 1y
        chartStartDate = subMonths(endDate, 12);
        for (let i = 11; i >= 0; i--) {
            const d = subMonths(endDate, i);
            trendsMap.set(format(d, "MMM yy", { locale: th }), { up: 0, down: 0 });
        }
    }

    const defaultLogicTier = sortedLogicTiers[0];
    const replayUserSpend = new Map<string, number>();

    allTxs.forEach((tx) => {
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

        if (newTier.min_spend_amount > oldTier.min_spend_amount && txDate >= chartStartDate) {
            let key = "";
            if (timePeriod === "7d" || timePeriod === "30d") {
                key = format(txDate, "d MMM", { locale: th });
            } else {
                key = format(txDate, "MMM yy", { locale: th });
            }
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
        nearUpgradeCustomers,
        churnRiskCustomers,
        pointsBurnRate: Math.round(pointsBurnRate),
        totalCustomers,
        totalRevenue,
        avgSpendAll,
        platinumCount,
    };
}

export function useCustomerTiers(timePeriod: string = "30d") {
    return useQuery({
        queryKey: ["customer-tiers", timePeriod],
        queryFn: () => fetchCustomerTiersData(timePeriod),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
