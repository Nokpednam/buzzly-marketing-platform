import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CohortData {
  cohort_date: string;
  cohort_type: string | null;
  cohort_size: number | null;
  retention_data: Record<string, number> | null;
  revenue_data: Record<string, number> | null;
  average_retention: number | null;
  churn_rate: number | null;
  lifetime_value: number | null;
}

export interface CustomerActivity {
  id: string;
  event_type_id: string | null;
  profile_customer_id: string | null;
  campaign_id: string | null;
  device_type: string | null;
  browser: string | null;
  page_url: string | null;
  referrer_url: string | null;
  created_at: string | null;
  event_data: Record<string, unknown> | null;
}

export interface ConversionEvent {
  id: string;
  event_name: string | null;
  event_value: number | null;
  occurred_at: string;
  processing_status: string | null;
  ads_id: string | null;
  campaign_id: string | null; // Virtual field, not directly in schema
}

export function useAnalyticsData(dateRange: string = "30d") {
  // Calculate date range
  const getStartDate = () => {
    const now = new Date();
    switch (dateRange) {
      case "7d": now.setDate(now.getDate() - 7); break;
      case "30d": now.setDate(now.getDate() - 30); break;
      case "90d": now.setDate(now.getDate() - 90); break;
      case "365d": now.setDate(now.getDate() - 365); break;
      default: now.setDate(now.getDate() - 30);
    }
    return now.toISOString().split("T")[0];
  };

  const startDate = getStartDate();

  // Cohort Analysis
  const { data: cohortData = [], isLoading: cohortLoading } = useQuery({
    queryKey: ["cohort-analysis", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cohort_analysis")
        .select("*")
        .gte("cohort_date", startDate)
        .order("cohort_date", { ascending: true });

      if (error) throw error;

      return (data || []).map(c => ({
        ...c,
        retention_data: c.retention_data as Record<string, number> | null,
        revenue_data: c.revenue_data as Record<string, number> | null,
      })) as CohortData[];
    },
  });

  // Customer Activities
  const { data: customerActivities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["customer-activities", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_activities")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map(a => ({
        ...a,
        event_data: a.event_data as Record<string, unknown> | null,
      })) as CustomerActivity[];
    },
  });

  // Conversion Events
  const { data: conversionEvents = [], isLoading: conversionsLoading } = useQuery({
    queryKey: ["conversion-events", dateRange],
    queryFn: async (): Promise<ConversionEvent[]> => {
      const { data, error } = await supabase
        .from("conversion_events")
        .select("*")
        .gte("occurred_at", startDate)
        .order("occurred_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      
      return (data || []).map(e => ({
        id: e.id,
        event_name: e.event_name,
        event_value: Number(e.event_value) || 0,
        occurred_at: e.occurred_at,
        processing_status: e.processing_status,
        ads_id: e.ads_id,
        campaign_id: null, // Not in schema, mapped separately
      }));
    },
  });

  // Event Types for reference
  const { data: eventTypes = [] } = useQuery({
    queryKey: ["event-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_types")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data || [];
    },
  });

  // Aggregate metrics
  const aggregatedMetrics = {
    totalActivities: customerActivities.length,
    totalConversions: conversionEvents.length,
    totalConversionValue: conversionEvents.reduce((sum, e) => sum + (e.event_value || 0), 0),
    avgRetention: cohortData.length > 0
      ? cohortData.reduce((sum, c) => sum + (c.average_retention || 0), 0) / cohortData.length
      : 0,
    avgChurnRate: cohortData.length > 0
      ? cohortData.reduce((sum, c) => sum + (c.churn_rate || 0), 0) / cohortData.length
      : 0,
    avgLTV: cohortData.length > 0
      ? cohortData.reduce((sum, c) => sum + (c.lifetime_value || 0), 0) / cohortData.length
      : 0,
  };

  // Device breakdown
  const deviceBreakdown = customerActivities.reduce((acc, a) => {
    const device = a.device_type || "unknown";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Browser breakdown
  const browserBreakdown = customerActivities.reduce((acc, a) => {
    const browser = a.browser || "unknown";
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    cohortData,
    customerActivities,
    conversionEvents,
    eventTypes,
    aggregatedMetrics,
    deviceBreakdown,
    browserBreakdown,
    isLoading: cohortLoading || activitiesLoading || conversionsLoading,
  };
}
