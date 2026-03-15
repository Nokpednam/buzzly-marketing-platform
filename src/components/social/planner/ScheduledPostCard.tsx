import { Badge } from "@/components/ui/badge";
import { Clock, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/hooks/useUnifiedCalendar";

interface ScheduledPostCardProps {
  item: CalendarItem;
  onClick: (item: CalendarItem) => void;
}

const POST_STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  archived: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
};

const AD_STATUS_STYLES: Record<string, string> = {
  active: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  paused: "bg-amber-100/60 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  draft: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  archived: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
};

const STATUS_LABELS: Record<string, string> = {
  published: "เผยแพร่",
  scheduled: "กำหนดเวลา",
  draft: "แบบร่าง",
  archived: "เก็บถาวร",
  active: "กำลังทำงาน",
  paused: "หยุดชั่วคราว",
};

function formatTime(isoString: string | null): string | null {
  if (!isoString) return null;
  return new Date(isoString).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ScheduledPostCard({ item, onClick }: ScheduledPostCardProps) {
  const time =
    formatTime(item.scheduled_at) ??
    formatTime(item.published_at) ??
    formatTime(item.created_at);
  const isAd = item.type === "ad";
  const statusStyle = isAd
    ? (AD_STATUS_STYLES[item.status] ?? AD_STATUS_STYLES.draft)
    : (POST_STATUS_STYLES[item.status] ?? POST_STATUS_STYLES.draft);

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={cn(
        "w-full text-left rounded-lg border px-2 py-1.5 text-xs transition-all",
        "hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]",
        isAd && "border-l-[3px] border-l-amber-400 dark:border-l-amber-500",
        statusStyle
      )}
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="font-semibold truncate max-w-[75%] flex items-center gap-1">
          {isAd && (
            <Megaphone className="h-2.5 w-2.5 shrink-0 text-amber-500" aria-hidden />
          )}
          {item.platform_name}
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          {isAd && (
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 h-4 bg-amber-500/10 border-amber-300 text-amber-700 dark:text-amber-400"
            >
              Ad
            </Badge>
          )}
          <Badge
            variant="outline"
            className={cn("text-[10px] px-1 py-0 h-4 border-current shrink-0", statusStyle)}
          >
            {STATUS_LABELS[item.status] ?? item.status}
          </Badge>
        </div>
      </div>

      {(item.content ?? item.title) && (
        <p className="line-clamp-1 opacity-80">
          {item.content ?? item.title}
        </p>
      )}

      {item.ad_group_name && (
        <div className="mt-1">
          <Badge variant="outline" className="h-4 px-1 text-[9px]">
            {item.ad_group_name}
          </Badge>
        </div>
      )}

      {time && (
        <div className="flex items-center gap-0.5 mt-0.5 opacity-60">
          <Clock className="h-2.5 w-2.5" />
          <span>{time}</span>
        </div>
      )}
    </button>
  );
}
