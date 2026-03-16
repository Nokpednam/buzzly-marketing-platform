import React, { useState, useMemo } from "react";
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
  Heart,
} from "lucide-react";
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
import { useSocialFilters } from "@/contexts/SocialFiltersContext";

type AnalyticsCategory = "all" | "organic" | "ads";

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
    <Card className="overflow-hidden rounded-2xl border-slate-200/60 shadow-sm dark:border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-600 dark:text-slate-400" />
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

interface OverviewBarProps extends AdGroupScopedProps {
  category: AnalyticsCategory;
}

function AnalyticsOverviewBar({ adGroupId, category }: OverviewBarProps) {
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

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toLocaleString();
  };

  if (category === "organic") {
    const pills = [
      { label: `${overview.organicPostCount} Organic`, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", Icon: Leaf },
      { label: `${formatNumber(overview.totalEngagement)} Engagement`, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", Icon: Heart },
      { label: `Eng. ${overview.avgEngagementRate.toFixed(2)}%`, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", Icon: TrendingUp },
    ];
    return (
      <div className="flex flex-wrap items-center gap-2">
        {pills.map(({ label, color, Icon }) => (
          <span key={label} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${color}`}>
            <Icon className="h-3 w-3" />
            {label}
          </span>
        ))}
      </div>
    );
  }

  if (category === "ads") {
    const pills = [
      { label: `${overview.paidPostCount} Paid`, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", Icon: Megaphone },
      { label: `ROAS ${overview.avgRoas.toFixed(2)}x`, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", Icon: TrendingUp },
      { label: `CTR ${overview.avgCtr.toFixed(2)}%`, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", Icon: BarChart3 },
    ];
    return (
      <div className="flex flex-wrap items-center gap-2">
        {pills.map(({ label, color, Icon }) => (
          <span key={label} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${color}`}>
            <Icon className="h-3 w-3" />
            {label}
          </span>
        ))}
      </div>
    );
  }

  const pills = [
    { label: `${overview.totalPostCount} ทั้งหมด`, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", Icon: TrendingUp },
    { label: `${overview.organicPostCount} Organic`, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", Icon: Leaf },
    { label: `${overview.paidPostCount} Paid`, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", Icon: Megaphone },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pills.map(({ label, color, Icon }) => (
        <span key={label} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${color}`}>
          <Icon className="h-3 w-3" />
          {label}
        </span>
      ))}
    </div>
  );
}

function UnifiedPostsList({ adGroupId }: AdGroupScopedProps) {
  const { dateRange } = useSocialFilters();
  const { getPlatformById } = usePlatformConnections();
  const { posts, isLoading, error } = useSocialPosts({
    adGroupId,
    dateRange,
    postChannels: ["social", "ad"],
    includeOrganicWhenFilteringAdGroup: true,
  });
  const [selectedPost, setSelectedPost] = useState<(typeof posts)[number] | null>(null);
  const visiblePosts = useMemo(
    () =>
      posts.filter((post) => {
        if (post.post_type === "chat") return false;
        return post.post_channel === "social" || post.post_channel === "ad";
      }),
    [posts]
  );

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
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">ไม่มี Post ในช่วงนี้</p>
          <p className="text-sm">ไม่พบรายการจาก `social_posts` สำหรับช่วงวันที่หรือ Ad Group ที่เลือก</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden rounded-2xl border-slate-200/60 shadow-sm dark:border-slate-700/50">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                Posts
                <Badge variant="secondary" className="ml-1 font-normal">
                  {visiblePosts.length}
                </Badge>
              </CardTitle>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Organic และ Paid รวมกัน
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">โพสต์</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Platform</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">ประเภท</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">สถานะ</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">วันที่</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Engagement</th>
                  <th className="w-[100px] px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {visiblePosts.map((post) => {
                  const platform = post.platform_id ? getPlatformById(post.platform_id) : undefined;
                  const PlatformIcon = platform?.icon;

                  return (
                    <tr key={post.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors dark:border-slate-800 dark:hover:bg-slate-800/50">
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
                        <ContentChannelBadge postChannel={post.post_channel as "social" | "ad"} />
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
                          รายละเอียด
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
  const [category, setCategory] = useState<AnalyticsCategory>("all");
  const [adsTab, setAdsTab] = useState<"posts" | "ad-groups">("posts");
  const [selectedAdGroupId, setSelectedAdGroupId] = useState<string>("all");
  const [adGroupDialogOpen, setAdGroupDialogOpen] = useState(false);
  const { adGroups } = useAdGroups();
  const activeAdGroupId = selectedAdGroupId === "all" ? undefined : selectedAdGroupId;

  // Auto-switch the content tab when category changes so the relevant view is visible
  const handleCategoryChange = (next: AnalyticsCategory) => {
    setCategory(next);
    setAdsTab("posts");
  };

  return (
    <div className="space-y-8 pb-6">
      {/* Header & filters */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/50 dark:bg-slate-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Social Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ดูผลลัพธ์ Organic และ Paid ในที่เดียว
            </p>
          </div>
          <AnalyticsOverviewBar adGroupId={activeAdGroupId} category={category} />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_320px]">
          <PlatformFilterBar />
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-800/30">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">ประเภท</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                กรอง Organic / Paid / ทั้งหมด
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "all", label: "ทั้งหมด", Icon: Layers },
                  { value: "organic", label: "Organic", Icon: Leaf },
                  { value: "ads", label: "Paid", Icon: Megaphone },
                ] as { value: AnalyticsCategory; label: string; Icon: React.ElementType }[]
              ).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCategoryChange(value)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                    category === value
                      ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Ad Group
              </p>
              <Select value={selectedAdGroupId} onValueChange={setSelectedAdGroupId}>
                <SelectTrigger className="h-10 w-full rounded-lg">
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
            </div>

            <DateRangeSelector />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Performance
        </h2>
        <AdInsightsSummary adGroupId={activeAdGroupId} category={category} />
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Platform Breakdown
        </h2>
        <PlatformBreakdownTable adGroupId={activeAdGroupId} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              รายการโพสต์
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Organic และ Paid รวมกัน
            </p>
          </div>
          <Button
            onClick={() => setAdGroupDialogOpen(true)}
            className="h-10 gap-2 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            สร้าง Ad Group
          </Button>
        </div>

        <Card className="overflow-hidden rounded-2xl border-slate-200/60 shadow-sm dark:border-slate-700/50">
          <CardContent className="p-4 sm:p-6">
            <Tabs value={adsTab} onValueChange={(v) => setAdsTab(v as typeof adsTab)}>
              <TabsList className="h-auto w-full justify-start gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                <TabsTrigger
                  value="posts"
                  className="gap-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="ad-groups"
                  className="gap-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-700"
                >
                  <Megaphone className="h-3.5 w-3.5" />
                  Ad Groups
                </TabsTrigger>
              </TabsList>
              <TabsContent value="posts" className="mt-6">
                <UnifiedPostsList adGroupId={activeAdGroupId} />
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
