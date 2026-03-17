import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  recentTransactions: any[];
}

export interface Mission {
  id: string;
  action_type: string;
  label: string;
  points_awarded: number;
  is_one_time: boolean;
  is_active: boolean;
  isCompleted: boolean;
}

// ─── UI Helpers (unchanged — no side-effects, safe to export as-is) ──────────

export const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: "bg-amber-700/20", text: "text-amber-700", border: "border-amber-700" },
  Silver: { bg: "bg-slate-400/20", text: "text-slate-500", border: "border-slate-400" },
  Gold: { bg: "bg-yellow-500/20", text: "text-yellow-600", border: "border-yellow-500" },
  Platinum: { bg: "bg-slate-300/20", text: "text-slate-600", border: "border-slate-400" },
};

export const tierIcons: Record<string, string> = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface LoyaltyContextType {
  userLoyalty: UserLoyaltyInfo | null;
  allTiers: LoyaltyTier[];
  missions: Mission[];
  loading: boolean;
  error: string | null;
  getNextTier: () => LoyaltyTier | null;
  getProgressToNextTier: () => number;
  completedCount: number;
  totalMissions: number;
  totalPoints: number;
  earnedPoints: number;
  /** Call this after awarding mission points to instantly sync all consumers */
  refetch: () => Promise<void>;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const [userLoyalty, setUserLoyalty] = useState<UserLoyaltyInfo | null>(null);
  const [allTiers, setAllTiers] = useState<LoyaltyTier[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
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

  const fetchLoyaltyAndMissions = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserLoyalty(null);
        setMissions([]);
        setLoading(false);
        return;
      }

      // Fetch Profile/Tier, Transactions, and Missions in parallel
      const [profileRes, txsRes, catalogueRes, completionsRes, pointsTxsRes] = await Promise.all([
        supabase
          .from("profile_customers")
          .select(`
            created_at,
            loyalty_points (
              point_balance,
              loyalty_tiers (*)
            )
          `)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("payment_transactions")
          .select("amount")
          .eq("user_id", user.id),
        (supabase as any)
          .from('loyalty_activity_codes')
          .select('*')
          .eq('is_active', true)
          .order('reward_points', { ascending: true }),
        (supabase as any)
          .from('loyalty_mission_completions')
          .select('action_type')
          .eq('user_id', user.id),
        supabase
          .from('points_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (profileRes.error && profileRes.error.code !== "PGRST116") throw profileRes.error;
      if (catalogueRes.error) throw catalogueRes.error;

      // 1. Process Loyalty Data
      const totalSpend = txsRes.data?.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0) || 0;
      const loyaltyData = profileRes.data?.loyalty_points?.[0] || profileRes.data?.loyalty_points;
      let tier: LoyaltyTier | null = (loyaltyData as any)?.loyalty_tiers || null;

      if (!tier) {
        const { data: bronzeTier } = await supabase
          .from("loyalty_tiers")
          .select("*")
          .eq("name", "Bronze")
          .single();
        if (bronzeTier) tier = bronzeTier;
      }

      setUserLoyalty({
        tier,
        points_balance: (loyaltyData as any)?.point_balance || 0,
        total_spend_amount: totalSpend,
        member_since: profileRes.data?.created_at || null,
        recentTransactions: pointsTxsRes.data || [],
      });

      // 2. Process Mission Data
      const completedTypes = new Set(
        (completionsRes.data ?? []).map((c) => c.action_type)
      );

      const missionsData = (catalogueRes.data as any[]) ?? [];

      // Maps new action_codes → legacy action_types that may be stored in the DB
      const legacyMap: Record<string, string> = {
        'first_campaign': 'create_campaign',
        'connect_ad_api': 'connect_api',
        'pro_upgrade':    'upgrade_plan',
        'create_workspace': 'create_workspace',
      };

      const combinedMissions: Mission[] = missionsData.map((m) => ({
        id: m.id,
        // loyalty_activity_codes uses action_code; loyalty_missions uses action_type — support both
        action_type: m.action_code ?? m.action_type,
        // loyalty_activity_codes uses name; loyalty_missions uses label — support both
        label: m.name ?? m.label,
        // loyalty_activity_codes uses reward_points; loyalty_missions uses points_awarded — support both
        points_awarded: m.reward_points ?? m.points_awarded,
        is_one_time: m.is_one_time ?? true,
        is_active: m.is_active,
        // Check new action_code, legacy action_type, OR the legacy equivalent of the new code
        isCompleted:
          completedTypes.has(m.action_code) ||
          completedTypes.has(m.action_type) ||
          completedTypes.has(legacyMap[m.action_code]),
      }));

      setMissions(combinedMissions);

    } catch (err) {
      console.error("Error fetching loyalty info:", err);
      setError("Failed to load loyalty info");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + re-fetch on auth change + global event listener
  useEffect(() => {
    fetchAllTiers();
    fetchLoyaltyAndMissions();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchLoyaltyAndMissions();
    });

    const handleGlobalRefetch = () => {
      console.log("[LoyaltyProvider] Global refetch event received");
      fetchLoyaltyAndMissions();
    };

    window.addEventListener('loyalty-refetch', handleGlobalRefetch);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('loyalty-refetch', handleGlobalRefetch);
    };
  }, [fetchAllTiers, fetchLoyaltyAndMissions]);

  const getNextTier = useCallback((): LoyaltyTier | null => {
    if (!userLoyalty?.tier || allTiers.length === 0) return null;
    const currentLevel = userLoyalty.tier.priority_level || 0;
    return allTiers.find(t => (t.priority_level || 0) > currentLevel) || null;
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

  const completedCount = missions.filter((m) => m.isCompleted).length;
  const totalPoints = missions.reduce((sum, m) => sum + m.points_awarded, 0);
  const earnedPoints = missions
    .filter((m) => m.isCompleted)
    .reduce((sum, m) => sum + m.points_awarded, 0);

  return (
    <LoyaltyContext.Provider
      value={{
        userLoyalty,
        allTiers,
        missions,
        loading,
        error,
        getNextTier,
        getProgressToNextTier,
        completedCount,
        totalMissions: missions.length,
        totalPoints,
        earnedPoints,
        refetch: fetchLoyaltyAndMissions,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Must be used inside <LoyaltyProvider>.
 * All consumers (Sidebar, TierBadge, LoyaltyTab) share the SAME state.
 * Calling refetch() in any one of them updates all simultaneously.
 */
export function useLoyaltyTier(): LoyaltyContextType {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) {
    throw new Error("useLoyaltyTier must be used inside <LoyaltyProvider>");
  }
  return ctx;
}
