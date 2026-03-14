/**
 * mockApiKeys.ts
 *
 * Client-side mirror of the mock API server's key dictionary.
 * Used by the UI to show developer hints about which keys are valid.
 *
 * The mock server must be running: cd mock-api && npm start   (port 3001)
 */

// Backend/Mock API server URL — override via VITE_BACKEND_API_URL in .env
export const MOCK_API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL ?? "http://localhost:3001";

export interface MockKeyInfo {
  tenant: "shop-a" | "shop-b";
  platform: string;
  shopLabel: string;
}

/** Full key → info mapping (mirrors mock-api/server.ts) */
export const MOCK_API_KEYS: Record<string, MockKeyInfo> = {
  FB_TEST_KEY_SHOP_A:  { tenant: "shop-a", platform: "facebook",  shopLabel: "Shop A – High Volume" },
  FB_TEST_KEY_SHOP_B:  { tenant: "shop-b", platform: "facebook",  shopLabel: "Shop B – Niche/High-Conv" },
  IG_TEST_KEY_SHOP_A:  { tenant: "shop-a", platform: "instagram", shopLabel: "Shop A – High Volume" },
  IG_TEST_KEY_SHOP_B:  { tenant: "shop-b", platform: "instagram", shopLabel: "Shop B – Niche/High-Conv" },
  TT_TEST_KEY_SHOP_A:  { tenant: "shop-a", platform: "tiktok",    shopLabel: "Shop A – High Volume" },
  TT_TEST_KEY_SHOP_B:  { tenant: "shop-b", platform: "tiktok",    shopLabel: "Shop B – Niche/High-Conv" },
  SHP_TEST_KEY_SHOP_A: { tenant: "shop-a", platform: "shopee",    shopLabel: "Shop A – High Volume" },
  SHP_TEST_KEY_SHOP_B: { tenant: "shop-b", platform: "shopee",    shopLabel: "Shop B – Niche/High-Conv" },
  GG_TEST_KEY_SHOP_A:  { tenant: "shop-a", platform: "google",    shopLabel: "Shop A – High Volume" },
  GG_TEST_KEY_SHOP_B:  { tenant: "shop-b", platform: "google",    shopLabel: "Shop B – Niche/High-Conv" },
};

/** Valid keys grouped by platform slug — used for the per-card dev hint */
export const KEYS_BY_PLATFORM: Record<string, { key: string; shopLabel: string }[]> = {
  facebook:  [
    { key: "FB_TEST_KEY_SHOP_A",  shopLabel: "Shop A – High Volume" },
    { key: "FB_TEST_KEY_SHOP_B",  shopLabel: "Shop B – Niche" },
  ],
  instagram: [
    { key: "IG_TEST_KEY_SHOP_A",  shopLabel: "Shop A – High Volume" },
    { key: "IG_TEST_KEY_SHOP_B",  shopLabel: "Shop B – Niche" },
  ],
  tiktok: [
    { key: "TT_TEST_KEY_SHOP_A",  shopLabel: "Shop A – High Volume" },
    { key: "TT_TEST_KEY_SHOP_B",  shopLabel: "Shop B – Niche" },
  ],
  shopee: [
    { key: "SHP_TEST_KEY_SHOP_A", shopLabel: "Shop A – High Volume" },
    { key: "SHP_TEST_KEY_SHOP_B", shopLabel: "Shop B – Niche" },
  ],
  google: [
    { key: "GG_TEST_KEY_SHOP_A",  shopLabel: "Shop A – High Volume" },
    { key: "GG_TEST_KEY_SHOP_B",  shopLabel: "Shop B – Niche" },
  ],
};
