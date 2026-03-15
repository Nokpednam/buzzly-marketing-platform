import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarPost } from "@/hooks/useSocialCalendar";

interface ScheduledPostCardProps {
  post: CalendarPost;
  onClick: (post: CalendarPost) => void;
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  archived: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
};

const STATUS_LABELS: Record<string, string> = {
  published: "เผยแพร่",
  scheduled: "กำหนดเวลา",
  draft: "แบบร่าง",
  archived: "เก็บถาวร",
};

function formatTime(isoString: string | null): string | null {
  if (!isoString) return null;
  return new Date(isoString).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ScheduledPostCard({ post, onClick }: ScheduledPostCardProps) {
  const time = formatTime(post.scheduled_at);
  const statusStyle = STATUS_STYLES[post.status] ?? STATUS_STYLES.draft;

  return (
    <button
      type="button"
      onClick={() => onClick(post)}
      className={cn(
        "w-full text-left rounded-lg border px-2 py-1.5 text-xs transition-all",
        "hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]",
        statusStyle
      )}
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="font-semibold truncate max-w-[80%]">
          {post.platform_name}
        </span>
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1 py-0 h-4 border-current shrink-0", statusStyle)}
        >
          {STATUS_LABELS[post.status] ?? post.status}
        </Badge>
      </div>

      {post.content && (
        <p className="line-clamp-1 opacity-80">{post.content}</p>
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
