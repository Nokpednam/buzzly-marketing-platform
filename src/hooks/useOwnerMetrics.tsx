import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

export interface MRRMetrics {
  currentMrr: number;
  previousMrr: number;
  mrrGrowth: number;
  activeSubscriptions: number;
  activeSubscriptionsGrowth: number;
  arr: number;
  monthlyData: { month: string; mrr: number; growth: number }[];
  growthData: { month: string; newSubs: number; churned: number; net: number; totalActive: number }[];
  breakdown: {
    newMrr: number;
    expansion: number;
    churn: number;
  };
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
  sentimentTrend: { month: string; positive: number; neutral: number; negative: number }[];
}

export function useSubscriptionMetrics() {
  return useQuery({
    queryKey: ["owner-subscription-metrics"],
    queryFn: async (): Promise<MRRMetrics> => {
      const now = new Date();
      const last13Months = subMonths(now, 12); // extra month for growthData diff

      // 1. Fetch active subscriptions
      const { data: activeSubs, error: subError } = await supabase
        .from("subscriptions")
        .select(`id, status, created_at, subscription_plans:plan_id (name, price_monthly, price_yearly)`)
        .eq("status", "active");
      if (subError) throw subError;

      // 2. Fetch ALL subscriptions (active + cancelled) for growth analysis
      const { data: allSubs, error: allSubsErr } = await supabase
        .from("subscriptions")
        .select("id, status, created_at, cancelled_at")
        .gte("created_at", last13Months.toISOString());
      if (allSubsErr) throw allSubsErr;

      // 3. Fetch completed transactions (last 12 months)
      const { data: txs, error: txError } = await supabase
        .from("payment_transactions")
        .select("id, amount, created_at")
        .gte("created_at", subMonths(now, 11).toISOString())
        .eq("status", "completed")
        .order("created_at", { ascending: true });
      if (txError) throw txError;

      // Build monthly MRR map
      const monthlyMap = new Map<string, { mrr: number }>();
      for (let i = 11; i >= 0; i--) {
        monthlyMap.set(format(subMonths(now, i), "MMM yyyy"), { mrr: 0 });
      }
      txs?.forEach(tx => {
        const label = format(new Date(tx.created_at), "MMM yyyy");
        if (monthlyMap.has(label)) {
          monthlyMap.get(label)!.mrr += Number(tx.amount);
        }
      });

      const monthlyEntries = Array.from(monthlyMap.entries());
      const monthlyData = monthlyEntries.map(([month, entry], i, arr) => {
        const prevMrr = i > 0 ? arr[i - 1][1].mrr : 0;
        const growth = prevMrr > 0 ? ((entry.mrr - prevMrr) / prevMrr) * 100 : 0;
        return { month, mrr: Math.round(entry.mrr), growth: Math.round(growth * 10) / 10 };
      });

      // Build monthly subscriber growth data
      const growthMap = new Map<string, { newSubs: number; churned: number }>();
      for (let i = 11; i >= 0; i--) {
        growthMap.set(format(subMonths(now, i), "MMM yyyy"), { newSubs: 0, churned: 0 });
      }
      allSubs?.forEach((sub: any) => {
        const startLabel = format(new Date(sub.created_at), "MMM yyyy");
        if (growthMap.has(startLabel)) growthMap.get(startLabel)!.newSubs++;
        if (sub.cancelled_at) {
          const churnLabel = format(new Date(sub.cancelled_at), "MMM yyyy");
          if (growthMap.has(churnLabel)) growthMap.get(churnLabel)!.churned++;
        }
      });

      let runningTotal = 0;
      const growthData = Array.from(growthMap.entries()).map(([month, g]) => {
        runningTotal += g.newSubs - g.churned;
        return {
          month,
          newSubs: g.newSubs,
          churned: -g.churned,  // negative for waterfall chart
          net: g.newSubs - g.churned,
          totalActive: Math.max(0, runningTotal),
        };
      });

      // Current MRR (use latest month tx total, fallback to subscription-based)
      const latestMrr = monthlyData[monthlyData.length - 1]?.mrr || 0;
      const prevMrr = monthlyData[monthlyData.length - 2]?.mrr || 0;
      const subBasedMrr = activeSubs?.reduce((s, sub: any) =>
        s + Number(sub.subscription_plans?.price_monthly || 0), 0) || 0;
      const currentMrr = latestMrr > 0 ? latestMrr : subBasedMrr;
      const mrrGrowth = prevMrr > 0
        ? Math.round(((currentMrr - prevMrr) / prevMrr) * 100 * 10) / 10
        : monthlyData[monthlyData.length - 1]?.growth || 0;

      const currentMonthStart = startOfMonth(now);
      const newThisMonth = activeSubs?.filter(s => new Date(s.created_at) >= currentMonthStart) || [];
      const newMrr = newThisMonth.reduce((s, sub: any) =>
        s + Number(sub.subscription_plans?.price_monthly || 0), 0);
      const rawChurn = Math.max(0, prevMrr - currentMrr + newMrr);
      const rawExpansion = Math.max(0, currentMrr - prevMrr - newMrr);
      const newSubsCount = newThisMonth.length;
      const prevSubsCount = (activeSubs?.length || 0) - newSubsCount;
      const activeSubscriptionsGrowth = prevSubsCount > 0
        ? Math.round((newSubsCount / prevSubsCount) * 100 * 10) / 10 : 0;

      return {
        currentMrr,
        previousMrr: prevMrr,
        mrrGrowth,
        activeSubscriptions: activeSubs?.length || 0,
        activeSubscriptionsGrowth,
        arr: currentMrr * 12,
        monthlyData,
        growthData,
        breakdown: {
          newMrr: Math.round(newMrr),
          expansion: Math.round(rawExpansion),
          churn: Math.round(rawChurn),
        },
      };
    },
  });
}

