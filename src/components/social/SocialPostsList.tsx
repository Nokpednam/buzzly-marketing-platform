import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
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
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  const base = "rounded-lg text-[11px] font-medium border-0";
  switch (status) {
    case "active":
      return <Badge className={cn(base, "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400")}>Active</Badge>;
    case "paused":
      return <Badge variant="outline" className={base}>Paused</Badge>;
    case "published":
      return <Badge className={cn(base, "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400")}>Published</Badge>;
    case "scheduled":
      return <Badge className={cn(base, "bg-primary/10 text-primary")}>Scheduled</Badge>;
    case "draft":
      return <Badge variant="secondary" className={base}>Draft</Badge>;
    case "archived":
      return <Badge variant="outline" className={base}>Archived</Badge>;
    default:
      return <Badge variant="outline" className={base}>{status}</Badge>;
  }
}

function formatNumber(num: number | null) {
  if (num === null) return "-";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

const POSTS_PER_PAGE = 8;

function matchesSearch(post: SocialPost, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const content = (post.content ?? "").toLowerCase();
  const title = (post.display_title ?? post.name ?? "").toLowerCase();
  const hashtags = (post.hashtags ?? []).join(" ").toLowerCase();
  return content.includes(q) || title.includes(q) || hashtags.includes(q);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
  const searchedPosts = visiblePosts.filter((post) => matchesSearch(post, searchQuery));
  const totalPages = Math.max(1, Math.ceil(searchedPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (totalPages >= 1 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  const paginatedPosts = searchedPosts.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE
  );
  const groupedVisiblePosts = paginatedPosts.reduce<Record<string, SocialPost[]>>((groups, post) => {
    const groupLabel = groupingMode === "ad-group"
      ? post.ad_group_name ?? "Unassigned Ad Group"
      : "All Posts";
    groups[groupLabel] = [...(groups[groupLabel] ?? []), post];
    return groups;
  }, {});
  const hasFilteredOutPosts = posts.length > 0 && visiblePosts.length === 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bento-card overflow-hidden">
            <Skeleton className={cn("w-full", i === 1 ? "h-64 sm:h-80" : "h-44")} />
            <CardContent className="p-5">
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
            Create Post
          </Button>
        </div>
        <Card className="bento-card p-12">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">
              {hasFilteredOutPosts ? "No posts match filters" : "No posts yet"}
            </p>
            <p className="text-sm">
              {hasFilteredOutPosts
                ? "Try changing platform or date range to see synced posts"
                : "Create your first post to get started"}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const hasSearchNoResults = searchQuery.trim() && searchedPosts.length === 0;

  if (hasSearchNoResults) {
    return (
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <Card className="bento-card p-12">
          <div className="text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No posts match your search</p>
            <p className="text-sm">Try different keywords or clear to see all</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
            >
              Clear search
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <p className="text-sm font-medium text-muted-foreground shrink-0">
          {searchedPosts.length} posts · {selectedPosts.length} selected
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedVisiblePosts).map(([groupLabel, groupedPosts]) => (
          <div key={groupLabel} className="space-y-4">
            {groupingMode === "ad-group" && (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{groupLabel}</h4>
                  <p className="text-xs text-muted-foreground">
                    {groupedPosts.length} posts
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-lg font-medium">
                  {groupedPosts.length}
                </Badge>
              </div>
            )}

            {/* Bento grid: first card spans 2 cols (wider), rest standard */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {groupedPosts.map((post, index) => {
                const platform = getPlatformInfo(post);
                const isAd = post.post_channel === "ad";
                const isFeatured = index === 0;
                return (
                  <Card
                    key={post.id}
                    className={cn(
                      "bento-card overflow-hidden transition-all duration-200",
                      isFeatured && "lg:col-span-2"
                    )}
                  >
                    <div className="relative">
                      <img
                        src={post.media_urls?.[0] ?? "/placeholder.svg"}
                        alt={post.display_title}
                        className={cn(
                          "w-full object-cover",
                          isFeatured ? "h-52 sm:h-56" : "h-44"
                        )}
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

                    <CardContent className={cn("p-5", isFeatured && "sm:p-6")}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs text-foreground/75">
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
                              {new Date(post.published_at ?? post.created_at ?? "").toLocaleDateString("en-US", {
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
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deletePost.mutate(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className={cn("text-sm", isFeatured ? "mb-4 line-clamp-3 sm:line-clamp-4" : "mb-4 line-clamp-2")}>
                        {post.content ?? post.display_title}
                      </p>

                      {post.status === "published" && (
                        <div className="grid grid-cols-4 gap-3 py-4 px-1 text-xs">
                          <div className="text-center p-3 bg-muted/40 rounded-xl">
                            <Eye className="h-3.5 w-3.5 mx-auto mb-1.5 text-foreground/65" />
                            <p className="font-medium text-foreground/80">{formatNumber(post.impressions)}</p>
                          </div>
                          <div className="text-center p-3 bg-muted/40 rounded-xl">
                            <Heart className="h-3.5 w-3.5 mx-auto mb-1.5 text-foreground/65" />
                            <p className="font-medium text-foreground/80">{formatNumber(post.likes)}</p>
                          </div>
                          <div className="text-center p-3 bg-muted/40 rounded-xl">
                            <MessageCircle className="h-3.5 w-3.5 mx-auto mb-1.5 text-foreground/65" />
                            <p className="font-medium text-foreground/80">{formatNumber(post.comments)}</p>
                          </div>
                          <div className="text-center p-3 bg-muted/40 rounded-xl">
                            <TrendingUp className="h-3.5 w-3.5 mx-auto mb-1.5 text-foreground/65" />
                            <p className="font-medium text-foreground/80">
                              {post.engagement_rate
                                ? Number(post.engagement_rate).toFixed(1)
                                : "-"}
                              %
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="flex items-center gap-1.5 text-xs text-foreground/75">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              isAd ? "bg-[#06B6D4]" : "bg-emerald-500"
                            )}
                            aria-hidden
                          />
                          <span>{isAd ? "Ad" : "Organic"}</span>
                        </span>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <>
                            {post.hashtags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-xs text-foreground/70">
                                #{tag}
                              </span>
                            ))}
                            {post.hashtags.length > 3 && (
                              <span className="text-xs text-foreground/70">
                                +{post.hashtags.length - 3}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {safePage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
