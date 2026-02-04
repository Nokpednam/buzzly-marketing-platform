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
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["customer_activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data as CustomerActivity[];
    },
  });

  // Calculate metrics for each stage
  const stagesWithMetrics: FunnelStageWithMetrics[] = funnelStages.map((stage, index) => {
    // Find related AARRR category
    const category = aarrrCategories.find(c => c.id === stage.aarrr_categories_id);
    
    // For demo purposes, generate some metrics
    // In production, you would aggregate from activities based on event_type_id
    const baseValue = Math.max(1000 - (index * 200), 100);
    const totalActivities = activities.length || 1000;
    
    return {
      ...stage,
      value: baseValue,
      percentage: (baseValue / (funnelStages[0] ? Math.max(1000, 100) : 1)) * 100,
      metrics: {
        users: baseValue,
        rate: ((baseValue / totalActivities) * 100).toFixed(1),
      },
      category,
    };
  });

  return {
    aarrrCategories,
    funnelStages: stagesWithMetrics,
    activities,
    isLoading: categoriesLoading || stagesLoading || activitiesLoading,
  };
}
