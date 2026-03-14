import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
// Load .env from mock-api directory (tsx doesn't auto-load it)
try {
  const envPath = new URL(".env", import.meta.url).pathname;
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
} catch { /* .env is optional */ }

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
let _supabase: ReturnType<typeof createClient> | null = null;
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
  "FB_TEST_KEY_SHOP_A":  { tenant: "shop-a", platform: "facebook",  shopLabel: "Shop A – High Volume" },
  "FB_TEST_KEY_SHOP_B":  { tenant: "shop-b", platform: "facebook",  shopLabel: "Shop B – Niche/High-Conversion" },
  "IG_TEST_KEY_SHOP_A":  { tenant: "shop-a", platform: "instagram", shopLabel: "Shop A – High Volume" },
  "IG_TEST_KEY_SHOP_B":  { tenant: "shop-b", platform: "instagram", shopLabel: "Shop B – Niche/High-Conversion" },
  "TT_TEST_KEY_SHOP_A":  { tenant: "shop-a", platform: "tiktok",    shopLabel: "Shop A – High Volume" },
  "TT_TEST_KEY_SHOP_B":  { tenant: "shop-b", platform: "tiktok",    shopLabel: "Shop B – Niche/High-Conversion" },
  "SHP_TEST_KEY_SHOP_A": { tenant: "shop-a", platform: "shopee",    shopLabel: "Shop A – High Volume" },
  "SHP_TEST_KEY_SHOP_B": { tenant: "shop-b", platform: "shopee",    shopLabel: "Shop B – Niche/High-Conversion" },
  "GG_TEST_KEY_SHOP_A":  { tenant: "shop-a", platform: "google",    shopLabel: "Shop A – High Volume" },
  "GG_TEST_KEY_SHOP_B":  { tenant: "shop-b", platform: "google",    shopLabel: "Shop B – Niche/High-Conversion" },
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

// ─── Shopee Endpoints ────────────────────────────────────────────────
app.get("/shopee/:tenant/orders/list", (req, res) => {
  res.json(loadFixture("shopee", req.params.tenant, "orders"));
});

app.get("/shopee/:tenant/marketing/shop_performance", (req, res) => {
  res.json(loadFixture("shopee", req.params.tenant, "performance"));
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
// This is the core ingestion route. The frontend sends the user's API key
// here; this server validates it, fetches data from EXTERNAL_API_BASE_URL,
// transforms it, and writes it into Supabase — then returns a status code.
// Raw external API data is never forwarded to the browser.
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

  try {
    const supabase = getSupabaseClient();

    // 2. Fetch raw data from the external API (EXTERNAL_API_BASE_URL)
    //    In dev this points back to our own mock endpoints.
    //    In production, swap EXTERNAL_API_BASE_URL to the real platform URL.
    const externalRes = await fetch(
      `${EXTERNAL_API_BASE_URL}/facebook/${tenant}/insights`
    );
    if (!externalRes.ok) {
      throw new Error(`External API responded with ${externalRes.status}`);
    }
    const { data: campaigns } = (await externalRes.json()) as { data: any[] };

    // 3. Clear previous insights for this ad account (full replace sync)
    await supabase.from("ad_insights").delete().eq("ad_account_id", adAccountId);

    // 4. Transform and ingest — upsert campaigns + generate daily ad_insights
    const insightRows: object[] = [];

    for (const campaign of campaigns) {
      // Upsert campaign record linked to this ad account
      const { data: upsertedCampaign } = await supabase
        .from("campaigns")
        .upsert(
          {
            ad_account_id: adAccountId,
            name: campaign.campaign_name,
            status: "active",
            objective: campaign.objective ?? null,
            budget_amount: parseFloat(campaign.spend),
            start_date: campaign.date_start,
            end_date: campaign.date_stop,
          },
          { onConflict: "id" }
        )
        .select("id")
        .single();

      const startDate = new Date(campaign.date_start);
      const endDate = new Date(campaign.date_stop);
      const totalDays =
        Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;

      for (let d = 0; d < totalDays; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + d);
        const jitter = 0.7 + Math.random() * 0.6;

        insightRows.push({
          ad_account_id: adAccountId,
          campaign_id: upsertedCampaign?.id ?? null,
          date: date.toISOString().split("T")[0],
          impressions: Math.round((parseInt(campaign.impressions) / totalDays) * jitter),
          clicks: Math.round((parseInt(campaign.clicks) / totalDays) * jitter),
          spend: parseFloat(((parseFloat(campaign.spend) / totalDays) * jitter).toFixed(2)),
          reach: Math.round((parseInt(campaign.reach) / totalDays) * jitter),
          conversions: Math.round((parseInt(campaign.conversions) / totalDays) * jitter),
          ctr: parseFloat(campaign.ctr),
          cpc: parseFloat(campaign.cpc),
          cpm: parseFloat(campaign.cpm),
          roas: parseFloat(campaign.roas),
        });
      }
    }

    const { error: insertError } = await supabase
      .from("ad_insights")
      .insert(insightRows);
    if (insertError) throw insertError;

    // 5. Return only a success status — raw external data stays on the server
    res.json({
      message: "Data synced successfully",
      rowsInserted: insightRows.length,
      platform: platformSlug ?? keyInfo.platform,
      tenant,
    });
  } catch (err: any) {
    console.error("[POST /api/connect] ingestion error:", err.message);
    res.status(500).json({ error: err.message });
  }
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
      "GET  /shopee/:tenant/orders/list",
      "GET  /shopee/:tenant/marketing/shop_performance",
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
  console.log(`   GET  /shopee/:tenant/orders/list`);
  console.log(`   GET  /shopee/:tenant/marketing/shop_performance`);
  console.log(`\n   Valid API Keys:`);
  Object.entries(MOCK_API_KEYS).forEach(([key, val]) => {
    console.log(`   ${key.padEnd(22)} → ${val.shopLabel}`);
  });
  console.log();
});
