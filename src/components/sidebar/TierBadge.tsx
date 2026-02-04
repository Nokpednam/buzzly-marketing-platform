import { useLoyaltyTier, tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface TierBadgeProps {
  collapsed?: boolean;
  showProgress?: boolean;
}

export function TierBadge({ collapsed = false, showProgress = true }: TierBadgeProps) {
  const { userLoyalty, loading, getNextTier, getProgressToNextTier } = useLoyaltyTier();

  if (loading || !userLoyalty?.tier) return null;

  const tier = userLoyalty.tier;
  const tierName = tier.name || "Bronze";
  const colors = tierColors[tierName] || tierColors.Bronze;
  const icon = tierIcons[tierName] || "🥉";
  const nextTier = getNextTier();
  const progress = getProgressToNextTier();

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-lg cursor-default",
            colors.bg
          )}>
            {icon}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <div className="space-y-2">
            <p className="font-medium">{tierName} Member</p>
            <p className="text-xs text-muted-foreground">
              {tier.discount_percentage}% discount • {tier.point_multiplier}x points
            </p>
            {nextTier && (
              <>
                <Progress value={progress} className="h-1.5" />
                <p className="text-xs">{Math.round(progress)}% to {nextTier.name}</p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <Badge className={cn("font-medium", colors.bg, colors.text)}>
          {tierName} Member
        </Badge>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">{tier.discount_percentage}%</span> discount • 
        <span className="font-medium"> {tier.point_multiplier}x</span> points
      </div>

      {showProgress && nextTier && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress to {nextTier.name}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
    </div>
  );
}
