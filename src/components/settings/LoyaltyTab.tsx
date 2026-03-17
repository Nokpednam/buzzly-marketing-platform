import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Crown, Gift, TrendingUp, Award, Star } from "lucide-react";
import { useLoyaltyTier, tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import { LoyaltyMissionsList } from "@/components/settings/LoyaltyMissionsList";

export function LoyaltyTab() {
  const {
    userLoyalty,
    allTiers,
    loading,
    getNextTier,
    getProgressToNextTier,
  } = useLoyaltyTier();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const currentTier = userLoyalty?.tier;
  const nextTier = getNextTier();
  const progress = getProgressToNextTier();
  const tierStyle = tierColors[currentTier?.name || "Bronze"] || tierColors.Bronze;

  return (
    <div className="space-y-6">
      {/* Current Tier */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <div className={`h-2 ${tierStyle.bg.replace("/20", "")}`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className={`h-5 w-5 ${tierStyle.text}`} />
                Your membership tier
              </CardTitle>
              <CardDescription>Your status and benefits</CardDescription>
            </div>
            <div className="text-right">
              <Badge className={`${tierStyle.bg} ${tierStyle.text} ${tierStyle.border} text-lg px-4 py-1`}>
                {tierIcons[currentTier?.name || "Bronze"]} {currentTier?.name || "Bronze"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Points Balance */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <Gift className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{(userLoyalty?.points_balance || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Points balance</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">฿{(userLoyalty?.total_spend_amount || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total spend</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <Award className="h-6 w-6 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold">{currentTier?.discount_percentage || 0}%</p>
              <p className="text-sm text-muted-foreground">Member discount</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress to {tierIcons[nextTier.name]} {nextTier.name}
                </span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {((nextTier.min_points || 0) - (userLoyalty?.points_balance || 0)).toLocaleString()} more points 
                to upgrade to {nextTier.name}
              </p>
            </div>
          )}

          {/* Benefits */}
          {currentTier?.benefits_summary && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Your benefits</h4>
                <p className="text-sm text-muted-foreground">{currentTier.benefits_summary}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* All Tiers */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            All membership tiers
          </CardTitle>
          <CardDescription>Compare benefits across tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {allTiers.map((tier) => {
              const style = tierColors[tier.name] || tierColors.Bronze;
              const isCurrent = currentTier?.id === tier.id;
              
              return (
                <div 
                  key={tier.id} 
                  className={`rounded-lg border p-4 ${isCurrent ? `${style.border} border-2` : ""}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${style.bg} ${style.text}`}>
                      {tierIcons[tier.name]} {tier.name}
                    </Badge>
                    {isCurrent && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium">{tier.discount_percentage || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Point multiplier</span>
                      <span className="font-medium">{tier.point_multiplier || 1}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min. points</span>
                      <span className="font-medium">{(tier.min_points || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  {tier.description && (
                    <p className="mt-3 text-xs text-muted-foreground">{tier.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mission Board */}
      <LoyaltyMissionsList />
    </div>
  );
}
