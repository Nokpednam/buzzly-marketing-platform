import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WorkspaceInfo {
    id: string;
    name: string;
    logo_url: string | null;
    plan: string;
}

export function useWorkspaceInfo() {
    return useQuery({
        queryKey: ['workspace-info'],
        queryFn: async (): Promise<WorkspaceInfo | null> => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // 1. Try fetching team owned by user
            const { data: teamData } = await supabase
                .from('teams')
                .select('id, name, logo_url')
                .eq('owner_id', user.id)
                .maybeSingle();

            if (teamData) {
                return {
                    id: teamData.id,
                    name: teamData.name,
                    logo_url: teamData.logo_url,
                    plan: 'Team Plan', // Determining plan logic can be complex, simplifying for display
                };
            }

            // 2. Try fetching team where user is a member
            const { data: memberData } = await supabase
                .from('team_members')
                .select('team_id, teams(id, name, logo_url)')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .maybeSingle();

            if (memberData?.teams) {
                // Supabase types can be tricky with joins, casting as any for simplicity here or defining proper types
                const team = memberData.teams as any;
                return {
                    id: team.id,
                    name: team.name,
                    logo_url: team.logo_url,
                    plan: 'Team Plan',
                };
            }

            return null;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
