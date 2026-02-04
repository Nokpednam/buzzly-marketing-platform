import { useState, useEffect } from "react";
import { usePlanAccess, PlanFeatures, PlanType } from "@/hooks/usePlanAccess";
import { UpgradeRequiredDialog } from "@/components/UpgradeRequiredDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface PlanRestrictedPageProps {
  children: React.ReactNode;
  requiredFeature: keyof PlanFeatures;
  featureDescription?: string;
}

export function PlanRestrictedPage({
  children,
  requiredFeature,
  featureDescription,
}: PlanRestrictedPageProps) {
  const { loading, canAccessFeature, getRequiredPlan, getFeatureName, currentPlan } = usePlanAccess();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const hasAccess = canAccessFeature(requiredFeature);
  const requiredPlan = getRequiredPlan(requiredFeature);
  const featureName = getFeatureName(requiredFeature);

  useEffect(() => {
    // Only show dialog if not loading and no access
    // Re-check when currentPlan changes
    if (!loading && !hasAccess) {
      setShowUpgradeDialog(true);
    } else if (!loading && hasAccess) {
      setShowUpgradeDialog(false);
    }
  }, [loading, hasAccess, currentPlan]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center opacity-50 pointer-events-none">
          <div className="p-6 rounded-lg bg-muted/50">
            <h2 className="text-xl font-semibold mb-2">{featureName}</h2>
            <p className="text-muted-foreground">
              ฟีเจอร์นี้ต้องการ {requiredPlan.toUpperCase()} Plan หรือสูงกว่า
            </p>
          </div>
        </div>
        <UpgradeRequiredDialog
          open={showUpgradeDialog}
          onOpenChange={setShowUpgradeDialog}
          requiredPlan={requiredPlan}
          featureName={featureName}
          featureDescription={featureDescription}
        />
      </>
    );
  }

  return <>{children}</>;
}
