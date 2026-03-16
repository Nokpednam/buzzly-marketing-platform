import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  Percent,
  Coins,
  BarChart3,
  AlertCircle,
  Heart,
  MessageCircle,
  Share2,
  Leaf,
  Megaphone,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdInsights } from "@/hooks/useAdInsights";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";
import { useWorkspace } from "@/hooks/useWorkspace";

interface AdInsightsSummaryProps {
  adGroupId?: string;
  category?: "all" | "organic" | "ads";
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatCurrency = (num: number) =>
  `฿${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function AdInsightsSummary({
  adGroupId,
  category = "all",
}: AdInsightsSummaryProps) {
  const { dateRange, activePlatforms } = useSocialFilters();
  const { workspace } = useWorkspace();

  const [showOrganic, setShowOrganic] = useState(category !== "ads");
  const [showPaid, setShowPaid] = useState(category !== "organic");

  useEffect(() => {
    setShowOrganic(category !== "ads");
    setShowPaid(category !== "organic");
  }, [category]);

  const {
    summary,
    isLoading: paidLoading,
    error: paidError,
  } = useAdInsights(dateRange, activePlatforms, workspace?.id, adGroupId);

  const {
    posts,
    isLoading: postsLoading,
    error: postsError,
  } = useSocialPosts({
    adGroupId,
    dateRange,
    postChannels: ["social"],
  });

  const matchesActivePlatforms = (platformId: string | null) => {
    if (activePlatforms.length === 0) return true;
    if (!platformId) return true;
    return activePlatforms.includes(platformId);
  };

  const organicPosts = useMemo(
    () =>
      posts.filter(
        (post) => post.post_type !== "chat" && matchesActivePlatforms(post.platform_id)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [posts, activePlatforms]
  );

  const organicSummary = useMemo(() => {
    const totalLikes = organicPosts.reduce((sum, post) => sum + (post.likes ?? 0), 0);
    const totalComments = organicPosts.reduce((sum, post) => sum + (post.comments ?? 0), 0);
    const totalShares = organicPosts.reduce((sum, post) => sum + (post.shares ?? 0), 0);
    const totalReach = organicPosts.reduce((sum, post) => sum + (post.reach ?? 0), 0);
    const totalEngagement = totalLikes + totalComments + totalShares;
    const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

    const byDate = new Map<string, { rawDate: string; engagement: number }>();
    for (const post of organicPosts) {
      const rawDate = (post.published_at ?? post.scheduled_at ?? post.created_at)?.slice(0, 10);
      if (!rawDate) continue;
      const entry = byDate.get(rawDate) ?? { rawDate, engagement: 0 };
      entry.engagement += (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0);
      byDate.set(rawDate, entry);
    }

    return {
      totalPosts: organicPosts.length,
      totalLikes,
      totalComments,
      totalShares,
      totalReach,
      totalEngagement,
      avgEngagementRate,
      dailyData: Array.from(byDate.values()).sort((a, b) => a.rawDate.localeCompare(b.rawDate)),
    };
  }, [organicPosts]);

  const paidDailyData = useMemo(() => {
    const byDate = new Map<string, { rawDate: string; impressions: number; clicks: number }>();
    for (const row of summary.dailyData) {
      const entry = byDate.get(row.date) ?? { rawDate: row.date, impressions: 0, clicks: 0 };
      entry.impressions += row.impressions;
      entry.clicks += row.clicks;
      byDate.set(row.date, entry);
    }
    return Array.from(byDate.values()).sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  }, [summary.dailyData]);

  const organicChartData = useMemo(
    () =>
      organicSummary.dailyData.map((d) => ({
        ...d,
        date: new Date(d.rawDate).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
      })),
    [organicSummary.dailyData]
  );

  const paidChartData = useMemo(
    () =>
      paidDailyData.map((d) => ({
        ...d,
        date: new Date(d.rawDate).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
      })),
    [paidDailyData]
  );

  if (paidLoading || postsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (paidError || postsError) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </div>
      </Card>
    );
  }

  const organicStats = [
    { label: "Posts", value: formatNumber(organicSummary.totalPosts), icon: Leaf, color: "text-emerald-500" },
    { label: "Engagement", value: formatNumber(organicSummary.totalEngagement), icon: TrendingUp, color: "text-violet-500" },
    { label: "Likes", value: formatNumber(organicSummary.totalLikes), icon: Heart, color: "text-pink-500" },
    { label: "Comments", value: formatNumber(organicSummary.totalComments), icon: MessageCircle, color: "text-blue-500" },
    { label: "Shares", value: formatNumber(organicSummary.totalShares), icon: Share2, color: "text-orange-500" },
    { label: "Reach", value: formatNumber(organicSummary.totalReach), icon: Users, color: "text-purple-500" },
    { label: "Eng. Rate", value: `${organicSummary.avgEngagementRate.toFixed(2)}%`, icon: Percent, color: "text-cyan-500" },
  ];

  const paidStats = [
    { label: "Impressions", value: formatNumber(summary.totalImpressions), icon: Eye, color: "text-blue-500" },
    { label: "Reach", value: formatNumber(summary.totalReach), icon: Users, color: "text-purple-500" },
    { label: "Clicks", value: formatNumber(summary.totalClicks), icon: MousePointer, color: "text-green-500" },
    { label: "CTR", value: `${summary.avgCtr.toFixed(2)}%`, icon: Percent, color: "text-cyan-500" },
    { label: "Spend", value: formatCurrency(summary.totalSpend), icon: DollarSign, color: "text-red-500" },
    { label: "CPC", value: formatCurrency(summary.avgCpc), icon: Coins, color: "text-orange-500" },
    { label: "Conversions", value: formatNumber(summary.totalConversions), icon: Target, color: "text-emerald-500" },
    { label: "ROAS", value: `${summary.avgRoas.toFixed(2)}x`, icon: TrendingUp, color: "text-primary" },
  ];

  const hasOrganicData = organicChartData.length > 0;
  const hasPaidData = paidChartData.length > 0;

  return (
    <div className="space-y-4">
      {/* Toggle buttons */}
      <div className="flex items-center gap-2">
        {category !== "ads" && (
          <Button
            variant={showOrganic ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOrganic((prev) => !prev)}
            className={
              showOrganic
                ? "gap-1.5 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white"
                : "gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
            }
          >
            <Leaf className="h-3.5 w-3.5" />
            Organic
          </Button>
        )}
        {category !== "organic" && (
          <Button
            variant={showPaid ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPaid((prev) => !prev)}
            className={
              showPaid
                ? "gap-1.5 bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
                : "gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30"
            }
          >
            <Megaphone className="h-3.5 w-3.5" />
            Paid Ads
          </Button>
        )}
      </div>

      {/* Stats cards */}
      {(showOrganic || showPaid) && (
        <div className="space-y-4">
          {showOrganic && (
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                <Leaf className="h-3 w-3" />
                Organic
              </p>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
                {organicStats.map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <Card key={stat.label} className="rounded-xl border-slate-200/60 dark:border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <StatIcon className={`h-4 w-4 ${stat.color}`} />
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                        <p className="text-xl font-bold">{stat.value}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {showPaid && (
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <Megaphone className="h-3 w-3" />
                Paid Ads
              </p>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
                {paidStats.map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <Card key={stat.label} className="rounded-xl border-slate-200/60 dark:border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <StatIcon className={`h-4 w-4 ${stat.color}`} />
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                        <p className="text-xl font-bold">{stat.value}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts — separate per type to avoid scale mismatch and cut-off */}
      {(showOrganic || showPaid) && (
        <div className="space-y-6">
          {showOrganic && (
            <Card className="rounded-2xl border-slate-200/60 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  Engagement ตามเวลา (Organic)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasOrganicData ? (
                  <div className="flex h-[220px] flex-col items-center justify-center text-center text-muted-foreground">
                    <BarChart3 className="mb-3 h-10 w-10 opacity-40" />
                    <p className="text-sm">ยังไม่มี Organic engagement ในช่วงนี้</p>
                  </div>
                ) : (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={organicChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v: number) => formatNumber(v)} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="engagement"
                          name="Engagement"
                          stroke="hsl(var(--chart-2))"
                          fill="hsl(var(--chart-2) / 0.2)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {showPaid && (
            <Card className="rounded-2xl border-slate-200/60 dark:border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-blue-600" />
                  Clicks & Impressions ตามเวลา (Paid)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasPaidData ? (
                  <div className="flex h-[220px] flex-col items-center justify-center text-center text-muted-foreground">
                    <BarChart3 className="mb-3 h-10 w-10 opacity-40" />
                    <p className="text-sm">ยังไม่มี Paid metrics ในช่วงนี้</p>
                  </div>
                ) : (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={paidChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v: number) => formatNumber(v)} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="impressions"
                          name="Impressions"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary) / 0.18)"
                        />
                        <Area
                          type="monotone"
                          dataKey="clicks"
                          name="Clicks"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1) / 0.18)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!showOrganic && !showPaid && (
        <Card className="rounded-2xl border-dashed border-slate-200 dark:border-slate-700">
          <CardContent className="flex h-[220px] flex-col items-center justify-center text-center text-muted-foreground">
            <BarChart3 className="mb-3 h-10 w-10 opacity-40" />
            <p className="font-medium">ยังไม่มีข้อมูลในช่วงนี้</p>
            <p className="text-sm">กด Organic หรือ Paid Ads เพื่อดูกราฟ</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
