import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Target,
  Wallet,
  TrendingUp,
  BarChart3,
  Zap,
  DollarSign,
  TrendingDown,
  ShoppingCart,
  Users,
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
import { useQueryClient } from "@tanstack/react-query";
import {
  useSubscriptionMetrics,
  useProductUsageMetrics,
  useFeedbackMetrics,
  useUserSegments,
} from "@/hooks/useOwnerMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formatValue = (value: number, format: string) => {
  switch (format) {
    case "number":
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
    case "percent":
      return `${value.toFixed(1)}%`;
    case "currency":
      return `฿${value.toLocaleString()}`;
    case "multiplier":
      return `${value.toFixed(1)}x`;
    default:
      return value.toString();
  }
};

export default function OwnerDashboard() {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = React.useState<"7d" | "1m" | "3m" | "6m" | "1y">("1m");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data: subscriptionMetrics, isLoading: subLoading, refetch: refetchSub } =
    useSubscriptionMetrics();
  const { data: usageMetrics, isLoading: usageLoading, refetch: refetchUsage } =
    useProductUsageMetrics();
  const { data: feedbackMetrics, isLoading: feedbackLoading, refetch: refetchFeedback } =
    useFeedbackMetrics();
  const { data: userSegments = [] } = useUserSegments();

  const totalWorkspaces = userSegments.reduce((s, x) => s + x.count, 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchSub(),
      refetchUsage(),
      refetchFeedback(),
      queryClient.invalidateQueries({ queryKey: ["owner-subscription-metrics"] }),
      queryClient.invalidateQueries({ queryKey: ["owner-product-usage"] }),
      queryClient.invalidateQueries({ queryKey: ["owner-feedback-metrics"] }),
      queryClient.invalidateQueries({ queryKey: ["owner-user-segments"] }),
    ]);
    setIsRefreshing(false);
  };

  const isLoading = subLoading || usageLoading || feedbackLoading;

  const timeRangeData = subscriptionMetrics?.timeRangeData?.[timeRange];
  const currentMrr = timeRangeData?.currentMrr ?? 0;
  const mrrGrowth = timeRangeData?.mrrGrowth ?? 0;
  const arr = timeRangeData?.arr ?? 0;
  const activeSubs = subscriptionMetrics?.activeSubscriptions ?? 0;

  const monthlyData = subscriptionMetrics?.monthlyData ?? [];
  const trendData = monthlyData.slice(-12).map((d) => ({
    date: d.month,
    impressions: d.mrr,
    clicks: d.activeAt,
  }));

  const hasData =
    currentMrr > 0 ||
    activeSubs > 0 ||
    totalWorkspaces > 0 ||
    (usageMetrics?.totalUsers ?? 0) > 0 ||
    (feedbackMetrics?.totalReviews ?? 0) > 0;

  // Derived stats from trend data
  const avgDailyImpressions =
    trendData.length > 0
      ? Math.round(trendData.reduce((s, d) => s + d.impressions, 0) / trendData.length)
      : 0;
  const avgDailyClicks =
    trendData.length > 0
      ? Math.round(trendData.reduce((s, d) => s + d.clicks, 0) / trendData.length)
      : 0;
  const peakDay =
    trendData.length > 0
      ? trendData.reduce(
          (best, d) => (d.impressions > (best?.impressions ?? 0) ? d : best),
          trendData[0]
        )
      : null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Platform Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Platform-wide data — Revenue, customers & usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-[130px] h-9 border-border/60 bg-background rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="1m">1 month</SelectItem>
              <SelectItem value="3m">3 months</SelectItem>
              <SelectItem value="6m">6 months</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg shrink-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </header>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !hasData ? (
        <NoDataState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3">
          {/* Row 1: Owner metrics */}
          <BentoCard className="md:col-span-2 lg:col-span-4" size="large">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Platform MRR
                </p>
                <p className="text-2xl font-semibold tracking-tight mt-0.5 text-foreground">
                  {formatValue(currentMrr, "currency")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total platform revenue
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2 lg:col-span-4" size="large">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Workspaces
                </p>
                <p className="text-2xl font-semibold tracking-tight mt-0.5 text-foreground">
                  {formatValue(totalWorkspaces, "number")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeSubs} paying · {mrrGrowth >= 0 ? "+" : ""}{formatValue(mrrGrowth, "percent")} growth
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-2 lg:col-span-4" size="large">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer NPS
                </p>
                <p className="text-2xl font-semibold tracking-tight mt-0.5 text-foreground">
                  {feedbackMetrics?.npsScore ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  From {feedbackMetrics?.totalReviews ?? 0} customer reviews
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </BentoCard>

          {/* Row 2: Platform revenue trend */}
          <BentoCard className="md:col-span-6 lg:col-span-8" size="xlarge">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Platform revenue trend</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    MRR and paying customers across the platform
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <LegendDot color="#3b82f6" label="Platform MRR" />
                  <LegendDot color="#8b5cf6" label="Paying customers" />
                  <span className="text-xs text-muted-foreground border-l border-border/60 pl-4">
                    Avg: {formatValue(avgDailyImpressions, "number")} MRR · {formatValue(avgDailyClicks, "number")}/month
                  </span>
                </div>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="ownerColorImp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ownerColorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(val) =>
                        typeof val === "string" ? val.split(" ")[0] : String(val)
                      }
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "hsl(var(--card))",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="impressions"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#ownerColorImp)"
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fill="url(#ownerColorClicks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </BentoCard>

          {/* Row 2: Sidebar — Platform summary */}
          <BentoCard className="md:col-span-6 lg:col-span-4" size="tall">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Platform ARR
                </p>
                <p className="text-2xl font-semibold tracking-tight mt-0.5 text-foreground">
                  {formatValue(arr, "currency")}
                </p>
              </div>
              <div className="pt-3 border-t border-border/60">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Workspaces
                </p>
                <p className="text-xl font-semibold tracking-tight mt-0.5 text-foreground">
                  {formatValue(totalWorkspaces, "number")} total
                </p>
              </div>
              <div className="pt-3 border-t border-border/60">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Registered users
                </p>
                <p className="text-lg font-medium text-foreground mt-0.5">
                  {formatValue(usageMetrics?.totalUsers ?? 0, "number")} users
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Data range
                </span>
                <span className="text-sm font-medium text-foreground">
                  {trendData.length} months
                </span>
              </div>
              {peakDay && (
                <div className="pt-3 border-t border-border/60">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Peak month
                  </p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {typeof peakDay.date === "string"
                      ? peakDay.date
                      : String(peakDay.date)}{" "}
                    · {formatValue(peakDay.impressions, "currency")} MRR
                  </p>
                </div>
              )}
            </div>
          </BentoCard>

          {/* Row 3: Owner KPIs */}
          <BentoCard className="md:col-span-3 lg:col-span-3" size="small">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">DAU (platform)</p>
                <p className="text-base font-semibold text-foreground">
                  {formatValue(usageMetrics?.dau ?? 0, "number")}
                </p>
              </div>
            </div>
          </BentoCard>
          <BentoCard className="md:col-span-3 lg:col-span-3" size="small">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">MAU (platform)</p>
                <p className="text-base font-semibold text-foreground">
                  {formatValue(usageMetrics?.mau ?? 0, "number")}
                </p>
              </div>
            </div>
          </BentoCard>
          <BentoCard className="md:col-span-3 lg:col-span-3" size="small">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paying workspaces</p>
                <p className="text-base font-semibold text-foreground">
                  {formatValue(activeSubs, "number")}
                </p>
              </div>
            </div>
          </BentoCard>
          <BentoCard className="md:col-span-3 lg:col-span-3" size="small">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">MRR growth</p>
                <p className="text-base font-semibold text-foreground">
                  {mrrGrowth >= 0 ? "+" : ""}{formatValue(mrrGrowth, "percent")}
                </p>
              </div>
            </div>
          </BentoCard>

          {/* Row 4: Platform overview */}
          <BentoCard className="md:col-span-6 lg:col-span-12" size="wide">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Platform overview</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Platform-wide metrics — Revenue, customers & satisfaction
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <RevenueItem
                  label="Platform MRR"
                  value={formatValue(currentMrr, "currency")}
                  icon={DollarSign}
                  variant="amber"
                />
                <RevenueItem
                  label="Platform ARR"
                  value={formatValue(arr, "currency")}
                  icon={Wallet}
                  variant="indigo"
                />
                <RevenueItem
                  label="MRR Growth"
                  value={`${mrrGrowth >= 0 ? "+" : ""}${formatValue(mrrGrowth, "percent")}`}
                  icon={mrrGrowth >= 0 ? TrendingUp : TrendingDown}
                  positive={mrrGrowth >= 0}
                  variant="sky"
                />
                <RevenueItem
                  label="Total Workspaces"
                  value={totalWorkspaces.toLocaleString()}
                  icon={Users}
                  variant="blue"
                />
                <RevenueItem
                  label="Paying Workspaces"
                  value={activeSubs.toLocaleString()}
                  icon={ShoppingCart}
                  variant="violet"
                />
                <RevenueItem
                  label="Customer NPS"
                  value={`${feedbackMetrics?.npsScore ?? 0}`}
                  icon={(feedbackMetrics?.npsScore ?? 0) >= 0 ? TrendingUp : TrendingDown}
                  positive={(feedbackMetrics?.npsScore ?? 0) >= 0}
                  variant="emerald"
                />
              </div>
            </div>
          </BentoCard>
        </div>
      )}
    </div>
  );
}

