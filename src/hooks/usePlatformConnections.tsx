import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Facebook, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export type PlatformStatus = "connected" | "disconnected" | "error";

export interface Platform {
  id: string;
  name: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }> | null;
  icon_url?: string | null;
  emoji?: string;
  status: PlatformStatus;
  lastSync?: string;
  accessToken?: string;
  error?: string;
  category_name?: string;
}

// Icon mapping for platforms
const platformIcons: Record<string, React.ComponentType<{ className?: string }> | null> = {
  facebook: Facebook,
  instagram: Instagram,
  tiktok: null,
  shopee: null,
  google: null,
};

const platformEmojis: Record<string, string> = {
  tiktok: "🎵",
  shopee: "🛒",
  google: "🔍",
};

interface PlatformConnectionsContextType {
  platforms: Platform[];
  connectedPlatforms: Platform[];
  loading: boolean;
  connectPlatform: (id: string, token?: string) => Promise<boolean>;
  disconnectPlatform: (id: string) => Promise<boolean>;
  updatePlatformToken: (id: string, token: string) => Promise<boolean>;
  refreshPlatformStatus: (id: string) => Promise<void>;
  getPlatformById: (id: string) => Platform | undefined;
  refetch: () => Promise<void>;
}

const PlatformConnectionsContext = createContext<PlatformConnectionsContextType | undefined>(undefined);

