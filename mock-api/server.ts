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
let _supabase: SupabaseClient | null = null;
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

interface ExternalAdRecord {
  ad_group_external_id?: string | null;
  ad_group_name?: string | null;
  ad_name?: string | null;
  ctr?: number | string | null;
  clicks?: number | string | null;
  cpc?: number | string | null;
  cpm?: number | string | null;
  conversions?: number | string | null;
  creative?: {
    body?: string | null;
    call_to_action?: string | null;
    headline?: string | null;
    image_url?: string | null;
    video_url?: string | null;
  } | null;
  date_start: string;
  date_stop: string;
  delivery_info?: {
    status?: string | null;
  } | null;
  external_ad_id?: string | null;
  impressions?: number | string | null;
  persona_data?: unknown;
  platform?: string | null;
  reach?: number | string | null;
  roas?: number | string | null;
  spend?: number | string | null;
  start_time?: string | null;
  status?: string | null;
  targeting?: {
    interests?: string[] | null;
  } | null;
  created_at?: string | null;
}

interface ExternalAdGroupRecord {
  ads_external_ids?: string[] | null;
  description?: string | null;
  external_group_id?: string | null;
  group_name?: string | null;
  group_type?: string | null;
}

interface ExternalLeadField {
  name: string;
  values?: string[] | null;
}

interface ExternalLeadRecord {
  ad_id?: string | null;
  created_time?: string | null;
  field_data?: ExternalLeadField[] | null;
  form_id?: string | null;
  id: string;
}

interface ExternalConversationRecord {
  last_message_time?: string | null;
  messages?: Array<{ text?: string | null }> | null;
  participant?: { name?: string | null } | null;
  thread_id?: string | null;
  unread_count?: number | null;
}

interface SimulatedAdPayload {
  name?: string | null;
}

interface InsertedPersonaRecord {
  custom_fields: unknown;
  id: string;
}

function getJsonStringField(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const fieldValue = (value as Record<string, unknown>)[key];
  return typeof fieldValue === "string" ? fieldValue : null;
}

function logIngestionWarning(
  message: string,
  error: unknown,
  details?: Record<string, unknown>,
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.warn("[/api/connect]", message, { ...details, error: errorMessage });
}

async function saveAdRecord(params: {
  ad: ExternalAdRecord;
  adGroupId?: string | null;
  platform: string;
  supabase: SupabaseClient;
  workspaceId: string;
}) {
  const { ad, adGroupId = null, platform, supabase, workspaceId } = params;
  const adPayload = {
    ad_copy: ad.creative?.body ?? null,
    ad_group_id: adGroupId,
    call_to_action: ad.creative?.call_to_action?.replace(/_/g, " ") ?? null,
    creative_type: ad.creative?.video_url ? "video" : "image",
    headline: ad.creative?.headline ?? null,
    media_urls: [ad.creative?.image_url, ad.creative?.video_url].filter(
      (url): url is string => Boolean(url)
    ),
    team_id: workspaceId,
    name: ad.ad_name ?? "Untitled Ad",
    status: ad.status === "ACTIVE" ? "active" : "paused",
    platform,
    platform_ad_id: ad.external_ad_id ?? null,
    external_status: "published",
    persona_data: ad.persona_data ?? null,
    content: ad.targeting?.interests?.length
      ? `Target interests: ${ad.targeting.interests.join(", ")}`
      : null,
  };

  try {
    if (ad.external_ad_id) {
      const { data: existingAd, error: existingAdError } = await supabase
        .from("ads")
        .select("id")
        .eq("team_id", workspaceId)
        .eq("platform", platform)
        .eq("platform_ad_id", ad.external_ad_id)
        .maybeSingle();

      if (existingAdError) {
        throw existingAdError;
      }

      if (existingAd?.id) {
        const { data: updatedAd, error: updateError } = await supabase
          .from("ads")
          .update(adPayload)
          .eq("id", existingAd.id)
          .select("id")
          .single();

        if (updateError) {
          throw updateError;
        }

        return updatedAd?.id ?? null;
      }
    }

    const { data: insertedAd, error: insertError } = await supabase
      .from("ads")
      .insert(adPayload)
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    return insertedAd?.id ?? null;
  } catch (error) {
    logIngestionWarning("ad save failed", error, {
      adName: ad.ad_name ?? null,
      externalAdId: ad.external_ad_id ?? null,
      platform,
      workspaceId,
    });
    return null;
  }
}

