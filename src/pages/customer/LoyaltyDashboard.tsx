import { useState } from "react";
import { useCustomerRewards } from "@/hooks/useCustomerRewards";
import { useLoyaltyTier, tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, TrendingUp, History, ArrowUp, ArrowDown, PackageOpen, Award, Crown } from "lucide-react";
import { type RewardItem } from "@/hooks/useRewardsManagement";
import { RewardCard } from "@/components/customer/RewardCard";
import { RewardRedemptionDialog } from "@/components/customer/RewardRedemptionDialog";
import { LoyaltyMissionsList } from "@/components/settings/LoyaltyMissionsList";
import { cn } from "@/lib/utils";

export function LoyaltyDashboard() {
    const { catalog } = useCustomerRewards();
    const { userLoyalty, getNextTier, getProgressToNextTier, loading } = useLoyaltyTier();
    const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

    const handleRedeemClick = (reward: RewardItem) => {
        setSelectedReward(reward);
    };

    if (loading || catalog.isLoading) {
        return (
            <div className="p-8 space-y-8">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-8">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-64 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    const currentTier = userLoyalty?.tier;
    const nextTier = getNextTier();
    const progress = getProgressToNextTier();
    const pointBalance = userLoyalty?.points_balance ?? 0;
    const tierStyle = tierColors[currentTier?.name || "Bronze"] || tierColors.Bronze;
    const recentTransactions = userLoyalty?.recentTransactions || [];

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header section */}
            <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    <Gift className="h-8 w-8 text-primary" /> Loyalty & Rewards
                </h1>
                <p className="text-muted-foreground mt-2">Manage your points, missions, and unlock exclusive rewards.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance & Tier Card */}
                <Card className="md:col-span-2 border-0 shadow-sm rounded-2xl overflow-hidden relative">
                    <div className={`absolute top-0 left-0 w-2 h-full ${tierStyle.bg.replace("/20", "")}`} />
                    <CardHeader className="pl-8 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Crown className={`h-5 w-5 ${tierStyle.text}`} />
                                    Your Membership
                                </CardTitle>
                                <CardDescription>Current status and progress</CardDescription>
                            </div>
                            <Badge className={`${tierStyle.bg} ${tierStyle.text} ${tierStyle.border} text-lg px-4 py-1 self-start sm:self-auto`}>
                                {tierIcons[currentTier?.name || "Bronze"]} {currentTier?.name || "Bronze"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                    Available Points
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-amber-500">
                                        {pointBalance.toLocaleString()}
                                    </span>
                                    <span className="text-sm font-bold text-muted-foreground">pts</span>
                                </div>
                            </div>

                            {/* Progress to next tier */}
                            {nextTier && (
                                <div className="space-y-3 flex flex-col justify-center">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                                            <TrendingUp className="h-4 w-4" /> Next: {nextTier.name}
                                        </span>
                                        <span className="font-bold">{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-3" />
                                    <p className="text-xs text-muted-foreground">
                                        Earn <span className="font-bold">{((nextTier.min_points || 0) - pointBalance).toLocaleString()}</span> more points to upgrade
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Benefits / Total Spend Summary */}
                <Card className="border-0 shadow-sm rounded-2xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Award className="h-5 w-5 text-primary" /> Member Benefits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                            <span className="text-sm text-muted-foreground">Discount</span>
                            <span className="font-bold">{currentTier?.discount_percentage || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                            <span className="text-sm text-muted-foreground">Point Multiplier</span>
                            <span className="font-bold">{currentTier?.point_multiplier || 1}x</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <span className="text-sm text-primary font-medium">Total Spend</span>
                            <span className="font-bold text-primary">฿{(userLoyalty?.total_spend_amount || 0).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Rewards Catalog */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <PackageOpen className="w-5 h-5 text-primary" /> Redeem Rewards
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {catalog.data?.map((reward) => (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                pointBalance={pointBalance}
                                onRedeem={handleRedeemClick}
                            />
                        ))}

                        {catalog.data?.length === 0 && (
                            <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                No rewards are available right now.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Content: Missions & Recent Activity */}
                <div className="space-y-8">
                    {/* Missions */}
                    <div className="bg-card rounded-2xl border-0 shadow-sm overflow-hidden">
                        <div className="p-4 bg-muted/30 border-b">
                            <h2 className="text-lg font-bold">Missions</h2>
                            <p className="text-xs text-muted-foreground">Complete tasks to earn points</p>
                        </div>
                        <div className="p-4">
                            <LoyaltyMissionsList />
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <Card className="border-0 shadow-sm rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" /> Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentTransactions.length > 0 ? (
                                <div className="space-y-3">
                                    {recentTransactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                                    tx.transaction_type === 'earn' ? "bg-emerald-500/10" : "bg-destructive/10"
                                                )}>
                                                    {tx.transaction_type === 'earn'
                                                        ? <ArrowUp className="h-4 w-4 text-emerald-600" />
                                                        : <ArrowDown className="h-4 w-4 text-destructive" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate max-w-[150px]">
                                                        {tx.description || tx.transaction_type}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {new Date(tx.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "font-bold text-sm shrink-0",
                                                tx.transaction_type === 'earn' ? "text-emerald-600" : "text-destructive"
                                            )}>
                                                {tx.transaction_type === 'earn' ? '+' : '-'}{tx.points_amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <RewardRedemptionDialog
                selectedReward={selectedReward}
                pointBalance={pointBalance}
                onClose={() => setSelectedReward(null)}
            />
        </div>
    );
}
