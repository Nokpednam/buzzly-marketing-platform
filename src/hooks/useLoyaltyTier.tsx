import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LoyaltyTier {
  id: string;
  name: string;
  description: string | null;
  badge_color: string | null;
  icon_url: string | null;
  min_points: number | null;
  min_spend_amount: number | null;
  retention_period_days: number | null;
  discount_percentage: number | null;
  point_multiplier: number | null;
  priority_level: number | null;
  benefits_summary: string | null;
}

export interface UserLoyaltyInfo {
  tier: LoyaltyTier | null;
  points_balance: number;
  total_spend_amount: number;
  member_since: string | null;
}

// Tier colors for UI
export const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: "bg-amber-700/20", text: "text-amber-700", border: "border-amber-700" },
  Silver: { bg: "bg-slate-400/20", text: "text-slate-500", border: "border-slate-400" },
  Gold: { bg: "bg-yellow-500/20", text: "text-yellow-600", border: "border-yellow-500" },
  Platinum: { bg: "bg-slate-300/20", text: "text-slate-600", border: "border-slate-400" },
};

// Tier icons
export const tierIcons: Record<string, string> = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
};

export function useLoyaltyTier() {
  const [userLoyalty, setUserLoyalty] = useState<UserLoyaltyInfo | null>(null);
  const [allTiers, setAllTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllTiers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("loyalty_tiers")
        .select("*")
        .eq("is_active", true)
        .order("priority_level", { ascending: true });

      if (error) throw error;
      setAllTiers(data || []);
    } catch (err) {
      console.error("Error fetching loyalty tiers:", err);
      setError("Failed to load loyalty tiers");
    }
  }, []);

  const fetchUserLoyalty = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUserLoyalty(null);
        setLoading(false);
        return;
      }

      // Fetch user profile with loyalty info
      const { data: profile, error: profileError } = await supabase
        .from("profile_customers")
        .select(`
          created_at,
          loyalty_points (
            point_balance,
            loyalty_tiers (*)
          )
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Calculate total spend
      const { data: txs } = await supabase
        .from("payment_transactions")
        .select("amount")
        .eq("user_id", user.id);

      const totalSpend = txs?.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0) || 0;

      const loyaltyData = profile?.loyalty_points?.[0] || profile?.loyalty_points; // array or single object depending on relation
      let tier: LoyaltyTier | null = loyaltyData?.loyalty_tiers || null;

      if (!tier) {
        // Default to Bronze if no tier assigned
        const { data: bronzeTier } = await supabase
          .from("loyalty_tiers")
          .select("*")
          .eq("name", "Bronze")
          .single();

        if (bronzeTier) {
          tier = bronzeTier;
        }
      }

      setUserLoyalty({
        tier,
        points_balance: loyaltyData?.point_balance || 0,
        total_spend_amount: totalSpend,
        member_since: profile?.created_at || null,
      });
    } catch (err) {
      console.error("Error fetching user loyalty:", err);
      setError("Failed to load loyalty info");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllTiers();
    fetchUserLoyalty();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserLoyalty();
    });

    return () => subscription.unsubscribe();
  }, [fetchAllTiers, fetchUserLoyalty]);

  const getNextTier = useCallback((): LoyaltyTier | null => {
    if (!userLoyalty?.tier || allTiers.length === 0) return null;

    const currentLevel = userLoyalty.tier.priority_level || 0;
    const nextTier = allTiers.find(t => (t.priority_level || 0) > currentLevel);
    return nextTier || null;
  }, [userLoyalty, allTiers]);

  const getProgressToNextTier = useCallback((): number => {
    const nextTier = getNextTier();
    if (!nextTier || !userLoyalty?.tier) return 100;

    const currentPoints = userLoyalty.points_balance;
    const requiredPoints = nextTier.min_points || 0;
    const currentTierPoints = userLoyalty.tier.min_points || 0;

    if (requiredPoints <= currentTierPoints) return 100;

    const progress = ((currentPoints - currentTierPoints) / (requiredPoints - currentTierPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }, [userLoyalty, getNextTier]);

  return {
    userLoyalty,
    allTiers,
    loading,
    error,
    getNextTier,
    getProgressToNextTier,
    refetch: fetchUserLoyalty,
  };
}
