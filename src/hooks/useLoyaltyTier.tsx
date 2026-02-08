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
        .from("customer")
        .select(`
          loyalty_tier_id,
          loyalty_points_balance,
          total_spend_amount,
          member_since
        `)
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // If user has a tier, fetch tier details
      let tier: LoyaltyTier | null = null;
      if (profile?.loyalty_tier_id) {
        const { data: tierData, error: tierError } = await supabase
          .from("loyalty_tiers")
          .select("*")
          .eq("id", profile.loyalty_tier_id)
          .single();

        if (!tierError && tierData) {
          tier = tierData;
        }
      } else {
        // Default to Bronze if no tier assigned
        const { data: bronzeTier } = await supabase
          .from("loyalty_tiers")
          .select("*")
          .eq("name", "Bronze")
          .single();

        if (bronzeTier) {
          tier = bronzeTier;
          // Update user profile with default Bronze tier
          await supabase
            .from("customer")
            .update({ loyalty_tier_id: bronzeTier.id })
            .eq("id", user.id);
        }
      }

      setUserLoyalty({
        tier,
        points_balance: profile?.loyalty_points_balance || 0,
        total_spend_amount: Number(profile?.total_spend_amount) || 0,
        member_since: profile?.member_since || null,
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
