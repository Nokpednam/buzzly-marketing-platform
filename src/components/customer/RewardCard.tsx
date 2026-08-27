import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { type RewardItem } from "@/hooks/useRewardsManagement";

interface RewardCardProps {
    reward: RewardItem;
    pointBalance: number;
    onRedeem: (reward: RewardItem) => void;
}

export function RewardCard({ reward, pointBalance, onRedeem }: RewardCardProps) {
    const canAfford = pointBalance >= reward.points_cost;
    const isOutOfStock = reward.stock_quantity !== null && reward.stock_quantity <= 0;
    const isDisabled = !canAfford || isOutOfStock;

    return (
        <Card className="overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
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
                    onClick={() => onRedeem(reward)}
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
}
