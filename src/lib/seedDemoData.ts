import { SupabaseClient } from "@supabase/supabase-js";

export async function seedDemoDataForWorkspace(workspaceId: string, supabase: SupabaseClient) {
  try {
    console.log("Seeding demo data for workspace:", workspaceId);

    // 1. Fetch valid ad accounts for this workspace first
    let { data: adAccounts } = await supabase
      .from("ad_accounts")
      .select("id, platform_id")
      .eq("team_id", workspaceId);

    // 2. Check if they already have insights (to avoid infinite loops or double seeding)
    const { count, error: countError } = await supabase
      .from("ad_insights")
      .select("*", { count: "exact", head: true })
      .in("ad_account_id", adAccounts?.map(a => a.id) || []);

    const { data: existingCampaigns } = await supabase
      .from("campaigns")
      .select("id")
      .in("ad_account_id", adAccounts?.map(a => a.id) || []);

    if (existingCampaigns && existingCampaigns.length > 0) {
      // Check insights for these campaigns
      const { count: insightsCount } = await supabase
        .from("ad_insights")
        .select("*", { count: "exact", head: true })
        .in("campaign_id", existingCampaigns.map(c => c.id));
      
      if (insightsCount && insightsCount > 0) {
        console.log("Workspace already has data, skipping seed.");
        return false;
      }
    }

    // 3. Create Ad Accounts if none exist
    if (!adAccounts || adAccounts.length === 0) {
      const { data: platforms } = await supabase.from('platforms').select('id, slug').in('slug', ['facebook', 'tiktok']);
      const fbPlatformId = platforms?.find(p => p.slug === 'facebook')?.id;
      const ttPlatformId = platforms?.find(p => p.slug === 'tiktok')?.id;

      if (!fbPlatformId || !ttPlatformId) return false;

      const { data: newAccounts } = await supabase
        .from("ad_accounts")
        .insert([
          { team_id: workspaceId, platform_id: fbPlatformId, account_id: "act_fb_demo", account_name: "Facebook Ads (Demo)", is_active: true },
          { team_id: workspaceId, platform_id: ttPlatformId, account_id: "act_tt_demo", account_name: "TikTok Ads (Demo)", is_active: true }
        ])
        .select();
      adAccounts = newAccounts;
    }

    if (!adAccounts || adAccounts.length === 0) return false;

    // 4. Create Campaigns if none exist
    let campaigns = existingCampaigns;
    if (!campaigns || campaigns.length === 0) {
      const { data: platforms } = await supabase.from('platforms').select('id, slug').in('slug', ['facebook', 'tiktok']);
      const fbPlatformId = platforms?.find(p => p.slug === 'facebook')?.id;
      const ttPlatformId = platforms?.find(p => p.slug === 'tiktok')?.id;

      const fbAcc = adAccounts.find(a => a.platform_id === fbPlatformId);
      const ttAcc = adAccounts.find(a => a.platform_id === ttPlatformId);

      const { data: newCampaigns } = await supabase
        .from("campaigns")
        .insert([
          {
            ad_account_id: fbAcc?.id || adAccounts[0].id,
            name: "Q3 Global Brand Awareness",
            objective: "Brand Awareness",
            status: "active",
            budget_amount: 500000,
            target_kpi_clicks: 120000,
            target_kpi_conversions: 2000,
            target_kpi_spend: 450000,
            target_kpi_impressions: 5000000
          },
          {
            ad_account_id: ttAcc?.id || adAccounts[0].id,
            name: "Gen-Z Viral Trend Campaign",
            objective: "Conversion",
            status: "active",
            budget_amount: 250000,
            target_kpi_clicks: 80000,
            target_kpi_conversions: 5000,
            target_kpi_spend: 250000,
            target_kpi_impressions: 3000000
          }
        ])
        .select();
      campaigns = newCampaigns;
    }

    if (!campaigns || campaigns.length === 0) return false;

    // 4. Generate 30 days of Insights for ALL campaigns (including user's manually created ones like "Gggggg")
    const insights = [];
    for (const campaign of campaigns) {
      // Base numbers
      let baseImpressions = 15000;
      let baseClicks = 400;
      let baseSpend = 3000;
      let baseConversions = 45;

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        
        // Add random fluctuation and gradual growth
        const dailyImpressions = Math.floor(baseImpressions + (i * 200) + (Math.random() * 5000 - 2500));
        const dailyClicks = Math.floor(baseClicks + (i * 10) + (Math.random() * 200 - 100));
        const dailySpend = Math.floor(baseSpend + (i * 50) + (Math.random() * 800 - 400));
        const dailyConversions = Math.floor(baseConversions + (i * 2) + (Math.random() * 20 - 10));

        insights.push({
          campaign_id: campaign.id,
          ad_account_id: campaign.ad_account_id,
          date: date.toISOString().split("T")[0],
          impressions: Math.max(0, dailyImpressions),
          clicks: Math.max(0, dailyClicks),
          spend: Math.max(0, dailySpend),
          conversions: Math.max(0, dailyConversions),
          roas: Number((2.0 + Math.random() * 1.5).toFixed(2)),
        });
      }
    }

    // Insert insights in chunks if necessary, but 60-100 rows is fine for a single insert
    const { error: insertError } = await supabase.from("ad_insights").insert(insights);
    if (insertError) {
      console.error("Failed to insert demo insights:", insertError);
      return false;
    }

    console.log("Successfully seeded demo data for workspace!");
    return true;
  } catch (error) {
    console.error("Seeding error:", error);
    return false;
  }
}

