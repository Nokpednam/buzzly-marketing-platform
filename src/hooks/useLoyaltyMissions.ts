/**
 * useLoyaltyMissions.ts
 * ─────────────────────────────────────────────────────────────
 * Convenience hook for the Mission Board component.
 *
 * DATA FLOW:
 *   LoyaltyProvider (useLoyaltyTier.tsx)
 *     ↓  fetches from Supabase: loyalty_activity_codes (active=true)
 *     ↓  cross-references: loyalty_mission_completions (by action_code)
 *     ↓  populates: missions[], earnedPoints, totalPoints, etc.
 *     ↓
 *   useLoyaltyMissions  ← you are here
 *     ↓
 *   LoyaltyMissionsList (component)
 *
 * ── TODO: API Integration ──────────────────────────────────────
 * To add real-time mission notifications (e.g. WebSocket/Realtime),
 * add a Supabase channel subscription here and call `refetch()` on
 * INSERT events into loyalty_mission_completions for the current user.
 * ─────────────────────────────────────────────────────────────
 */

import { useLoyaltyTier, type Mission } from './useLoyaltyTier';
import {
  calculateEarnedPoints,
  calculateTotalPoints,
  calculateProgressPercent,
} from '@/utils/missionHelpers';

export type { Mission };

export interface LoyaltyMissionsResult {
  /** Full mission catalogue (active only) with isCompleted flags set. */
  missions: Mission[];
  /** True while the initial data fetch is in flight. */
  loading: boolean;
  /** Non-null if the fetch failed. */
  error: Error | null;
  /** Number of missions the user has completed. */
  completedCount: number;
  /** Total number of missions in the catalogue. */
  totalMissions: number;
  /**
   * Sum of reward_points across ALL missions.
   * Denominator for the progress bar.
   * Recalculated from the live mission list so it stays in sync with
   * any admin changes to loyalty_activity_codes.
   */
  totalPoints: number;
  /**
   * Sum of reward_points for completed missions only.
   * Numerator for the progress bar.
   */
  earnedPoints: number;
  /**
   * Progress bar fill value (0–100).
   * Formula: Math.round((earnedPoints / totalPoints) * 100)
   */
  progressPercent: number;
  /** Force a re-fetch from Supabase (e.g. after a mission is completed). */
  refetch: () => void;
}

/**
 * useLoyaltyMissions
 * ──────────────────
 * Wraps useLoyaltyTier and exposes mission-specific derived values.
 *
 * All heavy lifting (Supabase query, completion cross-reference) lives in
 * useLoyaltyTier so this hook stays thin and easy to test.
 */
export function useLoyaltyMissions(): LoyaltyMissionsResult {
  const { missions, loading, error, completedCount, totalMissions, refetch } =
    useLoyaltyTier();

  // ── Dynamic calculations ──────────────────────────────────────────────────
  // These are recalculated on every render from the live mission list.
  // If an admin enables/disables a code in loyalty_activity_codes the values
  // update automatically on the next fetch without any component changes.

  /** Points earned = sum of reward_points for missions where isCompleted===true */
  const earnedPoints = calculateEarnedPoints(missions);

  /** Total possible points = sum of reward_points for all active missions */
  const totalPoints = calculateTotalPoints(missions);

  /** Progress bar width (0–100) for the <Progress /> component */
  const progressPercent = calculateProgressPercent(earnedPoints, totalPoints);

  return {
    missions,
    loading,
    error: error as unknown as Error | null,
    completedCount,
    totalMissions,
    earnedPoints,
    totalPoints,
    progressPercent,
    refetch,
  };
}
