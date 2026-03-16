import { useLoyaltyTier, Mission } from './useLoyaltyTier';

/**
 * Convenience hook that wraps useLoyaltyTier to provide missions-specific data.
 * All data is synced via the central LoyaltyProvider.
 */
export function useLoyaltyMissions() {
  const {
    missions,
    loading,
    error,
    completedCount,
    totalMissions,
    totalPoints,
    earnedPoints,
    refetch,
  } = useLoyaltyTier();

  return {
    missions,
    loading,
    error,
    completedCount,
    totalMissions,
    totalPoints,
    earnedPoints,
    refetch,
  };
}
 export type { Mission };
