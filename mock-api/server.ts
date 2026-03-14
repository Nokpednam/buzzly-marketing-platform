import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

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