export async function generateMockDataForPlatform(adAccountId: string, platformSlug: string, supabase: SupabaseClient) {
  try {
    // Check if we already have campaigns
    const { data: existingCampaigns } = await supabase
      .from("campaigns")
      .select("id, ad_account_id")
      .eq("ad_account_id", adAccountId);

    let campaigns = existingCampaigns;
    if (!campaigns || campaigns.length === 0) {
      const namePrefix = platformSlug === 'facebook' ? 'FB Retargeting' : platformSlug === 'tiktok' ? 'TT Viral' : 'Mock Campaign';
      const { data: newCampaigns } = await supabase
        .from("campaigns")
        .insert([
          {
            ad_account_id: adAccountId,
            name: `${namePrefix} - Alpha`,
            objective: "Conversion",
            status: "active",
            budget_amount: 100000,
            target_kpi_clicks: 50000,
            target_kpi_conversions: 1000,
            target_kpi_spend: 90000,
            target_kpi_impressions: 1000000
          }
        ])
        .select("id, ad_account_id");
      campaigns = newCampaigns;
    }

    if (!campaigns || campaigns.length === 0) return false;

    // Generate 30 days of Insights
    const insights = [];
    for (const campaign of campaigns) {
      let baseImpressions = platformSlug === 'tiktok' ? 25000 : 15000;
      let baseClicks = platformSlug === 'google' ? 800 : 400;
      let baseSpend = 3000;
      let baseConversions = 45;

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        
        const dailyImpressions = Math.floor(baseImpressions + (i * 200) + (Math.random() * 5000 - 2500));
        const dailyClicks = Math.floor(baseClicks + (i * 10) + (Math.random() * 200 - 100));
        const dailySpend = Math.floor(baseSpend + (i * 50) + (Math.random() * 800 - 400));
        const dailyConversions = Math.floor(baseConversions + (i * 2) + (Math.random() * 20 - 10));

        insights.push({
          campaign_id: campaign.id,
          ad_account_id: campaign.ad_account_id,
          date: date.toISOString().split("T")[0],
          impressions: Math.max(0, dailyImpressions),
          clicks: Math.max(0, dailyClicks),
          spend: Math.max(0, dailySpend),
          conversions: Math.max(0, dailyConversions),
          roas: Number((2.0 + Math.random() * 1.5).toFixed(2)),
        });
      }
    }

    const { error: insertError } = await supabase.from("ad_insights").insert(insights);
    if (insertError) {
      console.error("Failed to insert mock insights:", insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Mock generation error:", error);
    return false;
  }
}
