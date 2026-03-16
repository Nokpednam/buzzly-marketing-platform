import { useEffect, useState } from "react";
import { Inbox, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { logError } from "@/services/errorLogger";
import { useSocialInbox, type InboxFiltersState } from "@/hooks/useSocialInbox";
import { useSocialComments } from "@/hooks/useSocialComments";
import { InboxFilters } from "@/components/social/inbox/InboxFilters";
import { ConversationList } from "@/components/social/inbox/ConversationList";
import { ConversationThread } from "@/components/social/inbox/ConversationThread";

export default function SocialInbox() {
  const [filters, setFilters] = useState<InboxFiltersState>({});
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { threads, isLoading, error } = useSocialInbox(filters);

  // useSocialComments is called without postId to get mutations scoped to workspace
  const { createComment, updateComment, markAsRead } = useSocialComments();

  const selectedThread = threads.find((t) => t.post_id === selectedPostId) ?? null;

  const totalUnread = threads.reduce((acc, t) => acc + t.unread_count, 0);

  useEffect(() => {
    if (threads.length === 0) {
      if (selectedPostId !== null) {
        setSelectedPostId(null);
      }
      return;
    }

    const hasSelectedThread = threads.some((thread) => thread.post_id === selectedPostId);
    if (!hasSelectedThread) {
      setSelectedPostId(threads[0].post_id);
    }
  }, [selectedPostId, threads]);

  const handleSelectThread = (postId: string) => {
    setSelectedPostId(postId);
    // Auto-mark all unread comments in the selected thread as read
    const thread = threads.find((t) => t.post_id === postId);
    if (thread) {
      thread.comments
        .filter((c) => !c.is_read)
        .forEach((c) => markAsRead.mutate(c.id));
    }
  };

  const handleReply = async (commentId: string, replyText: string) => {
    const thread = threads.find((t) => t.post_id === selectedPostId);
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

      toast.success("ตอบกลับสำเร็จ");
    } catch (err) {
      logError("SocialInbox.handleReply", err);
      toast.error("ไม่สามารถส่งตอบกลับได้ กรุณาลองอีกครั้ง");
    }
  };

  const handleMarkRead = (commentId: string) => {
    markAsRead.mutate(commentId);
  };

  if (error) {
    logError("SocialInbox", error);
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Social Inbox</h2>
            {totalUnread > 0 && (
              <Badge className="h-5 min-w-5 px-1.5 text-xs rounded-full bg-primary text-primary-foreground">
                {totalUnread}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
            ความคิดเห็นจาก social media อัปเดตแบบเรียลไทม์
          </p>
        </div>
      </div>

      {/* Filters */}
      <InboxFilters filters={filters} onFiltersChange={setFilters} />

      {/* Split-panel layout */}
      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-0 rounded-2xl border border-border/40 overflow-hidden",
          "bg-white dark:bg-slate-900 shadow-sm",
          "min-h-[600px]"
        )}
      >
        {/* Left: Conversation list */}
        <div className="border-r border-border/40 flex flex-col">
          <div className="px-4 py-3 border-b border-border/40 bg-slate-50/80 dark:bg-slate-800/50 shrink-0">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {isLoading ? "กำลังโหลด..." : `${threads.length} การสนทนา`}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ConversationList
              threads={threads}
              selectedPostId={selectedPostId}
              onSelect={handleSelectThread}
              isLoading={isLoading}
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
