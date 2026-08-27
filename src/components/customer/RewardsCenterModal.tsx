import { useState } from "react";
import { useCustomerRewards } from "@/hooks/useCustomerRewards";
import { useLoyaltyTier } from "@/hooks/useLoyaltyTier";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Gift, Star, PackageOpen } from "lucide-react";
import { type RewardItem } from "@/hooks/useRewardsManagement";
import { RewardCard } from "./RewardCard";
import { RewardRedemptionDialog } from "./RewardRedemptionDialog";

interface RewardsCenterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RewardsCenterModal({ open, onOpenChange }: RewardsCenterModalProps) {
    const { catalog } = useCustomerRewards();
    const { userLoyalty } = useLoyaltyTier();
    const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

    const handleRedeemClick = (reward: RewardItem) => {
        setSelectedReward(reward);
    };

    const isLoading = catalog.isLoading || !userLoyalty;
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
                <DialogContent className="max-w-5xl max-h-[88vh] overflow-hidden flex flex-col p-0">
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
                            <div className="flex items-center gap-3 flex-wrap">
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
                    </div>

                    {/* Scrollable body — full-width Rewards Catalog */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        {isLoading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Skeleton key={i} className="h-64 rounded-2xl" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                    <PackageOpen className="w-5 h-5 text-primary" /> Rewards Catalog
                                </h3>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <RewardRedemptionDialog 
                selectedReward={selectedReward} 
                pointBalance={pointBalance} 
                onClose={() => setSelectedReward(null)} 
            />
        </>
    );
}
