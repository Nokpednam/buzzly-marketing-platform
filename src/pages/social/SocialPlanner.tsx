import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CalendarDays } from "lucide-react";
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
      toast.error("Please set a valid date and time before saving");
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
          toast.success(`Created ${data.platform_ids.length} post(s) successfully`);
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
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* CTA + Filters — no duplicate header (SocialLayout handles it) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <PlatformFilterBar />
          <DateRangeSelector />
          <Button
            onClick={() => openCreateComposer()}
            className="h-10 gap-2 rounded-xl px-5 font-medium order-first sm:order-last"
          >
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Bento: Calendar (main) */}
      <ContentCalendar
        calendarDays={calendarDays}
        isLoading={calendarLoading}
        onDayClick={openCreateComposer}
        onItemClick={openEditFromCalendar}
        viewYear={calendarYear}
        viewMonth={calendarMonth}
        onViewChange={handleViewChange}
      />

      {/* Bento: Post list section */}
      <section className="bento-card overflow-hidden p-0">
        <div className="flex flex-col gap-4 border-b border-border/30 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Post List</h3>
              <p className="text-xs text-muted-foreground">Manage and edit posts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Group by</span>
            <Select
              value={postGrouping}
              onValueChange={(value: "none" | "ad-group") => setPostGrouping(value)}
            >
              <SelectTrigger className="h-9 w-[160px] rounded-xl border-border/40 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="ad-group">Ad Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-6">
          <SocialPostsList
            groupingMode={postGrouping}
            selectedPosts={selectedPosts}
            onSelectPost={handleSelectPost}
            onRequestCreate={() => openCreateComposer()}
            onRequestEdit={openEditComposer}
          />
        </div>
      </section>

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
