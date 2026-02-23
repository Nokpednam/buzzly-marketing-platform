import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomerCoupons, CustomerNotification } from "@/hooks/useCustomerCoupons";
import {
    Bell,
    Ticket,
    Zap,
    CheckCircle2,
    Clock,
    Percent,
    DollarSign,
    Loader2,
    Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NotificationCenterDialog({
    children,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    defaultTab = "notifications",
}: {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultTab?: "notifications" | "coupons";
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange ?? setInternalOpen;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="max-w-2xl w-full p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl bg-background border-border">
                <DialogHeader className="px-7 pt-6 pb-0">
                    <DialogTitle className="font-black text-2xl flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-primary" />
                        </div>
                        Notification Center
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} className="mt-5">
                    <div className="px-7">
                        <TabsList className="w-full grid grid-cols-2 h-10">
                            <TabsTrigger value="notifications" className="text-sm font-semibold">
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger value="coupons" className="text-sm font-semibold">
                                🎟 Coupon History
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="notifications" className="mt-0 focus-visible:ring-0">
                        <AllNotificationsTab />
                    </TabsContent>

                    <TabsContent value="coupons" className="mt-0 focus-visible:ring-0">
                        <CouponHistoryTab />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

// ─── All Notifications Tab ────────────────────────────────────────────────────
function AllNotificationsTab() {
    const { notifications, isLoadingNotifications, markNotificationRead, collectCoupon } =
        useCustomerCoupons();
    const [collectingId, setCollectingId] = useState<string | null>(null);

    // Check if a coupon-type notification has already been collected
    const { collectedCoupons } = useCustomerCoupons();
    const collectedDiscountIds = new Set(collectedCoupons.map((c) => c.discount_id));

    const handleCollect = async (notif: CustomerNotification) => {
        if (!notif.related_id) return;
        setCollectingId(notif.id);
        try {
            await collectCoupon.mutateAsync({
                discountId: notif.related_id,
                notificationId: notif.id,
            });
        } finally {
            setCollectingId(null);
        }
    };

    const handleRead = (notif: CustomerNotification) => {
        if (!notif.is_read) {
            markNotificationRead.mutate(notif.id);
        }
    };

    if (isLoadingNotifications) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Loading...</span>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <EmptyState
                icon={<Bell className="h-8 w-8 text-primary/30" />}
                title="No notifications yet"
                description="We'll notify you when there are new promotions or updates."
            />
        );
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div>
            {unreadCount > 0 && (
                <div className="px-6 py-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-primary px-2"
                        onClick={() =>
                            notifications
                                .filter((n) => !n.is_read)
                                .forEach((n) => markNotificationRead.mutate(n.id))
                        }
                    >
                        Mark all read
                    </Button>
                </div>
            )}
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/50">
                {notifications.map((notif) => {
                    const alreadyCollected = notif.related_id
                        ? collectedDiscountIds.has(notif.related_id)
                        : false;

                    return (
                        <div
                            key={notif.id}
                            className={cn(
                                "flex items-start gap-3 px-6 py-4 transition-colors cursor-pointer",
                                !notif.is_read
                                    ? "bg-primary/5 hover:bg-primary/8"
                                    : "hover:bg-muted/40"
                            )}
                            onClick={() => handleRead(notif)}
                        >
                            {/* Icon */}
                            <div
                                className={cn(
                                    "h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5",
                                    notif.type === "discount"
                                        ? "bg-emerald-500/10"
                                        : "bg-primary/10"
                                )}
                            >
                                {notif.type === "discount" ? (
                                    <Ticket className="h-4 w-4 text-emerald-600" />
                                ) : (
                                    <Zap className="h-4 w-4 text-primary" />
                                )}
                            </div>

                            {/* Body */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-semibold leading-tight">
                                        {notif.title}
                                    </p>
                                    {!notif.is_read && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                    {notif.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1">
                                    {new Date(notif.created_at).toLocaleString("th-TH", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>

                                {/* Collect button for discount notifications */}
                                {notif.type === "discount" && notif.related_id && (
                                    <Button
                                        size="sm"
                                        variant={alreadyCollected ? "secondary" : "default"}
                                        className="mt-2 h-7 text-xs font-bold w-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!alreadyCollected) handleCollect(notif);
                                        }}
                                        disabled={
                                            alreadyCollected || collectingId === notif.id
                                        }
                                    >
                                        {collectingId === notif.id ? (
                                            <>
                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                Collecting...
                                            </>
                                        ) : alreadyCollected ? (
                                            <>
                                                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                                                Collected
                                            </>
                                        ) : (
                                            "Collect Coupon"
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Coupon History Tab ───────────────────────────────────────────────────────
function CouponHistoryTab() {
    const { collectedCoupons, isLoadingCoupons } = useCustomerCoupons();

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Copied "${code}" to clipboard`);
    };

    if (isLoadingCoupons) {
        return (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Loading...</span>
            </div>
        );
    }

    if (collectedCoupons.length === 0) {
        return (
            <EmptyState
                icon={<Ticket className="h-8 w-8 text-primary/30" />}
                title="No coupons collected"
                description="Collect promotional codes from notifications to see them here."
            />
        );
    }

    const unused = collectedCoupons.filter((c) => !c.used_at);
    const used = collectedCoupons.filter((c) => !!c.used_at);

    return (
        <div className="max-h-[60vh] overflow-y-auto">
            {/* Summary bar */}
            <div className="px-6 py-3 flex items-center gap-4 bg-muted/30 border-b border-border/50">
                <div className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">{unused.length} available</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    <span className="text-muted-foreground">{used.length} used</span>
                </div>
            </div>

            <div className="px-4 py-3 space-y-3">
                {collectedCoupons.map((coupon) => {
                    const d = coupon.discounts;
                    if (!d) return null;

                    const isExpired = d.end_date && new Date(d.end_date) < new Date();
                    const isUsed = !!coupon.used_at;
                    const isAvailable = !isUsed && !isExpired;

                    let statusBadge;
                    if (isUsed) {
                        statusBadge = (
                            <Badge className="text-[10px] h-5 px-2 gap-1 bg-slate-500/10 text-slate-500 border-slate-500/20">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Used
                            </Badge>
                        );
                    } else if (isExpired) {
                        statusBadge = (
                            <Badge className="text-[10px] h-5 px-2 bg-destructive/10 text-destructive border-destructive/20">
                                Expired
                            </Badge>
                        );
                    } else {
                        statusBadge = (
                            <Badge className="text-[10px] h-5 px-2 gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Ready
                            </Badge>
                        );
                    }

                    return (
                        <div
                            key={coupon.id}
                            className={cn(
                                "rounded-2xl border p-4 transition-all",
                                isUsed || isExpired
                                    ? "opacity-55 bg-muted/30"
                                    : "bg-card hover:border-primary/30 hover:shadow-sm"
                            )}
                        >
                            {/* Top row */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] h-5 px-2 gap-1 font-bold bg-background"
                                    >
                                        {d.discount_type === "percent" ? (
                                            <>
                                                <Percent className="h-2.5 w-2.5" />
                                                {d.discount_value}% off
                                            </>
                                        ) : (
                                            <>
                                                <DollarSign className="h-2.5 w-2.5" />
                                                ฿{d.discount_value} off
                                            </>
                                        )}
                                    </Badge>
                                    {statusBadge}
                                </div>
                            </div>

                            <h4 className="font-bold text-sm">{d.name || "Special Offer"}</h4>
                            {d.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                    {d.description}
                                </p>
                            )}

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-muted-foreground font-medium">
                                {d.end_date && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" />
                                        {isExpired
                                            ? `Expired ${new Date(d.end_date).toLocaleDateString()}`
                                            : `Valid until ${new Date(d.end_date).toLocaleDateString()}`}
                                    </div>
                                )}
                                {d.min_order_value > 0 && (
                                    <div>Min order ฿{d.min_order_value}</div>
                                )}
                                {isUsed && coupon.used_at && (
                                    <div className="flex items-center gap-1">
                                        <Package className="h-2.5 w-2.5" />
                                        Used on {new Date(coupon.used_at).toLocaleDateString("th-TH")}
                                    </div>
                                )}
                            </div>

                            {/* Code + Copy */}
                            <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-between -mx-4 px-4 pb-0">
                                <span className="font-mono font-black text-primary text-sm tracking-widest bg-background px-3 py-1.5 rounded-lg border">
                                    {d.code}
                                </span>
                                <Button
                                    size="sm"
                                    onClick={() => copyCode(d.code)}
                                    disabled={isUsed || !!isExpired}
                                    className="h-8 text-xs font-bold shrink-0"
                                    variant={isAvailable ? "default" : "secondary"}
                                >
                                    {isUsed ? "Used" : isExpired ? "Expired" : "Copy Code"}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Shared Empty State ───────────────────────────────────────────────────────
function EmptyState({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                {icon}
            </div>
            <p className="font-bold text-base text-muted-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
                {description}
            </p>
        </div>
    );
}
