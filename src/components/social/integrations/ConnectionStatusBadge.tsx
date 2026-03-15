import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlatformStatus } from "@/hooks/usePlatformConnections";

interface ConnectionStatusBadgeProps {
  status: PlatformStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  PlatformStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  connected: {
    label: "เชื่อมต่อแล้ว",
    icon: CheckCircle2,
    classes:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  },
  disconnected: {
    label: "ยังไม่เชื่อมต่อ",
    icon: XCircle,
    classes:
      "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
  },
  error: {
    label: "เชื่อมต่อล้มเหลว",
    icon: AlertCircle,
    classes:
      "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  },
};

export function ConnectionStatusBadge({ status, className }: ConnectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        config.classes,
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {config.label}
    </span>
  );
}

interface SyncStatusBadgeProps {
  status: "success" | "failed" | "in_progress";
  className?: string;
}

const SYNC_STATUS_CONFIG: Record<
  SyncStatusBadgeProps["status"],
  { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  success: {
    label: "สำเร็จ",
    icon: CheckCircle2,
    classes:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  },
  failed: {
    label: "ล้มเหลว",
    icon: XCircle,
    classes:
      "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  },
  in_progress: {
    label: "กำลังซิงค์",
    icon: Loader2,
    classes:
      "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
};

export function SyncStatusBadge({ status, className }: SyncStatusBadgeProps) {
  const config = SYNC_STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        config.classes,
        className
      )}
    >
      <Icon className={cn("h-3 w-3 shrink-0", status === "in_progress" && "animate-spin")} />
      {config.label}
    </span>
  );
}
