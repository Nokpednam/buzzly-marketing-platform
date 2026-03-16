import { useState } from "react";
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
  TrendingUp,
  Layers,
  BarChart3,
  AlertCircle,
  Leaf,
  Megaphone,
  CalendarDays,
  FileText,
  Eye,
  Plus,
} from "lucide-react";
import { PlatformFilterBar } from "@/components/social/layout/PlatformFilterBar";
import { DateRangeSelector } from "@/components/social/layout/DateRangeSelector";
import { AdInsightsSummary } from "@/components/social/analytics/AdInsightsSummary";
import { AdsList } from "@/components/social/analytics/AdsList";
import { AdGroupsList } from "@/components/social/analytics/AdGroupsList";
import { AdGroupFormDialog } from "@/components/social/analytics/AdGroupFormDialog";
import { PostDetailsDialog } from "@/components/social/analytics/PostDetailsDialog";
import { useSocialAnalyticsSummary } from "@/hooks/useSocialAnalyticsSummary";
import { useAdGroups } from "@/hooks/useAdGroups";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";

interface AdGroupScopedProps {
  adGroupId?: string;
}

function ContentChannelBadge({ postChannel }: { postChannel: "social" | "ad" }) {
  if (postChannel === "social") {
    return (
      <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
        <Leaf className="h-3 w-3" />
        Organic
      </Badge>
    );
  }

  return (
    <Badge className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
      <Megaphone className="h-3 w-3" />
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
          <p className="text-sm">ไม่สามารถโหลดข้อมูล Platform Breakdown</p>
        </div>
      </Card>
    );
  }

  if (platformBreakdown.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Layers className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">ไม่มีข้อมูล Platform Breakdown</p>
          <p className="text-sm">เชื่อมต่อ platform เพื่อดูข้อมูลเปรียบเทียบ</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Platform Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Platform</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Impressions</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Clicks</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">CTR</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Spend</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Conversions</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Posts</th>
              </tr>
            </thead>
            <tbody>
              {platformBreakdown.map((row) => (
                <tr key={row.platform_id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
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
                      {row.engagement_rate.toFixed(2)}%
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

function AnalyticsOverviewBar({ adGroupId }: AdGroupScopedProps) {
  const { overview, isLoading } = useSocialAnalyticsSummary(adGroupId);

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-6 w-28 rounded-full" />
        ))}
      </div>
    );
  }

  const pills = [
    { label: `${overview.totalPostCount} Posts`, color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
    {
      label: `ROAS ${overview.avgRoas.toFixed(2)}x`,
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: `Avg CTR ${overview.avgCtr.toFixed(2)}%`,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pills.map((pill) => (
        <span key={pill.label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${pill.color}`}>
          <TrendingUp className="h-3 w-3" />
          {pill.label}
        </span>
      ))}
    </div>
  );
}

function OrganicPostsList({ adGroupId }: AdGroupScopedProps) {
  const { dateRange } = useSocialFilters();
  const { getPlatformById } = usePlatformConnections();
  const { posts, isLoading, error } = useSocialPosts({
    adGroupId,
    dateRange,
    postChannel: "social",
  });
  const [selectedPost, setSelectedPost] = useState<(typeof posts)[number] | null>(null);
  const visiblePosts = posts.filter((post) => post.post_type !== "chat");

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "published": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "scheduled": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "draft": return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
      default: return "bg-muted text-muted-foreground";
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
          <p className="text-sm">ไม่สามารถโหลด Organic Posts</p>
        </div>
      </Card>
    );
  }

  if (visiblePosts.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Leaf className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">ไม่มี Organic Post ในช่วงนี้</p>
          <p className="text-sm">ไม่พบโพสต์ Organic สำหรับช่วงวันที่หรือ Ad Group ที่เลือก</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-500" />
                Organic Posts
                <Badge variant="secondary" className="ml-1">{visiblePosts.length}</Badge>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Organic content is mapped as first-class social content with `post_channel = "social"`.
              </p>
            </div>
            <Badge className="w-fit gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Leaf className="h-3 w-3" />
              Organic Performance
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Post Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Platform</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Channel</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Scheduled / Published</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Engagement</th>
                  <th className="w-[120px] px-4 py-3 text-right font-medium text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {visiblePosts.map((post) => {
                  const platform = post.platform_id ? getPlatformById(post.platform_id) : undefined;
                  const PlatformIcon = platform?.icon;

                  return (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
                        <ContentChannelBadge postChannel="social" />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status ?? "draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 shrink-0" />
                          {formatDate(post.published_at ?? post.scheduled_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5 text-xs">
                          <Badge variant="outline">Likes {(post.likes ?? 0).toLocaleString()}</Badge>
                          <Badge variant="outline">Comments {(post.comments ?? 0).toLocaleString()}</Badge>
                          <Badge variant="outline">Shares {(post.shares ?? 0).toLocaleString()}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => setSelectedPost(post)}
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
  const [adsTab, setAdsTab] = useState<"ad-groups" | "ads" | "organic">("ad-groups");
  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string>("all");
  const [adGroupDialogOpen, setAdGroupDialogOpen] = useState(false);
  const { adGroups } = useAdGroups();
  const activeAdGroupId = selectedAdGroupId === "all" ? undefined : selectedAdGroupId;

  return (
    <div className="space-y-8 pb-6">
      <Card className="border-border/60 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-semibold tracking-tight">Social Analytics</h1>
              </div>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Unified analytics for organic social posts and paid ads, with manual ad-group management and platform-level performance views.
              </p>
            </div>
            <AnalyticsOverviewBar adGroupId={activeAdGroupId} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <PlatformFilterBar />
            <Card className="border-border/60">
              <CardContent className="space-y-3 p-4">
                <div>
                  <p className="text-sm font-medium">Ad Group Filter</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    กรองทั้ง organic และ paid analytics ตามกลุ่มโฆษณาที่ต้องการตรวจสอบ
                  </p>
                </div>
                <Select value={selectedAdGroupId} onValueChange={setSelectedAdGroupId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="ทุกกลุ่มโฆษณา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกกลุ่มโฆษณา</SelectItem>
                    {adGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="pt-1">
                  <DateRangeSelector />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Paid Performance
          </h2>
        </div>
        <AdInsightsSummary adGroupId={activeAdGroupId} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Platform Breakdown
          </h2>
        </div>
        <PlatformBreakdownTable adGroupId={activeAdGroupId} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Content Entities
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Organic posts stay distinct in green while paid entities remain blue throughout the analytics workspace.
            </p>
          </div>
          <Button onClick={() => setAdGroupDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Ad Group
          </Button>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <Tabs value={adsTab} onValueChange={(v) => setAdsTab(v as typeof adsTab)}>
              <TabsList className="h-auto w-full justify-start gap-2 rounded-xl border border-border/60 bg-muted/30 p-1">
                <TabsTrigger value="organic" className="gap-1.5">
                  <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                  Organic
                </TabsTrigger>
                <TabsTrigger value="ad-groups" className="gap-1.5">
                  <Megaphone className="h-3.5 w-3.5 text-blue-500" />
                  Ad Groups
                </TabsTrigger>
                <TabsTrigger value="ads" className="gap-1.5">
                  <Megaphone className="h-3.5 w-3.5 text-blue-400" />
                  Paid Ads
                </TabsTrigger>
              </TabsList>
              <TabsContent value="organic" className="mt-6">
                <OrganicPostsList adGroupId={activeAdGroupId} />
              </TabsContent>
              <TabsContent value="ad-groups" className="mt-6">
                <AdGroupsList />
              </TabsContent>
              <TabsContent value="ads" className="mt-6">
                <AdsList
                  adGroups={adGroups.map((g) => ({ id: g.id, name: g.name }))}
                  filterAdGroupId={activeAdGroupId}
                />
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
