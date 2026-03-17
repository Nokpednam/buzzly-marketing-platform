import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface MissionResult {
  success: boolean;
  points_awarded?: number;
  new_balance?: number;
  reason?: string; // 'already_claimed' for duplicate one-time missions
}

/**
 * Thin wrapper around the award_loyalty_points() Supabase RPC.
 *
 * Usage:
 *   const { awardMission } = useAwardMission();
 *   const result = await awardMission('create_workspace');
 *   if (result?.success) { ... show toast ... }
 */
export function useAwardMission() {
  const queryClient = useQueryClient();

  const awardMission = useCallback(
    async (actionType: string): Promise<MissionResult | null> => {
      try {
        const { data, error } = await supabase.rpc(
          // Cast to any: award_loyalty_points is a new RPC not yet in the
          // generated types snapshot. Update types (supabase gen types) to remove this cast.
          'award_loyalty_points' as any,
          { p_action_type: actionType }
        );

        if (error) {
          console.error('[useAwardMission] RPC error:', error.message);
          return null;
        }

        if (data && (data as any).success) {
          window.dispatchEvent(new CustomEvent('loyalty-refetch'));
          queryClient.invalidateQueries({ queryKey: ['loyalty-missions'] });
          queryClient.invalidateQueries({ queryKey: ['loyalty-tier'] });
        }

        return data as unknown as MissionResult;
      } catch (err) {
        console.error('[useAwardMission] Unexpected error:', err);
        return null;
      }
    },
    [queryClient]
  );

  return { awardMission };
}
