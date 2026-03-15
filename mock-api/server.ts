import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
// Load .env from mock-api directory (tsx doesn't auto-load it)
try {
  const envPath = fileURLToPath(new URL(".env", import.meta.url));
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
} catch (e) {
  console.error("Failed to load .env:", e);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// ─── Environment Configuration ────────────────────────────────────────
// Points to the external data API. In dev this loops back to our own mock
// endpoints; in production point to real Facebook/Shopee/etc. base URLs.
const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || `http://localhost:${PORT}`;
const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Lazy Supabase client (service role — bypasses RLS for server-side writes)
let _supabase: SupabaseClient<any> | null = null;
function getSupabaseClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. " +
      "Add it to mock-api/.env (run: supabase status to get the key)."
    );
  }
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return _supabase;
}

app.use(cors());
app.use(express.json());

// ─── Mock API Key Dictionary ──────────────────────────────────────────
// Each key maps to a { tenant, platform, shopLabel }
const MOCK_API_KEYS: Record<string, { tenant: string; platform: string; shopLabel: string }> = {
  "FB_TEST_KEY_SHOP_A": { tenant: "shop-a", platform: "facebook", shopLabel: "Shop A – High Volume" },
  "FB_TEST_KEY_SHOP_B": { tenant: "shop-b", platform: "facebook", shopLabel: "Shop B – Niche/High-Conversion" },
  "IG_TEST_KEY_SHOP_A": { tenant: "shop-a", platform: "instagram", shopLabel: "Shop A – High Volume" },
  "IG_TEST_KEY_SHOP_B": { tenant: "shop-b", platform: "instagram", shopLabel: "Shop B – Niche/High-Conversion" },
  "TT_TEST_KEY_SHOP_A": { tenant: "shop-a", platform: "tiktok", shopLabel: "Shop A – High Volume" },
  "TT_TEST_KEY_SHOP_B": { tenant: "shop-b", platform: "tiktok", shopLabel: "Shop B – Niche/High-Conversion" },
  "SHP_TEST_KEY_SHOP_A": { tenant: "shop-a", platform: "shopee", shopLabel: "Shop A – High Volume" },
  "SHP_TEST_KEY_SHOP_B": { tenant: "shop-b", platform: "shopee", shopLabel: "Shop B – Niche/High-Conversion" },
  "GG_TEST_KEY_SHOP_A": { tenant: "shop-a", platform: "google", shopLabel: "Shop A – High Volume" },
  "GG_TEST_KEY_SHOP_B": { tenant: "shop-b", platform: "google", shopLabel: "Shop B – Niche/High-Conversion" },
};

// Helper: load fixture JSON
function loadFixture(platform: string, tenant: string, endpoint: string) {
  const filePath = join(__dirname, "fixtures", platform, `${tenant}-${endpoint}.json`);
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (e) {
    return { error: `Fixture not found: ${filePath}` };
  }
}

// ─── Facebook Endpoints ──────────────────────────────────────────────
app.get("/facebook/:tenant/insights", (req, res) => {
  res.json(loadFixture("facebook", req.params.tenant, "insights"));
});

app.get("/facebook/:tenant/leads", (req, res) => {
  res.json(loadFixture("facebook", req.params.tenant, "leads"));
});

app.get("/facebook/:tenant/ads", (req, res) => {
  res.json(loadFixture("facebook", req.params.tenant, "ads"));
});

app.get("/facebook/:tenant/chats", (req, res) => {
  res.json(loadFixture("facebook", req.params.tenant, "chats"));
});

// ─── Instagram Endpoints ─────────────────────────────────────────────
app.get("/instagram/:tenant/ads", (req, res) => {
  res.json(loadFixture("instagram", req.params.tenant, "ads"));
});

// ─── TikTok Endpoints ────────────────────────────────────────────────
app.get("/tiktok/:tenant/ads", (req, res) => {
  res.json(loadFixture("tiktok", req.params.tenant, "ads"));
});

