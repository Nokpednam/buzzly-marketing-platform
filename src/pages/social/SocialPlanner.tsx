import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PlatformFilterBar } from "@/components/social/layout/PlatformFilterBar";
import { DateRangeSelector } from "@/components/social/layout/DateRangeSelector";
import { ContentCalendar } from "@/components/social/planner/ContentCalendar";
import { PostComposer, type SocialPostFormData } from "@/components/social/planner/PostComposer";
import { SocialPostsList } from "@/components/social/SocialPostsList";
import { useUnifiedCalendar, type CalendarItem } from "@/hooks/useUnifiedCalendar";
import { useSocialPosts, type SocialPost } from "@/hooks/useSocialPosts";
import { useAds } from "@/hooks/useAds";
import { useAdGroups } from "@/hooks/useAdGroups";
import { usePostPersonaLinks } from "@/hooks/usePostPersonaLinks";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";
import { logError } from "@/services/errorLogger";

function toDateTimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultScheduledAt(prefilledDate?: string): string {
  if (prefilledDate) {
    return `${prefilledDate}T09:00`;
  }

  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return toDateTimeLocalValue(nextHour);
}

export default function SocialPlanner() {
  const { dateRange } = useSocialFilters();
  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());

  const handleViewChange = (year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonth(month);
  };

  const { calendarDays, isLoading: calendarLoading } = useUnifiedCalendar(dateRange, calendarYear, calendarMonth);
  const { createPost, updatePost } = useSocialPosts(dateRange);
  const { ads, createAdWithMirrorPost, updateAd, linkPersonas: linkAdPersonas } = useAds();
  const { adGroups } = useAdGroups();
  const { linkPersonas } = usePostPersonaLinks();

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<"create" | "edit" | "preview">("create");
  const [composerInitialData, setComposerInitialData] = useState<Partial<SocialPostFormData>>({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postGrouping, setPostGrouping] = useState<"none" | "ad-group">("none");

  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  const openCreateComposer = (prefilledDate?: string) => {
    setComposerMode("create");
    setEditingPostId(null);
    setComposerInitialData(
      {
        content_kind: "organic",
        status: "scheduled",
        scheduled_at: getDefaultScheduledAt(prefilledDate),
      }
    );
    setComposerOpen(true);
  };

  const openEditComposer = (post: SocialPost) => {
    const matchingAd = post.post_channel === "ad" ? ads.find((ad) => ad.id === post.id) : undefined;
    setComposerMode("edit");
    setEditingPostId(post.id);
    setComposerInitialData({
      platform_ids: post.platform_id ? [post.platform_id] : [],
      content_kind: post.post_channel === "ad" ? "paid" : "organic",
      post_type: post.post_type ?? "image",
      headline: matchingAd?.headline ?? post.name ?? "",
      content: post.content ?? "",
      media_url: post.media_urls?.[0] ?? "",
      budget: matchingAd?.budget ?? null,
      status: post.status ?? "draft",
      hashtags: post.hashtags?.join(", ") ?? "",
      scheduled_at: post.scheduled_at ?? undefined,
      media_urls: post.media_urls,
      ad_group_id: post.ad_group_id ?? null,
    });
    setComposerOpen(true);
  };

  const openEditFromCalendar = (item: CalendarItem) => {
    const matchingAd = item.type === "ad" ? ads.find((ad) => ad.id === item.id) : undefined;
    setComposerMode("preview");
    setEditingPostId(item.id);
    setComposerInitialData({
      platform_ids: item.platform_id ? [item.platform_id] : [],
      content_kind: item.type === "ad" ? "paid" : "organic",
      post_type: item.post_type ?? "image",
      headline: matchingAd?.headline ?? item.title ?? "",
      content: item.content ?? "",
      media_url: item.media_urls?.[0] ?? "",
      budget: matchingAd?.budget ?? null,
      status: item.status,
      hashtags: item.hashtags?.join(", ") ?? "",
      scheduled_at: item.scheduled_at ?? undefined,
      media_urls: item.media_urls,
      persona_ids: item.persona_ids,
      ad_group_id: item.ad_group_id ?? null,
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
    const scheduledAtInput = data.scheduled_at?.trim() ?? "";
    const parsedScheduledAt = scheduledAtInput ? new Date(scheduledAtInput) : null;

    if (!parsedScheduledAt || Number.isNaN(parsedScheduledAt.getTime())) {
      toast.error("กรุณากำหนดวันเวลาที่ถูกต้องก่อนบันทึกโพสต์");
      return;
    }

    const hashtagArray = data.hashtags
      ? data.hashtags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const mediaUrls = data.media_url.trim() ? [data.media_url.trim()] : null;
    const normalizedScheduledAt = parsedScheduledAt.toISOString();
    const publishedAt = data.status === "published" ? new Date().toISOString() : null;
    const isPaidAd = data.content_kind === "paid";

    try {
      if (composerMode === "create") {
        const targets = data.platform_ids.length > 0 ? data.platform_ids : [null];
        const createdPosts = await Promise.all(
          targets.map(async (platformId) => {
            const sharedId = crypto.randomUUID();

            if (isPaidAd) {
              return createAdWithMirrorPost.mutateAsync({
                id: sharedId,
                ad_group_id: data.ad_group_id ?? null,
                budget: data.budget,
                content: data.content,
                creative_type: data.post_type,
                headline: data.headline || null,
                media_urls: mediaUrls,
                name: data.headline || "Untitled Ad",
                platform_id: platformId,
                scheduled_at: normalizedScheduledAt,
                status:
                  data.status === "published"
                    ? "active"
                    : data.status === "archived"
                      ? "archived"
                      : "draft",
              });
            }

            return createPost.mutateAsync({
              id: sharedId,
              name: data.headline || null,
              platform_id: platformId,
              post_type: data.post_type,
              content: data.content,
              media_urls: mediaUrls,
              status: data.status,
              hashtags: hashtagArray.length > 0 ? hashtagArray : null,
              scheduled_at: normalizedScheduledAt,
              published_at: publishedAt,
              post_channel: isPaidAd ? "ad" : "social",
              ad_group_id: data.ad_group_id ?? null,
            });
          })
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

          if (isPaidAd) {
            await Promise.all(
              createdPosts
                .filter(Boolean)
                .map((post) =>
                  linkAdPersonas.mutateAsync({
                    adId: post.id,
                    personaIds: data.persona_ids!,
                  })
                )
            );
          }
        }

        if (data.platform_ids.length > 1) {
          toast.success(`สร้าง ${data.platform_ids.length} รายการสำเร็จ`);
        }
      } else if (editingPostId) {
        const primaryPlatformId = data.platform_ids[0] ?? null;
        if (isPaidAd) {
          await updateAd.mutateAsync({
            id: editingPostId,
            updates: {
              budget: data.budget,
              content: data.content,
              ad_group_id: data.ad_group_id ?? null,
              headline: data.headline || null,
              media_urls: mediaUrls,
              name: data.headline || "Untitled Ad",
              platform: primaryPlatformId,
              scheduled_at: normalizedScheduledAt,
              status:
                data.status === "published"
                  ? "active"
                  : data.status === "archived"
                    ? "archived"
                    : "draft",
            },
          });
        }

        await updatePost.mutateAsync({
          id: editingPostId,
          updates: {
            name: data.headline || null,
            platform_id: primaryPlatformId,
            post_type: data.post_type,
            content: data.content,
            media_urls: mediaUrls,
            status: data.status,
            hashtags: hashtagArray.length > 0 ? hashtagArray : null,
            scheduled_at: normalizedScheduledAt,
            published_at: publishedAt,
            post_channel: isPaidAd ? "ad" : "social",
            ad_group_id: data.ad_group_id ?? null,
          },
        });
        if (data.persona_ids !== undefined) {
          await linkPersonas.mutateAsync({ postId: editingPostId, personaIds: data.persona_ids });
          if (isPaidAd) {
            await linkAdPersonas.mutateAsync({ adId: editingPostId, personaIds: data.persona_ids });
          }
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
        viewYear={calendarYear}
        viewMonth={calendarMonth}
        onViewChange={handleViewChange}
      />

      <div>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            รายการโพสต์
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">จัดกลุ่ม</span>
            <Select
              value={postGrouping}
              onValueChange={(value: "none" | "ad-group") => setPostGrouping(value)}
            >
              <SelectTrigger className="w-[190px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ไม่จัดกลุ่ม</SelectItem>
                <SelectItem value="ad-group">ตาม Ad Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SocialPostsList
          groupingMode={postGrouping}
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
        isPending={
          createPost.isPending ||
          updatePost.isPending ||
              createAdWithMirrorPost.isPending ||
          updateAd.isPending
        }
        onRequestEdit={switchToEdit}
        adGroups={adGroups.map((g) => ({ id: g.id, name: g.name }))}
      />
    </div>
  );
}
