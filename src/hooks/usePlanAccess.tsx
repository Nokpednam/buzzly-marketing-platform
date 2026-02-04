// Re-export types and hook from PlanContext for backward compatibility
export type { PlanType, PlanFeatures } from "@/contexts/PlanContext";
export { featureRequiredPlan, featureNames, usePlanContext as usePlanAccess } from "@/contexts/PlanContext";
