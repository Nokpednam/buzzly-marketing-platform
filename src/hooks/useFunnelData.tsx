import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type FunnelStage = Database["public"]["Tables"]["funnel_stages"]["Row"];
export type AARRRCategory = Database["public"]["Tables"]["aarrr_categories"]["Row"];
export type CustomerActivity = Database["public"]["Tables"]["customer_activities"]["Row"];

export interface FunnelStageWithMetrics extends FunnelStage {
  value: number;
  percentage: number;
  metrics: Record<string, number | string>;
  category?: AARRRCategory;
}

export function useFunnelData() {
  // Fetch Total Users for Top of Funnel alignment
  const { data: totalUserCount = 0 } = useQuery({
    queryKey: ["funnel_total_users"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profile_customers")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch AARRR Categories
  const { data: aarrrCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["aarrr_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aarrr_categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as AARRRCategory[];
    },
  });

  // Fetch Funnel Stages
  const { data: funnelStages = [], isLoading: stagesLoading } = useQuery({
    queryKey: ["funnel_stages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funnel_stages")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as FunnelStage[];
    },
  });

  // Fetch Customer Activities for metrics calculation
  // Increased limit to 5000 to match useOwnerMetrics for consistency
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["customer_activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_activities")
        .select(`
          *,
          event_types (
            slug
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return data as (CustomerActivity & { event_types: { slug: string } | null })[];
    },
  });

  // Calculate metrics for each stage with sequential dependency (waterfall)
  let previousStageValue = totalUserCount > 0 ? totalUserCount : 0;

  const stagesWithMetrics: FunnelStageWithMetrics[] = funnelStages.map((stage, index) => {
    // Find related AARRR category
    const category = aarrrCategories.find(c => c.id === stage.aarrr_categories_id);

    // Calculate values from real activities based on Stage Definition
    let stageValue = 0;

    // Mapping Logic based on Stage Slugs
    const uniqueUsersInStage = new Set<string>();

    if (index === 0 || stage.slug === 'landing') {
      // Stage 1: Always align with Total Users count from DB
      stageValue = totalUserCount;
    } else if (stage.slug === 'signup-start' || stage.slug === 'signup') {
      // Count users who triggered sign up event or visited signup page
      activities.forEach(a => {
        if (a.event_types?.slug === 'signup' || a.page_url?.includes('signup')) {
          if (a.profile_customer_id) uniqueUsersInStage.add(a.profile_customer_id);
        }
      });
      stageValue = uniqueUsersInStage.size;
    } else if (stage.slug === 'active' || stage.slug === 'email-verified') {
      // Active Users or Email Verified (using Login as proxy for verified)
      activities.forEach(a => {
        const eventSlug = a.event_types?.slug;
        if (eventSlug === 'login' || (stage.slug === 'active' && a.profile_customer_id)) {
          if (a.profile_customer_id) uniqueUsersInStage.add(a.profile_customer_id);
        }
      });
      stageValue = uniqueUsersInStage.size;
    } else if (stage.slug === 'profile-complete') {
      // Profile Complete: Users who have at least one activity recorded implies they exist
      // A better proxy might be users who have 'update' events on settings, but simplistic view:
      // Use users who have reached this far in funnel (e.g. have done anything post-signup)
      // For strictness: Check for 'profile-update' or similar, but let's stick to explicit events if available.
      // Since we don't have a specific event for this in the sample data, we'll check for ANY activity that isn't just landing/signup.
      activities.forEach(a => {
        const eventSlug = a.event_types?.slug;
        if (eventSlug && !['page-view', 'signup'].includes(eventSlug)) {
          if (a.profile_customer_id) uniqueUsersInStage.add(a.profile_customer_id);
        }
      });
      stageValue = uniqueUsersInStage.size;

    } else if (stage.slug === 'first-campaign' || stage.slug === 'campaign-created') {
      activities.forEach(a => {
        if (a.event_types?.slug === 'campaign-created') {
          if (a.profile_customer_id) uniqueUsersInStage.add(a.profile_customer_id);
        }
      });
      stageValue = uniqueUsersInStage.size;

    } else if (stage.slug === 'first-payment' || stage.slug === 'purchase') {
      activities.forEach(a => {
        if (a.event_types?.slug === 'purchase' || a.page_url?.includes('checkout')) {
          if (a.profile_customer_id) uniqueUsersInStage.add(a.profile_customer_id);
        }
      });
      stageValue = uniqueUsersInStage.size;
    } else if (stage.slug === 'referral') {
      activities.forEach(a => {
        if (a.event_types?.slug === 'referral') {
          if (a.profile_customer_id) uniqueUsersInStage.add(a.profile_customer_id);
        }
      });
      stageValue = uniqueUsersInStage.size;
    } else {
      // STRICT MODE: If we don't have a mapping, it is ZERO. No guesses.
      stageValue = 0;
    }

    // Waterfall constraint: Stage N cannot be larger than Stage N-1
    // (Optional: depending on if we want strict funnel or just raw counts. 
    // strictly speaking, a funnel should shrink. but data errors might make it grow.
    // Let's keep the constraint to avoid confusing charts.)
    if (index > 0) {
      stageValue = Math.min(stageValue, previousStageValue);
    }

    // REMOVED: The cosmetic fix that forced stageValue to be max(1, ...)

    // Update previousStageValue for next iteration
    previousStageValue = stageValue;

    const totalActivities = activities.length || 1;

    return {
      ...stage,
      value: stageValue,
      percentage: 0, // Calculated in second pass
      metrics: {
        users: stageValue,
        rate: stageValue > 0 ? ((stageValue / totalActivities) * 100).toFixed(1) : "0.0",
      },
      category,
    };
  });

  // Re-calculate percentages strictly based on the first item after the loop if needed 
  // or use the first item's value if available. 
  // To avoid complexity, I'll update the percentages in a second pass or just use the known first value if index > 0.
  // Actually, for percentage relative to *first stage*, we need the first stage value.
  // Since index 0 runs first, we validly set previousStageValue. 
  // But inside index 1, we normally refer to stagesWithMetrics[0].value.
  // Let's capture the first value in a separate variable.

  const firstStageValue = stagesWithMetrics[0]?.value || 0;

  const finalStages = stagesWithMetrics.map(s => ({
    ...s,
    percentage: firstStageValue > 0 ? Math.round((s.value / firstStageValue) * 100) : 0
  }));

  // Calculate metrics for AARRR categories (High Level Funnel for Dashboard)
  const categoriesWithMetrics = aarrrCategories.map((category, index) => {
    // Find stages belonging to this category
    const categoryStages = finalStages.filter(s => s.aarrr_categories_id === category.id);

    // Use the maximum value from the stages in this category as the category representative value
    // (Usually the entry stage, but max ensures we capture the volume)
    const categoryValue = categoryStages.length > 0
      ? Math.max(...categoryStages.map(s => s.value))
      : 0;

    // Calculate percentage relative to Acquisition (first category)
    // We need to resolve the first category value carefully
    let firstCategoryValue = 0;
    if (index === 0) {
      firstCategoryValue = categoryValue;
    } else {
      // Attempt to find the first category's value from the current mapping if possible, 
      // or rely on the previous iteration logic if we were reducing. 
      // Simpler: find the Acquisition category explicitly from the source arrays or use a separate lookup.
      // Since we are inside map, we can't look at the result array yet.
      // But we know Acquisition is display_order 1.
      const acquisitionCategory = aarrrCategories.find(c => c.name === "Acquisition");
      if (acquisitionCategory) {
        const acqStages = finalStages.filter(s => s.aarrr_categories_id === acquisitionCategory.id);
        firstCategoryValue = acqStages.length > 0 ? Math.max(...acqStages.map(s => s.value)) : 0;
      }
    }

    return {
      ...category,
      value: categoryValue,
      percentage: firstCategoryValue > 0 ? Math.round((categoryValue / firstCategoryValue) * 100) : 0,
      metrics: {
        users: categoryValue,
        stages: categoryStages.length
      }
    };
  });

  return {
    aarrrCategories: categoriesWithMetrics, // Return enriched categories
    funnelStages: finalStages,
    activities,
    isLoading: categoriesLoading || stagesLoading || activitiesLoading,
  };
}
