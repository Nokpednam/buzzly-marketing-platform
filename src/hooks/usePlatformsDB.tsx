import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MOCK_API_BASE_URL } from '@/lib/mockApiKeys';

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

// Show these 5 platforms: Instagram, Facebook, TikTok, Shopee, Google
const ALLOWED_PLATFORM_SLUGS = ['facebook', 'instagram', 'tiktok', 'shopee', 'google'];

/**
 * Fetches Facebook insights from the mock API for a given tenant, then upserts
 * daily records into the Supabase `ad_insights` table for the specified ad account.
 * We use Facebook fixtures for all platform types in mock mode.
 */
async function seedInsightsFromMockAPI(
  tenant: "shop-a" | "shop-b",
  adAccountId: string,
): Promise<number> {
  const res = await fetch(`${MOCK_API_BASE_URL}/facebook/${tenant}/insights`);
  if (!res.ok) throw new Error("Mock API unreachable");
  const { data: campaigns } = await res.json() as { data: any[] };

  const insightRows: object[] = [];
  for (const campaign of campaigns) {
    const startDate = new Date(campaign.date_start);
    const endDate = new Date(campaign.date_stop);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;

    for (let d = 0; d < totalDays; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      const jitter = 0.7 + Math.random() * 0.6;

      insightRows.push({
        ad_account_id: adAccountId,
        date: date.toISOString().split("T")[0],
        impressions: Math.round((parseInt(campaign.impressions) / totalDays) * jitter),
        clicks: Math.round((parseInt(campaign.clicks) / totalDays) * jitter),
        spend: parseFloat((parseFloat(campaign.spend) / totalDays * jitter).toFixed(2)),
        reach: Math.round((parseInt(campaign.reach) / totalDays) * jitter),
        conversions: Math.round((parseInt(campaign.conversions) / totalDays) * jitter),
        ctr: parseFloat(campaign.ctr),
        cpc: parseFloat(campaign.cpc),
        cpm: parseFloat(campaign.cpm),
        roas: parseFloat(campaign.roas),
      });
    }
  }

  // Wipe previous data for this account and insert fresh shop-specific rows
  await supabase.from("ad_insights").delete().eq("ad_account_id", adAccountId);
  const { error } = await supabase.from("ad_insights").insert(insightRows);
  if (error) throw error;
  return insightRows.length;
}

export function usePlatformsDB(teamId: string | null | undefined) {
  const [platforms, setPlatforms] = useState<PlatformWithConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

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

  // Connect platform — optionally with a mock API key to seed shop-specific data
  const connectPlatform = async (platformId: string, apiKey?: string): Promise<boolean> => {
    if (!teamId) {
      toast.error('กรุณาสร้าง Workspace ก่อน');
      return false;
    }

    try {
      const platform = platforms.find(p => p.id === platformId);
      let tenant: "shop-a" | "shop-b" | null = null;
      let accessToken = apiKey?.trim() || `oauth_${platform?.slug || 'key'}_${Date.now().toString(36)}`;

      // ── Step 1: Validate the API key against the mock server ───────
      if (apiKey?.trim()) {
        toast.info('กำลังตรวจสอบ API Key...');
        try {
          const validateRes = await fetch(`${MOCK_API_BASE_URL}/validate-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: apiKey.trim(), platformSlug: platform?.slug }),
          });
          const validation = await validateRes.json() as {
            valid: boolean; tenant?: string; shopLabel?: string; error?: string;
          };

          if (!validation.valid) {
            toast.error(`API Key ไม่ถูกต้อง: ${validation.error ?? 'Unknown key'}`);
            return false;
          }
          tenant = validation.tenant as "shop-a" | "shop-b";
          toast.info(`พบ ${validation.shopLabel} · กำลังโหลดข้อมูล...`);
        } catch {
          toast.error('ไม่สามารถติดต่อ Mock API Server ได้ — รัน: cd mock-api && npm start');
          return false;
        }
      } else {
        toast.info(`กำลังเชื่อมต่อ ${platform?.name}...`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // ── Step 2: Upsert workspace_api_keys ────────────────────────
      const { error: keyError } = await supabase
        .from('workspace_api_keys')
        .upsert({
          team_id: teamId,
          platform_id: platformId,
          access_token: accessToken,
          sync_status: 'connected',
          is_active: true,
          last_synced_at: new Date().toISOString(),
          error_message: null,
        }, { onConflict: 'team_id,platform_id' });

      if (keyError) {
        console.warn('workspace_api_keys upsert failed, using optimistic UI:', keyError);
      }

      // ── Step 3: Ensure ad_account exists for this team+platform ──
      await supabase.from('ad_accounts').upsert({
        team_id: teamId,
        platform_id: platformId,
        account_name: `${platform?.name || 'Platform'} Account`,
        is_active: true,
      }, { onConflict: 'team_id,platform_id', ignoreDuplicates: false });

      const { data: adAccount } = await supabase
        .from('ad_accounts')
        .select('id')
        .eq('team_id', teamId)
        .eq('platform_id', platformId)
        .maybeSingle();

      // ── Step 4: Seed insights data ───────────────────────────────
      if (adAccount?.id) {
        if (tenant) {
          // Valid mock key → fetch and upsert shop-specific fixture data
          try {
            const count = await seedInsightsFromMockAPI(tenant, adAccount.id);
            toast.success(`โหลดข้อมูล ${count} วันสำเร็จ!`);
          } catch (seedErr) {
            console.warn('Mock API seed failed, falling back to generic demo:', seedErr);
            await (supabase as any).rpc('seed_demo_insights', { p_ad_account_id: adAccount.id });
          }
        } else {
          // No API key → use generic demo seed
          await (supabase as any).rpc('seed_demo_insights', { p_ad_account_id: adAccount.id });
        }
      }

      // ── Step 5: Optimistic local state update ─────────────────────
      setPlatforms(prev => prev.map(p => {
        if (p.id !== platformId) return p;
        return {
          ...p,
          status: 'connected',
          accessToken,
          lastSync: new Date().toLocaleString(),
          connection: {
            ...(p.connection || {}),
            id: p.connection?.id || crypto.randomUUID(),
            team_id: teamId,
            platform_id: platformId,
            access_token: accessToken,
            sync_status: 'connected',
            is_active: true,
            last_synced_at: new Date().toISOString(),
            error_message: null,
            account_id_on_platform: null,
            api_key_encrypted: null,
          },
        };
      }));

      toast.success(`${platform?.name} เชื่อมต่อสำเร็จ!`);

      // ── Step 6: Invalidate React Query caches ─────────────────────
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      await queryClient.invalidateQueries({ queryKey: ['ad-accounts'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      await queryClient.invalidateQueries({ queryKey: ['ad-insights'] });
      await queryClient.invalidateQueries({ queryKey: ['revenue-metrics-dashboard'] });

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
      await queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      await queryClient.invalidateQueries({ queryKey: ['ad-insights'] });
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