export function PlatformConnectionsProvider({ children }: { children: ReactNode }) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

      // Fetch platforms from database (all 5 supported platforms)
      const ALLOWED_SLUGS = ['facebook', 'instagram', 'tiktok', 'shopee', 'google'];
      const { data: platformsData, error: platformsError } = await supabase
        .from('platforms')
        .select(`
          *,
          platform_categories(name)
        `)
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
          id: p.id, // Use UUID from DB, not slug
          slug: p.slug,
          name: p.name,
          icon: platformIcons[p.slug] || null,
          icon_url: p.icon_url,
          emoji: platformEmojis[p.slug],
          status,
          lastSync: connection?.last_synced_at
            ? new Date(connection.last_synced_at).toLocaleString()
            : undefined,
          accessToken: connection?.access_token,
          error: connection?.error_message,
          category_name: p.platform_categories?.name,
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

    // Re-fetch when workspace is created (dispatched from useWorkspace.createWorkspace)
    // Using window events is more reliable than realtime for same-session state updates
    const onWorkspaceCreated = () => {
      // Retry a few times to handle any auth token propagation delay
      fetchPlatforms();
      setTimeout(() => fetchPlatforms(), 800);
      setTimeout(() => fetchPlatforms(), 2000);
    };
    window.addEventListener('workspace-created', onWorkspaceCreated);

    return () => {
      window.removeEventListener('workspace-created', onWorkspaceCreated);
    };
  }, []);


  // Connect platform (simulate OAuth + DB Write)
  const connectPlatform = async (id: string, token: string = ""): Promise<boolean> => {
    if (!teamId) {
      toast.error('กรุณาสร้าง Workspace ก่อน');
      return false;
    }

    try {
      const platform = platforms.find(p => p.id === id);
      toast.info(`กำลังเชื่อมต่อ ${platform?.name}...`);

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Use provided token or simulate one
      const accessToken = token || `oauth_${platform?.slug || 'key'}_${Date.now().toString(36)}`;

      // Try actual DB update first
      const { error } = await supabase
        .from('workspace_api_keys')
        .upsert({
          team_id: teamId,
          platform_id: id,
          access_token: accessToken,
          sync_status: 'connected',
          is_active: true,
          last_synced_at: new Date().toISOString(),
          error_message: null,
        }, {
          onConflict: 'team_id,platform_id',
        });

      if (error) {
        console.error("DB update failed:", error);
        throw error;
      }

      // Auto-create ad_account row for this platform+team (required for campaigns/insights data chain)
      // If it already exists, just ensure it's active (idempotent)
      const { error: adAccountError } = await supabase
        .from('ad_accounts')
        .upsert({
          team_id: teamId,
          platform_id: id,
          account_name: `${platform?.name || 'Platform'} Account`,
          is_active: true,
        }, {
          onConflict: 'team_id,platform_id',
          ignoreDuplicates: false,
        });

      if (adAccountError) {
        // Non-blocking: log but don't fail the connection
        console.warn('Could not create ad_account (non-critical):', adAccountError.message);
      } else {
        // Seed 30 days of demo insights so dashboard shows data immediately
        // This is idempotent - won't duplicate if already seeded
        const { data: newAccount } = await supabase
          .from('ad_accounts')
          .select('id')
          .eq('team_id', teamId)
          .eq('platform_id', id)
          .maybeSingle();

        if (newAccount?.id) {
          // Cast to any: seed_demo_insights exists in DB but not yet in generated types
          await (supabase as any).rpc('seed_demo_insights', { p_ad_account_id: newAccount.id });
        }
      }

      // Update local state ONLY on success
      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
              ...p,
              status: "connected" as PlatformStatus,
              accessToken: accessToken,
              lastSync: new Date().toLocaleString(),
              error: undefined,
            }
            : p
        )
      );

      toast.success(`${platform?.name} เชื่อมต่อสำเร็จ!`);

      // Invalidate ALL downstream React Query caches so every page
      // (Dashboard, Campaigns, Analytics) refreshes immediately without a manual page refresh
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      await queryClient.invalidateQueries({ queryKey: ["ad-accounts"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      await queryClient.invalidateQueries({ queryKey: ["ad-insights"] });
      await queryClient.invalidateQueries({ queryKey: ["revenue-metrics-dashboard"] });
      // Also refetch platforms so connected count in Dashboard header is current
      await fetchPlatforms();

      return true;
    } catch (error: any) {
      toast.error(`เชื่อมต่อล้มเหลว: ${error.message}`);
      return false;
    }
  };

  // Disconnect platform
  const disconnectPlatform = async (id: string): Promise<boolean> => {
    if (!teamId) return false;

    try {
      const platform = platforms.find(p => p.id === id);

      const { error } = await supabase
        .from('workspace_api_keys')
        .delete()
        .eq('team_id', teamId)
        .eq('platform_id', id);

      if (error) throw error;

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

      toast.success(`${platform?.name} ถูกยกเลิกการเชื่อมต่อ`);
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      return true;
    } catch (error: any) {
      toast.error(`ยกเลิกการเชื่อมต่อล้มเหลว: ${error.message}`);
      return false;
    }
  };

  // Update token
  const updatePlatformToken = async (id: string, token: string): Promise<boolean> => {
    if (!teamId) return false;

    try {
      const platform = platforms.find(p => p.id === id);

      const { error } = await supabase
        .from('workspace_api_keys')
        .update({
          access_token: token,
          last_synced_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('team_id', teamId)
        .eq('platform_id', id);

      if (error) throw error;

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

      toast.success(`${platform?.name} API key อัปเดตสำเร็จ`);
      return true;
    } catch (error: any) {
      toast.error(`อัปเดต API key ล้มเหลว: ${error.message}`);
      return false;
    }
  };

  const refreshPlatformStatus = async (id: string) => {
    if (!teamId) return;
    const platform = platforms.find(p => p.id === id);
    toast.info(`กำลังตรวจสอบ ${platform?.name}...`);

    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));

    await supabase
      .from('workspace_api_keys')
      .update({
        last_synced_at: new Date().toISOString(),
        sync_status: 'connected',
      })
      .eq('team_id', teamId)
      .eq('platform_id', id);

    // Simply update local lastSync
    setPlatforms((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
            ...p,
            lastSync: new Date().toLocaleString(),
            status: p.accessToken ? "connected" as PlatformStatus : "disconnected" as PlatformStatus,
          }
          : p
      )
    );
    toast.success(`${platform?.name} การเชื่อมต่อปกติ`);
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