export function useCohortAnalysis() {
  // ... (keep existing implementation)
  return useQuery({
    queryKey: ["owner-cohort-analysis"],
    queryFn: async (): Promise<CohortData[]> => {
      const { data, error } = await supabase
        .from("cohort_analysis")
        .select("*")
        .order("cohort_date", { ascending: false })
        .limit(12);

      if (error) throw error;

      return (data || []).map((cohort) => {
        let retentionData: number[] = [];
        const rawRetention = cohort.retention_data;
        const cohortSize = cohort.cohort_size || 1;

        const toPercent = (val: number) =>
          val > 100 ? Math.min(100, Math.round((val / cohortSize) * 100 * 10) / 10) : val;

        if (Array.isArray(rawRetention)) {
          retentionData = (rawRetention as number[]).map(toPercent);
        } else if (rawRetention && typeof rawRetention === 'object') {
          const rd = rawRetention as Record<string, any>;
          const m1 = Number(rd.week_4 ?? rd.month_1 ?? 100);
          const m2 = Number(rd.month_2 ?? 85);
          const m3 = Number(rd.month_3 ?? 72);
          retentionData = [toPercent(m1), toPercent(m2), toPercent(m3)];
        }

        return {
          cohort: format(parseISO(cohort.cohort_date), "MMM yyyy"),
          cohortSize: cohort.cohort_size || 0,
          retentionData,
        };
      });
    },
  });
}