// ─── Shopee Endpoints ────────────────────────────────────────────────
app.get("/shopee/:tenant/orders/list", (req, res) => {
  res.json(loadFixture("shopee", req.params.tenant, "orders"));
});

app.get("/shopee/:tenant/marketing/shop_performance", (req, res) => {
  res.json(loadFixture("shopee", req.params.tenant, "performance"));
});

app.get("/shopee/:tenant/ads", (req, res) => {
  res.json(loadFixture("shopee", req.params.tenant, "ads"));
});

// ─── Google Endpoints ────────────────────────────────────────────────
app.get("/google/:tenant/ads", (req, res) => {
  res.json(loadFixture("google", req.params.tenant, "ads"));
});

// ─── Validate API Key ────────────────────────────────────────────────
app.post("/validate-key", (req, res) => {
  const { apiKey, platformSlug } = req.body as { apiKey?: string; platformSlug?: string };
  if (!apiKey) {
    res.status(400).json({ valid: false, error: "apiKey is required" });
    return;
  }
  const match = MOCK_API_KEYS[apiKey.trim()];
  if (!match) {
    res.json({ valid: false, error: "Unknown API key" });
    return;
  }
  // Optional: reject if key is for a different platform
  if (platformSlug && match.platform !== platformSlug) {
    res.json({ valid: false, error: `This key is for '${match.platform}', not '${platformSlug}'` });
    return;
  }
  res.json({ valid: true, tenant: match.tenant, platform: match.platform, shopLabel: match.shopLabel });
});

