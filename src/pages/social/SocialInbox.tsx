import { useEffect, useState } from "react";
import { Inbox, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logError } from "@/services/errorLogger";
import { useSocialInbox, type InboxFiltersState } from "@/hooks/useSocialInbox";
import { useSocialComments } from "@/hooks/useSocialComments";
import { useInboxArchived } from "@/hooks/useInboxArchived";
import { InboxFilters } from "@/components/social/inbox/InboxFilters";
import { ConversationList } from "@/components/social/inbox/ConversationList";
import { ConversationThread } from "@/components/social/inbox/ConversationThread";

export default function SocialInbox() {
  const [filters, setFilters] = useState<InboxFiltersState>({});
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { threads, isLoading, error } = useSocialInbox(filters);
  const { archive, unarchive, isArchived } = useInboxArchived();

  // useSocialComments is called without postId to get mutations scoped to workspace
  const { createComment, updateComment, markAsRead } = useSocialComments();

  const visibleThreads = threads.filter((t) => {
    const archived = isArchived(t.post_id);
    return filters.showArchived ? archived : !archived;
  });

  const selectedThread = visibleThreads.find((t) => t.post_id === selectedPostId) ?? null;

  const totalUnread = threads.reduce((acc, t) => acc + t.unread_count, 0);

  const handleSetSentiment = async (
    thread: { post_id: string; comments: { id: string }[] },
    sentiment: "positive" | "negative" | "neutral"
  ) => {
    try {
      await Promise.all(
        thread.comments.map((c) =>
          updateComment.mutateAsync({ id: c.id, updates: { sentiment } })
        )
      );
      toast.success(`Set to ${sentiment}`);
    } catch (err) {
      logError("SocialInbox.handleSetSentiment", err);
      toast.error("Failed to update sentiment");
    }
  };

  useEffect(() => {
    if (visibleThreads.length === 0) {
      if (selectedPostId !== null) {
        setSelectedPostId(null);
      }
      return;
    }

    const hasSelectedThread = visibleThreads.some((thread) => thread.post_id === selectedPostId);
    if (!hasSelectedThread && visibleThreads.length > 0) {
      setSelectedPostId(visibleThreads[0].post_id);
    }
  }, [selectedPostId, visibleThreads]);

  const handleSelectThread = (postId: string) => {
    setSelectedPostId(postId);
    // Auto-mark all unread comments in the selected thread as read
    const thread = visibleThreads.find((t) => t.post_id === postId);
    if (thread) {
      thread.comments
        .filter((c) => !c.is_read)
        .forEach((c) => markAsRead.mutate(c.id));
    }
  };

  const handleReply = async (commentId: string, replyText: string) => {
    const thread = selectedThread ?? threads.find((t) => t.post_id === selectedPostId);
    if (!thread) return;

    try {
      // Insert a new outbound comment so the thread appends rather than
      // overwriting the reply_content of the targeted inbound comment.
      await createComment.mutateAsync({
        post_id: thread.post_id,
        platform_id: thread.platform_id,
        platform_comment_id: null,
        author_name: "You",
        author_avatar_url: null,
        author_platform_id: "__outbound__",
        content: replyText,
        sentiment: null,
        is_read: true,
        is_replied: false,
        replied_at: null,
        reply_content: null,
      });

      // Mark the original comment as replied so the unread indicator clears
      await updateComment.mutateAsync({
        id: commentId,
        updates: {
          is_replied: true,
          replied_at: new Date().toISOString(),
          is_read: true,
        },
      });

      toast.success("Reply sent");
    } catch (err) {
      logError("SocialInbox.handleReply", err);
      toast.error("Failed to send reply. Please try again.");
    }
  };

  const handleMarkRead = (commentId: string) => {
    markAsRead.mutate(commentId);
  };

  if (error) {
    logError("SocialInbox", error);
  }

  return (
    <div className="space-y-6">
      {/* Compact bar: unread badge + filters — no duplicate header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {totalUnread > 0 && (
          <Badge className="h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs text-primary-foreground">
            <Wifi className="mr-1 h-3 w-3" aria-hidden />
            {totalUnread} unread
          </Badge>
        )}
        <div className="flex-1" />
      </div>

      {/* Filters */}
      <InboxFilters filters={filters} onFiltersChange={setFilters} />

      {/* Split-panel layout */}
      <div
        className={cn(
          "grid min-h-[600px] grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/50 dark:bg-slate-900 lg:grid-cols-[360px_1fr]"
        )}
      >
        {/* Left: Conversation list */}
        <div className="flex flex-col border-r border-slate-200/60 dark:border-slate-700/50">
          <div className="shrink-0 border-b border-slate-200/60 bg-slate-50/80 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {isLoading ? "Loading..." : `${visibleThreads.length} conversations`}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ConversationList
              threads={visibleThreads}
              selectedPostId={selectedPostId}
              onSelect={handleSelectThread}
              isLoading={isLoading}
              onSetSentiment={handleSetSentiment}
              onArchive={(t) => archive(t.post_id)}
              onUnarchive={(t) => unarchive(t.post_id)}
              isArchived={isArchived}
            />
          </div>
        </div>

        {/* Right: Thread detail */}
        <div className="flex flex-col overflow-hidden">
          <ConversationThread
            thread={selectedThread}
            onReply={handleReply}
            onMarkRead={handleMarkRead}
            isReplying={createComment.isPending || updateComment.isPending}
          />
        </div>
      </div>
    </div>
  );
}
