import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// ---------------------------------------------------------------------------
// Helper: call the mock API server
// ---------------------------------------------------------------------------
type AdRow = Record<string, unknown>;

async function callMockApi(ad: AdRow, platform: string) {
  const mockApiUrl = "http://host.docker.internal:3001/api/ads";

  const response = await fetch(mockApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ad, platform }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Platform API returned status ${response.status}`);
  }

  return await response.json() as { platform_ad_id: string };
}

const platformAdapters: Record<
  string,
  (ad: AdRow) => Promise<{ externalId: string }>
> = {
  facebook: async (ad) => {
    const data = await callMockApi(ad, "facebook");
    return { externalId: data.platform_ad_id };
  },

  instagram: async (ad) => {
    const data = await callMockApi(ad, "instagram");
    return { externalId: data.platform_ad_id };
  },

  shopee: async (ad) => {
    const data = await callMockApi(ad, "shopee");
    return { externalId: data.platform_ad_id };
  },

  tiktok: async (ad) => {
    const data = await callMockApi(ad, "tiktok");
    return { externalId: data.platform_ad_id };
  },

  linkedin: async (ad) => {
    const data = await callMockApi(ad, "linkedin");
    return { externalId: data.platform_ad_id };
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
