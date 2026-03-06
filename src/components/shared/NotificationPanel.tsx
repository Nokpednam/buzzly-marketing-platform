import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Bell,
    BellRing,
    AlertCircle,
    ShieldAlert,
    Gift,
    Zap,
    CheckCheck,
    Loader2,
} from "lucide-react";
import { type Notification, type NotificationType } from "@/hooks/useNotifications";

// ─── Type helpers ─────────────────────────────────────────────────────────────

const typeConfig: Record<
    NotificationType | string,
    { icon: React.ReactNode; color: string; bg: string }
> = {
    critical_error: {
        icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        color: "text-red-600",
        bg: "bg-red-50 border-red-100",
    },
    error_log: {
        icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
        color: "text-orange-500",
        bg: "bg-orange-50 border-orange-100",
    },
    auth_failure: {
        icon: <ShieldAlert className="h-4 w-4 text-amber-600" />,
        color: "text-amber-600",
        bg: "bg-amber-50 border-amber-100",
    },
    redemption_request: {
        icon: <Gift className="h-4 w-4 text-blue-600" />,
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-100",
    },
    suspicious_activity: {
        icon: <Zap className="h-4 w-4 text-rose-600" />,
        color: "text-rose-600",
        bg: "bg-rose-50 border-rose-100",
    },
};

function getConfig(type: NotificationType | string) {
    return typeConfig[type] ?? typeConfig["error_log"];
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

interface NotificationItemProps {
    notification: Notification;
    onRead: (id: string) => void;
    accentColor: string;
}

function NotificationItem({ notification, onRead, accentColor }: NotificationItemProps) {
    const navigate = useNavigate();
    const config = getConfig(notification.type);

    const handleClick = () => {
        if (!notification.is_read) {
            onRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "w-full text-left p-3 rounded-xl border transition-all duration-150 group",
                "hover:shadow-sm active:scale-[0.99]",
                notification.is_read
                    ? "bg-slate-50/60 border-slate-100 opacity-60"
                    : config.bg
            )}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    notification.is_read ? "bg-slate-100" : "bg-white shadow-sm"
                )}>
                    {config.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                            "text-sm font-semibold leading-snug truncate",
                            notification.is_read ? "text-slate-500" : "text-slate-800"
                        )}>
                            {notification.title}
                        </p>
                        {!notification.is_read && (
                            <span className={cn("h-2 w-2 shrink-0 rounded-full", accentColor)} />
                        )}
                    </div>
                    {notification.body && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {notification.body}
                        </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                </div>
            </div>
        </button>
    );
}

// ─── NotificationPanel ────────────────────────────────────────────────────────

interface NotificationPanelProps {
    notifications: Notification[];
    unreadCount: number;
    isMarkingAll: boolean;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    /** Accent color class for unread dots and badge, e.g. 'bg-emerald-500' */
    accentColor?: string;
    /** Badge bg class e.g. 'bg-emerald-500' */
    badgeColor?: string;
}

export function NotificationPanel({
    notifications,
    unreadCount,
    isMarkingAll,
    onMarkAsRead,
    onMarkAllAsRead,
    accentColor = "bg-blue-500",
    badgeColor = "bg-blue-500",
}: NotificationPanelProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "relative p-2 text-slate-400 hover:text-slate-700",
                        "transition-all duration-150 rounded-lg hover:bg-slate-50 active:scale-90"
                    )}
                    title="Notifications"
                >
                    {unreadCount > 0 ? (
                        <BellRing className="h-5 w-5 animate-[wiggle_0.5s_ease-in-out]" />
                    ) : (
                        <Bell className="h-5 w-5" />
                    )}

                    {/* Badge */}
                    {unreadCount > 0 && (
                        <span className={cn(
                            "absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center",
                            "rounded-full text-[9px] font-bold text-white",
                            badgeColor, "shadow"
                        )}>
                            {unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                side="top"
                align="end"
                className="w-80 p-0 rounded-2xl shadow-xl border border-slate-100 animate-scale-in"
                sideOffset={12}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-slate-500" />
                        <span className="font-semibold text-sm text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                            <span className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white",
                                badgeColor
                            )}>
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-slate-500 hover:text-slate-800 px-2"
                            onClick={onMarkAllAsRead}
                            disabled={isMarkingAll}
                        >
                            {isMarkingAll
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <CheckCheck className="h-3 w-3 mr-1" />
                            }
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Body */}
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <Bell className="h-8 w-8 mb-2 opacity-30" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1.5">
                            {notifications.map((n) => (
                                <NotificationItem
                                    key={n.id}
                                    notification={n}
                                    onRead={onMarkAsRead}
                                    accentColor={accentColor}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-slate-100 text-center">
                        <p className="text-[10px] text-slate-400">
                            Showing last {notifications.length} notifications
                        </p>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
