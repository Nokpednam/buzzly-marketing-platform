/**
 * campaign-auto-stop
 *
 * Called every 15 minutes by pg_cron (via net.http_post) or manually via HTTP.
 * For every active campaign that has hit 100% overall progress:
 *   1. Pauses each assigned ad on its external platform.
 *   2. Sets campaign.status = 'completed'.
 *   3. Writes an audit_log row.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import {
  calculateCampaignProgress,
  type ProgressInput,
} from "../_shared/campaignProgress.ts";

// ---------------------------------------------------------------------------
// Platform pause adapters
// Production: replace stubs with real API calls.
// ---------------------------------------------------------------------------
async function pauseOnPlatform(
  platform: string,
  externalAdId: string | null,
): Promise<void> {
  if (!externalAdId) return;

  // facebook:  PATCH https://graph.facebook.com/v19.0/{ad_id}  { status: "PAUSED" }
  // instagram: same as facebook (Marketing API)
  // tiktok:    POST /open_api/v1.3/ad/status/update/           { opt_status: "DISABLE" }
  // shopee:    POST /api/v2/ads/update_ad                      { status: 2 }
  // linkedin:  POST /rest/adCampaigns/{id}                     { status: "PAUSED" }

  console.log(`[auto-stop] Pausing ${platform} ad ${externalAdId}`);
  await new Promise((r) => setTimeout(r, 100)); // simulate latency
}

// ---------------------------------------------------------------------------
// Helper: write to error_logs (best-effort)
// ---------------------------------------------------------------------------
async function logError(
  supabase: ReturnType<typeof createClient>,
  message: string,
  detail: unknown,
) {
  try {
    await supabase.from("error_logs").insert({
      error_type: "edge_function",
      message,
      stack_trace: JSON.stringify(detail),
      created_at: new Date().toISOString(),
    });
  } catch {
    // never crash the main flow
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // ── 1. Fetch active campaigns that have KPI targets defined ──────────────
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select(`
        id, name, status,
        start_date, end_date,
        target_kpi_metric, target_kpi_value,
        ad_insights ( clicks, spend, conversions, impressions )
      `)
      .eq("status", "active")
      .not("target_kpi_metric", "is", null)
      .not("target_kpi_value", "is", null);

    if (campaignsError) throw campaignsError;

    const checked    = campaigns?.length ?? 0;
    const stoppedIds: string[] = [];

    for (const campaign of campaigns ?? []) {
      // ── 2. Aggregate insights for this campaign ────────────────────────────
      const rows = Array.isArray(campaign.ad_insights) ? campaign.ad_insights : [];
      const aggregated = rows.reduce(
        (acc: { clicks: number; spend: number; conversions: number; impressions: number }, row: any) => ({
          clicks:      acc.clicks      + (row.clicks      ?? 0),
          spend:       acc.spend       + (row.spend       ?? 0),
          conversions: acc.conversions + (row.conversions ?? 0),
          impressions: acc.impressions + (row.impressions ?? 0),
        }),
        { clicks: 0, spend: 0, conversions: 0, impressions: 0 },
      );

      const input: ProgressInput = {
        start_date:         campaign.start_date,
        end_date:           campaign.end_date,
        target_kpi_metric:  campaign.target_kpi_metric,
        target_kpi_value:   campaign.target_kpi_value,
        ...aggregated,
      };

      const { overallProgress, kpiProgress, timeProgress } = calculateCampaignProgress(input);

      console.log(`[auto-stop] Campaign "${campaign.name}" — overall ${overallProgress}% (kpi ${kpiProgress}%, time ${timeProgress}%)`);

      if (overallProgress < 100) continue;

      // ── 3. Fetch assigned ads via junction table ────────────────────────────
      const { data: campaignAds } = await (supabase as any)
        .from("campaign_ads")
        .select("ad_id")
        .eq("campaign_id", campaign.id);

      for (const row of (campaignAds ?? []) as { ad_id: string }[]) {
        const { data: ad } = await supabase
          .from("ads")
          .select("id, platform, platform_ad_id, external_status, status")
          .eq("id", row.ad_id)
          .single();

        if (!ad) continue;

        // Pause on external platform if it was ever published
        if (ad.external_status === "published" && ad.platform) {
          try {
            await pauseOnPlatform(ad.platform as string, ad.platform_ad_id);
          } catch (platformErr) {
            await logError(supabase, `Failed to pause ${ad.platform} ad ${ad.id}`, platformErr);
          }
        }

        // Update local status
        if (ad.status === "active") {
          await supabase
            .from("ads")
            .update({ status: "paused", updated_at: new Date().toISOString() })
            .eq("id", ad.id);
        }
      }

      // ── 4. Mark campaign completed ─────────────────────────────────────────
      await supabase
        .from("campaigns")
        .update({ status: "completed", updated_at: new Date().toISOString() } as any)
        .eq("id", campaign.id);

      // ── 5. Audit log ───────────────────────────────────────────────────────
      await (supabase as any).from("audit_logs").insert({
        action:      "campaign_auto_stopped",
        entity_type: "campaign",
        entity_id:   campaign.id,
        details: {
          campaign_name:        campaign.name,
          kpi_metric:           campaign.target_kpi_metric,
          kpi_target:           campaign.target_kpi_value,
          kpi_progress_pct:     kpiProgress,
          time_progress_pct:    timeProgress,
          overall_progress_pct: overallProgress,
          ads_paused:           (campaignAds ?? []).length,
        },
        created_at: new Date().toISOString(),
      });

      stoppedIds.push(campaign.id);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        campaigns_checked: checked,
        campaigns_stopped: stoppedIds.length,
        stopped_ids: stoppedIds,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logError(supabase, "campaign-auto-stop crashed", { message });
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
