import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  UserMinus,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Database,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  Legend,
  ReferenceLine,
} from "recharts";

import { useSubscriptionMetrics, useCohortAnalysis, useSurvivalAnalysis } from "@/hooks/useOwnerMetrics";
import { subDays, format as fnsFormat } from "date-fns";
import { cn } from "@/lib/utils";

export default function BusinessPerformance() {

  // Time range toggle state
  type TimeRange = '7d' | '1m' | '3m' | '6m' | '1y';
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  const { data: subscriptionMetrics, isLoading: subLoading, refetch: refetchSub } = useSubscriptionMetrics();
  const { data: cohortData, isLoading: cohortLoading, refetch: refetchCohort } = useCohortAnalysis();
  const { data: survivalData, isLoading: survivalLoading, refetch: refetchSurvival } = useSurvivalAnalysis();

  const handleRefresh = async () => {
    await Promise.all([refetchSub(), refetchCohort(), refetchSurvival()]);
  };

  const timeRangeData = subscriptionMetrics?.timeRangeData?.[timeRange];
  const currentMrr = timeRangeData?.currentMrr || 0;
  const mrrGrowth = timeRangeData?.mrrGrowth || 0;

  const isLoading = subLoading || cohortLoading || survivalLoading;
  const hasData = (subscriptionMetrics?.activeSubscriptions || 0) > 0 ||
    currentMrr > 0 ||
    (cohortData && cohortData.length > 0);

  const mrrData = subscriptionMetrics?.monthlyData || [];
  const growthData = subscriptionMetrics?.growthData || [];
  const rawTransactions = subscriptionMetrics?.rawTransactions || [];
  const breakdown = timeRangeData?.breakdown || { newMrr: 0, expansion: 0, churn: 0 };

  const TIME_RANGE_OPTIONS: { key: TimeRange; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '1m', label: '1M' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: '1y', label: '1Y' },
  ];

  // Monthly chart data with activeAt coming from same txs source as MRR (always correlated)
  const mrrChartData = mrrData.map((d) => ({
    ...d,
    label: d.month.split(' ')[0], // "Mar", "Apr" etc.
    subs: d.activeAt,             // unique paying users — directly correlated to MRR
  }));

  // Dynamic chart data based on selected time range
  const chartData = useMemo(() => {
    if (timeRange === '7d' || timeRange === '1m') {
      const daysBack = timeRange === '7d' ? 7 : 30;
      const dailyMap = new Map<string, { mrr: number; users: Set<string> }>();
      for (let i = daysBack - 1; i >= 0; i--) {
        const key = fnsFormat(subDays(new Date(), i), 'MMM dd');
        dailyMap.set(key, { mrr: 0, users: new Set() });
      }
      const cutoff = subDays(new Date(), daysBack);
      rawTransactions
        .filter(tx => new Date(tx.date) >= cutoff)
        .forEach(tx => {
          const key = fnsFormat(new Date(tx.date), 'MMM dd');
          if (dailyMap.has(key)) {
            const e = dailyMap.get(key)!;
            e.mrr += tx.amount;
            e.users.add(tx.userId);
          }
        });
      return Array.from(dailyMap.entries()).map(([label, e]) => ({
        label,
        mrr: Math.round(e.mrr),
        subs: e.users.size,
        growth: 0,
        activeAt: e.users.size,
      }));
    }
    const sliceMap: Record<string, number> = { '3m': 3, '6m': 6, '1y': 12 };
    return mrrChartData.slice(-(sliceMap[timeRange] ?? 12));
  }, [timeRange, mrrChartData, rawTransactions]);

  const growthDataShort = growthData.map(d => ({ ...d, label: d.month.split(' ')[0] }));


  // KPI data safely mapped
  const kpis: {
    title: string; value: string; change: number; trend: 'up' | 'down';
    icon: React.ElementType; gradient: string; text: string;
  }[] = [
      {
        title: "Monthly Recurring Revenue",
        value: `฿${(currentMrr || 0).toLocaleString()}`,
        change: mrrGrowth,
        trend: mrrGrowth >= 0 ? "up" as const : "down" as const,
        icon: DollarSign,
        gradient: "from-emerald-600 to-teal-700",
        text: "text-emerald-100"
      },
      {
        title: "Active Subscriptions",
        value: (subscriptionMetrics?.activeSubscriptions ?? 0).toString(),
        change: timeRangeData?.activeSubscriptionsGrowth || 0,
        trend: "up" as const,
        icon: Users,
        gradient: "from-blue-600 to-indigo-700",
        text: "text-blue-100",
      },
      {
        title: "Annual Run Rate",
        value: `฿${(((timeRangeData?.arr ?? 0)) / 1000).toFixed(1)}K`,
        change: mrrGrowth,
        trend: mrrGrowth >= 0 ? "up" as const : "down" as const,
        icon: Target,
        gradient: "from-purple-600 to-fuchsia-700",
        text: "text-purple-100"
      },
      {
        title: "Avg Revenue/User",
        value: (subscriptionMetrics?.activeSubscriptions && subscriptionMetrics.activeSubscriptions > 0)
          ? `฿${Math.round((currentMrr || 0) / subscriptionMetrics.activeSubscriptions)}`
          : "฿0",
        change: 0,
        trend: "up" as const,
        icon: Activity,
        gradient: "from-cyan-500 to-sky-600",
        text: "text-cyan-100"
      },
    ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground mt-4 font-mono text-sm tracking-wider animate-pulse">Analyzing Revenue Streams...</p>
      </div>
    );
  }

  // Robust empty state check
  if (!hasData && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-lg shadow-primary/5">
          <Database className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight">No Performance Data</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Generate sample subscriptions to see revenue analytics.
        </p>
        <Button variant="default" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
          Open Supabase
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Business Performance
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Revenue, growth, and retention metrics.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white rounded-2xl px-6 py-6 font-bold shadow-sm transition-all shrink-0 sm:self-start"
        >
          <Activity className={cn("mr-2 h-4 w-4", isLoading && "animate-pulse")} />
          REFRESH DATA
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className={`bg-gradient-to-br ${kpi.gradient} border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <kpi.icon className="h-24 w-24 text-white transform rotate-12 translate-x-8 translate-y-[-10px]" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                  <kpi.icon className="h-5 w-5" />
                </div>
                <Badge variant={kpi.trend === "up" ? "default" : "outline"} className={cn("border-0 font-medium backdrop-blur-sm",
                  kpi.trend === "up" ? "bg-white/20 text-white" : "bg-white/20 text-white"
                )}>
                  {kpi.trend === "up" ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                  {Math.abs(kpi.change)}%
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-4xl font-bold tracking-tight text-white shadow-sm">{kpi.value}</p>
                <p className={`text-sm font-medium ${kpi.text}`}>{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-8">
        <TabsList className="w-full max-w-4xl grid grid-cols-4 bg-muted/50 p-1 rounded-lg border border-border/50">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Revenue Trends</TabsTrigger>
          <TabsTrigger value="growth" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Growth Analysis</TabsTrigger>
          <TabsTrigger value="cohort" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Cohort Retention</TabsTrigger>
          <TabsTrigger value="survival" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">Survival Probability</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          {/* Main MRR Area Chart */}
          <Card className="glass-panel p-6">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-xl">Monthly Recurring Revenue</CardTitle>
                  <CardDescription>
                    {timeRange === '7d' ? 'Last 7 days — daily view' :
                      timeRange === '1m' ? 'Last 30 days — daily view' :
                        timeRange === '3m' ? 'Last 3 months' :
                          timeRange === '6m' ? 'Last 6 months' : '12-month trend'}
                    {' '}· MRR (฿) &amp; Active Subscribers
                  </CardDescription>
                </div>
                {/* Time Range Toggle */}
                <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1">
                  {TIME_RANGE_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setTimeRange(opt.key)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200",
                        timeRange === opt.key
                          ? "bg-background text-primary shadow-sm ring-1 ring-border/50"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-baseline gap-3 mt-2">
                <p className="text-3xl font-bold text-primary">฿{currentMrr.toLocaleString()}</p>
                <p className={cn("text-sm font-semibold",
                  mrrGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>
                  {mrrGrowth >= 0 ? '▲' : '▼'}&nbsp;
                  {Math.abs(mrrGrowth)}% vs last period
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0 h-[340px]">
              {mrrChartData.every(d => d.mrr === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Database className="h-10 w-10 opacity-30" />
                  <p className="text-sm font-medium">No transaction data yet</p>
                  <p className="text-xs opacity-60">Run the SQL fix file in Supabase SQL Editor:</p>
                  <code className="text-xs bg-muted px-3 py-1.5 rounded-md font-mono border border-border/50">
                    supabase/snippets/fix_payment_transactions_sync.sql
                  </code>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="subsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142,76%,45%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(142,76%,45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: timeRange === '1m' ? 10 : 12, fontWeight: 500 }}
                      axisLine={false} tickLine={false}
                      interval={timeRange === '7d' ? 0 : timeRange === '1m' ? 4 : 0}
                    />
                    <YAxis
                      yAxisId="mrr"
                      tickFormatter={(v) => v >= 1000 ? `฿${(v / 1000).toFixed(0)}k` : `฿${v}`}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      axisLine={false} tickLine={false} width={58}
                    />
                    <YAxis
                      yAxisId="subs" orientation="right"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      axisLine={false} tickLine={false} width={38}
                    />
                    <Tooltip
                      formatter={(v: number, name: string) => [
                        name === 'mrr' ? `฿${v.toLocaleString()}` : `${v} users`,
                        name === 'mrr' ? 'MRR' : 'Active Subscribers'
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))", borderRadius: "10px",
                        border: "1px solid hsl(var(--border))", boxShadow: "0 4px 20px rgba(0,0,0,0.12)"
                      }}
                      labelStyle={{ fontWeight: 700, marginBottom: 4 }}
                    />
                    <Legend
                      formatter={(v) => v === 'mrr' ? 'MRR (฿)' : 'Active Subscribers'}
                      wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
                    />
                    <Area
                      yAxisId="mrr" type="monotone" dataKey="mrr" name="mrr"
                      stroke="hsl(var(--primary))" strokeWidth={2.5}
                      fill="url(#mrrGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 2 }}
                    />
                    <Area
                      yAxisId="subs" type="monotone" dataKey="subs" name="subs"
                      stroke="hsl(142,76%,45%)" strokeWidth={2} strokeDasharray="5 3"
                      fill="url(#subsGrad)" dot={false} activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Breakdown + Growth Bar */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader><CardTitle>Revenue Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {[
                  { label: 'New MRR', value: breakdown.newMrr, barColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
                  { label: 'Expansion', value: breakdown.expansion, barColor: 'bg-blue-500', textColor: 'text-blue-600' },
                  { label: 'Churn', value: breakdown.churn, barColor: 'bg-red-500', textColor: 'text-red-600' },
                ].map(item => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-muted-foreground">{item.label}</span>
                      <span className={cn("font-bold tabular-nums", item.textColor)}>฿{item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", item.barColor)}
                        style={{ width: `${currentMrr > 0 ? Math.min(100, (item.value / currentMrr) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-border/50 flex justify-between text-sm font-bold">
                  <span>Net MRR Change</span>
                  <span className={cn(
                    (breakdown.newMrr + breakdown.expansion - breakdown.churn) >= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}>
                    {(breakdown.newMrr + breakdown.expansion - breakdown.churn) >= 0 ? '+' : ''}
                    ฿{(breakdown.newMrr + breakdown.expansion - breakdown.churn).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>
                  {timeRange === '7d' ? 'Daily Revenue' :
                    timeRange === '1m' ? 'Daily Revenue (30d)' : 'MoM Growth %'}
                </CardTitle>
                <CardDescription>
                  {timeRange === '7d' || timeRange === '1m'
                    ? 'Revenue per day in selected period'
                    : 'Month-over-month MRR change rate'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[220px] px-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={timeRange === '1m' ? 12 : 28}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false} tickLine={false}
                      interval={timeRange === '7d' ? 0 : timeRange === '1m' ? 4 : 0}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false} tickLine={false}
                      tickFormatter={(v) => timeRange === '7d' || timeRange === '1m'
                        ? (v >= 1000 ? `฿${(v / 1000).toFixed(0)}k` : `฿${v}`)
                        : `${v}%`}
                    />
                    <Tooltip
                      formatter={(v: number) =>
                        timeRange === '7d' || timeRange === '1m'
                          ? [`฿${v.toLocaleString()}`, 'Revenue']
                          : [`${v >= 0 ? '+' : ''}${v}%`, 'MRR Growth']}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "10px", border: "1px solid hsl(var(--border))" }}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
                    <Bar
                      dataKey={timeRange === '7d' || timeRange === '1m' ? 'mrr' : 'growth'}
                      radius={[5, 5, 0, 0]}
                      fill="hsl(var(--primary))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="glass-panel p-8 text-center transition-all hover:shadow-md">
              <div className={cn("mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4",
                mrrGrowth >= 0 ? "bg-emerald-500/10" : "bg-red-500/10")}>
                <TrendingUp className={cn("h-6 w-6", mrrGrowth >= 0 ? "text-emerald-500" : "text-red-500")} />
              </div>
              <p className={cn("text-4xl font-bold", mrrGrowth >= 0 ? "text-emerald-500" : "text-red-500")}>
                {mrrGrowth >= 0 ? '+' : ''}{mrrGrowth}%
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-2 tracking-widest">Growth Rate</p>
            </Card>

            <Card className="glass-panel p-8 text-center transition-all hover:shadow-md">
              <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-4xl font-bold text-blue-500">
                {(() => {
                  const prev = timeRangeData?.previousMrr || 0;
                  const exp = breakdown.expansion || 0;
                  const churn = breakdown.churn || 0;
                  if (prev <= 0) return 'N/A';
                  return `${Math.round(((prev + exp - churn) / prev) * 100)}%`;
                })()}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-2 tracking-widest">Net Revenue Retention</p>
            </Card>

            <Card className="glass-panel p-8 text-center transition-all hover:shadow-md">
              <div className="mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4 bg-red-500/10">
                <UserMinus className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-4xl font-bold text-red-500">
                {(() => {
                  const prev = timeRangeData?.previousMrr || 0;
                  const churn = breakdown.churn || 0;
                  if (prev <= 0) return '0.0%';
                  return `${((churn / prev) * 100).toFixed(1)}%`;
                })()}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase mt-2 tracking-widest">MRR Churn Rate</p>
            </Card>
          </div>

          {/* Subscriber Growth Chart */}
          <Card className="glass-panel p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Monthly Subscriber Growth</CardTitle>
              <CardDescription>New subscriptions vs churned subscribers per month</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthDataShort} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1.5} />
                  <Tooltip
                    formatter={(v: number, name: string) => [Math.abs(v), name === 'newSubs' ? 'New Subscribers' : 'Churned']}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend formatter={(v) => v === 'newSubs' ? 'New Subscribers' : 'Churned'} />
                  <Bar dataKey="newSubs" name="newSubs" fill="hsl(142, 76%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="churned" name="churned" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative Active Subscribers */}
          <Card className="glass-panel p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Cumulative Active Subscribers</CardTitle>
              <CardDescription>Total paying subscribers growing over time</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthDataShort}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => [v, 'Active Subscribers']}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Area type="monotone" dataKey="totalActive" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorActive)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="cohort" className="space-y-6">
          <Card className="glass-panel p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Retention Cohorts</CardTitle>
              <CardDescription>User stickiness over time — retention curves and heatmap</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {cohortData && cohortData.length > 0 ? (
                <>
                  {/* Line Chart: Retention curves per cohort */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Retention Curves</h3>
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: "M1", ...Object.fromEntries(cohortData.slice(0, 6).map((c, i) => [c.cohort, (c.retentionData || [])[0] ?? 0])) },
                            { month: "M2", ...Object.fromEntries(cohortData.slice(0, 6).map((c, i) => [c.cohort, (c.retentionData || [])[1] ?? 0])) },
                            { month: "M3", ...Object.fromEntries(cohortData.slice(0, 6).map((c, i) => [c.cohort, (c.retentionData || [])[2] ?? 0])) },
                          ]}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis
                            tickFormatter={(v) => `${v}%`}
                            domain={[0, 100]}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                          />
                          <Tooltip
                            formatter={(v: number) => [`${v}%`, "Retention"]}
                            contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "10px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
                            labelFormatter={(label) => `Month ${label}`}
                          />
                          <Legend wrapperStyle={{ paddingTop: 12, fontSize: 11 }} />
                          {cohortData.slice(0, 6).map((c, i) => {
                            const colors = ["hsl(var(--primary))", "hsl(142,76%,45%)", "hsl(217,91%,60%)", "hsl(280,67%,60%)", "hsl(24,95%,53%)", "hsl(173,80%,40%)"];
                            return (
                              <Line
                                key={c.cohort}
                                type="monotone"
                                dataKey={c.cohort}
                                name={`${c.cohort} (n=${c.cohortSize})`}
                                stroke={colors[i % colors.length]}
                                strokeWidth={2.5}
                                dot={{ r: 4, strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Heatmap: Retention % by cohort × month */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Retention Heatmap</h3>
                    <div className="overflow-x-auto">
                      <div className="inline-block min-w-full">
                        <div className="grid gap-1" style={{ gridTemplateColumns: "120px 60px repeat(3, minmax(80px, 1fr))" }}>
                          <div className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground p-2">Cohort</div>
                          <div className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground p-2 text-center">Size</div>
                          {["M1", "M2", "M3"].map((m) => (
                            <div key={m} className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground p-2 text-center">{m}</div>
                          ))}
                          {cohortData.slice(0, 6).map((row) => (
                            <React.Fragment key={row.cohort}>
                              <div className="p-2 font-semibold text-sm flex items-center">{row.cohort}</div>
                              <div className="p-2 text-center font-mono text-xs text-muted-foreground flex items-center justify-center">{row.cohortSize}</div>
                              {(row.retentionData || [100, 85, 72]).slice(0, 3).map((val, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "p-2 rounded-lg text-center text-xs font-bold flex items-center justify-center min-h-[36px]",
                                    val >= 80 ? "bg-emerald-500/25 text-emerald-700 dark:text-emerald-400" :
                                    val >= 60 ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                                    val >= 40 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                                    "bg-red-500/20 text-red-600 dark:text-red-400"
                                  )}
                                >
                                  {val}%
                                </div>
                              ))}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact table for detailed numbers */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2">
                      <span className="group-open:rotate-90 transition-transform">▶</span>
                      View detailed table
                    </summary>
                    <div className="overflow-x-auto mt-4 border border-border/50 rounded-lg">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 text-muted-foreground bg-muted/30">
                            <th className="p-3 text-left font-bold uppercase tracking-widest text-[10px]">Cohort</th>
                            <th className="p-3 font-bold uppercase tracking-widest text-[10px]">Size</th>
                            <th className="p-3 font-bold uppercase tracking-widest text-[10px]">M1</th>
                            <th className="p-3 font-bold uppercase tracking-widest text-[10px]">M2</th>
                            <th className="p-3 font-bold uppercase tracking-widest text-[10px]">M3</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cohortData.slice(0, 6).map((row) => (
                            <tr key={row.cohort} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                              <td className="p-3 font-bold">{row.cohort}</td>
                              <td className="p-3 text-center font-mono text-xs">{row.cohortSize}</td>
                              {(row.retentionData || [100, 85, 72]).slice(0, 3).map((val, i) => (
                                <td key={i} className="p-3 text-center">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-lg text-[11px] font-bold",
                                    val > 80 ? "bg-emerald-500/20 text-emerald-600" :
                                    val > 60 ? "bg-blue-500/20 text-blue-600" : "bg-red-500/20 text-red-600"
                                  )}>
                                    {val}%
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </>
              ) : (
                <div className="py-20 text-center text-muted-foreground">No cohort data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="survival" className="space-y-6">
          <Card className="glass-panel p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Survival Probability Curve</CardTitle>
              <CardDescription>User retention rate over time</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 h-[350px]">
              {survivalData && survivalData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={survivalData}>
                    <defs>
                      <linearGradient id="colorSurvival" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: 'Days Since Registration', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                      label={{ value: 'Survival Rate (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      formatter={(v: number) => [`${v}%`, "Survival Rate"]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="survivalRate"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No survival data available</div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Detailed Survival Data</CardTitle>
              <CardDescription>User retention breakdown by day</CardDescription>
            </CardHeader>
            <CardContent>
              {survivalData && survivalData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="p-4 text-left font-bold uppercase tracking-widest text-[10px]">Day</th>
                        <th className="p-4 text-center font-bold uppercase tracking-widest text-[10px]">Total Users</th>
                        <th className="p-4 text-center font-bold uppercase tracking-widest text-[10px]">Still Active</th>
                        <th className="p-4 text-center font-bold uppercase tracking-widest text-[10px]">Churned</th>
                        <th className="p-4 text-center font-bold uppercase tracking-widest text-[10px]">Survival Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {survivalData.map((row) => (
                        <tr key={row.day} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-bold">
                            <span className="text-primary">Day {row.day}</span>
                          </td>
                          <td className="p-4 text-center font-mono text-xs">{row.totalUsers.toLocaleString()}</td>
                          <td className="p-4 text-center font-mono text-xs text-emerald-600">{row.activeUsers.toLocaleString()}</td>
                          <td className="p-4 text-center font-mono text-xs text-red-600">{row.churnedUsers.toLocaleString()}</td>
                          <td className="p-4 text-center">
                            <span className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm",
                              row.survivalRate >= 80 ? "bg-emerald-500/20 text-emerald-600" :
                                row.survivalRate >= 60 ? "bg-blue-500/20 text-blue-600" : "bg-red-500/20 text-red-600"
                            )}>
                              {row.survivalRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center text-muted-foreground">No survival data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
