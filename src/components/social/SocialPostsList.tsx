import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Calendar,
  Image,
  AlertCircle,
} from "lucide-react";
import { useSocialPosts, type SocialPost } from "@/hooks/useSocialPosts";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";

type GroupingMode = "none" | "ad-group";

interface SocialPostsListProps {
  groupingMode?: GroupingMode;
  selectedPosts: string[];
  onSelectPost: (id: string) => void;
  onRequestCreate: () => void;
  onRequestEdit: (post: SocialPost) => void;
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case "active":
      return <Badge className="bg-success text-success-foreground">กำลังทำงาน</Badge>;
    case "paused":
      return <Badge variant="outline">หยุดชั่วคราว</Badge>;
    case "published":
      return <Badge className="bg-success text-success-foreground">เผยแพร่แล้ว</Badge>;
    case "scheduled":
      return <Badge className="bg-info text-info-foreground">กำหนดเวลา</Badge>;
    case "draft":
      return <Badge variant="secondary">แบบร่าง</Badge>;
    case "archived":
      return <Badge variant="outline">เก็บถาวร</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatNumber(num: number | null) {
  if (num === null) return "-";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

export function SocialPostsList({
  groupingMode = "none",
  selectedPosts,
  onSelectPost,
  onRequestCreate,
  onRequestEdit,
}: SocialPostsListProps) {
  const { dateRange, activePlatforms } = useSocialFilters();
  const { posts, isLoading, deletePost } = useSocialPosts(dateRange);
  const { platforms } = usePlatformConnections();

  const getPlatformInfo = (post: SocialPost) => {
    const resolvedPlatform = platforms.find(
      (platform) =>
        platform.id === post.platform_id ||
        platform.slug === post.platform_id ||
        platform.slug === post.post_channel
    );

    if (resolvedPlatform) {
      return resolvedPlatform;
    }

    const fallbackId = post.platform_id ?? post.post_channel ?? "";
    const fallbackName = fallbackId
      ? fallbackId.charAt(0).toUpperCase() + fallbackId.slice(1)
      : "Unknown";

    return {
      name: fallbackName,
      emoji: "📱",
      id: fallbackId,
      slug: fallbackId,
      icon: null,
      status: "disconnected" as const,
    };
  };

  const matchesActivePlatforms = (post: SocialPost) => {
    if (activePlatforms.length === 0) {
      return true;
    }

    const platform = getPlatformInfo(post);
    const candidateKeys = [
      post.platform_id,
      post.post_channel,
      platform.id,
      platform.slug,
    ].filter((value): value is string => Boolean(value));

    return candidateKeys.some((key) => activePlatforms.includes(key));
  };

  const visiblePosts = posts
    .filter((post) => post.post_type !== "chat")
    .filter(matchesActivePlatforms);
  const groupedVisiblePosts = visiblePosts.reduce<Record<string, SocialPost[]>>((groups, post) => {
    const groupLabel = groupingMode === "ad-group"
      ? post.ad_group_name ?? "Unassigned Ad Group"
      : "All Posts";
    groups[groupLabel] = [...(groups[groupLabel] ?? []), post];
    return groups;
  }, {});
  const hasFilteredOutPosts = posts.length > 0 && visiblePosts.length === 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <Skeleton className="h-40 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (visiblePosts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={onRequestCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            สร้างโพสต์
          </Button>
        </div>
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">
              {hasFilteredOutPosts ? "ไม่พบโพสต์ตามตัวกรอง" : "ยังไม่มีโพสต์"}
            </p>
            <p className="text-sm">
              {hasFilteredOutPosts
                ? "ลองเปลี่ยนแพลตฟอร์มหรือช่วงวันที่เพื่อดูโพสต์ที่ซิงค์แล้ว"
                : "สร้างโพสต์แรกของคุณเพื่อเริ่มต้น"}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {visiblePosts.length} โพสต์ | เลือกแล้ว {selectedPosts.length} รายการ
        </p>
        <Button onClick={onRequestCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          สร้างโพสต์
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedVisiblePosts).map(([groupLabel, groupedPosts]) => (
          <div key={groupLabel} className="space-y-3">
            {groupingMode === "ad-group" && (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">{groupLabel}</h4>
                  <p className="text-xs text-muted-foreground">
                    {groupedPosts.length} โพสต์
                  </p>
                </div>
                <Badge variant="secondary">{groupedPosts.length}</Badge>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groupedPosts.map((post) => {
                const platform = getPlatformInfo(post);
                return (
                  <Card key={post.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={post.media_urls?.[0] ?? "/placeholder.svg"}
                        alt={post.display_title}
                        className="h-40 w-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedPosts.includes(post.id)}
                          onCheckedChange={() => onSelectPost(post.id)}
                          disabled={
                            !selectedPosts.includes(post.id) && selectedPosts.length >= 5
                          }
                          className="bg-background"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        {getStatusBadge(post.status)}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="outline" className="bg-background/80 gap-1">
                          <span>{platform.emoji}</span>
                          {platform.name}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs capitalize">
                            <Image className="h-3 w-3 mr-1" />
                            {post.post_type}
                          </Badge>
                          {post.ad_group_name && (
                            <Badge variant="secondary" className="text-xs">
                              {post.ad_group_name}
                            </Badge>
                          )}
                          {(post.published_at ?? post.created_at) && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.published_at ?? post.created_at ?? "").toLocaleDateString("th-TH", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onRequestEdit(post)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deletePost.mutate(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              ลบ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm line-clamp-2 mb-3">{post.content ?? post.display_title}</p>

                      {post.status === "published" && (
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <Eye className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                            <p className="font-medium">{formatNumber(post.impressions)}</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <Heart className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                            <p className="font-medium">{formatNumber(post.likes)}</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <MessageCircle className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                            <p className="font-medium">{formatNumber(post.comments)}</p>
                          </div>
                          <div className="text-center p-2 bg-muted/50 rounded">
                            <TrendingUp className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                            <p className="font-medium">
                              {post.engagement_rate
                                ? Number(post.engagement_rate).toFixed(1)
                                : "-"}
                              %
                            </p>
                          </div>
                        </div>
                      )}

                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {post.hashtags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs text-primary">
                              #{tag}
                            </span>
                          ))}
                          {post.hashtags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{post.hashtags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
