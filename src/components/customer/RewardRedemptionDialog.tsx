import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerRewards } from "@/hooks/useCustomerRewards";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Loader2, Copy } from "lucide-react";
import { type RewardItem } from "@/hooks/useRewardsManagement";
import { toast } from "sonner";

interface RewardRedemptionDialogProps {
    selectedReward: RewardItem | null;
    pointBalance: number;
    onClose: () => void;
}

export function RewardRedemptionDialog({
    selectedReward,
    pointBalance,
    onClose
}: RewardRedemptionDialogProps) {
    const queryClient = useQueryClient();
    const { redeemReward } = useCustomerRewards();

    const confirmRedeem = async () => {
        if (!selectedReward) return;

        try {
            const result = await redeemReward.mutateAsync(selectedReward);

            // Refresh all coupon lists so status is globally in sync
            queryClient.invalidateQueries({ queryKey: ["user-redeemed-coupons"] });
            queryClient.invalidateQueries({ queryKey: ["customer_coupons"] });
            queryClient.invalidateQueries({ queryKey: ["loyalty-points"] });
            queryClient.invalidateQueries({ queryKey: ["customer_notifications"] });
            queryClient.invalidateQueries({ queryKey: ["customer-loyalty-stats"] });
            queryClient.invalidateQueries({ queryKey: ["customer-completed-rules"] });

            // Show a rich toast with the generated coupon code
            const couponCode = (result as any)?.coupon_code;
            if (couponCode) {
                toast.success(
                    <div className="space-y-2">
                        <p className="font-bold">🎉 Reward Redeemed!</p>
                        <div className="flex items-center gap-2">
                            <code className="font-mono font-black tracking-widest bg-black/10 px-2 py-0.5 rounded text-sm">
                                {couponCode}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(couponCode);
                                    toast.info("Copied to clipboard!");
                                }}
                                className="text-white/80 hover:text-white"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <p className="text-xs opacity-80">Check bell 🔔 for your code anytime</p>
                    </div>,
                    { duration: 7000 }
                );
            } else {
                toast.success("Reward redeemed! Check your notification bell for your code.");
            }
        } catch {
            // Error toast is handled by useCustomerRewards hook
        }

        onClose();
    };

    return (
        <Dialog open={!!selectedReward} onOpenChange={(open) => !open && onClose()}>
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
                                {Math.max(0, pointBalance - (selectedReward?.points_cost ?? 0)).toLocaleString()} pts
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700 font-semibold text-center">
                            🎟️ A unique discount code will be generated instantly and sent to your notification bell.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        ยกเลิก
                    </Button>
                    <Button onClick={confirmRedeem} disabled={redeemReward.isPending}>
                        {redeemReward.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        ยืนยันการแลกรางวัล
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
