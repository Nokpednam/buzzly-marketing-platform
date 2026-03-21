import React, { useMemo } from "react";
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
  ArrowRight,
  Building2,
  FileText,
  MessageSquareHeart,
  Crown,
} from "lucide-react";
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { useQueryClient } from "@tanstack/react-query";
import { subDays, format as fnsFormat } from "date-fns";
import {
  useSubscriptionMetrics,
  useProductUsageMetrics,
  useFeedbackMetrics,
  useUserSegments,
} from "@/hooks/useOwnerMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
  const rawTransactions = subscriptionMetrics?.rawTransactions ?? [];

  // Build chart data that actually responds to the selected time range
  const trendData = useMemo(() => {
    if (timeRange === "7d" || timeRange === "1m") {
      const daysBack = timeRange === "7d" ? 7 : 30;
      const cutoff = subDays(new Date(), daysBack);
      const dailyMap = new Map<string, { mrr: number; users: Set<string> }>();
      for (let i = daysBack - 1; i >= 0; i--) {
        const key = fnsFormat(subDays(new Date(), i), "MMM dd");
        dailyMap.set(key, { mrr: 0, users: new Set() });
      }
      rawTransactions
        .filter((tx) => new Date(tx.date) >= cutoff)
        .forEach((tx) => {
          const key = fnsFormat(new Date(tx.date), "MMM dd");
          if (dailyMap.has(key)) {
            const e = dailyMap.get(key)!;
            e.mrr += tx.amount;
            e.users.add(tx.userId);
          }
        });
      return Array.from(dailyMap.entries()).map(([date, e]) => ({
        date,
        mrr: Math.round(e.mrr),
        payingWorkspaces: e.users.size,
      }));
    }
    // monthly slice for 3m / 6m / 1y
    const sliceCount = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
    return monthlyData.slice(-sliceCount).map((d) => ({
      date: d.month,
      mrr: d.mrr,
      payingWorkspaces: d.activeAt,
    }));
  }, [timeRange, monthlyData, rawTransactions]);

  const platformUsers = usageMetrics?.platformUsersCount ?? 0;
  const breakdown = timeRangeData?.breakdown ?? { newMrr: 0, expansion: 0, churn: 0 };

  const hasData =
    currentMrr > 0 ||
    activeSubs > 0 ||
    totalWorkspaces > 0 ||
    platformUsers > 0 ||
    (feedbackMetrics?.totalReviews ?? 0) > 0;

  const peakMonth =
    trendData.length > 0
      ? trendData.reduce(
          (best, d) => (d.mrr > (best?.mrr ?? 0) ? d : best),
          trendData[0]
        )
      : null;

  return (
    <div className="min-h-screen animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 mb-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.15),transparent)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-5 w-5 text-amber-400" />
              <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Owner
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Platform Overview
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Buzzly business overview — Revenue · Workspaces · Satisfaction
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
              <SelectTrigger className="w-[130px] h-9 border-slate-600/50 bg-slate-800/50 text-white [&>span]:text-slate-300">
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
              className="h-9 w-9 shrink-0 text-slate-400 hover:bg-slate-700/50 hover:text-white"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !hasData ? (
        <NoDataState />
      ) : (
        <div className="space-y-6">
          {/* Top KPIs — 4 cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Platform MRR"
              value={formatValue(currentMrr, "currency")}
              sublabel="Total revenue"
              icon={DollarSign}
              accent="emerald"
            />
            <StatCard
              label="Platform ARR"
              value={formatValue(arr, "currency")}
              sublabel="Annual revenue"
              icon={Wallet}
              accent="blue"
            />
            <StatCard
              label="Workspaces"
              value={`${totalWorkspaces}`}
              sublabel={`${activeSubs} paying`}
              icon={Building2}
              accent="violet"
            />
            <StatCard
              label="Platform NPS"
              value={`${feedbackMetrics?.npsScore ?? 0}`}
              sublabel={`${feedbackMetrics?.totalReviews ?? 0} reviews`}
              icon={Target}
              accent="amber"
            />
          </div>

          {/* Chart + Sidebar */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Charts — separate MRR and Paying workspaces for clear scale */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              {/* MRR Chart */}
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <div className="mb-3">
                  <h3 className="font-semibold text-foreground">MRR Trend</h3>
                  <p className="text-xs text-muted-foreground">Monthly revenue (THB)</p>
                </div>
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                      <defs>
                        <linearGradient id="ownerMrr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                        opacity={0.5}
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
                        yAxisId="left"
                        orientation="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : String(v))}
                        width={36}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="mrr"
                        stroke="hsl(199 89% 48%)"
                        strokeWidth={2.5}
                        fill="url(#ownerMrr)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Paying Workspaces Chart */}
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <div className="mb-3">
                  <h3 className="font-semibold text-foreground">Paying Workspaces</h3>
                  <p className="text-xs text-muted-foreground">Count per month</p>
                </div>
                <div className="h-[110px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                        opacity={0.5}
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
                        allowDecimals={false}
                        width={28}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
                              <p className="mb-1 text-xs font-medium text-muted-foreground">
                                {label}
                              </p>
                              <p className="font-semibold">
                                {payload[0]?.value} workspaces
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="payingWorkspaces"
                        fill="hsl(243 75% 59% / 0.7)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick actions
                </h4>
                <div className="flex flex-col gap-1">
                  <QuickLink to="/owner/business-performance" icon={TrendingUp}>
                    Business Performance
                  </QuickLink>
                  <QuickLink to="/owner/product-usage" icon={BarChart3}>
                    Product Usage
                  </QuickLink>
                  <QuickLink to="/owner/user-feedback" icon={MessageSquareHeart}>
                    User Feedback
                  </QuickLink>
                  <QuickLink to="/owner/executive-report" icon={FileText}>
                    Executive Report
                  </QuickLink>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Summary for this period
                </h4>
                <div className="space-y-3">
                  <SummaryRow label="Platform users" value={`${formatValue(platformUsers, "number")} users`} />
                  <SummaryRow
                    label="New MRR"
                    value={`฿${breakdown.newMrr.toLocaleString()}`}
                    valueClassName="text-emerald-600 dark:text-emerald-400"
                  />
                  <SummaryRow
                    label="Churn"
                    value={`฿${breakdown.churn.toLocaleString()}`}
                    valueClassName="text-rose-600 dark:text-rose-400"
                  />
                  <SummaryRow
                    label="MRR growth"
                    value={`${mrrGrowth >= 0 ? "+" : ""}${formatValue(mrrGrowth, "percent")}`}
                    valueClassName={cn(
                      mrrGrowth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}
                  />
                  {peakMonth && (
                    <div className="border-t border-border/60 pt-3 mt-3">
                      <SummaryRow
                        label="Highest month"
                        value={`${typeof peakMonth.date === "string" ? peakMonth.date : String(peakMonth.date)} · ${formatValue(peakMonth.mrr, "currency")}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: DAU, MAU, Paying, Growth */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MiniStat icon={Zap} label="DAU" value={usageMetrics?.dau ?? 0} accent="amber" />
            <MiniStat icon={BarChart3} label="MAU" value={usageMetrics?.mau ?? 0} accent="blue" />
            <MiniStat icon={ShoppingCart} label="Paying workspaces" value={activeSubs} accent="violet" />
            <MiniStat
              icon={mrrGrowth >= 0 ? TrendingUp : TrendingDown}
              label="MRR growth"
              value={`${mrrGrowth >= 0 ? "+" : ""}${formatValue(mrrGrowth, "percent")}`}
              positive={mrrGrowth >= 0}
              accent={mrrGrowth >= 0 ? "emerald" : "rose"}
            />
          </div>

          {/* Workspaces by Business Type — table + colored bars */}
          {userSegments.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h4 className="mb-4 text-sm font-semibold text-foreground">
                Workspaces by Business Type
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="text-left py-2.5 font-medium text-muted-foreground">Type</th>
                      <th className="text-right py-2.5 font-medium text-muted-foreground w-20">Count</th>
                      <th className="text-right py-2.5 font-medium text-muted-foreground w-16">%</th>
                      <th className="w-32 pl-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...userSegments]
                      .sort((a, b) => b.count - a.count)
                      .map((seg, i) => {
                        const pct = totalWorkspaces > 0 ? Math.round((seg.count / totalWorkspaces) * 100) : 0;
                        const barColors = [
                          "bg-teal-500",
                          "bg-blue-500",
                          "bg-violet-500",
                          "bg-amber-500",
                          "bg-rose-500",
                          "bg-emerald-500",
                          "bg-cyan-500",
                          "bg-fuchsia-500",
                        ];
                        const barColor = barColors[i % barColors.length];
                        return (
                          <tr key={seg.type} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 font-medium">
                              <span className="inline-flex items-center gap-2">
                                <span className={cn("h-2 w-2 rounded-full shrink-0", barColor)} />
                                {seg.type}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-mono tabular-nums">{seg.count}</td>
                            <td className="py-2.5 text-right text-muted-foreground tabular-nums">{pct}%</td>
                            <td className="py-2.5 pl-4">
                              <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full min-w-[4px]", barColor)}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "emerald" | "blue" | "violet" | "amber";
}) {
  const accentStyles = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
        </div>
        <div className={cn("rounded-xl p-2.5", accentStyles[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

const MINI_STAT_ACCENTS = {
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
} as const;

function MiniStat({
  icon: Icon,
  label,
  value,
  positive,
  accent = "blue",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  positive?: boolean;
  accent?: keyof typeof MINI_STAT_ACCENTS;
}) {
  const valueColor = positive === true ? "text-emerald-600 dark:text-emerald-400" : positive === false ? "text-rose-600 dark:text-rose-400" : "text-foreground";
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/50 px-4 py-3">
      <div className={cn("rounded-lg p-2", MINI_STAT_ACCENTS[accent])}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("font-semibold", valueColor)}>
          {typeof value === "number" ? value.toLocaleString() : String(value)}
        </p>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">
              {p.dataKey === "mrr" ? "MRR" : "Paying workspaces"}
            </span>
            <span className="font-medium">
              {p.dataKey === "mrr"
                ? `฿${Number(p.value).toLocaleString()}`
                : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_minmax(7rem,auto)] items-baseline gap-4">
      <span className="text-sm text-muted-foreground truncate">{label}</span>
      <span className={cn("font-medium tabular-nums text-right", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg py-2 px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1">{children}</span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

function NoDataState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-24">
      <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="text-base font-semibold text-foreground">No platform data yet</h3>
      <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
        Data will appear when Workspaces and subscriptions exist
      </p>
    </div>
  );
}
