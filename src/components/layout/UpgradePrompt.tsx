import { useNavigate } from "react-router-dom";
import { Lock, Zap, BarChart3, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PlanType } from "@/contexts/PlanContext";

interface UpgradePromptProps {
  featureName: string;
  requiredPlan: PlanType;
  description?: string;
}

const PLAN_HIGHLIGHTS: Record<PlanType, { label: string; color: string; perks: string[] }> = {
  free: {
    label: "Free",
    color: "bg-gray-100 text-gray-700",
    perks: [],
  },
  pro: {
    label: "Pro",
    color: "bg-blue-100 text-blue-700",
    perks: [
      "Create & manage ad campaigns",
      "Allocate ads across campaigns",
      "Set KPI targets and track progress",
      "Auto-stop campaigns on completion",
      "Advanced analytics & AI insights",
    ],
  },
  team: {
    label: "Team",
    color: "bg-purple-100 text-purple-700",
    perks: [
      "Everything in Pro",
      "Unlimited team collaboration",
      "Unlimited report history",
      "Priority support",
    ],
  },
};

const FEATURE_ICONS = [BarChart3, Target, TrendingUp, Zap];

export function UpgradePrompt({ featureName, requiredPlan, description }: UpgradePromptProps) {
  const navigate = useNavigate();
  const plan = PLAN_HIGHLIGHTS[requiredPlan];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Lock icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <Badge className={plan.color}>{plan.label} Plan Required</Badge>
          <h2 className="text-2xl font-bold tracking-tight">
            Unlock {featureName}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description ??
              `${featureName} is available on the ${plan.label} plan. Upgrade to start running campaigns, tracking KPIs, and automating your ad spend.`}
          </p>
        </div>

        {/* Perks list */}
        {plan.perks.length > 0 && (
          <ul className="space-y-2 text-left">
            {plan.perks.map((perk, i) => {
              const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
              return (
                <li key={perk} className="flex items-center gap-3 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-blue-500" />
                  <span>{perk}</span>
                </li>
              );
            })}
          </ul>
        )}

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => navigate("/settings?tab=billing")}
          >
            <Zap className="mr-2 h-4 w-4" />
            Upgrade to {plan.label}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
