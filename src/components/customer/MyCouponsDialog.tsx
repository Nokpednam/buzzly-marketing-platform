import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCustomerCoupons } from "@/hooks/useCustomerCoupons";
import { Ticket, Percent, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MyCouponsDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { collectedCoupons, isLoadingCoupons } = useCustomerCoupons();

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Copied "${code}" to clipboard`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md border-none shadow-2xl p-0 overflow-hidden bg-background">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle className="font-black text-xl flex items-center gap-2">
                        <Ticket className="h-5 w-5 text-primary" />
                        My Collected Coupons
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6 pt-4 max-h-[60vh] overflow-y-auto space-y-4">
                    {isLoadingCoupons ? (
                        <p className="text-center text-sm text-muted-foreground py-8 animate-pulse">Loading coupons...</p>
                    ) : collectedCoupons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Ticket className="h-8 w-8 text-primary/40" />
                            </div>
                            <p className="font-bold text-base text-muted-foreground">ไม่มีคูปองส่วนลด</p>
                            <p className="text-xs text-muted-foreground mt-1 px-4">
                                คุณยังไม่ได้เก็บคูปองส่วนลดใดๆ รอรับการแจ้งเตือนเมื่อมีแคมเปญใหม่ได้เลย!
                            </p>
                        </div>
                    ) : (
                        collectedCoupons.map((coupon) => {
                            const d = coupon.discounts;
                            if (!d) return null;
                            const isExpired = d.end_date && new Date(d.end_date) < new Date();
                            const isUsed = !!coupon.used_at;

                            return (
                                <div
                                    key={coupon.id}
                                    className={cn(
                                        "p-4 rounded-2xl border relative overflow-hidden transition-all",
                                        isUsed || isExpired ? "opacity-60 bg-muted/50" : "bg-card hover:border-primary/30 hover:shadow-md"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <Badge variant="outline" className="text-[10px] h-5 px-2 gap-1 font-bold bg-background">
                                                    {d.discount_type === "percent" ? (
                                                        <><Percent className="h-2.5 w-2.5" /> {d.discount_value}% off</>
                                                    ) : (
                                                        <><DollarSign className="h-2.5 w-2.5" /> ฿{d.discount_value} off</>
                                                    )}
                                                </Badge>
                                                {isUsed ? (
                                                    <Badge className="text-[10px] h-5 px-2 gap-1 bg-slate-500/10 text-slate-600 border-slate-500/20">Used</Badge>
                                                ) : isExpired ? (
                                                    <Badge className="text-[10px] h-5 px-2 gap-1 bg-destructive/10 text-destructive border-destructive/20">Expired</Badge>
                                                ) : (
                                                    <Badge className="text-[10px] h-5 px-2 gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Ready to Use</Badge>
                                                )}
                                            </div>

                                            <h4 className="font-bold text-sm truncate">{d.name || "Special Offer"}</h4>
                                            {d.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{d.description}</p>}

                                            <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-muted-foreground font-medium">
                                                {(d.start_date || d.end_date) && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {d.end_date ? `Valid until ${new Date(d.end_date).toLocaleDateString()}` : `From ${new Date(d.start_date!).toLocaleDateString()}`}
                                                    </div>
                                                )}
                                                {d.min_order_value > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        Min order ฿{d.min_order_value}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-dashed flex justify-between items-center bg-muted/20 -mx-4 -mb-4 px-4 pb-4 pt-3">
                                        <div className="font-mono font-black text-primary text-sm tracking-widest bg-background px-3 py-1.5 rounded-lg border">
                                            {d.code}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => copyCode(d.code)}
                                            disabled={isUsed || isExpired}
                                            className="h-8 text-xs font-bold shrink-0"
                                        >
                                            Copy Code
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
