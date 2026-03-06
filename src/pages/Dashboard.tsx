import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Eye,
  Target,
  Wallet,
  TrendingUp,
  BarChart3,
  Zap,
  MousePointer2,
  DollarSign,
  Activity,
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
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
import { cn } from "@/lib/utils";

const formatValue = (value: number, format: string) => {
  switch (format) {
    case "number":
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
    case "percent": return `${value.toFixed(1)}%`;
    case "currency": return `฿${value.toLocaleString()}`;
    case "multiplier": return `${value.toFixed(1)}x`;
    default: return value.toString();
  }
};

export default function Dashboard() {
  const { connectedPlatforms } = usePlatformConnections();
  const { state: onboardingState } = useOnboardingGuard();
  const [dateRange, setDateRange] = React.useState("7d");
  const [selectedPlatform, setSelectedPlatform] = React.useState<string>("all");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data: metrics, isLoading, refetch } = useDashboardMetrics(dateRange, selectedPlatform);

  // Revenue metrics from revenue_metrics table
  const { data: revenueMetrics } = useQuery({
    queryKey: ["revenue-metrics-dashboard"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get team ID
      const { data: ws } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      const teamId = ws?.id ?? null;
      if (!teamId) return null;

      const { data } = await supabase
        .from("revenue_metrics")
        .select("gross_revenue, net_revenue, profit, profit_margin, revenue_growth_percent, total_orders, new_customers, metric_date")
        .eq("team_id", teamId)
        .order("metric_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      return data;
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (onboardingState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (onboardingState !== "ready") {
    return <OnboardingBanner state={onboardingState} />;
  }

  const hasData = metrics && (metrics.totalImpressions > 0 || metrics.totalClicks > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-700">

      {/* 1. DYNAMIC HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Activity className="h-4 w-4" /> Live Performance Monitor
          </div>
          <h1 className="text-4xl font-black tracking-tighter">MARKETING HUB</h1>
          <p className="text-muted-foreground italic">
            {selectedPlatform === "all"
              ? `Aggregated insights across ${connectedPlatforms.length} connected platforms.`
              : `Insights for ${connectedPlatforms.find(p => p.id === selectedPlatform)?.name || "Platform"}.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px] bg-background border-none shadow-none h-9 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[140px] bg-background border-none shadow-none h-9 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {connectedPlatforms.map(platform => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} variant="ghost" size="icon" className="h-9 w-9 rounded-lg" disabled={isRefreshing}>
              <RefreshCw className={cn("h-4 w-4 text-muted-foreground", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !hasData ? (
        <NoDataState />
      ) : (
        <div className="space-y-8">

          {/* 2. CORE METRICS BENTO GRID */}
          <div className="grid gap-6 md:grid-cols-3">
            <SummaryCard
              title="Awareness Flow"
              icon={Eye}
              primaryLabel="Total Impressions"
              primaryValue={formatValue(metrics.totalImpressions, "number")}
              secondaryLabel="Engagement (Clicks)"
              secondaryValue={formatValue(metrics.totalClicks, "number")}
              color="blue"
            />
            <SummaryCard
              title="Efficiency Rate"
              icon={Target}
              primaryLabel="Total Conversions"
              primaryValue={formatValue(metrics.totalConversions, "number")}
              secondaryLabel="Avg. CTR"
              secondaryValue={formatValue(metrics.avgCtr, "percent")}
              color="emerald"
            />
            <SummaryCard
              title="Economic Impact"
              icon={Wallet}
              primaryLabel="ROAS"
              primaryValue={formatValue(metrics.avgRoas, "multiplier")}
              secondaryLabel="Total Ad Spend"
              secondaryValue={formatValue(metrics.totalSpend, "currency")}
              color="amber"
            />
          </div>

          {/* 3. PERFORMANCE CHART */}
          <Card className="border-none shadow-sm bg-muted/20 rounded-3xl overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> Multi-Channel Trend
                  </CardTitle>
                  <CardDescription>Visualizing Impression-to-Click volume over time</CardDescription>
                </div>
                <div className="flex gap-4">
                  <LegendItem label="Impressions" color="hsl(var(--primary))" />
                  <LegendItem label="Clicks" color="hsl(var(--chart-2))" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full bg-background rounded-2xl p-4 border shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.trendData}>
                    <defs>
                      <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600 }}
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorImp)" />
                    <Area type="monotone" dataKey="clicks" stroke="hsl(var(--chart-2))" strokeWidth={3} fill="url(#colorClicks)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4. GRANULAR KPI ROW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPIItem label="Avg. CPC" value={formatValue(metrics.avgCpc, "currency")} icon={MousePointer2} />
            <KPIItem label="Avg. CPM" value={formatValue(metrics.avgCpm, "currency")} icon={Zap} />
            <KPIItem label="Total Investment" value={formatValue(metrics.totalSpend, "currency")} icon={DollarSign} />
            <KPIItem label="Coverage" value={`${metrics.trendData.length} Days`} icon={BarChart3} />
          </div>

          {/* 5. REVENUE METRICS SECTION */}
          {revenueMetrics && (
            <Card className="border-none shadow-sm bg-muted/20 rounded-3xl overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" /> Revenue Overview
                </CardTitle>
                <CardDescription>
                  ข้อมูลรายได้จริงจากฐานข้อมูล · อัปเดตล่าสุด: {revenueMetrics.metric_date}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <RevenueKPI
                    label="Gross Revenue"
                    value={`฿${Number(revenueMetrics.gross_revenue ?? 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="text-emerald-600"
                  />
                  <RevenueKPI
                    label="Net Revenue"
                    value={`฿${Number(revenueMetrics.net_revenue ?? 0).toLocaleString()}`}
                    icon={Wallet}
                    color="text-blue-600"
                  />
                  <RevenueKPI
                    label="Profit Margin"
                    value={`${Number(revenueMetrics.profit_margin ?? 0).toFixed(1)}%`}
                    icon={revenueMetrics.profit_margin && revenueMetrics.profit_margin > 0 ? TrendingUp : TrendingDown}
                    color={revenueMetrics.profit_margin && revenueMetrics.profit_margin > 0 ? "text-green-600" : "text-destructive"}
                  />
                  <RevenueKPI
                    label="Revenue Growth"
                    value={`${Number(revenueMetrics.revenue_growth_percent ?? 0) > 0 ? "+" : ""}${Number(revenueMetrics.revenue_growth_percent ?? 0).toFixed(1)}%`}
                    icon={revenueMetrics.revenue_growth_percent && revenueMetrics.revenue_growth_percent > 0 ? TrendingUp : TrendingDown}
                    color={revenueMetrics.revenue_growth_percent && revenueMetrics.revenue_growth_percent > 0 ? "text-green-600" : "text-destructive"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <RevenueKPI
                    label="Total Orders"
                    value={(revenueMetrics.total_orders ?? 0).toLocaleString()}
                    icon={ShoppingCart}
                    color="text-purple-600"
                  />
                  <RevenueKPI
                    label="New Customers"
                    value={(revenueMetrics.new_customers ?? 0).toLocaleString()}
                    icon={Users}
                    color="text-amber-600"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SummaryCard({ title, icon: Icon, primaryLabel, primaryValue, secondaryLabel, secondaryValue, color }: any) {
  const colors: any = {
    blue: "from-blue-500/10 text-blue-600",
    emerald: "from-emerald-500/10 text-emerald-600",
    amber: "from-amber-500/10 text-amber-600"
  };

  return (
    <Card className={cn("border-none shadow-none bg-gradient-to-br bg-background rounded-3xl group overflow-hidden border", colors[color])}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 opacity-80 uppercase text-[10px] font-black tracking-widest">
            <Icon className="h-4 w-4" /> {title}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground group-hover:scale-105 transition-transform origin-left duration-300">
            {primaryValue}
          </h2>
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">{primaryLabel}</p>
        </div>
        <div className="pt-4 border-t border-current/10">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">{secondaryValue}</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">{secondaryLabel}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KPIItem({ label, value, icon: Icon }: any) {
  return (
    <Card className="border-none bg-muted/20 shadow-none rounded-2xl p-4 flex items-center gap-4 group">
      <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center shadow-sm group-hover:text-primary transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">{label}</p>
        <p className="text-lg font-black tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

function RevenueKPI({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-background border shadow-sm">
      <div className={cn("h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={cn("text-base font-black tracking-tight", color)}>{value}</p>
      </div>
    </div>
  );
}

function LegendItem({ label, color }: { label: string, color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}


function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-[2rem]" />)}
      </div>
      <Skeleton className="h-[400px] w-full rounded-[2rem]" />
    </div>
  );
}

function NoDataState() {
  return (
    <div className="py-20 flex flex-col items-center justify-center bg-muted/30 rounded-[3rem] border border-dashed">
      <BarChart3 className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
      <h3 className="text-lg font-bold">Awaiting Transaction Data</h3>
      <p className="text-sm text-muted-foreground">Your connected platforms haven't reported any activity in this period yet.</p>
    </div>
  );
}