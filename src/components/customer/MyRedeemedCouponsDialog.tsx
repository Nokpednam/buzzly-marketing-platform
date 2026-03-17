import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRedeemedCoupons, isCouponUsed } from "@/hooks/useUserRedeemedCoupons";
import { Ticket, Copy, CheckCircle2, Clock, Gift, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function MyRedeemedCouponsDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { data: coupons = [], isLoading } = useUserRedeemedCoupons();

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Copied "${code}" to clipboard!`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md border-none shadow-2xl p-0 overflow-hidden bg-background">
                <DialogHeader className="p-6 pb-3 border-b bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20">
                    <DialogTitle className="font-black text-xl flex items-center gap-2">
                        <div className="h-8 w-8 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Ticket className="h-4 w-4 text-amber-600" />
                        </div>
                        My Reward Coupons
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Codes from your redeemed loyalty rewards
                    </p>
                </DialogHeader>

                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-28 w-full rounded-2xl" />
                            <Skeleton className="h-28 w-full rounded-2xl" />
                        </>
                    ) : coupons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                                <Gift className="h-8 w-8 text-amber-500/40" />
                            </div>
                            <p className="font-bold text-base text-muted-foreground">No coupons yet</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                Redeem a reward from the Rewards Center to get your first coupon code!
                            </p>
                        </div>
                    ) : (
                        coupons.map((coupon) => {
                            const isUsed = isCouponUsed(coupon);
                            return (
                                <div
                                    key={coupon.id}
                                    className={cn(
                                        "rounded-2xl border p-4 transition-all",
                                        isUsed
                                            ? "opacity-50 grayscale bg-muted/40 border-muted"
                                            : "bg-card hover:border-amber-500/30 hover:shadow-md"
                                    )}
                                >
                                    {/* Reward name + status */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] h-5 px-2 font-bold bg-amber-500/10 text-amber-700 border-amber-500/20"
                                                >
                                                    <Zap className="h-2.5 w-2.5 mr-1" />
                                                    {coupon.reward_item?.points_cost?.toLocaleString()} pts
                                                </Badge>
                                                {isUsed ? (
                                                    <Badge className="text-[10px] h-5 px-2.5 font-extrabold tracking-wide bg-slate-700 text-white border-transparent">
                                                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                                                        Used · ใช้แล้ว
                                                    </Badge>
                                                ) : (
                                                    <Badge className="text-[10px] h-5 px-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                                        <Clock className="h-2.5 w-2.5 mr-1" />Ready to Use
                                                    </Badge>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-sm">
                                                {coupon.reward_item?.name ?? "Reward"}
                                            </h4>
                                            {coupon.reward_item?.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                    {coupon.reward_item.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Coupon code row — with USED watermark stamp */}
                                    <div className="relative flex items-center justify-between gap-3 bg-muted/50 rounded-xl px-3 py-2.5 border border-dashed overflow-hidden">
                                        {/* Diagonal USED stamp overlay */}
                                        {isUsed && (
                                            <div
                                                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                                                aria-hidden="true"
                                            >
                                                <span
                                                    className="text-slate-500/30 font-black text-3xl select-none"
                                                    style={{ transform: "rotate(-20deg)", letterSpacing: "0.3em" }}
                                                >
                                                    USED
                                                </span>
                                            </div>
                                        )}
                                        <code className="font-mono font-black text-primary text-sm tracking-widest flex-1 truncate">
                                            {coupon.coupon_code}
                                        </code>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 shrink-0 text-primary hover:bg-primary/10"
                                            onClick={() => copyCode(coupon.coupon_code)}
                                            disabled={isUsed}
                                            title={isUsed ? "Coupon already used" : "Copy code"}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Date */}
                                    <p className="text-[10px] text-muted-foreground mt-2 text-right">
                                        Redeemed on {format(new Date(coupon.redeemed_at), "dd MMM yyyy 'at' HH:mm")}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