// ─── Backend Ingestion Endpoint ───────────────────────────────────────
// Validates the API key, fetches the full platform dataset (ads, leads,
// chats), and writes everything to Supabase with the correct team_id so
// the frontend's workspace-scoped queries can find the records.
// Raw external data never leaves the server.
app.post("/api/connect", async (req, res) => {
  const { apiKey, platformSlug, workspaceId, adAccountId } = req.body as {
    apiKey?: string;
    platformSlug?: string;
    workspaceId?: string;
    adAccountId?: string;
  };

  if (!apiKey || !workspaceId || !adAccountId) {
    res.status(400).json({ error: "apiKey, workspaceId, and adAccountId are required" });
    return;
  }

  // 1. Validate API key
  const keyInfo = MOCK_API_KEYS[apiKey.trim()];
  if (!keyInfo) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }
  if (platformSlug && keyInfo.platform !== platformSlug) {
    res.status(401).json({
      error: `This key is for '${keyInfo.platform}', not '${platformSlug}'`,
    });
    return;
  }

  const tenant = keyInfo.tenant;
  const platform = keyInfo.platform;

  try {
    const supabase = getSupabaseClient();

    // 2. Fetch ads and (for Facebook) leads + chats in parallel
    const [adsRes, leadsRes, chatsRes] = await Promise.all([
      fetch(`${EXTERNAL_API_BASE_URL}/${platform}/${tenant}/ads`),
      platform === "facebook"
        ? fetch(`${EXTERNAL_API_BASE_URL}/facebook/${tenant}/leads`)
        : Promise.resolve(null),
      platform === "facebook"
        ? fetch(`${EXTERNAL_API_BASE_URL}/facebook/${tenant}/chats`)
        : Promise.resolve(null),
    ]);

    if (!adsRes.ok) throw new Error(`Ads endpoint responded with ${adsRes.status}`);
    const { data: adsData } = (await adsRes.json()) as { data: any[] };

    const leadsData: any[] = leadsRes?.ok
      ? ((await leadsRes.json()) as { data: any[] }).data ?? []
      : [];

    const chatsData: any[] = chatsRes?.ok
      ? ((await chatsRes.json()) as { conversations: any[] }).conversations ?? []
      : [];

    // 3. Clear stale data for this workspace + platform (full-replace sync)
    await supabase.from("ad_insights").delete().eq("ad_account_id", adAccountId);
    await supabase.from("ads").delete().eq("team_id", workspaceId).eq("platform", platform);
    if (platform === "facebook") {
      // Remove previously synced chats so we don't accumulate duplicates
      await supabase
        .from("social_posts")
        .delete()
        .eq("team_id", workspaceId)
        .eq("post_channel", "facebook")
        .eq("post_type", "chat");
    }

    // 4. Upsert ads with team_id and generate daily ad_insights.
    //    Ads are ingested as ORPHANS — not linked to any campaign.
    //    Users assign ads to campaigns in the Campaign Builder.
    const insightRows: any[] = [];

    for (const ad of adsData) {
      const { data: upsertedAd } = await (supabase as any)
        .from("ads")
        .upsert(
          {
            team_id: workspaceId,       // ← scope every ad to this workspace
            name: ad.ad_name,
            status: ad.status === "ACTIVE" ? "active" : "paused",
            platform: platform,
            platform_ad_id: ad.external_ad_id,
            external_status: "published",
            persona_data: ad.persona_data ?? null,
          },
          { onConflict: "platform_ad_id" }
        )
        .select("id")
        .single();

      const adId = upsertedAd?.id ?? null;

      // Spread totals evenly over the flight window with light jitter
      const startDate = new Date(ad.date_start);
      const endDate = new Date(ad.date_stop);
      const totalDays = Math.max(
        1,
        Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1
      );

      for (let d = 0; d < totalDays; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + d);
        const jitter = 0.7 + Math.random() * 0.6;

        insightRows.push({
          ad_account_id: adAccountId,
          campaign_id: null,
          ads_id: adId,
          date: date.toISOString().split("T")[0],
          impressions: Math.round((Number(ad.impressions) / totalDays) * jitter),
          clicks: Math.round((Number(ad.clicks) / totalDays) * jitter),
          spend: parseFloat(((Number(ad.spend) / totalDays) * jitter).toFixed(2)),
          reach: Math.round((Number(ad.reach) / totalDays) * jitter),
          conversions: Math.round((Number(ad.conversions) / totalDays) * jitter),
          ctr: Number(ad.ctr),
          cpc: Number(ad.cpc),
          cpm: Number(ad.cpm),
          roas: Number(ad.roas),
        });
      }
    }

    const { error: insertError } = await supabase.from("ad_insights").insert(insightRows);
    if (insertError) throw insertError;

    // 5. Upsert Facebook leads as customer_personas
    let personasInserted = 0;
    if (leadsData.length > 0) {
      const getField = (lead: any, name: string): string | null =>
        lead.field_data?.find((f: any) => f.name === name)?.values?.[0] ?? null;

      const personaRows = leadsData.map((lead: any) => ({
        team_id: workspaceId,
        persona_name: getField(lead, "full_name") ?? `Lead ${lead.id}`,
        description: getField(lead, "company_name"),
        profession: getField(lead, "company_name"),
        is_active: true,
        is_template: false,
        custom_fields: {
          source: "facebook_lead_ad",
          lead_id: lead.id,
          email: getField(lead, "email"),
          phone: getField(lead, "phone_number"),
          form_id: lead.form_id ?? null,
          ad_id: lead.ad_id ?? null,
          created_time: lead.created_time ?? null,
        },
      }));

      const { error: personaError } = await supabase
        .from("customer_personas")
        .insert(personaRows);
      if (personaError) {
        console.warn("[/api/connect] personas insert warn:", personaError.message);
      } else {
        personasInserted = personaRows.length;
      }
    }

    // 6. Insert Facebook chats as social_posts (one row per conversation thread)
    let chatsInserted = 0;
    if (chatsData.length > 0) {
      const chatRows = chatsData.map((conv: any) => {
        const msgs: any[] = conv.messages ?? [];
        const lastMsg = msgs[msgs.length - 1];
        return {
          team_id: workspaceId,
          post_channel: "facebook",
          post_type: "chat",
          platform_post_id: conv.thread_id,
          name: conv.participant?.name ?? "Unknown",
          content: lastMsg?.text ?? null,
          published_at: conv.last_message_time ?? new Date().toISOString(),
          status: "published",
          comments: conv.unread_count ?? 0,
        };
      });

      const { error: chatError } = await supabase.from("social_posts").insert(chatRows);
      if (chatError) {
        console.warn("[/api/connect] chats insert warn:", chatError.message);
      } else {
        chatsInserted = chatsData.length;
      }
    }

    // 7. Return summary — raw external data stays on the server
    res.json({
      message: "Data synced successfully",
      adsUpserted: adsData.length,
      rowsInserted: insightRows.length,
      personasInserted,
      chatsInserted,
      platform,
      tenant,
    });
  } catch (err: any) {
    console.error("[POST /api/connect] ingestion error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Ad Creation Endpoint (Simulated) ──────────────────────────────────
// This simulates the creation of an ad on an external platform.
// Called by the create-platform-ad Edge Function.
app.post("/api/ads", async (req, res) => {
  const { ad, platform } = req.body as { ad: any; platform: string };

  if (!ad || !platform) {
    res.status(400).json({ error: "ad and platform are required" });
    return;
  }

  console.log(`[POST /api/ads] Simulating ad creation on ${platform} for: ${ad.name}`);

  // Simulating platform latency
  await new Promise(r => setTimeout(r, 1200));

  // 10% chance of failure to test error handling
  if (Math.random() < 0.1) {
    console.error(`[POST /api/ads] Simulated platform error for ${platform}`);
    res.status(502).json({ error: `Simulated ${platform} API error` });
    return;
  }

  const externalId = `${platform.slice(0, 2)}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  res.json({
    success: true,
    platform_ad_id: externalId,
    status: "active",
    metadata: {
      creative_id: `ct_${Math.random().toString(36).substring(7)}`,
      published_at: new Date().toISOString()
    }
  });
});

// ─── Health Check ────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", tenants: ["shop-a", "shop-b"] });
});

// ─── List all routes ─────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    name: "Buzzly Mock API Server",
    version: "1.0.0",
    endpoints: [
      "POST /validate-key                          — validate a mock API key",
      "POST /api/connect                           — ingest external data → Supabase (returns status only)",
      "GET  /facebook/:tenant/insights",
      "GET  /facebook/:tenant/leads",
      "GET  /facebook/:tenant/ads",
      "GET  /facebook/:tenant/chats",
      "GET  /instagram/:tenant/ads",
      "GET  /tiktok/:tenant/ads",
      "GET  /shopee/:tenant/orders/list",
      "GET  /shopee/:tenant/marketing/shop_performance",
      "GET  /shopee/:tenant/ads",
      "GET  /google/:tenant/ads",
      "GET  /health",
    ],
    tenants: ["shop-a", "shop-b"],
    docs: "Use shop-a for high-volume data or shop-b for niche/high-conversion data",
    validKeys: Object.entries(MOCK_API_KEYS).map(([key, val]) => ({ key, ...val })),
  });
});

app.listen(PORT, () => {
  console.log(`\n🐝 Buzzly Mock API Server running at http://localhost:${PORT}`);
  console.log(`   Tenants: shop-a (high volume) | shop-b (niche)`);
  console.log(`\n   Endpoints:`);
  console.log(`   POST /validate-key`);
  console.log(`   GET  /facebook/:tenant/insights`);
  console.log(`   GET  /facebook/:tenant/leads`);
  console.log(`   GET  /facebook/:tenant/ads`);
  console.log(`   GET  /facebook/:tenant/chats`);
  console.log(`   GET  /instagram/:tenant/ads`);
  console.log(`   GET  /tiktok/:tenant/ads`);
  console.log(`   GET  /shopee/:tenant/orders/list`);
  console.log(`   GET  /shopee/:tenant/marketing/shop_performance`);
  console.log(`   GET  /shopee/:tenant/ads`);
  console.log(`   GET  /google/:tenant/ads`);
  console.log(`\n   Valid API Keys:`);
  Object.entries(MOCK_API_KEYS).forEach(([key, val]) => {
    console.log(`   ${key.padEnd(22)} → ${val.shopLabel}`);
  });
  console.log();
});
