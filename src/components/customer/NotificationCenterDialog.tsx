import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCustomerCoupons, CustomerNotification } from "@/hooks/useCustomerCoupons";
import {
    Bell,
    Ticket,
    Zap,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationCenterDialog({
    children,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** @deprecated no longer used — kept for backwards compat */
    defaultTab?: string;
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange ?? setInternalOpen;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="max-w-2xl w-full p-0 gap-0 overflow-hidden rounded-2xl shadow-2xl bg-background border-border">
                <DialogHeader className="px-7 pt-6 pb-4 border-b border-border/50">
                    <DialogTitle className="font-black text-2xl flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-primary" />
                        </div>
                        Notifications
                    </DialogTitle>
                </DialogHeader>

                <AllNotificationsContent />
            </DialogContent>
        </Dialog>
    );
}

// ─── Notifications Content ────────────────────────────────────────────────────
function AllNotificationsContent() {
    const { notifications, isLoadingNotifications, markNotificationRead, collectCoupon, collectedCoupons } =
        useCustomerCoupons();
    const [collectingId, setCollectingId] = useState<string | null>(null);

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
            <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Loading...</span>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-primary/30" />
                </div>
                <p className="font-bold text-base text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
                    We'll notify you when there are new promotions or updates.
                </p>
            </div>
        );
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div>
            {unreadCount > 0 && (
                <div className="px-6 py-2 flex items-center justify-between border-b border-border/30">
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
            <div className="max-h-[65vh] overflow-y-auto divide-y divide-border/50">
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
                                        disabled={alreadyCollected || collectingId === notif.id}
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
