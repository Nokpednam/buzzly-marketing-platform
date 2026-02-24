import { useState } from "react";
import { useCustomerRewards } from "@/hooks/useCustomerRewards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Star, Award, ChevronRight, CheckCircle2, Loader2, PackageOpen } from "lucide-react";
import { type RewardItem } from "@/hooks/useRewardsManagement";

export default function RewardsCenter() {
    const { catalog, campaigns, stats, completedRules, redeemReward } = useCustomerRewards();

    const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

    const handleRedeemClick = (reward: RewardItem) => {
        setSelectedReward(reward);
    };

    const confirmRedeem = async () => {
        if (!selectedReward) return;
        await redeemReward.mutateAsync(selectedReward);
        setSelectedReward(null);
    };

    const isLoading = catalog.isLoading || campaigns.isLoading || stats.isLoading;
    const pointBalance = stats.data?.point_balance ?? 0;
    const tierName = stats.data?.tier_name ?? "Bronze";

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'Bronze': return 'text-amber-700 bg-amber-100/50';
            case 'Silver': return 'text-slate-500 bg-slate-100/50';
            case 'Gold': return 'text-yellow-600 bg-yellow-100/50';
            case 'Platinum': return 'text-slate-700 bg-slate-200/50';
            default: return 'text-primary bg-primary/10';
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-8 animate-in fade-in duration-500">
                <Skeleton className="h-40 w-full rounded-3xl" />
                <div className="grid md:grid-cols-2 gap-8">
                    <Skeleton className="h-80 rounded-2xl" />
                    <Skeleton className="h-80 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-700">

            {/* 1. HEADER & BALANCE CARD */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                        <Gift className="h-8 w-8 text-primary" /> REWARDS CENTER
                    </h1>
                    <p className="text-muted-foreground mt-2">สะสมคะแนนจากกิจกรรมต่างๆ และนำมาแลกรับของรางวัลพิเศษ</p>
                </div>

                <Card className="border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl min-w-[300px] overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Star className="w-24 h-24" />
                    </div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-slate-300 uppercase tracking-widest">Available Balance</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-4xl font-black text-amber-400">{pointBalance.toLocaleString()}</span>
                                    <span className="text-sm font-bold text-slate-400">pts</span>
                                </div>
                            </div>
                            <Badge className={getTierColor(tierName) + " border-none"}>
                                {tierName} Tier
                            </Badge>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                            <p className="text-xs text-slate-400">Total earned: {stats.data?.total_points_earned?.toLocaleString() ?? 0} pts</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* 2. REWARDS CATALOG (MAIN CONTENT) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <PackageOpen className="w-6 h-6 text-primary" /> Rewards Catalog
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {catalog.data?.map(reward => {
                            const canAfford = pointBalance >= reward.points_cost;
                            const isOutOfStock = reward.stock_quantity !== null && reward.stock_quantity <= 0;
                            const isDisabled = !canAfford || isOutOfStock;

                            return (
                                <Card key={reward.id} className="overflow-hidden border-border/50 hover:border-border transition-colors group">
                                    <div className="aspect-[2/1] bg-muted/30 relative">
                                        {reward.image_url ? (
                                            <img src={reward.image_url} alt={reward.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                <Gift className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-none shadow-sm font-bold">
                                                {reward.points_cost.toLocaleString()} pts
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{reward.name}</h3>
                                            <Badge variant="outline" className="text-[10px] uppercase">{reward.reward_type}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                            {reward.description}
                                        </p>

                                        {reward.stock_quantity !== null && (
                                            <p className="text-xs font-bold mt-4 text-slate-500">
                                                Remaining: <span className={reward.stock_quantity < 10 ? "text-red-500" : ""}>{reward.stock_quantity}</span> left
                                            </p>
                                        )}
                                    </CardContent>
                                    <CardFooter className="px-5 pb-5 pt-0">
                                        <Button
                                            className="w-full"
                                            variant={canAfford && !isOutOfStock ? "default" : "secondary"}
                                            disabled={isDisabled}
                                            onClick={() => handleRedeemClick(reward)}
                                        >
                                            {isOutOfStock ? "Out of Stock" : !canAfford ? "Insufficient Points" : "Redeem Now"}
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

                {/* 3. WAYS TO EARN (SIDEBAR) */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="w-6 h-6 text-primary" /> Ways to Earn
                    </h2>

                    <Card className="border-border/50 shadow-sm border-t-4 border-t-amber-400">
                        <CardContent className="p-0 divide-y divide-border/50">
                            {campaigns.data?.map(campaign => {
                                const completionRecord = completedRules.data?.find(r => r.rule_id === campaign.id);
                                const timesCompleted = completionRecord?.times_completed ?? 0;
                                const maxTimes = campaign.max_times_per_user;
                                const isMaxedOut = maxTimes !== null && timesCompleted >= maxTimes;

                                return (
                                    <div key={campaign.id} className="p-5 hover:bg-muted/30 transition-colors">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h4 className="font-bold flex items-center gap-2">
                                                    {campaign.name}
                                                    {isMaxedOut && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-1 mb-3">{campaign.description}</p>

                                                {maxTimes !== null && (
                                                    <div className="space-y-1.5 w-full">
                                                        <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                                            <span>Progress</span>
                                                            <span>{Math.min(timesCompleted, maxTimes)} / {maxTimes}</span>
                                                        </div>
                                                        <Progress value={(timesCompleted / maxTimes) * 100} className="h-1.5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span className="font-black text-amber-500 block">+{campaign.points_reward}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">pts</span>
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

            {/* REDEMPTION CONFIRMATION DIALOG */}
            <Dialog open={!!selectedReward} onOpenChange={(open) => !open && setSelectedReward(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Gift className="w-5 h-5 text-primary" /> Confirm Redemption
                        </DialogTitle>
                        <DialogDescription>
                            ยืนยันการใช้คะแนนสะสมเพื่อแลกรับ "{selectedReward?.name}"
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                                <span className="text-muted-foreground text-sm font-medium">ปัจจุบัน</span>
                                <span className="font-bold">{pointBalance.toLocaleString()} pts</span>
                            </div>
                            <div className="flex justify-between items-center px-4">
                                <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold">ใช้ไป</span>
                                <span className="font-black text-amber-600 text-lg">-{selectedReward?.points_cost.toLocaleString()} pts</span>
                            </div>

                            <div className="h-px bg-border/50 my-2" />

                            <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <span className="text-primary font-bold">คงเหลือ</span>
                                <span className="font-bold text-primary">
                                    {Math.max(0, pointBalance - (selectedReward?.points_cost ?? 0)).toLocaleString()} pts
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-center text-muted-foreground mt-6 leading-relaxed">
                            *เมื่อยืนยันแล้วจะไม่สามารถขอคืนคะแนนได้<br />
                            แอดมินจะทำการจัดส่งรางวัลให้ภายใน 3-5 วันทำการ อิงตามรายละเอียดอีเมลบัญชีของท่าน
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedReward(null)}>ยกเลิก</Button>
                        <Button
                            onClick={confirmRedeem}
                            disabled={redeemReward.isPending}
                        >
                            {redeemReward.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            ยืนยันการแลกรางวัล
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
