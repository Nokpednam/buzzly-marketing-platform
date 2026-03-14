/**
 * seed-to-supabase.ts
 *
 * Transforms mock API fixtures → INSERT into Buzzly Supabase tables.
 * Each row is tagged with `team_id` for workspace isolation.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_KEY=... TEAM_ID=... npx tsx scripts/seed-to-supabase.ts [shop-a|shop-b]
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || ""; // service_role key recommended
const TEAM_ID = process.env.TEAM_ID || "";
const TENANT = process.argv[2] || "shop-a";

if (!SUPABASE_URL || !SUPABASE_KEY || !TEAM_ID) {
  console.error("❌ Missing env: SUPABASE_URL, SUPABASE_KEY, TEAM_ID");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function loadFixture(platform: string, file: string) {
  return JSON.parse(readFileSync(join(__dirname, "..", "fixtures", platform, file), "utf-8"));
}

// ─── 1. Seed Campaigns + Ad Insights (from FB /insights) ────────────
async function seedCampaignsAndInsights() {
  console.log("📊 Seeding campaigns + ad_insights...");
  const data = loadFixture("facebook", `${TENANT}-insights.json`);

  // First, get or create an ad_account for this team
  let { data: adAccount } = await supabase
    .from("ad_accounts")
    .select("id")
    .eq("team_id", TEAM_ID)
    .maybeSingle();

  if (!adAccount) {
    const { data: newAccount, error } = await supabase
      .from("ad_accounts")
      .insert({ team_id: TEAM_ID, account_name: `${TENANT} Ad Account`, is_active: true })
      .select("id")
      .single();
    if (error) throw error;
    adAccount = newAccount;
  }

  for (const campaign of data.data) {
    // Upsert campaign
    const { data: upsertedCampaign, error: campErr } = await supabase
      .from("campaigns")
      .upsert({
        ad_account_id: adAccount!.id,
        name: campaign.campaign_name,
        status: "active",
        objective: campaign.objective,
        budget_amount: parseFloat(campaign.spend),
        start_date: campaign.date_start,
        end_date: campaign.date_stop,
      }, { onConflict: "id" })
      .select("id")
      .single();
    if (campErr) { console.warn("  ⚠️ Campaign:", campErr.message); continue; }

    // Generate daily ad_insights for the date range
    const startDate = new Date(campaign.date_start);
    const endDate = new Date(campaign.date_stop);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const dailyInsights = [];
    for (let d = 0; d < totalDays; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      const jitter = 0.7 + Math.random() * 0.6; // 0.7–1.3 variance

      dailyInsights.push({
        ad_account_id: adAccount!.id,
        campaign_id: upsertedCampaign!.id,
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

    const { error: insightErr } = await supabase.from("ad_insights").insert(dailyInsights);
    if (insightErr) console.warn("  ⚠️ Insights:", insightErr.message);
    else console.log(`  ✅ ${campaign.campaign_name}: ${dailyInsights.length} days of insights`);
  }
}

// ─── 2. Seed Prospects (from FB /leads) ──────────────────────────────
async function seedProspects() {
  console.log("👤 Seeding prospects...");
  const data = loadFixture("facebook", `${TENANT}-leads.json`);

  const prospects = data.data.map((lead: any) => {
    const fields: Record<string, string> = {};
    lead.field_data.forEach((f: any) => { fields[f.name] = f.values[0]; });

    const [firstName, ...lastParts] = (fields.full_name || "Unknown").split(" ");
    return {
      team_id: TEAM_ID,
      first_name: firstName,
      last_name: lastParts.join(" ") || "",
      email: fields.email || "",
      phone: fields.phone_number || "",
      company_name: fields.company_name || "",
      source: "facebook",
      status: "new",
      created_at: lead.created_time,
    };
  });

  const { error } = await supabase.from("prospects").insert(prospects);
  if (error) console.warn("  ⚠️ Prospects:", error.message);
  else console.log(`  ✅ ${prospects.length} prospects seeded`);
}

// ─── 3. Seed Social Posts (synthetic) ────────────────────────────────
async function seedSocialPosts() {
  console.log("📱 Seeding social posts...");

  // Get platform IDs
  const { data: platforms } = await supabase
    .from("platforms")
    .select("id, slug")
    .in("slug", ["facebook", "instagram", "tiktok"]);

  if (!platforms?.length) { console.warn("  ⚠️ No platforms found"); return; }

  const posts = [];
  const postTypes = ["image", "video", "carousel", "reel", "story"];
  const contents = [
    "🔥 Flash Sale! Up to 50% off all items this weekend only!",
    "✨ New arrivals just dropped! Check out our latest collection",
    "💡 Tips: 5 ways to boost your productivity with our tools",
    "🎉 Thank you for 10K followers! Here's a special discount code",
    "📦 Behind the scenes: How we pack and ship your orders",
    "🌟 Customer spotlight: See what @happy_customer says about us",
    "⚡ Limited time offer: Buy 2 Get 1 Free on selected items",
    "🎯 Pro tips for using our premium features effectively",
  ];

  for (const platform of platforms) {
    const numPosts = TENANT === "shop-a" ? 12 : 5;
    for (let i = 0; i < numPosts; i++) {
      const isHighVolume = TENANT === "shop-a";
      const baseImpressions = isHighVolume ? 15000 + Math.random() * 85000 : 2000 + Math.random() * 8000;
      const engagementRate = isHighVolume ? 2 + Math.random() * 4 : 5 + Math.random() * 10;

      const daysAgo = Math.floor(Math.random() * 30);
      const publishedAt = new Date();
      publishedAt.setDate(publishedAt.getDate() - daysAgo);

      posts.push({
        team_id: TEAM_ID,
        platform_id: platform.id,
        post_type: postTypes[Math.floor(Math.random() * postTypes.length)],
        content: contents[Math.floor(Math.random() * contents.length)],
        status: "published",
        published_at: publishedAt.toISOString(),
        impressions: Math.round(baseImpressions),
        reach: Math.round(baseImpressions * (0.6 + Math.random() * 0.3)),
        likes: Math.round(baseImpressions * engagementRate / 100 * 0.6),
        comments: Math.round(baseImpressions * engagementRate / 100 * 0.15),
        shares: Math.round(baseImpressions * engagementRate / 100 * 0.1),
        saves: Math.round(baseImpressions * engagementRate / 100 * 0.05),
        clicks: Math.round(baseImpressions * engagementRate / 100 * 0.1),
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
        hashtags: ["#buzzly", `#${platform.slug}`, "#marketing"],
      });
    }
  }

  const { error } = await supabase.from("social_posts").insert(posts);
  if (error) console.warn("  ⚠️ Social posts:", error.message);
  else console.log(`  ✅ ${posts.length} social posts seeded`);
}

// ─── 4. Seed Customer Personas (synthetic) ───────────────────────────
async function seedCustomerPersonas() {
  console.log("🎭 Seeding customer personas...");

  const personas = TENANT === "shop-a"
    ? [
        {
          team_id: TEAM_ID,
          persona_name: "Tech-Savvy Millennial",
          description: "Young professional, 25-34, interested in gadgets and tech. Actively shops on multiple platforms.",
          age_min: 25, age_max: 34,
          profession: "Software Developer",
          company_size: "50-200",
          salary_range: "40K-80K",
          industry: "Technology",
          interests: ["technology", "gadgets", "gaming", "productivity"],
          pain_points: ["price comparison", "shipping speed", "product authenticity"],
          goals: ["find best deals", "stay updated with latest tech"],
          is_active: true,
        },
        {
          team_id: TEAM_ID,
          persona_name: "Budget-Conscious Parent",
          description: "Working parent, 30-45, looking for value deals on family products.",
          age_min: 30, age_max: 45,
          profession: "Office Worker",
          company_size: "10-50",
          salary_range: "25K-50K",
          industry: "Various",
          interests: ["family", "education", "home", "discounts"],
          pain_points: ["limited budget", "product quality", "delivery reliability"],
          goals: ["save money", "find quality products for family"],
          is_active: true,
        },
        {
          team_id: TEAM_ID,
          persona_name: "Small Business Owner",
          description: "Entrepreneur, 28-50, buying in bulk for resale or business use.",
          age_min: 28, age_max: 50,
          profession: "Business Owner",
          company_size: "1-10",
          salary_range: "50K-150K",
          industry: "Retail",
          interests: ["wholesale", "business tools", "inventory management"],
          pain_points: ["bulk pricing", "consistent quality", "supplier reliability"],
          goals: ["grow business", "reduce costs", "find reliable suppliers"],
          is_active: true,
        },
      ]
    : [
        {
          team_id: TEAM_ID,
          persona_name: "Skincare Enthusiast",
          description: "Beauty-conscious individual, 22-35, willing to pay premium for quality skincare.",
          age_min: 22, age_max: 35,
          profession: "Creative Professional",
          company_size: "10-50",
          salary_range: "30K-60K",
          industry: "Beauty & Wellness",
          interests: ["skincare", "organic products", "self-care", "wellness"],
          pain_points: ["product ingredients", "skin sensitivity", "authenticity"],
          goals: ["achieve healthy skin", "find trusted brands"],
          is_active: true,
        },
        {
          team_id: TEAM_ID,
          persona_name: "Luxury Beauty Buyer",
          description: "High-income individual, 30-50, loyal to premium brands with repeat purchases.",
          age_min: 30, age_max: 50,
          profession: "Executive",
          company_size: "200+",
          salary_range: "80K-200K",
          industry: "Corporate",
          interests: ["luxury", "premium skincare", "anti-aging", "spa treatments"],
          pain_points: ["finding genuine products", "personalized recommendations"],
          goals: ["maintain youthful appearance", "discover new premium brands"],
          is_active: true,
        },
      ];

  const { error } = await supabase.from("customer_personas").insert(personas);
  if (error) console.warn("  ⚠️ Personas:", error.message);
  else console.log(`  ✅ ${personas.length} personas seeded`);
}

// ─── 5. Seed Customer Activities (synthetic for Journey + Funnel) ────
async function seedCustomerActivities() {
  console.log("🚶 Seeding customer activities...");

  // Get event types
  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("id, name")
    .limit(10);

  if (!eventTypes?.length) {
    console.warn("  ⚠️ No event_types found — skipping customer_activities");
    return;
  }

  // Get campaigns for this team's ad account
  const { data: adAccount } = await supabase
    .from("ad_accounts")
    .select("id")
    .eq("team_id", TEAM_ID)
    .maybeSingle();

  let campaignIds: string[] = [];
  if (adAccount) {
    const { data: campaigns } = await supabase
      .from("campaigns")
      .select("id")
      .eq("ad_account_id", adAccount.id)
      .limit(5);
    campaignIds = campaigns?.map((c) => c.id) || [];
  }

  // Get profile_customers
  const { data: profiles } = await supabase
    .from("profile_customers")
    .select("id")
    .limit(20);

  const profileIds = profiles?.map((p) => p.id) || [];

  const activities = [];
  const devices = ["mobile", "desktop", "tablet"];
  const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
  const numActivities = TENANT === "shop-a" ? 80 : 30;

  for (let i = 0; i < numActivities; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    createdAt.setHours(Math.floor(Math.random() * 24));
    createdAt.setMinutes(Math.floor(Math.random() * 60));

    activities.push({
      profile_customer_id: profileIds.length > 0
        ? profileIds[Math.floor(Math.random() * profileIds.length)]
        : null,
      event_type_id: eventTypes[Math.floor(Math.random() * eventTypes.length)].id,
      campaign_id: campaignIds.length > 0
        ? campaignIds[Math.floor(Math.random() * campaignIds.length)]
        : null,
      session_id: `sess_${Date.now().toString(36)}_${i}`,
      device_type: devices[Math.floor(Math.random() * devices.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      created_at: createdAt.toISOString(),
    });
  }

  const { error } = await supabase.from("customer_activities").insert(activities);
  if (error) console.warn("  ⚠️ Activities:", error.message);
  else console.log(`  ✅ ${activities.length} customer activities seeded`);
}

// ─── 6. Seed Cohort Analysis (synthetic for Analytics) ───────────────
async function seedCohortAnalysis() {
  console.log("📈 Seeding cohort analysis...");

  const cohorts = [];
  for (let month = 0; month < 6; month++) {
    const date = new Date();
    date.setMonth(date.getMonth() - month);
    date.setDate(1);

    const isHighVolume = TENANT === "shop-a";
    const baseSize = isHighVolume ? 500 + Math.floor(Math.random() * 1500) : 50 + Math.floor(Math.random() * 150);
    const retentionData: Record<string, number> = {};
    let retention = 100;
    for (let w = 0; w <= 12; w++) {
      retentionData[`week_${w}`] = Math.round(retention * 10) / 10;
      retention *= isHighVolume ? 0.82 + Math.random() * 0.08 : 0.88 + Math.random() * 0.06;
    }

    cohorts.push({
      team_id: TEAM_ID,
      cohort_date: date.toISOString().split("T")[0],
      cohort_type: "monthly",
      cohort_size: baseSize,
      retention_data: retentionData,
      revenue_data: {
        month_0: baseSize * (isHighVolume ? 18 : 85),
        month_1: Math.round(baseSize * (isHighVolume ? 18 : 85) * 0.6),
        month_2: Math.round(baseSize * (isHighVolume ? 18 : 85) * 0.35),
      },
      average_retention: parseFloat((retention).toFixed(2)),
      lifetime_value: parseFloat((isHighVolume ? 42 + Math.random() * 20 : 180 + Math.random() * 80).toFixed(2)),
      churn_rate: parseFloat((isHighVolume ? 12 + Math.random() * 8 : 5 + Math.random() * 5).toFixed(2)),
    });
  }

  const { error } = await supabase.from("cohort_analysis").insert(cohorts);
  if (error) console.warn("  ⚠️ Cohort:", error.message);
  else console.log(`  ✅ ${cohorts.length} cohort records seeded`);
}

// ─── 7. Seed Conversion Events (from Shopee orders) ─────────────────
async function seedConversionEvents() {
  console.log("💰 Seeding conversion events...");
  const data = loadFixture("shopee", `${TENANT}-orders.json`);

  const { data: adAccount } = await supabase
    .from("ad_accounts")
    .select("id")
    .eq("team_id", TEAM_ID)
    .maybeSingle();

  if (!adAccount) { console.warn("  ⚠️ No ad_account found — skipping"); return; }

  const events = data.response.order_list
    .filter((o: any) => o.order_status === "COMPLETED")
    .map((order: any) => ({
      ad_account_id: adAccount.id,
      event_name: "purchase",
      event_value: order.total_amount,
      occurred_at: new Date(order.create_time * 1000).toISOString(),
      processing_status: "completed",
      meta_data: {
        order_sn: order.order_sn,
        buyer: order.buyer_username,
        payment_method: order.payment_method,
        items: order.item_list.length,
        source: "shopee",
      },
    }));

  const { error } = await supabase.from("conversion_events").insert(events);
  if (error) console.warn("  ⚠️ Conversion events:", error.message);
  else console.log(`  ✅ ${events.length} conversion events seeded`);
}

// ─── Run All ─────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🐝 Buzzly Mock Data Seeder`);
  console.log(`   Tenant: ${TENANT}`);
  console.log(`   Team ID: ${TEAM_ID}\n`);

  try {
    await seedCampaignsAndInsights();
    await seedProspects();
    await seedSocialPosts();
    await seedCustomerPersonas();
    await seedCustomerActivities();
    await seedCohortAnalysis();
    await seedConversionEvents();
    console.log("\n✅ All mock data seeded successfully!\n");
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
