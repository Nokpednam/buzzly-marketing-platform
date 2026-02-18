import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Facebook, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type PlatformStatus = "connected" | "disconnected" | "error";

export interface Platform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }> | null;
  emoji?: string;
  status: PlatformStatus;
  lastSync?: string;
  accessToken?: string;
  error?: string;
}

// Icon mapping for platforms
const platformIcons: Record<string, React.ComponentType<{ className?: string }> | null> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: null,
  shopee: null,
};

const platformEmojis: Record<string, string> = {
  tiktok: "🎵",
  shopee: "🛒",
};

interface PlatformConnectionsContextType {
  platforms: Platform[];
  connectedPlatforms: Platform[];
  loading: boolean;
  connectPlatform: (id: string, token: string) => void;
  disconnectPlatform: (id: string) => void;
  updatePlatformToken: (id: string, token: string) => void;
  refreshPlatformStatus: (id: string) => void;
  getPlatformById: (id: string) => Platform | undefined;
  refetch: () => Promise<void>;
}

const PlatformConnectionsContext = createContext<PlatformConnectionsContextType | undefined>(undefined);

export function PlatformConnectionsProvider({ children }: { children: ReactNode }) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<string | null>(null);

  const connectedPlatforms = platforms.filter((p) => p.status === "connected");

  // Fetch team ID and platforms from database
  const fetchPlatforms = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's team
      let currentTeamId: string | null = null;

      // Check if user owns a workspace
      const { data: ownedWorkspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (ownedWorkspace) {
        currentTeamId = ownedWorkspace.id;
      } else {
        // Check if user is a member of a workspace
        const { data: memberData } = await supabase
          .from('workspace_members')
          .select('team_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (memberData) {
          currentTeamId = memberData.team_id;
        }
      }

      setTeamId(currentTeamId);

      // Fetch platforms from database (only 4 supported platforms)
      const ALLOWED_SLUGS = ['facebook', 'instagram', 'tiktok', 'shopee'];
      const { data: platformsData, error: platformsError } = await supabase
        .from('platforms')
        .select('id, name, slug')
        .eq('is_active', true)
        .in('slug', ALLOWED_SLUGS)
        .order('name');

      if (platformsError) throw platformsError;

      // Fetch connections for this team
      let connectionsMap: Record<string, any> = {};
      if (currentTeamId) {
        const { data: connectionsData } = await supabase
          .from('workspace_api_keys')
          .select('*')
          .eq('team_id', currentTeamId);

        if (connectionsData) {
          connectionsData.forEach((conn) => {
            connectionsMap[conn.platform_id] = conn;
          });
        }
      }

      // Transform to Platform format
      const transformedPlatforms: Platform[] = (platformsData || []).map((p: any) => {
        const connection = connectionsMap[p.id];
        let status: PlatformStatus = 'disconnected';

        if (connection) {
          if (connection.error_message) {
            status = 'error';
          } else if (connection.is_active && (connection.access_token || connection.api_key_encrypted)) {
            status = 'connected';
          }
        }

        return {
          id: p.slug || p.id,
          name: p.name,
          icon: platformIcons[p.slug] || null,
          emoji: platformEmojis[p.slug],
          status,
          lastSync: connection?.last_synced_at
            ? new Date(connection.last_synced_at).toLocaleString()
            : undefined,
          accessToken: connection?.access_token,
          error: connection?.error_message,
        };
      });

      console.log('Transformed platforms:', transformedPlatforms);
      setPlatforms(transformedPlatforms);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const connectPlatform = (id: string, token: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
            ...p,
            status: "connected" as PlatformStatus,
            accessToken: token,
            lastSync: new Date().toLocaleString(),
            error: undefined,
          }
          : p
      )
    );
  };

  const disconnectPlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
            ...p,
            status: "disconnected" as PlatformStatus,
            accessToken: undefined,
            lastSync: undefined,
            error: undefined,
          }
          : p
      )
    );
  };

  const updatePlatformToken = (id: string, token: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
            ...p,
            accessToken: token,
            lastSync: new Date().toLocaleString(),
            status: "connected" as PlatformStatus,
            error: undefined,
          }
          : p
      )
    );
  };

  const refreshPlatformStatus = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
            ...p,
            lastSync: new Date().toLocaleString(),
            status: p.accessToken ? "connected" as PlatformStatus : "disconnected" as PlatformStatus,
            error: undefined,
          }
          : p
      )
    );
  };

  const getPlatformById = (id: string) => {
    return platforms.find((p) => p.id === id);
  };

  return (
    <PlatformConnectionsContext.Provider
      value={{
        platforms,
        connectedPlatforms,
        loading,
        connectPlatform,
        disconnectPlatform,
        updatePlatformToken,
        refreshPlatformStatus,
        getPlatformById,
        refetch: fetchPlatforms,
      }}
    >
      {children}
    </PlatformConnectionsContext.Provider>
  );
}

export function usePlatformConnections() {
  const context = useContext(PlatformConnectionsContext);
  if (context === undefined) {
    throw new Error("usePlatformConnections must be used within a PlatformConnectionsProvider");
  }
  return context;
}
