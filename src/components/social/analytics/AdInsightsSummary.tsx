import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  MousePointer,
  BarChart3,
  AlertCircle,
  Heart,
  MessageCircle,
  Share2,
  Leaf,
  Megaphone,
  Info,
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
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

const cardBase =
  "bg-white dark:bg-slate-900 border border-[rgba(0,0,0,0.05)] dark:border-slate-700/40 rounded-xl transition-colors";

function LabelWithInfo({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <TooltipProvider delayDuration={200}>
        <UITooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
              aria-label="More info"
            >
              <Info className="h-3 w-3" strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[220px] text-xs">
            {tooltip}
          </TooltipContent>
        </UITooltip>
      </TooltipProvider>
    </span>
  );
}

function ProgressDots({ organic, paid }: { organic: number; paid: number }) {
  const total = organic + paid;
  if (total === 0) return null;
  const organicPct = total > 0 ? (organic / total) * 100 : 0;
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="h-1 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
        <div
          className="rounded-l-full bg-emerald-500"
          style={{ width: `${organicPct}%` }}
        />
        <div
          className="rounded-r-full bg-blue-600"
          style={{ width: `${100 - organicPct}%` }}
        />
      </div>
      <span className="text-[10px] tabular-nums">
        <span className="text-emerald-600 dark:text-emerald-400">{formatNumber(organic)}</span>
        <span className="text-gray-400 mx-0.5">/</span>
        <span className="text-blue-600 dark:text-blue-400">{formatNumber(paid)}</span>
      </span>
    </div>
  );
}

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
    [posts, activePlatforms]
  );

  const organicSummary = useMemo(() => {
    const totalLikes = organicPosts.reduce((sum, post) => sum + (post.likes ?? 0), 0);
    const totalComments = organicPosts.reduce((sum, post) => sum + (post.comments ?? 0), 0);
    const totalShares = organicPosts.reduce((sum, post) => sum + (post.shares ?? 0), 0);
    const totalReach = organicPosts.reduce((sum, post) => sum + (post.reach ?? 0), 0);
    const totalEngagement = totalLikes + totalComments + totalShares;
    const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

    const byDate = new Map<string, { rawDate: string; engagement: number; reach: number }>();
    for (const post of organicPosts) {
      const rawDate = (post.published_at ?? post.scheduled_at ?? post.created_at)?.slice(0, 10);
      if (!rawDate) continue;
      const entry = byDate.get(rawDate) ?? { rawDate, engagement: 0, reach: 0 };
      entry.engagement += (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0);
      entry.reach += post.reach ?? 0;
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

  const sparklineData = useMemo(() => {
    const byDate = new Map<string, { rawDate: string; total: number }>();
    for (const d of organicSummary.dailyData) {
      byDate.set(d.rawDate, { rawDate: d.rawDate, total: d.reach });
    }
    for (const d of paidDailyData) {
      const existing = byDate.get(d.rawDate);
      if (existing) {
        existing.total += d.impressions;
      } else {
        byDate.set(d.rawDate, { rawDate: d.rawDate, total: d.impressions });
      }
    }
    return Array.from(byDate.values())
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
      .map((d) => ({
        date: new Date(d.rawDate).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        total: d.total,
      }));
  }, [organicSummary.dailyData, paidDailyData]);

  const organicChartData = useMemo(
    () =>
      organicSummary.dailyData.map((d) => ({
        ...d,
        date: new Date(d.rawDate).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      })),
    [organicSummary.dailyData]
  );

  const paidChartData = useMemo(
    () =>
      paidDailyData.map((d) => ({
        ...d,
        date: new Date(d.rawDate).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      })),
    [paidDailyData]
  );

  if (paidLoading || postsLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className={`col-span-2 ${cardBase} p-6 h-32`}>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className={`${cardBase} p-6 h-32`}>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${cardBase} p-4 h-24`}>
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (paidError || postsError) {
    return (
      <div className={`${cardBase} p-8`}>
        <div className="flex flex-col items-center justify-center text-center text-gray-500">
          <AlertCircle className="h-10 w-10 mb-3 opacity-50" strokeWidth={1.5} />
          <p className="text-sm">Error loading data</p>
        </div>
      </div>
    );
  }

  const showOrganicData = category === "all" || category === "organic";
  const showPaidData = category === "all" || category === "ads";

  const totalReach =
    (showOrganicData ? organicSummary.totalReach : 0) +
    (showPaidData ? summary.totalReach : 0);
  const totalImpressions = showPaidData ? summary.totalImpressions : 0;
  const totalClicks = showPaidData ? summary.totalClicks : 0;
  const totalEngagement = showOrganicData ? organicSummary.totalEngagement : 0;
  const avgEngagementRate = showOrganicData ? organicSummary.avgEngagementRate : 0;

  const hasOrganicChartData = organicChartData.length > 0;
  const hasPaidData = paidChartData.length > 0;
  const hasOrganicData = organicSummary.totalPosts > 0 || hasOrganicChartData;
  const organicButtonDisabled = !!adGroupId && !hasOrganicData;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {category !== "ads" && (
          <Button
            variant={showOrganic ? "default" : "outline"}
            size="sm"
            onClick={() => !organicButtonDisabled && setShowOrganic((p) => !p)}
            disabled={organicButtonDisabled}
            className={`h-8 text-xs ${showOrganic ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" : "text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-950/30"}`}
          >
            <Leaf className="h-3 w-3 mr-1" strokeWidth={1.5} />
            Organic{organicButtonDisabled ? " (0)" : ""}
          </Button>
        )}
        {category !== "organic" && (
          <Button
            variant={showPaid ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPaid((p) => !p)}
            className={`h-8 text-xs ${showPaid ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" : "text-blue-600 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-950/30"}`}
          >
            <Megaphone className="h-3 w-3 mr-1" strokeWidth={1.5} />
            Paid
          </Button>
        )}
      </div>

      {/* KPI Overview — single wide card replacing Reach, Impressions, Engagement Rate */}
      <div className="grid grid-cols-1 gap-4">
        <div
          className={`${cardBase} p-6 shadow-sm relative overflow-hidden min-h-[140px]`}
        >
          {/* Sparkline as subtle monochrome background */}
          {sparklineData.length > 0 && (
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="sparkMono" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#64748b" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="natural" dataKey="total" stroke="#64748b" strokeWidth={1} fill="url(#sparkMono)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Reach */}
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <LabelWithInfo label="Reach" tooltip="Organic reach + paid reach combined." />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {formatNumber(totalReach)}
              </p>
              {category === "all" && (organicSummary.totalReach > 0 || summary.totalReach > 0) && (
                <ProgressDots organic={organicSummary.totalReach} paid={summary.totalReach} />
              )}
              <p className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                Primary Reach (Paid): {formatNumber(summary.totalReach)} · Secondary Reach (Organic): {formatNumber(organicSummary.totalReach)}
              </p>
            </div>
            {/* Impressions */}
            <div>
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <LabelWithInfo label="Impressions" tooltip="Total ad impressions delivered." />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {formatNumber(totalImpressions)}
              </p>
              {category === "all" && (organicSummary.totalReach > 0 || summary.totalImpressions > 0) && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                    {(() => {
                      const total = organicSummary.totalReach + summary.totalImpressions;
                      const organicPct = total > 0 ? (organicSummary.totalReach / total) * 100 : 0;
                      return (
                        <>
                          <div className="rounded-l-full bg-emerald-500" style={{ width: `${organicPct}%` }} />
                          <div className="rounded-r-full bg-blue-600" style={{ width: `${100 - organicPct}%` }} />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              <p className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                Engagement Rate: {avgEngagementRate.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Small metrics (row 2): Clicks, Likes, Comments, Shares — 4-col with refined layout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`${cardBase} p-6 flex flex-col min-h-[100px] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200`}>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <LabelWithInfo label="Clicks" tooltip="Total ad clicks from paid campaigns." />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                {formatNumber(totalClicks)}
              </p>
              <MousePointer className="h-4 w-4 text-blue-500/60 mt-1" strokeWidth={1.5} />
            </div>
          </div>
          <div className={`${cardBase} p-6 flex flex-col min-h-[100px] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200`}>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <LabelWithInfo label="Likes" tooltip="Total likes across organic posts." />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 tabular-nums">
                {formatNumber(showOrganicData ? organicSummary.totalLikes : 0)}
              </p>
              <Heart className="h-4 w-4 text-rose-500/60 mt-1" strokeWidth={1.5} />
            </div>
          </div>
          <div className={`${cardBase} p-6 flex flex-col min-h-[100px] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200`}>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <LabelWithInfo label="Comments" tooltip="Total comments across organic posts." />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-sky-700 dark:text-sky-300 tabular-nums">
                {formatNumber(showOrganicData ? organicSummary.totalComments : 0)}
              </p>
              <MessageCircle className="h-4 w-4 text-sky-500/60 mt-1" strokeWidth={1.5} />
            </div>
          </div>
          <div className={`${cardBase} p-6 flex flex-col min-h-[100px] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200`}>
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <LabelWithInfo label="Shares" tooltip="Total shares across organic posts." />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {formatNumber(showOrganicData ? organicSummary.totalShares : 0)}
              </p>
              <Share2 className="h-4 w-4 text-emerald-500/60 mt-1" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {(showOrganic || showPaid) && (
        <div className="space-y-4">
          {showOrganic && (
            <Card className={`${cardBase} shadow-sm`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Engagement Over Time (Organic)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasOrganicChartData ? (
                  <div className="flex h-[200px] flex-col items-center justify-center text-gray-500 text-sm">
                    <BarChart3 className="h-8 w-8 mb-2 opacity-40" strokeWidth={1.5} />
                    No organic engagement in this period
                  </div>
                ) : (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={organicChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" tickFormatter={(v) => formatNumber(v)} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="natural"
                          dataKey="engagement"
                          stroke="#10B981"
                          strokeWidth={1.5}
                          fill="#10B981"
                          fillOpacity={0.05}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {showPaid && (
            <Card className={`${cardBase} shadow-sm`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  Clicks & Impressions Over Time (Paid)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasPaidData ? (
                  <div className="flex h-[200px] flex-col items-center justify-center text-gray-500 text-sm">
                    <BarChart3 className="h-8 w-8 mb-2 opacity-40" strokeWidth={1.5} />
                    No paid metrics in this period
                  </div>
                ) : (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={paidChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" tickFormatter={(v) => formatNumber(v)} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #E5E7EB",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="natural"
                          dataKey="impressions"
                          stroke="#3B82F6"
                          strokeWidth={1.5}
                          fill="#3B82F6"
                          fillOpacity={0.05}
                        />
                        <Area
                          type="natural"
                          dataKey="clicks"
                          stroke="#6366F1"
                          strokeWidth={1.5}
                          fill="#6366F1"
                          fillOpacity={0.05}
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
        <div className={`${cardBase} shadow-sm flex h-[200px] flex-col items-center justify-center text-gray-500 text-sm`}>
          <BarChart3 className="h-8 w-8 mb-2 opacity-40" />
          Click Organic or Paid to view charts
        </div>
      )}
    </div>
  );
}
