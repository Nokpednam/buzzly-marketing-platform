import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MRRMetrics {
  currentMrr: number;
  previousMrr: number;
  mrrGrowth: number;
  monthlyData: { month: string; mrr: number; growth: number }[];
}

export interface ChurnMetrics {
  churnRate: number;
  churnedCustomers: number;
  recoveredCustomers: number;
  lostRevenue: number;
  trendData: { month: string; churnRate: number }[];
}

export interface CohortData {
  cohort: string;
  cohortSize: number;
  retentionData: number[];
}

export interface FeedbackMetrics {
  avgRating: number;
  npsScore: number;
  totalReviews: number;
  openIssues: number;
  sentimentBreakdown: { sentiment: string; count: number; percentage: number }[];
}

export function useSubscriptionMetrics() {
  return useQuery({
    queryKey: ["owner-subscription-metrics"],
    queryFn: async () => {
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select(`
          id,
          status,
          current_period_start,
          current_period_end,
          subscription_plans:subscription_plan_id (
            name,
            price_monthly,
            price_yearly
          )
        `)
        .eq("status", "active");

      if (error) throw error;

      // Calculate MRR
      const mrr = subscriptions?.reduce((sum, sub: any) => {
        return sum + Number(sub.subscription_plans?.price_monthly || 0);
      }, 0) || 0;

      return {
        currentMrr: mrr,
        activeSubscriptions: subscriptions?.length || 0,
        arr: mrr * 12,
      };
    },
  });
}

export function useCohortAnalysis() {
  return useQuery({
    queryKey: ["owner-cohort-analysis"],
    queryFn: async (): Promise<CohortData[]> => {
      const { data, error } = await supabase
        .from("cohort_analysis")
        .select("*")
        .order("cohort_date", { ascending: false })
        .limit(12);

      if (error) throw error;

      return (data || []).map((cohort) => ({
        cohort: cohort.cohort_date,
        cohortSize: cohort.cohort_size || 0,
        retentionData: cohort.retention_data as number[] || [],
      }));
    },
  });
}

export function useFeedbackMetrics() {
  return useQuery({
    queryKey: ["owner-feedback-metrics"],
    queryFn: async (): Promise<FeedbackMetrics> => {
      const { data: feedback, error } = await supabase
        .from("feedback")
        .select(`
          id,
          comment,
          rating:rating_id (
            score
          )
        `)
        .limit(500);

      if (error) throw error;

      // Calculate metrics
      const ratings = feedback?.map((f: any) => f.rating?.score || 0).filter(Boolean) || [];
      const avgRating = ratings.length
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

      // Simulate NPS calculation (promoters - detractors)
      const promoters = ratings.filter((r) => r >= 9).length;
      const detractors = ratings.filter((r) => r <= 6).length;
      const npsScore = ratings.length
        ? Math.round(((promoters - detractors) / ratings.length) * 100)
        : 0;

      // Basic sentiment analysis based on rating
      const positive = ratings.filter((r) => r >= 4).length;
      const neutral = ratings.filter((r) => r === 3).length;
      const negative = ratings.filter((r) => r <= 2).length;
      const total = ratings.length || 1;

      return {
        avgRating: Math.round(avgRating * 10) / 10,
        npsScore,
        totalReviews: feedback?.length || 0,
        openIssues: negative,
        sentimentBreakdown: [
          { sentiment: "Positive", count: positive, percentage: Math.round((positive / total) * 100) },
          { sentiment: "Neutral", count: neutral, percentage: Math.round((neutral / total) * 100) },
          { sentiment: "Negative", count: negative, percentage: Math.round((negative / total) * 100) },
        ],
      };
    },
  });
}

export function useProductUsageMetrics() {
  return useQuery({
    queryKey: ["owner-product-usage"],
    queryFn: async () => {
      // Get user counts from profile_customers
      const { count: totalUsers, error: usersError } = await supabase
        .from("profile_customers")
        .select("*", { count: "exact", head: true });

      if (usersError) throw usersError;

      // Get customer activities for engagement metrics
      // Increased limit to getting better statistics
      const { data: activities, error: activitiesError } = await supabase
        .from("customer_activities")
        .select("profile_customer_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5000);

      if (activitiesError) throw activitiesError;

      // Calculate DAU/MAU
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Unique users for DAU
      const dauSet = new Set();
      activities.forEach(a => {
        if (a.profile_customer_id && a.created_at && new Date(a.created_at) > last24h) {
          dauSet.add(a.profile_customer_id);
        }
      });
      const dau = dauSet.size;

      // Unique users for MAU
      const mauSet = new Set();
      activities.forEach(a => {
        if (a.profile_customer_id && a.created_at && new Date(a.created_at) > last30d) {
          mauSet.add(a.profile_customer_id);
        }
      });
      const mau = mauSet.size;

      return {
        totalUsers: totalUsers || 0,
        dau,
        mau,
        dauMauRatio: mau > 0 ? Math.round((dau / mau) * 100) : 0,
      };
    },
  });
}

export function useUserSegments() {
  return useQuery({
    queryKey: ["owner-user-segments"],
    queryFn: async () => {
      // Fetch workspaces with their business types
      const { data: workspaces, error } = await supabase
        .from("workspaces")
        .select(`
          id,
          business_types (
            name,
            color_code
          )
        `);

      if (error) throw error;

      // Group by business type
      const segments: Record<string, number> = {};
      let total = 0;

      workspaces?.forEach((ws: any) => {
        const typeName = ws.business_types?.name || "Other";
        segments[typeName] = (segments[typeName] || 0) + 1;
        total++;
      });

      // Convert to array format for UI
      // Define colors map if color_code is missing
      const defaultColors: Record<string, string> = {
        "Small Business": "bg-primary",
        "Agency": "bg-accent",
        "Enterprise": "bg-secondary",
        "Freelancer": "bg-muted",
        "Other": "bg-border"
      };

      return Object.entries(segments)
        .map(([type, count]) => ({
          type,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          color: defaultColors[type] || "bg-primary/50", // Fallback color
          count
        }))
        .sort((a, b) => b.percentage - a.percentage); // Sort by percentage desc
    },
  });
}