async function saveAdGroupRecord(params: {
  group: ExternalAdGroupRecord;
  platform: string;
  supabase: SupabaseClient;
  workspaceId: string;
}) {
  const { group, platform, supabase, workspaceId } = params;
  const groupName = group.group_name?.trim();

  if (!groupName) {
    return null;
  }

  const groupPayload = {
    name: groupName,
    description: group.description ?? null,
    group_type: group.group_type ?? null,
    source_platform: platform,
    external_group_id: group.external_group_id ?? null,
    status: "active",
    team_id: workspaceId,
    updated_at: new Date().toISOString(),
  };

  try {
    if (group.external_group_id) {
      const { data: existingGroup, error: existingGroupError } = await supabase
        .from("ad_groups")
        .select("id")
        .eq("team_id", workspaceId)
        .eq("source_platform", platform)
        .eq("external_group_id", group.external_group_id)
        .maybeSingle();

      if (existingGroupError) {
        throw existingGroupError;
      }

      if (existingGroup?.id) {
        const { data: updatedGroup, error: updateError } = await supabase
          .from("ad_groups")
          .update(groupPayload)
          .eq("id", existingGroup.id)
          .select("id")
          .single();

        if (updateError) {
          throw updateError;
        }

        return updatedGroup?.id ?? null;
      }
    }

    const { data: existingManualGroup, error: existingManualGroupError } = await supabase
      .from("ad_groups")
      .select("id")
      .eq("team_id", workspaceId)
      .eq("name", groupName)
      .maybeSingle();

    if (existingManualGroupError) {
      throw existingManualGroupError;
    }

    if (existingManualGroup?.id) {
      const { data: updatedGroup, error: updateError } = await supabase
        .from("ad_groups")
        .update(groupPayload)
        .eq("id", existingManualGroup.id)
        .select("id")
        .single();

      if (updateError) {
        throw updateError;
      }

      return updatedGroup?.id ?? null;
    }

    const { data: insertedGroup, error: insertError } = await supabase
      .from("ad_groups")
      .insert(groupPayload)
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    return insertedGroup?.id ?? null;
  } catch (error) {
    logIngestionWarning("ad group save failed", error, {
      groupName,
      externalGroupId: group.external_group_id ?? null,
      platform,
      workspaceId,
    });
    return null;
  }
}

