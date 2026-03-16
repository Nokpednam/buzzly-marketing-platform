import React, { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Layers,
  AlertCircle,
  Leaf,
  Megaphone,
  CalendarDays,
  FileText,
  ChevronRight,
  ChevronLeft,
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { PlatformFilterBar } from "@/components/social/layout/PlatformFilterBar";
import { DateRangeSelector } from "@/components/social/layout/DateRangeSelector";
import { AdInsightsSummary } from "@/components/social/analytics/AdInsightsSummary";
import { AdGroupsList } from "@/components/social/analytics/AdGroupsList";
import { AdGroupFormDialog } from "@/components/social/analytics/AdGroupFormDialog";
import { PostDetailsDialog } from "@/components/social/analytics/PostDetailsDialog";
import { useSocialAnalyticsSummary } from "@/hooks/useSocialAnalyticsSummary";
import { useAdGroups } from "@/hooks/useAdGroups";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useSocialFilters, type AnalyticsCategory } from "@/contexts/SocialFiltersContext";

interface AdGroupScopedProps {
  adGroupId?: string;
}

function ContentChannelBadge({ postChannel }: { postChannel: "social" | "ad" }) {
  if (postChannel === "social") {
    return (
      <Badge className="gap-1 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:bg-emerald-400/15 dark:text-emerald-400 border-0">
        <Leaf className="h-3 w-3" strokeWidth={1.5} />
        Organic
      </Badge>
    );
  }

  return (
    <Badge className="gap-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/10 dark:bg-blue-400/15 dark:text-blue-400 border-0">
      <Megaphone className="h-3 w-3" strokeWidth={1.5} />
      Paid Ad
    </Badge>
  );
}

