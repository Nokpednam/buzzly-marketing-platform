import { MessageCircle, Circle, SmilePlus, Frown, Minus, Archive, ArchiveRestore } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import type { InboxThread } from "@/hooks/useSocialInbox";

type SentimentType = "positive" | "negative" | "neutral";

interface ConversationListProps {
  threads: InboxThread[];
  selectedPostId: string | null;
  onSelect: (postId: string) => void;
  isLoading: boolean;
  onSetSentiment?: (thread: InboxThread, sentiment: SentimentType) => void;
  onArchive?: (thread: InboxThread) => void;
  onUnarchive?: (thread: InboxThread) => void;
  isArchived?: (postId: string) => boolean;
}

function formatRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function getSentimentColor(
  sentiment: "positive" | "negative" | "neutral" | null
): string {
  switch (sentiment) {
    case "positive":
      return "text-emerald-500";
    case "negative":
      return "text-red-500";
    default:
      return "text-slate-400";
  }
}

interface ConversationListItemProps {
  thread: InboxThread;
  isSelected: boolean;
  onClick: () => void;
  onSetSentiment?: (thread: InboxThread, sentiment: SentimentType) => void;
  onArchive?: (thread: InboxThread) => void;
  onUnarchive?: (thread: InboxThread) => void;
  isArchived?: boolean;
}

function ConversationListItem({
  thread,
  isSelected,
  onClick,
  onSetSentiment,
  onArchive,
  onUnarchive,
  isArchived,
}: ConversationListItemProps) {
  const { getPlatformById } = usePlatformConnections();
  const platform = thread.platform_id ? getPlatformById(thread.platform_id) : null;
  const Icon = platform?.icon ?? null;

  const latestComment = thread.comments[thread.comments.length - 1];
  const dominantSentiment = latestComment?.sentiment ?? null;

  const postSnippet = thread.post_content
    ? thread.post_content.length > 60
      ? `${thread.post_content.slice(0, 60)}…`
      : thread.post_content
    : "No content";

  const latestCommentSnippet = latestComment?.content
    ? latestComment.content.length > 80
      ? `${latestComment.content.slice(0, 80)}…`
      : latestComment.content
    : "";

  const content = (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-border/30 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        isSelected && "bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Platform icon avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold",
            platform?.slug === "facebook" && "bg-blue-600",
            platform?.slug === "instagram" && "bg-gradient-to-br from-purple-500 to-pink-500",
            platform?.slug === "tiktok" && "bg-black",
            platform?.slug === "shopee" && "bg-orange-500",
            platform?.slug === "google" && "bg-red-500",
            !platform && "bg-slate-400"
          )}
        >
          {Icon ? <Icon className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground truncate">
              {platform?.name ?? thread.platform_name}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              {formatRelativeTime(thread.latest_comment_at)}
            </span>
          </div>

          <p className="text-sm font-medium text-foreground truncate mt-0.5">
            {postSnippet}
          </p>

          <div className="flex items-center gap-1.5 mt-1">
            {dominantSentiment && (
              <Circle
                className={cn("h-2 w-2 fill-current", getSentimentColor(dominantSentiment))}
              />
            )}
            <p className="text-xs text-muted-foreground truncate">{latestCommentSnippet}</p>
          </div>
        </div>

        {thread.unread_count > 0 && (
          <Badge
            className="ml-1 h-5 min-w-5 px-1.5 text-xs rounded-full shrink-0 bg-primary text-primary-foreground"
          >
            {thread.unread_count}
          </Badge>
        )}
      </div>
    </button>
  );

  if (onSetSentiment || onArchive || onUnarchive) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{content}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => onSetSentiment?.(thread, "positive")}>
            <SmilePlus className="mr-2 h-4 w-4 text-emerald-500" />
            Positive
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onSetSentiment?.(thread, "negative")}>
            <Frown className="mr-2 h-4 w-4 text-red-500" />
            Negative
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onSetSentiment?.(thread, "neutral")}>
            <Minus className="mr-2 h-4 w-4 text-slate-400" />
            Neutral
          </ContextMenuItem>
          <ContextMenuSeparator />
          {isArchived ? (
            <ContextMenuItem onClick={() => onUnarchive?.(thread)}>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive
            </ContextMenuItem>
          ) : (
            <ContextMenuItem onClick={() => onArchive?.(thread)}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return content;
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-border/30">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationList({
  threads,
  selectedPostId,
  onSelect,
  isLoading,
  onSetSentiment,
  onArchive,
  onUnarchive,
  isArchived,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <ConversationListSkeleton />
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No comments yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            New comments will appear here in real time
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {threads.map((thread) => (
        <ConversationListItem
          key={thread.post_id}
          thread={thread}
          isSelected={thread.post_id === selectedPostId}
          onClick={() => onSelect(thread.post_id)}
          onSetSentiment={onSetSentiment}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          isArchived={isArchived?.(thread.post_id)}
        />
      ))}
    </div>
  );
}
