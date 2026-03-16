import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/hooks/useUnifiedCalendar";

interface ScheduledPostCardProps {
  item: CalendarItem;
  onClick: (item: CalendarItem) => void;
}

const STATUS_LABELS: Record<string, string> = {
  published: "Published",
  scheduled: "Scheduled",
  draft: "Draft",
  archived: "Archived",
  active: "Active",
  paused: "Paused",
};

function formatTime(isoString: string | null): string | null {
  if (!isoString) return null;
  return new Date(isoString).toLocaleTimeString("en-US", {
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

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className={cn(
        "w-full text-left rounded-xl border border-border/30 bg-background/90 px-2.5 py-1.5 text-xs transition-all",
        "hover:bg-muted/30 hover:border-border/50 active:scale-[0.99]"
      )}
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="font-medium truncate max-w-[75%] text-foreground">
          {item.platform_name}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center gap-1 text-muted-foreground">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                isAd ? "bg-[#06B6D4]" : "bg-emerald-500"
              )}
              aria-hidden
            />
            <span className="text-[10px] text-foreground/75">{isAd ? "Ad" : "Organic"}</span>
          </span>
          <span className="text-[10px] text-foreground/70">
            {STATUS_LABELS[item.status] ?? item.status}
          </span>
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
        <div className="flex items-center gap-0.5 mt-0.5 text-foreground/70">
          <Clock className="h-2.5 w-2.5" />
          <span>{time}</span>
        </div>
      )}
    </button>
  );
}
