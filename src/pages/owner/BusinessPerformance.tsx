import { useNavigate } from "react-router-dom";
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
} from "recharts";
import { useSubscriptionMetrics, useCohortAnalysis, useSurvivalAnalysis } from "@/hooks/useOwnerMetrics";
import { cn } from "@/lib/utils";

export default function BusinessPerformance() {
  const navigate = useNavigate();
  const { data: subscriptionMetrics, isLoading: subLoading, refetch: refetchSub } = useSubscriptionMetrics();
  const { data: cohortData, isLoading: cohortLoading, refetch: refetchCohort } = useCohortAnalysis();
  const { data: survivalData, isLoading: survivalLoading, refetch: refetchSurvival } = useSurvivalAnalysis();

  const handleRefresh = async () => {
    await Promise.all([refetchSub(), refetchCohort(), refetchSurvival()]);
  };

  const isLoading = subLoading || cohortLoading || survivalLoading;
  const currentMrr = subscriptionMetrics?.currentMrr || 0;
  const hasData = currentMrr > 0 || (cohortData && cohortData.length > 0);

  // NOTE: This trend data is currently simulated based on the current MRR.
  // Real historical trend data would require a more complex query from payment_transactions or a dedicated trends table.
  const mrrData = subscriptionMetrics?.monthlyData || [];
  const breakdown = subscriptionMetrics?.breakdown || { newMrr: 0, expansion: 0, churn: 0 };

  // KPI data safely mapped
  const kpis = [
    {
      title: "Monthly Recurring Revenue",
      value: `฿${(currentMrr || 0).toLocaleString()}`,
      change: subscriptionMetrics?.mrrGrowth || 0,
      trend: (subscriptionMetrics?.mrrGrowth || 0) >= 0 ? "up" as const : "down" as const,
      icon: DollarSign,
      color: "text-emerald-500",
    },
    {
      title: "Active Subscriptions",
      value: (subscriptionMetrics?.activeSubscriptions ?? 0).toString(),
      change: 0, // Simplified
      trend: "up" as const,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Annual Run Rate",
      value: `฿${(((subscriptionMetrics?.arr ?? 0)) / 1000).toFixed(1)}K`,
      change: subscriptionMetrics?.mrrGrowth || 0,
      trend: (subscriptionMetrics?.mrrGrowth || 0) >= 0 ? "up" as const : "down" as const,
      icon: Target,
      color: "text-purple-500",
    },
    {
      title: "Avg Revenue/User",
      value: (subscriptionMetrics?.activeSubscriptions && subscriptionMetrics.activeSubscriptions > 0)
        ? `฿${Math.round((currentMrr || 0) / subscriptionMetrics.activeSubscriptions)}`
        : "฿0",
      change: 0,
      trend: "up" as const,
      icon: Activity,
      color: "text-cyan-500",
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
          <Card key={kpi.title} className="glass-panel border-primary/10 shadow-lg shadow-primary/5 hover:translate-y-[-2px] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10", kpi.color)}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <Badge variant={kpi.trend === "up" ? "default" : "secondary"} className={cn(
                  kpi.trend === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                )}>
                  {kpi.trend === "up" ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                  {Math.abs(kpi.change)}%
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold tracking-tight text-foreground">{kpi.value}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">{kpi.title}</p>
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
          <Card className="glass-panel p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Monthly Recurring Revenue (MRR)</CardTitle>
              <CardDescription>Past 12 months performance</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrData || []}>
                  <defs>
                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `฿${v / 1000}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => [`฿${v.toLocaleString()}`, "MRR"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                  />
                  <Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorMrr)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader><CardTitle>Revenue Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>New MRR</span>
                    <span className="text-emerald-500 font-bold">฿{breakdown.newMrr.toLocaleString()}</span>
                  </div>
                  <Progress value={currentMrr > 0 ? (breakdown.newMrr / currentMrr) * 100 : 0} className="h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Expansion</span>
                    <span className="text-blue-500 font-bold">฿{breakdown.expansion.toLocaleString()}</span>
                  </div>
                  <Progress value={currentMrr > 0 ? (breakdown.expansion / currentMrr) * 100 : 0} className="h-1.5" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Churn</span>
                    <span className="text-red-500 font-bold">฿{breakdown.churn.toLocaleString()}</span>
                  </div>
                  <Progress value={currentMrr > 0 ? (breakdown.churn / currentMrr) * 100 : 0} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader><CardTitle>Growth Trend</CardTitle></CardHeader>
              <CardContent className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mrrData?.slice(-6) || []}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Bar dataKey="growth" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                val: `${(subscriptionMetrics?.mrrGrowth || 0) >= 0 ? '+' : ''}${subscriptionMetrics?.mrrGrowth || 0}%`,
                label: "MoM Growth",
                color: (subscriptionMetrics?.mrrGrowth || 0) >= 0 ? "text-emerald-500" : "text-red-500",
                bg: (subscriptionMetrics?.mrrGrowth || 0) >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
              },
              { icon: Users, val: "100%", label: "NRR", color: "text-blue-500", bg: "bg-blue-500/10" },
              {
                icon: UserMinus,
                val: "2.0%",
                label: "Est. Churn",
                color: "text-red-500",
                bg: "bg-red-500/10"
              }
            ].map((inc, i) => (
              <Card key={i} className="glass-panel p-8 text-center transition-all hover:shadow-md">
                <div className={cn("mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4", inc.bg)}>
                  <inc.icon className={cn("h-6 w-6", inc.color)} />
                </div>
                <p className={cn("text-4xl font-bold", inc.color)}>{inc.val}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase mt-2 tracking-widest">{inc.label}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Retention Cohorts</CardTitle>
              <CardDescription>User stickiness over time</CardDescription>
            </CardHeader>
            <CardContent>
              {cohortData && cohortData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 text-muted-foreground">
                        <th className="p-4 text-left font-bold uppercase tracking-widest text-[10px]">Cohort</th>
                        <th className="p-4 font-bold uppercase tracking-widest text-[10px]">Size</th>
                        <th className="p-4 font-bold uppercase tracking-widest text-[10px]">M1</th>
                        <th className="p-4 font-bold uppercase tracking-widest text-[10px]">M2</th>
                        <th className="p-4 font-bold uppercase tracking-widest text-[10px]">M3</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohortData.slice(0, 6).map((row) => (
                        <tr key={row.cohort} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-bold">{row.cohort}</td>
                          <td className="p-4 text-center font-mono text-xs">{row.cohortSize}</td>
                          {(row.retentionData || [100, 85, 72]).slice(0, 3).map((val, i) => (
                            <td key={i} className="p-4 text-center">
                              <span className={cn(
                                "px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-sm",
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
