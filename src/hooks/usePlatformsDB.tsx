import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Platform {
  id: string;
  name: string;
  slug: string | null;
  icon_url: string | null;
  description: string | null;
  is_active: boolean;
  platform_category_id: string | null;
  category_name?: string;
}

interface WorkspaceApiKey {
  id: string;
  team_id: string;
  platform_id: string;
  api_key_encrypted: string | null;
  access_token: string | null;
  account_id_on_platform: string | null;
  sync_status: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  error_message: string | null;
  platform?: Platform;
}

interface PlatformWithConnection extends Platform {
  connection: WorkspaceApiKey | null;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  accessToken?: string;
  error?: string;
}

// Only show these 4 platforms
const ALLOWED_PLATFORM_SLUGS = ['facebook', 'instagram', 'tiktok', 'shopee'];

export function usePlatformsDB(teamId: string | null | undefined) {
  const [platforms, setPlatforms] = useState<PlatformWithConnection[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch platforms and connections
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setLoading(true);

        // Fetch only the 4 allowed platforms
        const { data: platformsData, error: platformsError } = await supabase
          .from('platforms')
          .select(`
            *,
            platform_categories(name)
          `)
          .eq('is_active', true)
          .in('slug', ALLOWED_PLATFORM_SLUGS)
          .order('name');

        if (platformsError) throw platformsError;

        let connectionsMap: Record<string, WorkspaceApiKey> = {};

        // Fetch connections for this team if teamId exists
        if (teamId) {
          const { data: connectionsData, error: connectionsError } = await supabase
            .from('workspace_api_keys')
            .select('*')
            .eq('team_id', teamId);

          if (connectionsError) throw connectionsError;

          if (connectionsData) {
            connectionsData.forEach((conn) => {
              connectionsMap[conn.platform_id] = conn;
            });
          }
        }

        // Merge platforms with connections
        const mergedPlatforms: PlatformWithConnection[] = (platformsData || []).map((platform: any) => {
          const connection = connectionsMap[platform.id] || null;
          let status: 'connected' | 'disconnected' | 'error' = 'disconnected';
          
          if (connection) {
            if (connection.error_message) {
              status = 'error';
            } else if (connection.is_active && (connection.access_token || connection.api_key_encrypted)) {
              status = 'connected';
            }
          }

          return {
            ...platform,
            category_name: platform.platform_categories?.name || null,
            connection,
            status,
            lastSync: connection?.last_synced_at 
              ? new Date(connection.last_synced_at).toLocaleString() 
              : undefined,
            accessToken: connection?.access_token || undefined,
            error: connection?.error_message || undefined,
          };
        });

        setPlatforms(mergedPlatforms);
      } catch (error) {
        console.error('Error fetching platforms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, [teamId]);

  // Refetch function
  const refetch = useCallback(async () => {
    try {
      setLoading(true);

      const { data: platformsData, error: platformsError } = await supabase
        .from('platforms')
        .select(`
          *,
          platform_categories(name)
        `)
        .eq('is_active', true)
        .in('slug', ALLOWED_PLATFORM_SLUGS)
        .order('name');

      if (platformsError) throw platformsError;

      let connectionsMap: Record<string, WorkspaceApiKey> = {};

      if (teamId) {
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('workspace_api_keys')
          .select('*')
          .eq('team_id', teamId);

        if (connectionsError) throw connectionsError;

        if (connectionsData) {
          connectionsData.forEach((conn) => {
            connectionsMap[conn.platform_id] = conn;
          });
        }
      }

      const mergedPlatforms: PlatformWithConnection[] = (platformsData || []).map((platform: any) => {
        const connection = connectionsMap[platform.id] || null;
        let status: 'connected' | 'disconnected' | 'error' = 'disconnected';
        
        if (connection) {
          if (connection.error_message) {
            status = 'error';
          } else if (connection.is_active && (connection.access_token || connection.api_key_encrypted)) {
            status = 'connected';
          }
        }

        return {
          ...platform,
          category_name: platform.platform_categories?.name || null,
          connection,
          status,
          lastSync: connection?.last_synced_at 
            ? new Date(connection.last_synced_at).toLocaleString() 
            : undefined,
          accessToken: connection?.access_token || undefined,
          error: connection?.error_message || undefined,
        };
      });

      setPlatforms(mergedPlatforms);
    } catch (error) {
      console.error('Error refetching platforms:', error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // Connect platform (simulate OAuth)
  const connectPlatform = async (platformId: string) => {
    if (!teamId) {
      toast.error('กรุณาสร้าง Workspace ก่อน');
      return false;
    }

    try {
      const platform = platforms.find(p => p.id === platformId);
      toast.info(`กำลังเชื่อมต่อ ${platform?.name}...`);

      // Simulate OAuth token
      const mockToken = `oauth_${platform?.slug}_${Date.now()}`;

      const { error } = await supabase
        .from('workspace_api_keys')
        .upsert({
          team_id: teamId,
          platform_id: platformId,
          access_token: mockToken,
          sync_status: 'connected',
          is_active: true,
          last_synced_at: new Date().toISOString(),
          error_message: null,
        }, {
          onConflict: 'team_id,platform_id',
        });

      if (error) throw error;

      await refetch();
      toast.success(`${platform?.name} เชื่อมต่อสำเร็จ!`);
      return true;
    } catch (error: any) {
      toast.error(`เชื่อมต่อล้มเหลว: ${error.message}`);
      return false;
    }
  };

  // Disconnect platform
  const disconnectPlatform = async (platformId: string) => {
    if (!teamId) return false;

    try {
      const platform = platforms.find(p => p.id === platformId);

      const { error } = await supabase
        .from('workspace_api_keys')
        .delete()
        .eq('team_id', teamId)
        .eq('platform_id', platformId);

      if (error) throw error;

      await refetch();
      toast.success(`${platform?.name} ถูกยกเลิกการเชื่อมต่อ`);
      return true;
    } catch (error: any) {
      toast.error(`ยกเลิกการเชื่อมต่อล้มเหลว: ${error.message}`);
      return false;
    }
  };

  // Update API key/token
  const updatePlatformToken = async (platformId: string, token: string) => {
    if (!teamId) return false;

    try {
      const platform = platforms.find(p => p.id === platformId);

      const { error } = await supabase
        .from('workspace_api_keys')
        .update({
          access_token: token,
          last_synced_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('team_id', teamId)
        .eq('platform_id', platformId);

      if (error) throw error;

      await refetch();
      toast.success(`${platform?.name} API key อัปเดตสำเร็จ`);
      return true;
    } catch (error: any) {
      toast.error(`อัปเดต API key ล้มเหลว: ${error.message}`);
      return false;
    }
  };

  // Refresh connection status
  const refreshPlatformStatus = async (platformId: string) => {
    if (!teamId) return;

    const platform = platforms.find(p => p.id === platformId);
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
      .eq('platform_id', platformId);

    await refetch();
    toast.success(`${platform?.name} การเชื่อมต่อปกติ`);
  };

  const connectedPlatforms = platforms.filter(p => p.status === 'connected');

  return {
    platforms,
    connectedPlatforms,
    loading,
    connectPlatform,
    disconnectPlatform,
    updatePlatformToken,
    refreshPlatformStatus,
    refetch,
  };
}
