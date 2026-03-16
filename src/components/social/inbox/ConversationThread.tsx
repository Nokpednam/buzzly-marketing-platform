import { useEffect, useRef } from "react";
import { CheckCheck, Clock, MessageSquareOff, SmilePlus, Frown, Minus, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SocialComment } from "@/hooks/useSocialComments";
import type { InboxThread } from "@/hooks/useSocialInbox";
import { ReplyComposer } from "./ReplyComposer";

interface ConversationThreadProps {
  thread: InboxThread | null;
  onReply: (commentId: string, replyText: string) => Promise<void>;
  onMarkRead: (commentId: string) => void;
  isReplying: boolean;
}

function SentimentIcon({ sentiment }: { sentiment: SocialComment["sentiment"] }) {
  if (sentiment === "positive") return <SmilePlus className="h-3.5 w-3.5 text-emerald-500" />;
  if (sentiment === "negative") return <Frown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface CommentBubbleProps {
  comment: SocialComment;
  onMarkRead: (id: string) => void;
}

const OUTBOUND_SENTINEL = "__outbound__";

function CommentBubble({ comment, onMarkRead }: CommentBubbleProps) {
  const isOutbound = comment.author_platform_id === OUTBOUND_SENTINEL;

  const initials = comment.author_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (isOutbound) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col gap-1 items-end">
          <div className="flex items-center gap-1.5">
            <Send className="h-3 w-3 text-primary" />
            <span className="text-xs font-semibold text-primary">You</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTime(comment.created_at)}
            </span>
          </div>
          <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex flex-col gap-2 rounded-2xl p-4 border transition-colors",
        comment.is_read
          ? "bg-white dark:bg-slate-900 border-border/30"
          : "bg-primary/5 dark:bg-primary/10 border-primary/20"
      )}
    >
      {/* Author row */}
      <div className="flex items-center gap-2.5">
        {comment.author_avatar_url ? (
          <img
            src={comment.author_avatar_url}
            alt={comment.author_name}
            className="h-8 w-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-foreground truncate">
              {comment.author_name}
            </span>
            {comment.sentiment && (
              <span title={comment.sentiment ?? undefined}>
                <SentimentIcon sentiment={comment.sentiment} />
              </span>
            )}
            {!comment.is_read && (
              <span className="inline-block h-2 w-2 rounded-full bg-primary shrink-0" aria-label="Unread" />
            )}
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTime(comment.created_at)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {!comment.is_read && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => onMarkRead(comment.id)}
              title="Mark as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Read
            </Button>
          )}
        </div>
      </div>

      {/* Comment content */}
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words pl-[2.75rem]">
        {comment.content}
      </p>

      {/* Replied badge (reply_content is no longer written; just show is_replied flag) */}
      {comment.is_replied && (
        <div className="ml-[2.75rem]">
          <Badge variant="secondary" className="text-xs gap-1">
            <CheckCheck className="h-3 w-3 text-emerald-500" />
            Replied
          </Badge>
        </div>
      )}
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 border border-border/30 space-y-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-full ml-[2.75rem]" />
          <Skeleton className="h-4 w-3/4 ml-[2.75rem]" />
        </div>
      ))}
    </div>
  );
}

export function ConversationThread({
  thread,
  onReply,
  onMarkRead,
  isReplying,
}: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new comments arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.comments.length]);

  if (!thread) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <MessageSquareOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Select a conversation</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click an item on the left to view comments
          </p>
        </div>
      </div>
    );
  }

  // Find the latest unread comment to reply to
  const latestUnreplied = [...thread.comments]
    .reverse()
    .find((c) => !c.is_replied);

  const handleReply = async (replyText: string) => {
    const target = latestUnreplied ?? thread.comments[thread.comments.length - 1];
    if (target) {
      await onReply(target.id, replyText);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Thread header */}
      <div className="px-4 py-3 border-b border-border/40 bg-white dark:bg-slate-900 flex items-center gap-3 shrink-0">
        <div>
          <p className="text-sm font-semibold text-foreground line-clamp-1">
            {thread.post_content ?? "Post"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground capitalize">
              {thread.platform_name}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground">
              {thread.comments.length} comments
            </span>
            {thread.unread_count > 0 && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-xs font-medium text-primary">
                  {thread.unread_count} unread
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comments scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {thread.comments.length === 0 ? (
          <ThreadSkeleton />
        ) : (
          thread.comments.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              onMarkRead={onMarkRead}
            />
          ))
        )}
      </div>

      {/* Reply composer */}
      <ReplyComposer
        onSubmit={handleReply}
        isPending={isReplying}
        placeholder={
          latestUnreplied
            ? `Reply to ${latestUnreplied.author_name}...`
            : "Write a reply..."
        }
      />
    </div>
  );
}
