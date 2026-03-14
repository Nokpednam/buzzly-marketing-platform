import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// ---------------------------------------------------------------------------
// Platform adapters
// In production: replace each stub with the real SDK / HTTP call for that
// platform (Facebook Graph API, Shopee Marketing API, TikTok Ads API, etc.).
// The contract: receive the ad row, return the external ad ID assigned by the
// platform, or throw with a descriptive message.
// ---------------------------------------------------------------------------
type AdRow = Record<string, unknown>;

const platformAdapters: Record<
  string,
  (ad: AdRow) => Promise<{ externalId: string }>
> = {
  facebook: async (ad) => {
    // Production:
    //   POST https://graph.facebook.com/v19.0/act_{ad_account_id}/ads
    //   Headers: { Authorization: `Bearer ${Deno.env.get("FB_ACCESS_TOKEN")}` }
    //   Body: { name, creative, status, ... }
    await new Promise((r) => setTimeout(r, 400)); // simulate network latency
    return {
      externalId: `fb_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    };
  },

  instagram: async (_ad) => {
    // Instagram ads are created through the Facebook Marketing API using the
    // same ad account. Separate adapter kept for clarity.
    await new Promise((r) => setTimeout(r, 400));
    return {
      externalId: `ig_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    };
  },

  shopee: async (_ad) => {
    // Production:
    //   POST https://partner.shopeemobile.com/api/v2/ads/create_ad
    //   Signed with HMAC-SHA256 using Deno.env.get("SHOPEE_PARTNER_KEY")
    await new Promise((r) => setTimeout(r, 400));
    return {
      externalId: `shopee_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    };
  },

  tiktok: async (_ad) => {
    // Production:
    //   POST https://business-api.tiktok.com/open_api/v1.3/ad/create/
    //   Headers: { Access-Token: Deno.env.get("TIKTOK_ACCESS_TOKEN") }
    await new Promise((r) => setTimeout(r, 400));
    return {
      externalId: `tt_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    };
  },

  linkedin: async (_ad) => {
    // Production: LinkedIn Marketing API v2
    await new Promise((r) => setTimeout(r, 400));
    return {
      externalId: `li_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    };
  },
};

// ---------------------------------------------------------------------------
// Helper: write to error_logs table (best-effort, never throws)
// ---------------------------------------------------------------------------
async function logErrorToDb(
  supabase: ReturnType<typeof createClient>,
  message: string,
  details: unknown,
) {
  try {
    await supabase.from("error_logs").insert({
      error_type: "edge_function",
      message,
      stack_trace: JSON.stringify(details),
      created_at: new Date().toISOString(),
    });
  } catch {
    // swallow — error logging must never crash the main flow
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let ad_id: string | undefined;

  try {
    const body = await req.json();
    ad_id = body.ad_id as string | undefined;
    const platform = body.platform as string | undefined;

    // --- Validate input ---
    if (!ad_id || !platform) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: ad_id, platform" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const adapter = platformAdapters[platform.toLowerCase()];
    if (!adapter) {
      return new Response(
        JSON.stringify({ error: `Unsupported platform: ${platform}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- Fetch the ad ---
    const { data: ad, error: fetchError } = await supabase
      .from("ads")
      .select("*")
      .eq("id", ad_id)
      .single();

    if (fetchError || !ad) {
      return new Response(
        JSON.stringify({ error: "Ad not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- Mark as pending so the UI can show a spinner ---
    await supabase
      .from("ads")
      .update({
        external_status: "pending",
        platform: platform.toLowerCase(),
        external_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ad_id);

    // --- Call the platform API ---
    const { externalId } = await adapter(ad as AdRow);

    // --- Persist result ---
    const { error: updateError } = await supabase
      .from("ads")
      .update({
        platform_ad_id: externalId,
        external_status: "published",
        external_error: null,
        status: "active",
        platform: platform.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", ad_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, platform_ad_id: externalId, status: "published" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Attempt to mark the ad as failed
    if (ad_id) {
      await supabase
        .from("ads")
        .update({
          external_status: "failed",
          external_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ad_id);
    }

    await logErrorToDb(supabase, `create-platform-ad failed for ad ${ad_id}`, { message });

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
