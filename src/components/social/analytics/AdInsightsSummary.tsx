import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

interface ChartSectionProps {
  title: string;
  description: string;
  icon: typeof Leaf;
  badgeClassName: string;
  badgeLabel: string;
  stats: {
    label: string;
    value: string;
    icon: typeof Eye;
    color: string;
  }[];
  chartTitle: string;
  chartData: Array<Record<string, number | string>>;
  areas: {
    dataKey: string;
    name: string;
    stroke: string;
    fill: string;
  }[];
  emptyTitle: string;
  emptyDescription: string;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatCurrency = (num: number) =>
  `฿${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function PerformanceSection({
  title,
  description,
  icon: Icon,
  badgeClassName,
  badgeLabel,
  stats,
  chartTitle,
  chartData,
  areas,
  emptyTitle,
  emptyDescription,
}: ChartSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge className={badgeClassName}>{badgeLabel}</Badge>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {stats.map((stat) => {
          const StatIcon = stat.icon;
          return (
            <Card key={stat.label}>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{chartTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex h-[250px] flex-col items-center justify-center text-center text-muted-foreground">
              <BarChart3 className="mb-3 h-10 w-10 opacity-40" />
              <p className="font-medium">{emptyTitle}</p>
              <p className="text-sm">{emptyDescription}</p>
            </div>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  {areas.map((area) => (
                    <Area
                      key={area.dataKey}
                      type="monotone"
                      dataKey={area.dataKey}
                      stroke={area.stroke}
                      fill={area.fill}
                      name={area.name}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdInsightsSummary({
  adGroupId,
  category = "all",
}: AdInsightsSummaryProps) {
  const { dateRange, activePlatforms } = useSocialFilters();
  const { workspace } = useWorkspace();
  const {
    summary,
    isLoading: paidLoading,
    error: paidError,
  } = useAdInsights(
    dateRange,
    activePlatforms,
    workspace?.id,
    adGroupId
  );
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
    if (activePlatforms.length === 0) {
      return true;
    }

    if (!platformId) {
      return true;
    }

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
    const byDate = new Map<string, { date: string; engagement: number }>();

    for (const post of organicPosts) {
      const anchorDate = (post.published_at ?? post.scheduled_at ?? post.created_at)?.slice(0, 10);
      if (!anchorDate) {
        continue;
      }

      const entry = byDate.get(anchorDate) ?? { date: anchorDate, engagement: 0 };
      entry.engagement += (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0);
      byDate.set(anchorDate, entry);
    }

    return {
      totalPosts: organicPosts.length,
      totalLikes,
      totalComments,
      totalShares,
      totalReach,
      totalEngagement,
      avgEngagementRate,
      dailyData: Array.from(byDate.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((entry) => ({
          date: new Date(entry.date).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
          }),
          engagement: entry.engagement,
        })),
    };
  }, [organicPosts]);

  const paidDailyData = useMemo(() => {
    const byDate = new Map<
      string,
      { date: string; impressions: number; clicks: number }
    >();

    for (const row of summary.dailyData) {
      const entry = byDate.get(row.date) ?? {
        date: row.date,
        impressions: 0,
        clicks: 0,
      };
      entry.impressions += row.impressions;
      entry.clicks += row.clicks;
      byDate.set(row.date, entry);
    }

    return Array.from(byDate.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        impressions: entry.impressions,
        clicks: entry.clicks,
      }));
  }, [summary.dailyData]);

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

  return (
    <div className="space-y-6">
      {(category === "all" || category === "organic") && (
        <PerformanceSection
          title="Organic Post Performance"
          description="Posts with `post_channel = social` are graphed by engagement over time."
          icon={Leaf}
          badgeClassName="w-fit gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
          badgeLabel="Organic Engagement"
          stats={[
            {
              label: "Posts",
              value: formatNumber(organicSummary.totalPosts),
              icon: Leaf,
              color: "text-emerald-500",
            },
            {
              label: "Engagement",
              value: formatNumber(organicSummary.totalEngagement),
              icon: TrendingUp,
              color: "text-violet-500",
            },
            {
              label: "Likes",
              value: formatNumber(organicSummary.totalLikes),
              icon: Heart,
              color: "text-pink-500",
            },
            {
              label: "Comments",
              value: formatNumber(organicSummary.totalComments),
              icon: MessageCircle,
              color: "text-blue-500",
            },
            {
              label: "Shares",
              value: formatNumber(organicSummary.totalShares),
              icon: Share2,
              color: "text-orange-500",
            },
            {
              label: "Reach",
              value: formatNumber(organicSummary.totalReach),
              icon: Users,
              color: "text-purple-500",
            },
            {
              label: "Eng. Rate",
              value: `${organicSummary.avgEngagementRate.toFixed(2)}%`,
              icon: Percent,
              color: "text-cyan-500",
            },
          ]}
          chartTitle="Engagement Over Time"
          chartData={organicSummary.dailyData}
          areas={[
            {
              dataKey: "engagement",
              name: "Engagement",
              stroke: "hsl(var(--chart-2))",
              fill: "hsl(var(--chart-2) / 0.2)",
            },
          ]}
          emptyTitle="ยังไม่มี Organic Post metrics"
          emptyDescription="Analytics จะแสดงทันทีเมื่อมีโพสต์ social ในช่วงวันที่ที่เลือก"
        />
      )}

      {(category === "all" || category === "ads") && (
        <PerformanceSection
          title="Paid Post Performance"
          description="Posts with `post_channel = ad` are graphed by paid delivery metrics over time."
          icon={Megaphone}
          badgeClassName="w-fit gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
          badgeLabel="Paid Delivery"
          stats={[
            {
              label: "Impressions",
              value: formatNumber(summary.totalImpressions),
              icon: Eye,
              color: "text-blue-500",
            },
            {
              label: "Reach",
              value: formatNumber(summary.totalReach),
              icon: Users,
              color: "text-purple-500",
            },
            {
              label: "Clicks",
              value: formatNumber(summary.totalClicks),
              icon: MousePointer,
              color: "text-green-500",
            },
            {
              label: "CTR",
              value: `${summary.avgCtr.toFixed(2)}%`,
              icon: Percent,
              color: "text-cyan-500",
            },
            {
              label: "Spend",
              value: formatCurrency(summary.totalSpend),
              icon: DollarSign,
              color: "text-red-500",
            },
            {
              label: "CPC",
              value: formatCurrency(summary.avgCpc),
              icon: Coins,
              color: "text-orange-500",
            },
            {
              label: "Conversions",
              value: formatNumber(summary.totalConversions),
              icon: Target,
              color: "text-emerald-500",
            },
            {
              label: "ROAS",
              value: `${summary.avgRoas.toFixed(2)}x`,
              icon: TrendingUp,
              color: "text-primary",
            },
          ]}
          chartTitle="Clicks & Impressions Over Time"
          chartData={paidDailyData}
          areas={[
            {
              dataKey: "impressions",
              name: "Impressions",
              stroke: "hsl(var(--primary))",
              fill: "hsl(var(--primary) / 0.18)",
            },
            {
              dataKey: "clicks",
              name: "Clicks",
              stroke: "hsl(var(--chart-1))",
              fill: "hsl(var(--chart-1) / 0.18)",
            },
          ]}
          emptyTitle="ยังไม่มี Paid metrics"
          emptyDescription="ข้อมูลจะปรากฏเมื่อมี `ad_insights` สำหรับโพสต์ประเภทโฆษณา"
        />
      )}
    </div>
  );
}