// ─── Bento Card (same as Customer) ─────────────────────────────────────────
interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  size?: "small" | "large" | "tall" | "wide" | "xlarge";
}

function BentoCard({ children, className, size = "large" }: BentoCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm transition-colors hover:border-border/80 hover:bg-card/70",
        size === "small" && "p-3",
        size === "large" && "p-4",
        size === "tall" && "p-4",
        size === "wide" && "p-4",
        size === "xlarge" && "p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

type RevenueVariant =
  | "amber"
  | "indigo"
  | "emerald"
  | "red"
  | "blue"
  | "violet"
  | "rose"
  | "sky"
  | "neutral";

const revenueVariantStyles: Record<
  RevenueVariant,
  { icon: string; value: string }
> = {
  amber: {
    icon: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
  },
  indigo: {
    icon: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    value: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    icon: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  red: {
    icon: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
    value: "text-red-600 dark:text-red-400",
  },
  blue: {
    icon: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    value: "text-blue-600 dark:text-blue-400",
  },
  violet: {
    icon: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400",
    value: "text-violet-600 dark:text-violet-400",
  },
  rose: {
    icon: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
    value: "text-rose-600 dark:text-rose-400",
  },
  sky: {
    icon: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400",
    value: "text-sky-600 dark:text-sky-400",
  },
  neutral: {
    icon: "bg-muted text-muted-foreground",
    value: "text-foreground",
  },
};

interface RevenueItemProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  positive?: boolean;
  variant?: RevenueVariant;
}

function RevenueItem({ label, value, icon: Icon, positive, variant = "neutral" }: RevenueItemProps) {
  const iconStyle =
    positive === true
      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
      : positive === false
        ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
        : revenueVariantStyles[variant].icon;

  const valueStyle =
    positive === true
      ? "text-emerald-600 dark:text-emerald-400"
      : positive === false
        ? "text-red-600 dark:text-red-400"
        : revenueVariantStyles[variant].value;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
          iconStyle
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className={cn("text-sm font-medium truncate", valueStyle)}>{value}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 rounded-xl md:col-span-2 lg:col-span-4" />
      ))}
      <Skeleton className="h-80 rounded-xl md:col-span-6 lg:col-span-8" />
      <Skeleton className="h-80 rounded-xl md:col-span-6 lg:col-span-4" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 rounded-xl md:col-span-3 lg:col-span-3" />
      ))}
    </div>
  );
}

function NoDataState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-dashed border-border/60 bg-muted/20">
      <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-4" />
      <h3 className="text-base font-medium text-foreground">No platform data yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
        Data will appear once customer workspaces and subscriptions exist
      </p>
    </div>
  );
}
