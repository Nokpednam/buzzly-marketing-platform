import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { usePlanContext, featureNames, featureRequiredPlan } from "@/contexts/PlanContext";
import type { PlanFeatures } from "@/contexts/PlanContext";
import { UpgradePrompt } from "./UpgradePrompt";

interface PlanGateProps {
  feature: keyof PlanFeatures;
  children: ReactNode;
  /** Optional override for the description shown in the upgrade prompt */
  description?: string;
}

/**
 * Renders children only when the user's current plan includes `feature`.
 * Otherwise renders an UpgradePrompt. Shows a spinner while the plan is loading.
 */
export function PlanGate({ feature, children, description }: PlanGateProps) {
  const { hasFeature, loading } = usePlanContext();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasFeature(feature)) {
    return (
      <UpgradePrompt
        featureName={featureNames[feature]}
        requiredPlan={featureRequiredPlan[feature]}
        description={description}
      />
    );
  }

  return <>{children}</>;
}