export function useFeedbackMetrics() {
  return useQuery({
    queryKey: ["owner-feedback-metrics"],
    queryFn: async (): Promise<FeedbackMetrics> => {
      // Fetch 6 months of feedback for trend analysis
      const now = new Date();
      const sixMonthsAgo = subMonths(now, 5); // Current month + 5 previous

      const { data: feedback, error } = await supabase
        .from("feedback")
        .select(`
          id,
          comment,
          created_at,
          rating:rating_id (
            name
          )
        `)
        .gte('created_at', startOfMonth(sixMonthsAgo).toISOString());

      if (error) {
        console.error("Error fetching feedback:", error);
        throw error;
      }

      // Helper to parse rating
      const getScoreByName = (name: string): number => {
        const n = name?.toLowerCase() || "";
        if (n.includes("excellent") || n.includes("5")) return 5;
        if (n.includes("good") || n.includes("4")) return 4;
        if (n.includes("average") || n.includes("3")) return 3;
        if (n.includes("poor") || n.includes("2")) return 2;
        if (n.includes("terrible") || n.includes("1")) return 1;
        return 0;
      };

      // 1. Overall Metrics (using all fetched data as sample)
      const allRatings = feedback?.map((f: any) => getScoreByName(f.rating?.name)).filter((r) => r > 0) || [];
      const avgRating = allRatings.length
        ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
        : 0;

      const promoters = allRatings.filter((r) => r === 5).length;
      const detractors = allRatings.filter((r) => r <= 3).length;
      const npsScore = allRatings.length
        ? Math.round(((promoters - detractors) / allRatings.length) * 100)
        : 0;

      const positive = allRatings.filter((r) => r >= 4).length;
      const neutral = allRatings.filter((r) => r === 3).length;
      const negative = allRatings.filter((r) => r <= 2).length;
      const total = allRatings.length || 1;

      // 2. Trend Analysis (Last 6 Months)
      const trendMap = new Map<string, { pos: number; neu: number; neg: number; total: number }>();

      // Init months
      for (let i = 5; i >= 0; i--) {
        const m = format(subMonths(now, i), "MMM");
        trendMap.set(m, { pos: 0, neu: 0, neg: 0, total: 0 });
      }

      feedback?.forEach((f: any) => {
        const score = getScoreByName(f.rating?.name);
        const m = format(new Date(f.created_at), "MMM");
        if (trendMap.has(m) && score > 0) {
          const bucket = trendMap.get(m)!;
          bucket.total++;
          if (score >= 4) bucket.pos++;
          else if (score === 3) bucket.neu++;
          else bucket.neg++;
        }
      });

      const sentimentTrend = Array.from(trendMap.entries()).map(([month, data]) => ({
        month,
        positive: data.total > 0 ? Math.round((data.pos / data.total) * 100) : 0,
        neutral: data.total > 0 ? Math.round((data.neu / data.total) * 100) : 0,
        negative: data.total > 0 ? Math.round((data.neg / data.total) * 100) : 0,
      }));

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
        sentimentTrend
      };
    },
  });
}

