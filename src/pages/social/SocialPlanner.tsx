import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlatformFilterBar } from "@/components/social/layout/PlatformFilterBar";
import { DateRangeSelector } from "@/components/social/layout/DateRangeSelector";
import { ContentCalendar } from "@/components/social/planner/ContentCalendar";
import { PostComposer, type SocialPostFormData } from "@/components/social/planner/PostComposer";
import { SocialPostsList } from "@/components/social/SocialPostsList";
import { useSocialCalendar } from "@/hooks/useSocialCalendar";
import { useSocialPosts, type SocialPost } from "@/hooks/useSocialPosts";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";
import { logError } from "@/services/errorLogger";
import { toast } from "sonner";
import type { CalendarPost } from "@/hooks/useSocialCalendar";

export default function SocialPlanner() {
  const { dateRange } = useSocialFilters();
  const { calendarDays, isLoading: calendarLoading } = useSocialCalendar(dateRange);
  const { createPost, updatePost } = useSocialPosts(dateRange);

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<"create" | "edit">("create");
  const [composerInitialData, setComposerInitialData] = useState<Partial<SocialPostFormData>>({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const openCreateComposer = (prefilledDate?: string) => {
    setComposerMode("create");
    setEditingPostId(null);
    setComposerInitialData(
      prefilledDate
        ? { status: "scheduled", scheduled_at: `${prefilledDate}T09:00` }
        : {}
    );
    setComposerOpen(true);
  };

  const openEditComposer = (post: SocialPost) => {
    setComposerMode("edit");
    setEditingPostId(post.id);
    setComposerInitialData({
      platform_ids: post.platform_id ? [post.platform_id] : [],
      post_type: post.post_type ?? "image",
      content: post.content ?? "",
      status: post.status ?? "draft",
      hashtags: post.hashtags?.join(", ") ?? "",
      scheduled_at: post.scheduled_at ?? undefined,
    });
    setComposerOpen(true);
  };

  const openEditFromCalendar = (calendarPost: CalendarPost) => {
    setComposerMode("edit");
    setEditingPostId(calendarPost.id);
    setComposerInitialData({
      platform_ids: calendarPost.platform_id ? [calendarPost.platform_id] : [],
      post_type: calendarPost.post_type ?? "image",
      content: calendarPost.content ?? "",
      status: calendarPost.status,
      hashtags: calendarPost.hashtags?.join(", ") ?? "",
      scheduled_at: calendarPost.scheduled_at ?? undefined,
    });
    setComposerOpen(true);
  };

  const handleSelectPost = (id: string) => {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleComposerSubmit = async (data: SocialPostFormData) => {
    const hashtagArray = data.hashtags
      ? data.hashtags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    try {
      if (composerMode === "create") {
        // Create one post per selected platform
        const targets = data.platform_ids.length > 0 ? data.platform_ids : [null];
        const mutations = targets.map((platformId) =>
          createPost.mutateAsync({
            platform_id: platformId,
            post_type: data.post_type,
            content: data.content,
            status: data.status,
            hashtags: hashtagArray.length > 0 ? hashtagArray : null,
            scheduled_at:
              data.status === "scheduled" && data.scheduled_at
                ? new Date(data.scheduled_at).toISOString()
                : null,
            post_channel: "social",
          })
        );
        await Promise.all(mutations);
        if (data.platform_ids.length > 1) {
          toast.success(`สร้าง ${data.platform_ids.length} โพสต์สำเร็จ`);
        }
      } else if (editingPostId) {
        const primaryPlatformId = data.platform_ids[0] ?? null;
        await updatePost.mutateAsync({
          id: editingPostId,
          updates: {
            platform_id: primaryPlatformId,
            post_type: data.post_type,
            content: data.content,
            status: data.status,
            hashtags: hashtagArray.length > 0 ? hashtagArray : null,
            scheduled_at:
              data.status === "scheduled" && data.scheduled_at
                ? new Date(data.scheduled_at).toISOString()
                : null,
          },
        });
      }
      setComposerOpen(false);
    } catch (err) {
      logError("SocialPlanner.handleComposerSubmit", err);
      toast.error("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Content Planner</h2>
          <p className="text-sm text-muted-foreground">
            วางแผนและกำหนดตารางโพสต์ social media
          </p>
        </div>
        <Button
          onClick={() => openCreateComposer()}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          โพสต์ใหม่
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PlatformFilterBar />
        <DateRangeSelector />
      </div>

      <ContentCalendar
        calendarDays={calendarDays}
        isLoading={calendarLoading}
        onDayClick={openCreateComposer}
        onPostClick={openEditFromCalendar}
      />

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          รายการโพสต์
        </h3>
        <SocialPostsList
          selectedPosts={selectedPosts}
          onSelectPost={handleSelectPost}
          onRequestCreate={() => openCreateComposer()}
          onRequestEdit={openEditComposer}
        />
      </div>

      <PostComposer
        mode={composerMode}
        open={composerOpen}
        onOpenChange={setComposerOpen}
        initialData={composerInitialData}
        onSubmit={handleComposerSubmit}
        isPending={createPost.isPending || updatePost.isPending}
      />
    </div>
  );
}