async function resolvePlatformId(supabase: SupabaseClient, platformSlug: string) {
  const { data, error } = await supabase
    .from("platforms")
    .select("id")
    .eq("slug", platformSlug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

function resolveAdPublishedAt(ad: ExternalAdRecord): string {
  const rawTimestamp = ad.start_time ?? ad.created_at ?? null;

  if (rawTimestamp) {
    const parsed = new Date(rawTimestamp);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  if (ad.date_start) {
    const parsed = new Date(`${ad.date_start}T09:00:00.000Z`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date().toISOString();
}

async function upsertSyncedAdPost(params: {
  ad: ExternalAdRecord;
  adId: string;
  adGroupId?: string | null;
  platformId: string | null;
  supabase: SupabaseClient;
  workspaceId: string;
}) {
  const { ad, adGroupId = null, adId, platformId, supabase, workspaceId } = params;
  const publishedAt = resolveAdPublishedAt(ad);

  console.log("[upsertSyncedAdPost] date resolution:", {
    adName: ad.ad_name ?? "unknown",
    externalAdId: ad.external_ad_id ?? "unknown",
    raw_start_time: ad.start_time ?? null,
    raw_created_at: ad.created_at ?? null,
    raw_date_start: ad.date_start ?? null,
    resolved_published_at: publishedAt,
  });

  const payload = {
    id: adId,
    team_id: workspaceId,
    platform_id: platformId,
    ad_group_id: adGroupId,
    post_channel: "ad",
    post_type: ad.creative?.video_url ? "video" : "image",
    platform_post_id: ad.external_ad_id ?? adId,
    name: ad.creative?.headline ?? ad.ad_name ?? "Untitled Ad",
    content: ad.creative?.body ?? null,
    media_urls: [ad.creative?.image_url, ad.creative?.video_url].filter(
      (url): url is string => Boolean(url)
    ),
    published_at: publishedAt,
    status: ad.status === "ACTIVE" ? "active" : "paused",
  };

  const { error } = await supabase.from("social_posts").upsert(payload, { onConflict: "id" });

  if (error) {
    throw error;
  }

  return payload.id;
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
    const platformId = await resolvePlatformId(supabase, platform);

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
    const adsPayload = (await adsRes.json()) as {
      ad_groups?: ExternalAdGroupRecord[];
      data?: ExternalAdRecord[];
      groups?: ExternalAdGroupRecord[];
    };
    const adsData = adsPayload.data ?? [];
    const externalGroups = adsPayload.ad_groups ?? adsPayload.groups ?? [];

    const leadsData: ExternalLeadRecord[] = leadsRes?.ok
      ? ((await leadsRes.json()) as { data?: ExternalLeadRecord[] }).data ?? []
      : [];

    const chatsData: ExternalConversationRecord[] = chatsRes?.ok
      ? ((await chatsRes.json()) as { conversations?: ExternalConversationRecord[] }).conversations ?? []
      : [];

    // 3. Clear stale data for this workspace + platform (full-replace sync)
    await supabase.from("ad_insights").delete().eq("ad_account_id", adAccountId);
    await supabase.from("ads").delete().eq("team_id", workspaceId).eq("platform", platform);
    if (platformId) {
      await supabase
        .from("social_posts")
        .delete()
        .eq("team_id", workspaceId)
        .eq("post_channel", "ad")
        .eq("platform_id", platformId)
        .not("platform_post_id", "is", null);
    }
    if (platform === "facebook") {
      // Remove previously synced chats so we don't accumulate duplicates
      await supabase
        .from("social_posts")
        .delete()
        .eq("team_id", workspaceId)
        .eq("platform_id", platformId)
        .eq("post_channel", "social")
        .eq("post_type", "chat");
    }

    // 4. Upsert ads with team_id and generate daily ad_insights.
    //    Ads are ingested as ORPHANS — not linked to any campaign.
    //    Users assign ads to campaigns in the Campaign Builder.
    const insightRows: Record<string, unknown>[] = [];
    const adIdByExternalId = new Map<string, string>();
    const adGroupIdByExternalId = new Map<string, string>();
    const adGroupIdByName = new Map<string, string>();

    for (const group of externalGroups) {
      const groupId = await saveAdGroupRecord({
        group,
        platform,
        supabase,
        workspaceId,
      });

      if (!groupId) {
        continue;
      }

      if (group.external_group_id) {
        adGroupIdByExternalId.set(group.external_group_id, groupId);
      }

      if (group.group_name) {
        adGroupIdByName.set(group.group_name, groupId);
      }
    }

    for (const group of externalGroups) {
      const resolvedGroupId = group.external_group_id
        ? adGroupIdByExternalId.get(group.external_group_id) ?? null
        : group.group_name
          ? adGroupIdByName.get(group.group_name) ?? null
          : null;

      if (!resolvedGroupId) {
        continue;
      }

      for (const externalAdId of group.ads_external_ids ?? []) {
        if (!externalAdId) {
          continue;
        }

        const matchingAd = adsData.find((ad) => ad.external_ad_id === externalAdId);
        if (matchingAd && !matchingAd.ad_group_external_id) {
          matchingAd.ad_group_external_id = group.external_group_id ?? null;
          matchingAd.ad_group_name = group.group_name ?? null;
        }
      }
    }

    for (const ad of adsData) {
      const adGroupId =
        (ad.ad_group_external_id
          ? adGroupIdByExternalId.get(ad.ad_group_external_id)
          : undefined) ??
        (ad.ad_group_name ? adGroupIdByName.get(ad.ad_group_name) : undefined) ??
        null;

      const adId = await saveAdRecord({
        ad,
        adGroupId,
        platform,
        supabase,
        workspaceId,
      });

      if (!adId) {
        console.warn("[/api/connect] skipping ad_insights for unsaved ad", {
          adName: ad.ad_name ?? null,
          externalAdId: ad.external_ad_id ?? null,
        });
        continue;
      }

      if (ad.external_ad_id) {
        adIdByExternalId.set(ad.external_ad_id, adId);
      }

      await upsertSyncedAdPost({
        ad,
        adId,
        adGroupId,
        platformId,
        supabase,
        workspaceId,
      });

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

    if (insightRows.length > 0) {
      const { error: insertError } = await supabase.from("ad_insights").insert(insightRows);
      if (insertError) throw insertError;
    }

    // 5. Upsert Facebook leads as customer_personas
    let personasInserted = 0;
    let personaLinksInserted = 0;
    let insertedPersonas: InsertedPersonaRecord[] = [];
    if (leadsData.length > 0) {
      const getField = (lead: ExternalLeadRecord, name: string): string | null =>
        lead.field_data?.find((field) => field.name === name)?.values?.[0] ?? null;

      const personaRows = leadsData.map((lead) => ({
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

      const { data: createdPersonas, error: personaError } = await supabase
        .from("customer_personas")
        .insert(personaRows)
        .select("id, custom_fields");
      if (personaError) {
        console.warn("[/api/connect] personas insert warn:", personaError.message);
      } else {
        insertedPersonas = (createdPersonas ?? []) as InsertedPersonaRecord[];
        personasInserted = insertedPersonas.length;
      }
    }

    // 6. Link synced ads to newly inserted personas so persona insights can join data
    if (insertedPersonas.length > 0) {
      const fallbackLeadAdIds = adsData
        .filter((ad) => /lead|signup|trial|form/i.test(ad.ad_name ?? ""))
        .map((ad) => (ad.external_ad_id ? adIdByExternalId.get(ad.external_ad_id) : null))
        .filter((adId): adId is string => Boolean(adId));

      const linkKeySet = new Set<string>();
      const adPersonaRows: { ad_id: string; persona_id: string }[] = [];

      for (const persona of insertedPersonas) {
        const sourceAdId = getJsonStringField(persona.custom_fields, "ad_id");
        const directAdId = sourceAdId ? adIdByExternalId.get(sourceAdId) ?? null : null;
        const candidateAdIds = (directAdId ? [directAdId] : fallbackLeadAdIds).filter(
          (adId): adId is string => Boolean(adId)
        );

        for (const adId of candidateAdIds) {
          const linkKey = `${adId}:${persona.id}`;
          if (linkKeySet.has(linkKey)) {
            continue;
          }

          linkKeySet.add(linkKey);
          adPersonaRows.push({ ad_id: adId, persona_id: persona.id });
        }
      }

      if (adPersonaRows.length > 0) {
        const { error: adPersonaError } = await supabase
          .from("ad_personas")
          .upsert(adPersonaRows, { onConflict: "ad_id,persona_id" });

        if (adPersonaError) {
          logIngestionWarning("ad_personas upsert failed", adPersonaError, {
            personaCount: insertedPersonas.length,
            linkCount: adPersonaRows.length,
          });
        } else {
          personaLinksInserted = adPersonaRows.length;
        }
      }
    }

    // 7. Insert Facebook chats as social_posts (one row per conversation thread)
    let chatsInserted = 0;
    if (chatsData.length > 0) {
      const chatRows = chatsData.map((conv) => {
        const msgs = conv.messages ?? [];
        const lastMsg = msgs[msgs.length - 1];
        return {
          team_id: workspaceId,
          platform_id: platformId,
          post_channel: "social",
          post_type: "chat",
          platform_post_id: conv.thread_id,
          name: null,
          content: lastMsg?.text ?? `Chat with ${conv.participant?.name ?? "Unknown"}`,
          published_at: conv.last_message_time ?? new Date().toISOString(),
          status: "published",
          comments: conv.unread_count ?? 0,
        };
      });

      const { data: insertedChats, error: chatError } = await supabase
        .from("social_posts")
        .insert(chatRows)
        .select("id, platform_post_id");

      if (chatError) {
        console.warn("[/api/connect] chats insert warn:", chatError.message);
      } else {
        const postIdByThreadId = new Map(
          (insertedChats ?? []).map((chat) => [chat.platform_post_id, chat.id])
        );

        const commentRows = chatsData
          .map((conv) => {
            const postId = conv.thread_id ? postIdByThreadId.get(conv.thread_id) : null;
            const msgs = conv.messages ?? [];
            const lastMsg = msgs[msgs.length - 1];

            if (!postId || !lastMsg?.text) {
              return null;
            }

            return {
              post_id: postId,
              team_id: workspaceId,
              platform_id: platformId,
              author_name: conv.participant?.name ?? "Unknown",
              content: lastMsg.text,
              is_read: (conv.unread_count ?? 0) === 0,
              created_at: conv.last_message_time ?? new Date().toISOString(),
            };
          })
          .filter(
            (
              row,
            ): row is {
              post_id: string;
              team_id: string;
              platform_id: string | null;
              author_name: string;
              content: string;
              is_read: boolean;
              created_at: string;
            } => Boolean(row)
          );

        if (commentRows.length > 0) {
          const { error: commentsError } = await supabase.from("social_comments").insert(commentRows);
          if (commentsError) {
            console.warn("[/api/connect] chat comments insert warn:", commentsError.message);
          }
        }

        chatsInserted = insertedChats?.length ?? 0;
      }
    }

    // 8. Return summary — raw external data stays on the server
    res.json({
      message: "Data synced successfully",
      adGroupsUpserted: externalGroups.length,
      adsUpserted: adsData.length,
      rowsInserted: insightRows.length,
      personasInserted,
      personaLinksInserted,
      chatsInserted,
      platform,
      tenant,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/connect] ingestion error:", message);
    res.status(500).json({ error: message });
  }
});

// ─── Ad Creation Endpoint (Simulated) ──────────────────────────────────
// This simulates the creation of an ad on an external platform.
// Called by the create-platform-ad Edge Function.
app.post("/api/ads", async (req, res) => {
  const { ad, platform } = req.body as { ad: SimulatedAdPayload; platform: string };

  if (!ad || !platform) {
    res.status(400).json({ error: "ad and platform are required" });
    return;
  }

  console.log(`[POST /api/ads] Simulating ad creation on ${platform} for: ${ad.name ?? "Unnamed Ad"}`);

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

app.get("/api/ad-groups", async (req, res) => {
  const workspaceId = typeof req.query.workspaceId === "string" ? req.query.workspaceId : "";

  if (!workspaceId) {
    res.status(400).json({ error: "workspaceId is required" });
    return;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("ad_groups")
      .select("id, name, description, group_type, status, team_id, created_at, updated_at")
      .eq("team_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ data: data ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

app.post("/api/ad-groups", async (req, res) => {
  const {
    adIds = [],
    description = null,
    groupType = null,
    name,
    status = "draft",
    workspaceId,
  } = req.body as {
    adIds?: string[];
    description?: string | null;
    groupType?: string | null;
    name?: string;
    status?: string;
    workspaceId?: string;
  };

  if (!workspaceId || !name?.trim()) {
    res.status(400).json({ error: "workspaceId and name are required" });
    return;
  }

  try {
    const supabase = getSupabaseClient();
    const { data: createdGroup, error: groupError } = await supabase
      .from("ad_groups")
      .insert({
        description,
        group_type: groupType,
        name: name.trim(),
        status,
        team_id: workspaceId,
      })
      .select()
      .single();

    if (groupError) {
      throw groupError;
    }

    if (adIds.length > 0) {
      const [{ error: adsError }, { error: postsError }] = await Promise.all([
        supabase
          .from("ads")
          .update({ ad_group_id: createdGroup.id })
          .eq("team_id", workspaceId)
          .in("id", adIds),
        supabase
          .from("social_posts")
          .update({ ad_group_id: createdGroup.id })
          .eq("team_id", workspaceId)
          .in("id", adIds),
      ]);

      if (adsError) throw adsError;
      if (postsError) throw postsError;
    }

    res.status(201).json({ data: createdGroup });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

app.put("/api/ad-groups/:id", async (req, res) => {
  const groupId = req.params.id;
  const {
    adIds,
    description,
    groupType,
    name,
    status,
    workspaceId,
  } = req.body as {
    adIds?: string[];
    description?: string | null;
    groupType?: string | null;
    name?: string;
    status?: string;
    workspaceId?: string;
  };

  if (!workspaceId) {
    res.status(400).json({ error: "workspaceId is required" });
    return;
  }

  try {
    const supabase = getSupabaseClient();
    const updatePayload = {
      description,
      group_type: groupType,
      name,
      status,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedGroup, error: groupError } = await supabase
      .from("ad_groups")
      .update(updatePayload)
      .eq("id", groupId)
      .eq("team_id", workspaceId)
      .select()
      .single();

    if (groupError) {
      throw groupError;
    }

    if (Array.isArray(adIds)) {
      const { data: currentlyLinkedAds, error: currentAdsError } = await supabase
        .from("ads")
        .select("id")
        .eq("team_id", workspaceId)
        .eq("ad_group_id", groupId);

      if (currentAdsError) {
        throw currentAdsError;
      }

      const adIdsToClear = (currentlyLinkedAds ?? [])
        .map((ad) => ad.id)
        .filter((adId) => !adIds.includes(adId));

      if (adIdsToClear.length > 0) {
        const [{ error: clearAdsError }, { error: clearPostsError }] = await Promise.all([
          supabase
            .from("ads")
            .update({ ad_group_id: null })
            .eq("team_id", workspaceId)
            .in("id", adIdsToClear),
          supabase
            .from("social_posts")
            .update({ ad_group_id: null })
            .eq("team_id", workspaceId)
            .in("id", adIdsToClear),
        ]);

        if (clearAdsError) throw clearAdsError;
        if (clearPostsError) throw clearPostsError;
      }

      if (adIds.length > 0) {
        const [{ error: assignAdsError }, { error: assignPostsError }] = await Promise.all([
          supabase
            .from("ads")
            .update({ ad_group_id: groupId })
            .eq("team_id", workspaceId)
            .in("id", adIds),
          supabase
            .from("social_posts")
            .update({ ad_group_id: groupId })
            .eq("team_id", workspaceId)
            .in("id", adIds),
        ]);

        if (assignAdsError) throw assignAdsError;
        if (assignPostsError) throw assignPostsError;
      }
    }

    res.json({ data: updatedGroup });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

app.delete("/api/ad-groups/:id", async (req, res) => {
  const groupId = req.params.id;
  const workspaceId = typeof req.query.workspaceId === "string" ? req.query.workspaceId : "";

  if (!workspaceId) {
    res.status(400).json({ error: "workspaceId is required" });
    return;
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("ad_groups")
      .delete()
      .eq("id", groupId)
      .eq("team_id", workspaceId);

    if (error) {
      throw error;
    }

    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
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
      "GET  /api/ad-groups?workspaceId=<uuid>      — list ad groups for a workspace",
      "POST /api/ad-groups                         — create an ad group and optionally assign ads",
      "PUT  /api/ad-groups/:id                     — update an ad group and sync assigned ads",
      "DELETE /api/ad-groups/:id?workspaceId=<id>  — delete an ad group",
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
  console.log(`   GET  /api/ad-groups?workspaceId=<uuid>`);
  console.log(`   POST /api/ad-groups`);
  console.log(`   PUT  /api/ad-groups/:id`);
  console.log(`   DELETE /api/ad-groups/:id?workspaceId=<uuid>`);
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
