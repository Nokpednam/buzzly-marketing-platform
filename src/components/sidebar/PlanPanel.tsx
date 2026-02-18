import { useState } from "react";
import { ChevronUp, ChevronDown, Sparkles, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlanSelectionDialog } from "@/components/PlanSelectionDialog";
import { usePlanAccess, PlanType } from "@/hooks/usePlanAccess";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface PlanPanelProps {
  collapsed?: boolean;
}

import { PLANS } from "@/constants/plans";

const planInfo = Object.entries(PLANS).reduce((acc, [key, plan]) => {
  acc[key as PlanType] = {
    name: plan.name,
    color: plan.color,
    features: plan.features.filter(f => f.included).map(f => f.name).slice(0, 4), // Show top 4 features
  };
  return acc;
}, {} as Record<PlanType, { name: string; color: string; features: string[] }>);

export function PlanPanel({ collapsed = false }: PlanPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const { currentPlan, loading } = usePlanAccess();

  if (loading) return null;

  const plan = planInfo[currentPlan];

  if (collapsed) {
    return (
      <div className="p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-10"
          onClick={() => setPlanDialogOpen(true)}
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </Button>
        <PlanSelectionDialog open={planDialogOpen} onOpenChange={setPlanDialogOpen} />
      </div>
    );
  }

  return (
    <div className="p-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-between rounded-lg p-3 transition-colors",
              "bg-sidebar-accent/50 hover:bg-sidebar-accent"
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="text-left">
                <Badge className={cn("text-xs font-medium", plan.color)}>
                  {plan.name} Plan
                </Badge>
              </div>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-3 space-y-3">
          {/* Current plan features */}
          <div className="rounded-lg bg-sidebar-accent/30 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your Features
            </p>
            <ul className="space-y-1.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade prompt - only show for non-team plans */}
          {currentPlan !== "team" && (
            <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                  <Zap className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {currentPlan === "free" ? "Upgrade to Pro" : "Upgrade to Team"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {currentPlan === "free"
                  ? "Unlock AI insights and advanced analytics"
                  : "Add team collaboration and unlimited history"}
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => setPlanDialogOpen(true)}
              >
                Upgrade Now
              </Button>
            </div>
          )}

          {/* Manage plan button for team users */}
          {currentPlan === "team" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setPlanDialogOpen(true)}
            >
              Manage Plan
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>

      <PlanSelectionDialog open={planDialogOpen} onOpenChange={setPlanDialogOpen} />
    </div>
  );
}
