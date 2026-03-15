import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Mission {
  id: string;
  action_type: string;
  label: string;
  points_awarded: number;
  is_one_time: boolean;
  is_active: boolean;
  isCompleted: boolean; // true if the current user has a row in loyalty_mission_completions
}

export function useLoyaltyMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMissions = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMissions([]);
        return;
      }

      // Fetch catalogue + completions in parallel
      const [catalogueRes, completionsRes] = await Promise.all([
        supabase
          .from('loyalty_missions')
          .select('*')
          .eq('is_active', true)
          .order('points_awarded', { ascending: true }),
        supabase
          .from('loyalty_mission_completions')
          .select('action_type')
          .eq('user_id', user.id),
      ]);

      if (catalogueRes.error) throw catalogueRes.error;

      const completedTypes = new Set(
        (completionsRes.data ?? []).map((c) => c.action_type)
      );

      const combined: Mission[] = (catalogueRes.data ?? []).map((m) => ({
        ...m,
        isCompleted: completedTypes.has(m.action_type),
      }));

      setMissions(combined);
    } catch (err) {
      console.error('[useLoyaltyMissions] Error:', err);
      setError('Failed to load missions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const completedCount = missions.filter((m) => m.isCompleted).length;
  const totalPoints = missions.reduce((sum, m) => sum + m.points_awarded, 0);
  const earnedPoints = missions
    .filter((m) => m.isCompleted)
    .reduce((sum, m) => sum + m.points_awarded, 0);

  return {
    missions,
    loading,
    error,
    completedCount,
    totalMissions: missions.length,
    totalPoints,
    earnedPoints,
    refetch: fetchMissions,
  };
}
