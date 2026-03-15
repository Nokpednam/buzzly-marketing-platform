import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PlatformFilterBar } from "@/components/social/layout/PlatformFilterBar";
import { DateRangeSelector } from "@/components/social/layout/DateRangeSelector";
import { ContentCalendar } from "@/components/social/planner/ContentCalendar";
import { PostComposer, type SocialPostFormData } from "@/components/social/planner/PostComposer";
import { SocialPostsList } from "@/components/social/SocialPostsList";
import { useUnifiedCalendar, type CalendarItem } from "@/hooks/useUnifiedCalendar";
import { useSocialPosts, type SocialPost } from "@/hooks/useSocialPosts";
import { usePostPersonaLinks } from "@/hooks/usePostPersonaLinks";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";
import { logError } from "@/services/errorLogger";

export default function SocialPlanner() {
  const { dateRange } = useSocialFilters();
  const { calendarDays, isLoading: calendarLoading } = useUnifiedCalendar(dateRange);
  const { createPost, updatePost } = useSocialPosts(dateRange);
  const { linkPersonas } = usePostPersonaLinks();

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<"create" | "edit" | "preview">("create");
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

  const openEditFromCalendar = (item: CalendarItem) => {
    if (item.type === "ad") {
      toast.info("แก้ไข Ad ได้ที่หน้า Social Analytics");
      return;
    }
    setComposerMode("preview");
    setEditingPostId(item.id);
    setComposerInitialData({
      platform_ids: item.platform_id ? [item.platform_id] : [],
      post_type: item.post_type ?? "image",
      content: item.content ?? "",
      status: item.status,
      hashtags: item.hashtags?.join(", ") ?? "",
      scheduled_at: item.scheduled_at ?? undefined,
      media_urls: item.media_urls,
      persona_ids: item.persona_ids,
    });
    setComposerOpen(true);
  };

  const switchToEdit = () => setComposerMode("edit");

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
        const targets = data.platform_ids.length > 0 ? data.platform_ids : [null];
        const createdPosts = await Promise.all(
          targets.map((platformId) =>
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
          )
        );
        if (data.persona_ids && data.persona_ids.length > 0) {
          await Promise.all(
            createdPosts
              .filter(Boolean)
              .map((post) =>
                linkPersonas.mutateAsync({
                  postId: post.id,
                  personaIds: data.persona_ids!,
                })
              )
          );
        }
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
        if (data.persona_ids !== undefined) {
          linkPersonas.mutate({ postId: editingPostId, personaIds: data.persona_ids });
        }
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
        onItemClick={openEditFromCalendar}
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
        onRequestEdit={switchToEdit}
      />
    </div>
  );
}