function PlatformBreakdownTable({ adGroupId }: AdGroupScopedProps) {
  const { platformBreakdown, isLoading, error } = useSocialAnalyticsSummary(adGroupId);

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toLocaleString();
  };

  const formatCurrency = (n: number) =>
    "฿" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Unable to load Platform Breakdown data</p>
        </div>
      </Card>
    );
  }

  if (platformBreakdown.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Layers className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No Platform Breakdown data</p>
          <p className="text-sm">Connect platforms to view comparison data</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-[rgba(0,0,0,0.05)] dark:border-slate-700/40 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-medium uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-gray-400" />
          Platform Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Platform</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Impressions</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Clicks</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">CTR</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Spend</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Conversions</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Posts</th>
              </tr>
            </thead>
            <tbody>
              {platformBreakdown.map((row) => (
                <tr key={row.platform_id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary opacity-70" />
                      {row.platform_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.impressions)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.clicks)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <Badge variant="secondary" className="font-mono">
                      {row.ctr.toFixed(2)}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(row.spend)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(row.conversions)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.post_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

const POSTS_PAGE_SIZE = 8;

function UnifiedPostsList({
  adGroupId,
  searchQuery,
}: AdGroupScopedProps & { searchQuery: string }) {
  const { dateRange } = useSocialFilters();
  const { getPlatformById } = usePlatformConnections();
  const { posts, isLoading, error } = useSocialPosts({
    adGroupId,
    dateRange,
    postChannels: ["social", "ad"],
    includeOrganicWhenFilteringAdGroup: true,
  });
  const [selectedPost, setSelectedPost] = useState<(typeof posts)[number] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const basePosts = useMemo(
    () =>
      posts.filter((post) => {
        if (post.post_type === "chat") return false;
        return post.post_channel === "social" || post.post_channel === "ad";
      }),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return basePosts;
    const q = searchQuery.trim().toLowerCase();
    return basePosts.filter(
      (post) =>
        (post.display_title ?? "").toLowerCase().includes(q) ||
        (post.content ?? "").toLowerCase().includes(q)
    );
  }, [basePosts, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = useMemo(
    () =>
      filteredPosts.slice(
        (safePage - 1) * POSTS_PAGE_SIZE,
        safePage * POSTS_PAGE_SIZE
      ),
    [filteredPosts, safePage]
  );

  const visiblePosts = paginatedPosts;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "published": return "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400";
      case "scheduled": return "bg-blue-500/10 text-blue-700 dark:bg-blue-400/15 dark:text-blue-400";
      case "active": return "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400";
      case "draft": return "bg-slate-500/10 text-slate-600 dark:bg-slate-400/15 dark:text-slate-400";
      default: return "bg-muted/50 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Unable to load posts</p>
        </div>
      </Card>
    );
  }

  if (basePosts.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No posts in this period</p>
          <p className="text-sm">No posts found for the selected date range or Ad Group</p>
        </div>
      </Card>
    );
  }

  if (filteredPosts.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Search className="h-10 w-10 mx-auto mb-3 opacity-40" strokeWidth={1.5} />
          <p className="font-medium">No matching posts</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.05)] dark:border-slate-700/40 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
                Posts
                <Badge variant="secondary" className="ml-1 font-normal">
                  {filteredPosts.length}
                </Badge>
              </CardTitle>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Organic and Paid combined
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Post</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Platform</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Ad Group</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Engagement</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {visiblePosts.map((post) => {
                  const platform = post.platform_id ? getPlatformById(post.platform_id) : undefined;
                  const PlatformIcon = platform?.icon;

                  return (
                    <tr
                      key={post.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPost(post)}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedPost(post)}
                      className="group/row border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                          <div className="min-w-0">
                            <span className="font-medium line-clamp-1">
                              {post.display_title}
                            </span>
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {post.post_type ?? "post"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {PlatformIcon ? <PlatformIcon className="h-3.5 w-3.5" /> : null}
                          <span>{platform?.name ?? "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ContentChannelBadge postChannel={post.post_channel as "social" | "ad"} />
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground/75">
                        {post.ad_group_name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status ?? "draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                          {formatDate(post.published_at ?? post.scheduled_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 text-xs tabular-nums">
                          <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400" title="Likes">
                            <Heart className="h-3 w-3" strokeWidth={1.5} />
                            {(post.likes ?? 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-0.5 text-sky-600 dark:text-sky-400" title="Comments">
                            <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                            {(post.comments ?? 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400" title="Shares">
                            <Share2 className="h-3 w-3" strokeWidth={1.5} />
                            {(post.shares ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right group/row">
                        <div
                          className="flex items-center justify-end h-8 w-8 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedPost(post)}
                            aria-label="View details"
                          >
                            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/30">
              <span className="text-muted-foreground">
                Showing {visiblePosts.length} of {filteredPosts.length} posts
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-transparent hover:border hover:border-slate-200 dark:hover:border-slate-600"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                </Button>
                <span className="min-w-[80px] text-center text-xs text-muted-foreground">
                  Page {safePage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-transparent hover:border hover:border-slate-200 dark:hover:border-slate-600"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PostDetailsDialog
        open={Boolean(selectedPost)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPost(null);
          }
        }}
        post={selectedPost}
      />
    </>
  );
}

export default function SocialAnalyticsView() {
  const { adGroupId: selectedAdGroupId, setAdGroupId: setSelectedAdGroupId, category, setCategory } = useSocialFilters();
  const [adsTab, setAdsTab] = useState<"posts" | "ad-groups">("posts");
  const [adGroupDialogOpen, setAdGroupDialogOpen] = useState(false);
  const [postsSearchQuery, setPostsSearchQuery] = useState("");
  const { adGroups } = useAdGroups();
  const activeAdGroupId = selectedAdGroupId === "all" ? undefined : selectedAdGroupId;

  // Auto-switch the content tab when category changes so the relevant view is visible
  const handleCategoryChange = (next: AnalyticsCategory) => {
    setCategory(next);
    setAdsTab("posts");
  };

  return (
    <div className="space-y-8 pb-6 bg-[#FDFDFD] dark:bg-slate-950 py-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-xl">
      {/* No duplicate header — SocialLayout shows title + subtitle per tab */}

      {/* Platform icons + filters — all on one line */}
      <div className="flex flex-wrap items-center gap-3">
        <PlatformFilterBar />
        <div className="h-6 w-px shrink-0 bg-border" aria-hidden />
        <div className="flex flex-wrap items-center gap-2">
          {(
                [
                  { value: "all", label: "All", Icon: Layers },
                  { value: "organic", label: "Organic", Icon: Leaf },
                  { value: "ads", label: "Paid", Icon: Megaphone },
                ] as { value: AnalyticsCategory; label: string; Icon: React.ElementType }[]
              ).map(({ value, label, Icon }) => {
                const isSelected = category === value;
                const selectedStyles =
                  value === "organic"
                    ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 dark:border-emerald-500 dark:bg-emerald-600 dark:text-white"
                    : value === "ads"
                      ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-600 dark:text-white"
                      : "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900";
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleCategoryChange(value)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      isSelected ? selectedStyles : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {label}
                  </button>
                );
          })}
          <Select value={selectedAdGroupId} onValueChange={setSelectedAdGroupId}>
              <SelectTrigger className="h-9 w-[180px] rounded-lg">
                <SelectValue placeholder="All Ad Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ad Groups</SelectItem>
                {adGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
          </Select>
          <DateRangeSelector />
        </div>
      </div>

      <section className="space-y-4">
        <AdInsightsSummary adGroupId={activeAdGroupId} category={category} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Platform Breakdown
        </h2>
        <PlatformBreakdownTable adGroupId={activeAdGroupId} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-widest text-gray-500">
            Post List
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Organic and Paid combined
          </p>
        </div>

        <Card className="overflow-hidden rounded-xl border border-[rgba(0,0,0,0.05)] dark:border-slate-700/40 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4 sm:p-6">
            <Tabs value={adsTab} onValueChange={(v) => setAdsTab(v as typeof adsTab)}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="h-auto justify-start gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                  <TabsTrigger
                    value="posts"
                    className="gap-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700"
                  >
                    <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="ad-groups"
                    className="gap-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700"
                  >
                    <Megaphone className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Ad Groups
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-3">
                  {adsTab === "posts" && (
                    <div className="relative w-[200px] sm:w-[240px]">
                      <Search
                        className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                        strokeWidth={1.5}
                      />
                      <Input
                        placeholder="Search posts..."
                        value={postsSearchQuery}
                        onChange={(e) => setPostsSearchQuery(e.target.value)}
                        className="h-9 pl-8 bg-transparent border-0 border-b border-gray-200 rounded-none focus-visible:ring-0 focus-visible:border-slate-400 dark:border-slate-600 dark:focus-visible:border-slate-500"
                      />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 border-slate-200 dark:border-slate-600"
                    onClick={() => setAdGroupDialogOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Create Ad Group
                  </Button>
                </div>
              </div>
              <TabsContent value="posts" className="mt-6">
                <UnifiedPostsList adGroupId={activeAdGroupId} searchQuery={postsSearchQuery} />
              </TabsContent>
              <TabsContent value="ad-groups" className="mt-6">
                <AdGroupsList />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      <AdGroupFormDialog
        open={adGroupDialogOpen}
        onOpenChange={setAdGroupDialogOpen}
      />
    </div>
  );
}
