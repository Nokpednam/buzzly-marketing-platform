import { useState } from "react";
import { useCustomerRewards } from "@/hooks/useCustomerRewards";
import { useLoyaltyTier } from "@/hooks/useLoyaltyTier";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Star, Award, CheckCircle2, Loader2, PackageOpen } from "lucide-react";
import { type RewardItem } from "@/hooks/useRewardsManagement";

interface RewardsCenterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RewardsCenterModal({ open, onOpenChange }: RewardsCenterModalProps) {
    const { catalog, campaigns, stats, completedRules, redeemReward } = useCustomerRewards();
    const { userLoyalty } = useLoyaltyTier();
    const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

    const handleRedeemClick = (reward: RewardItem) => {
        setSelectedReward(reward);
    };

    const confirmRedeem = async () => {
        if (!selectedReward) return;
        await redeemReward.mutateAsync(selectedReward);
        setSelectedReward(null);
    };

    const isLoading = catalog.isLoading || campaigns.isLoading || stats.isLoading || !userLoyalty;
    const pointBalance = userLoyalty?.points_balance ?? 0;
    const tierName = userLoyalty?.tier?.name ?? "Bronze";

    const getTierColor = (tier: string) => {
        switch (tier) {
            case "Bronze": return "text-amber-700 bg-amber-100/50";
            case "Silver": return "text-slate-500 bg-slate-100/50";
            case "Gold": return "text-yellow-600 bg-yellow-100/50";
            case "Platinum": return "text-slate-700 bg-slate-200/50";
            default: return "text-primary bg-primary/10";
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[88vh] overflow-hidden flex flex-col p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-8 py-6 shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Star className="w-40 h-40" />
                        </div>
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                                    <Gift className="h-6 w-6 text-amber-400" /> REWARDS CENTER
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    สะสมคะแนนจากกิจกรรมต่างๆ และนำมาแลกรับของรางวัลพิเศษ
                                </p>
                            </div>
                            {/* Balance */}
                            <div className="shrink-0 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20 flex items-center gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Available Balance
                                    </p>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                        <span className="text-3xl font-black text-amber-400">
                                            {pointBalance.toLocaleString()}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">pts</span>
                                    </div>
                                </div>
                                <Badge className={getTierColor(tierName) + " border-none font-bold shrink-0"}>
                                    {tierName} Tier
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        {isLoading ? (
                            <div className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Skeleton className="h-56 rounded-2xl" />
                                    <Skeleton className="h-56 rounded-2xl" />
                                    <Skeleton className="h-56 rounded-2xl" />
                                    <Skeleton className="h-56 rounded-2xl" />
                                </div>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Rewards Catalog */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <PackageOpen className="w-5 h-5 text-primary" /> Rewards Catalog
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {catalog.data?.map((reward) => {
                                            const canAfford = pointBalance >= reward.points_cost;
                                            const isOutOfStock =
                                                reward.stock_quantity !== null && reward.stock_quantity <= 0;
                                            const isDisabled = !canAfford || isOutOfStock;

                                            return (
                                                <Card
                                                    key={reward.id}
                                                    className="overflow-hidden border-border/50 hover:border-border transition-colors group"
                                                >
                                                    <div className="aspect-[2/1] bg-muted/30 relative">
                                                        {reward.image_url ? (
                                                            <img
                                                                src={reward.image_url}
                                                                alt={reward.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                                <Gift className="w-10 h-10" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-background/80 backdrop-blur-sm border-none shadow-sm font-bold"
                                                            >
                                                                {reward.points_cost.toLocaleString()} pts
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-bold group-hover:text-primary transition-colors">
                                                                {reward.name}
                                                            </h4>
                                                            <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                                                                {reward.reward_type}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[36px]">
                                                            {reward.description}
                                                        </p>
                                                        {reward.stock_quantity !== null && (
                                                            <p className="text-xs font-bold mt-3 text-slate-500">
                                                                Remaining:{" "}
                                                                <span className={reward.stock_quantity < 10 ? "text-red-500" : ""}>
                                                                    {reward.stock_quantity}
                                                                </span>{" "}
                                                                left
                                                            </p>
                                                        )}
                                                    </CardContent>
                                                    <CardFooter className="px-4 pb-4 pt-0">
                                                        <Button
                                                            className="w-full"
                                                            variant={canAfford && !isOutOfStock ? "default" : "secondary"}
                                                            disabled={isDisabled}
                                                            onClick={() => handleRedeemClick(reward)}
                                                        >
                                                            {isOutOfStock
                                                                ? "Out of Stock"
                                                                : !canAfford
                                                                    ? "Insufficient Points"
                                                                    : "Redeem Now"}
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            );
                                        })}

                                        {catalog.data?.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                                ไม่มีของรางวัลให้แลกในขณะนี้
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ways to Earn */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" /> Ways to Earn
                                    </h3>
                                    <Card className="border-border/50 shadow-sm border-t-4 border-t-amber-400">
                                        <CardContent className="p-0 divide-y divide-border/50">
                                            {campaigns.data?.map((campaign) => {
                                                const completionRecord = completedRules.data?.find(
                                                    (r) => r.rule_id === campaign.id
                                                );
                                                const timesCompleted = completionRecord?.times_completed ?? 0;
                                                const maxTimes = campaign.max_times_per_user;
                                                const isMaxedOut =
                                                    maxTimes !== null && timesCompleted >= maxTimes;

                                                return (
                                                    <div
                                                        key={campaign.id}
                                                        className="p-4 hover:bg-muted/30 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-sm flex items-center gap-2">
                                                                    {campaign.name}
                                                                    {isMaxedOut && (
                                                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                                    )}
                                                                </h4>
                                                                <p className="text-xs text-muted-foreground mt-1 mb-2">
                                                                    {campaign.description}
                                                                </p>
                                                                {maxTimes !== null && (
                                                                    <div className="space-y-1">
                                                                        <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                                                            <span>Progress</span>
                                                                            <span>
                                                                                {Math.min(timesCompleted, maxTimes)} /{" "}
                                                                                {maxTimes}
                                                                            </span>
                                                                        </div>
                                                                        <Progress
                                                                            value={(timesCompleted / maxTimes) * 100}
                                                                            className="h-1.5"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="shrink-0 text-right">
                                                                <span className="font-black text-amber-500 block">
                                                                    +{campaign.points_reward}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                    pts
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {campaigns.data?.length === 0 && (
                                                <div className="p-8 text-center text-muted-foreground text-sm">
                                                    ไม่มีแคมเปญแจกคะแนนในขณะนี้
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Redemption Confirmation Dialog (nested) */}
            <Dialog open={!!selectedReward} onOpenChange={(open) => !open && setSelectedReward(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Gift className="w-5 h-5 text-primary" /> Confirm Redemption
                        </DialogTitle>
                        <DialogDescription>
                            ยืนยันการใช้คะแนนสะสมเพื่อแลกรับ &ldquo;{selectedReward?.name}&rdquo;
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                                <span className="text-muted-foreground text-sm font-medium">ปัจจุบัน</span>
                                <span className="font-bold">{pointBalance.toLocaleString()} pts</span>
                            </div>
                            <div className="flex justify-between items-center px-4">
                                <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold">
                                    ใช้ไป
                                </span>
                                <span className="font-black text-amber-600 text-lg">
                                    -{selectedReward?.points_cost.toLocaleString()} pts
                                </span>
                            </div>

                            <div className="h-px bg-border/50 my-2" />

                            <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <span className="text-primary font-bold">คงเหลือ</span>
                                <span className="font-bold text-primary">
                                    {Math.max(
                                        0,
                                        pointBalance - (selectedReward?.points_cost ?? 0)
                                    ).toLocaleString()}{" "}
                                    pts
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-center text-muted-foreground mt-6 leading-relaxed">
                            *เมื่อยืนยันแล้วจะไม่สามารถขอคืนคะแนนได้
                            <br />
                            แอดมินจะทำการจัดส่งรางวัลให้ภายใน 3-5 วันทำการ อิงตามรายละเอียดอีเมลบัญชีของท่าน
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedReward(null)}>
                            ยกเลิก
                        </Button>
                        <Button onClick={confirmRedeem} disabled={redeemReward.isPending}>
                            {redeemReward.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            ยืนยันการแลกรางวัล
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
