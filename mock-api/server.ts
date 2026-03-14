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
      "GET /facebook/:tenant/insights",
      "GET /facebook/:tenant/leads",
      "GET /shopee/:tenant/orders/list",
      "GET /shopee/:tenant/marketing/shop_performance",
      "GET /health",
    ],
    tenants: ["shop-a", "shop-b"],
    docs: "Use shop-a for high-volume data or shop-b for niche/high-conversion data",
  });
});

app.listen(PORT, () => {
  console.log(`\n🐝 Buzzly Mock API Server running at http://localhost:${PORT}`);
  console.log(`   Tenants: shop-a (high volume) | shop-b (niche)`);
  console.log(`\n   Endpoints:`);
  console.log(`   GET /facebook/:tenant/insights`);
  console.log(`   GET /facebook/:tenant/leads`);
  console.log(`   GET /shopee/:tenant/orders/list`);
  console.log(`   GET /shopee/:tenant/marketing/shop_performance\n`);
});
