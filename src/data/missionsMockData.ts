/**
 * missionsMockData.ts
 * ─────────────────────────────────────────────────────────────
 * Static mock dataset for the Mission Board component.
 *
 * These 4 missions are the canonical source of truth for the
 * customer-facing Mission Board (image_4.png) and the admin
 * "Loyalty Reward" page.
 *
 * Total available points: 50 + 50 + 100 + 300 = 500 pts
 *
 * ─── TODO: API Integration ────────────────────────────────────
 * These are seeded to Supabase via:
 *   supabase/migrations/20260316230000_sync_loyalty_admin_customer.sql
 * When the DB is available, useLoyaltyTier.tsx fetches real rows from
 * loyalty_activity_codes (is_active=true) instead of this file.
 * ─────────────────────────────────────────────────────────────
 */

export interface MockMission {
  /** Matches loyalty_activity_codes.action_code  */
  id: string;
  /** Matches loyalty_activity_codes.action_code  */
  action_code: string;
  /** Matches loyalty_activity_codes.name          */
  name: string;
  /** Matches loyalty_activity_codes.description   */
  description: string;
  /** Matches loyalty_activity_codes.reward_points */
  reward_points: number;
  /**
   * 'completed' = user has a row in loyalty_mission_completions for this action_code.
   * 'pending'   = not yet completed.
   * This field does NOT exist in the DB; it is derived client-side.
   */
  status: 'completed' | 'pending';
}

/**
 * MOCK_MISSIONS
 * ─────────────
 * 4 canonical missions matching the dashboard (image_4.png).
 * Updates here should be mirrored in:
 *   1. The SQL migration seed block (loyalty_activity_codes)
 *   2. missionHelpers.ts (MISSION_ICONS) — add icon for any new action_code
 */
export const MOCK_MISSIONS: MockMission[] = [
  {
    id: 'mock-1',
    action_code: 'create_workspace',
    name: 'Create Your Workspace',
    description: 'Set up your first Buzzly workspace to unlock campaigns, analytics, and team features.',
    reward_points: 50,
    status: 'pending', // ← Set to 'completed' to simulate a finished mission in UI dev
  },
  {
    id: 'mock-2',
    action_code: 'first_campaign',
    name: 'Launch Your First Campaign',
    description: 'Create and activate your first marketing campaign in Buzzly.',
    reward_points: 50,
    status: 'completed', // ← Confirmed via "Recent Activity" panel (+50 pts)
  },
  {
    id: 'mock-3',
    action_code: 'connect_ad_api',
    name: 'Connect an Ad Platform API',
    description: 'Link your external ad platform via API to unlock advanced analytics.',
    reward_points: 100,
    status: 'completed', // ← Confirmed via "Recent Activity" panel (+100 pts)
  },
  {
    id: 'mock-4',
    action_code: 'pro_upgrade',
    name: 'Upgrade to Pro/Team Plan',
    description: 'Unlock the full power of Buzzly by upgrading to a Pro or Team subscription.',
    reward_points: 300,
    status: 'pending',
  },
];