export function useProductUsageMetrics() {
  return useQuery({
    queryKey: ["owner-product-usage"],
    queryFn: async () => {
      const now = new Date();
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get total customers count from `customer` table
      const { count: totalCustomers, error: customersError } = await supabase
        .from("customer")
        .select("*", { count: "exact", head: true });

      if (customersError) {
        console.warn("Error counting customers:", customersError.message);
      }

      // Get active subscription count (paid customers) from subscriptions table
      const { count: activeSubsCount, error: subsError } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (subsError) {
        console.warn("Error counting subscriptions:", subsError.message);
      }

      // Get customer activities for DAU/MAU calculation
      const { data: activities, error: activitiesError } = await supabase
        .from("customer_activities")
        .select("profile_customer_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5000);

      let dau = 0;
      let mau = 0;

      if (!activitiesError && activities && activities.length > 0) {
        // Unique users for DAU
        const dauSet = new Set<string>();
        activities.forEach(a => {
          if (a.profile_customer_id && a.created_at && new Date(a.created_at) > last24h) {
            dauSet.add(a.profile_customer_id);
          }
        });
        dau = dauSet.size;

        // Unique users for MAU
        const mauSet = new Set<string>();
        activities.forEach(a => {
          if (a.profile_customer_id && a.created_at && new Date(a.created_at) > last30d) {
            mauSet.add(a.profile_customer_id);
          }
        });
        mau = mauSet.size;
      } else {
        // Fallback: count recently active subscriptions as MAU if no activities
        mau = activeSubsCount || 0;
      }

      const totalUsers = totalCustomers || 0;

      return {
        totalUsers,
        activeSubscriptions: activeSubsCount || 0,
        dau,
        mau: mau || activeSubsCount || 0,
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
            name
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

export interface SurvivalData {
  day: number;
  totalUsers: number;
  activeUsers: number;
  churnedUsers: number;
  survivalRate: number;
}

export function useSurvivalAnalysis() {
  return useQuery({
    queryKey: ["owner-survival-analysis"],
    queryFn: async (): Promise<SurvivalData[]> => {
      // Fetch all subscriptions with created_at, status, and cancelled_at
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select("id, created_at, status, cancelled_at");

      if (error) throw error;

      const now = new Date();
      const milestones = [0, 7, 14, 30, 60, 90, 120, 180, 270, 365];

      const survivalData: SurvivalData[] = milestones.map(dayMilestone => {
        let totalUsers = 0;
        let activeUsers = 0;

        subscriptions?.forEach(sub => {
          const createdAt = new Date(sub.created_at);
          const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

          // Only count users who have reached this milestone
          if (daysSinceCreation >= dayMilestone) {
            totalUsers++;

            // Check if user was still active at this milestone
            if (sub.status === 'active') {
              // If currently active and hasn't been cancelled, count as active
              activeUsers++;
            } else if (sub.cancelled_at) {
              // Check if cancellation happened after the milestone
              const cancelledAt = new Date(sub.cancelled_at);
              const daysUntilCancellation = Math.floor((cancelledAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

              if (daysUntilCancellation >= dayMilestone) {
                activeUsers++;
              }
            }
          }
        });

        const survivalRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100 * 10) / 10 : 100;
        const churnedUsers = totalUsers - activeUsers;

        return {
          day: dayMilestone,
          totalUsers,
          activeUsers,
          churnedUsers,
          survivalRate
        };
      });

      return survivalData;
    },
  });
}

export type FeedbackComment = {
  id: string;
  comment: string;
  created_at: string;
  rating: number; // 1-5
  customer: {
    name: string;
    avatarUrl: string;
    email?: string;
  };
  workspace: {
    name: string;
    businessType: string;
  };
};

export function useFeedbackList(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["owner-feedback-list", page, limit],
    queryFn: async (): Promise<{ data: FeedbackComment[]; count: number }> => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // 1. Fetch Feedback with Rating name and Profile info
      const { data: feedback, count, error } = await supabase
        .from("feedback")
        .select(`
          id,
          comment,
          created_at,
          user_id,
          rating:rating_id (
            name
          ),
          customer_activities (
            profile_customers (
              first_name,
              last_name,
              profile_img
            )
          )
        `, { count: 'exact' })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching feedback list:", error);
        throw error;
      }

      // 2. Collect User IDs to fetch workspace info
      // Note: user_id might be null in old data, filter boolean
      const userIds = Array.from(new Set(feedback?.map((f: any) => f.user_id).filter(Boolean)));

      let workspacesMap: Record<string, { name: string; type: string }> = {};

      if (userIds.length > 0) {
        // Fetch workspace members for these users
        // Since we can't easily join deep without exact paths, fetch separately
        const { data: members, error: wError } = await supabase
          .from("workspace_members")
          .select(`
            user_id,
            workspaces (
              name,
              business_types (
                name
              )
            )
          `)
          .in("user_id", userIds);

        if (!wError && members) {
          members.forEach((m: any) => {
            if (m.user_id && m.workspaces) {
              // Just take the first workspace found for simplicity
              if (!workspacesMap[m.user_id]) {
                workspacesMap[m.user_id] = {
                  name: m.workspaces.name,
                  type: m.workspaces.business_types?.name || "Uncategorized"
                };
              }
            }
          });
        }
      }

      // 3. Map to FeedbackComment type
      const getScoreByName = (name: string): number => {
        const n = name?.toLowerCase() || "";
        if (n.includes("excellent") || n.includes("5")) return 5;
        if (n.includes("good") || n.includes("4")) return 4;
        if (n.includes("average") || n.includes("3")) return 3;
        if (n.includes("poor") || n.includes("2")) return 2;
        if (n.includes("terrible") || n.includes("1")) return 1;
        return 0;
      };

      const mappedData = feedback?.map((f: any) => {
        // Profile info from customer_activities -> profile_customers
        // Fallback to "Anonymous" if missing
        const profile = f.customer_activities?.profile_customers;
        const fullName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : "Anonymous User";
        const wsInfo = f.user_id ? workspacesMap[f.user_id] : null;

        return {
          id: f.id,
          comment: f.comment,
          created_at: f.created_at,
          rating: getScoreByName(f.rating?.name),
          customer: {
            name: fullName || "Anonymous",
            avatarUrl: profile?.profile_img || "",
          },
          workspace: {
            name: wsInfo?.name || "Unknown Workspace",
            businessType: wsInfo?.type || "-",
          }
        };
      }) || [];

      return {
        data: mappedData,
        count: count || 0
      };
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
}
