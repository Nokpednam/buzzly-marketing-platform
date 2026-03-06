import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3,
  Activity,
  Zap,
  MousePointer2,
  DollarSign,
  PieChart as PieChartIcon,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function AnalyticsContent() {
  const navigate = useNavigate();
  const { connectedPlatforms } = usePlatformConnections();
  const [dateRange, setDateRange] = useState("30d");

  const { data: metrics, isLoading } = useDashboardMetrics(dateRange);

  if (connectedPlatforms.length === 0) {
    return <EmptyPlatformState navigate={navigate} />;
  }

  const hasData = metrics && (metrics.totalImpressions > 0 || metrics.totalClicks > 0);

  if (!isLoading && !hasData) {
    return <NoDataState setDateRange={setDateRange} dateRange={dateRange} />;
  }

  const metricsCards = metrics ? [
    { label: "Total Impressions", value: formatNumber(metrics.totalImpressions), icon: Activity, color: "text-blue-500" },
    { label: "CTR Rate", value: `${metrics.avgCtr.toFixed(2)}%`, icon: MousePointer2, color: "text-emerald-500" },
    { label: "Avg CPC", value: `฿${metrics.avgCpc.toFixed(2)}`, icon: Zap, color: "text-amber-500" },
    { label: "Net ROAS", value: `${metrics.avgRoas.toFixed(1)}x`, icon: TrendingUp, color: "text-indigo-500" },
    { label: "Conversions", value: metrics.totalConversions.toLocaleString(), icon: Target, color: "text-rose-500" },
    { label: "Total Spend", value: `฿${metrics.totalSpend.toFixed(2)}`, icon: DollarSign, color: "text-slate-500" },
  ] : [];

  const pieData = metrics?.trendData.reduce((acc, item, index) => {
    const weekLabel = `Week ${Math.floor(index / 7) + 1}`;
    const existing = acc.find(i => i.name === weekLabel);
    if (existing) existing.value += item.impressions;
    else acc.push({ name: weekLabel, value: item.impressions });
    return acc;
  }, [] as any[]).map((item, i) => ({ ...item, color: CHART_COLORS[i % CHART_COLORS.length] })) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500">

      {/* 1. HEADER & GLOBAL FILTERS */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <BarChart3 className="h-4 w-4" /> Global Intelligence
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Analytics Hub</h1>
          <p className="text-muted-foreground">Cross-platform performance audit and predictive growth metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-muted/50 p-1 rounded-xl flex items-center gap-1 border">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px] bg-background border-none shadow-none h-9 rounded-lg">
                <Calendar className="mr-2 h-3.5 w-3.5 opacity-50" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="rounded-xl h-11 px-6 border-primary/20 hover:bg-primary/5 text-primary" onClick={() => toast.info("Export — พร้อมใช้งานเร็วๆ นี้")}>
            <Download className="h-4 w-4 mr-2" /> Export Hub
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {/* 2. EXECUTIVE METRICS GRID */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {metricsCards.map((metric) => (
              <Card key={metric.label} className="border-none shadow-sm bg-muted/20 rounded-2xl group hover:bg-muted/40 transition-all">
                <CardContent className="p-4">
                  <div className={cn("h-8 w-8 rounded-lg bg-background flex items-center justify-center mb-3 shadow-sm", metric.color)}>
                    <metric.icon className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest opacity-70">{metric.label}</p>
                  <p className="mt-1 text-xl font-black tracking-tight">{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 3. CORE ANALYTICS BENTO */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Traffic Area Chart */}
            <Card className="border-none shadow-none bg-muted/10 rounded-[2rem] lg:col-span-2 overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Traffic Trajectory
                </CardTitle>
                <CardDescription>Correlating Impression volume with active click acquisition.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-[320px] w-full bg-background rounded-2xl p-4 border shadow-inner">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics?.trendData}>
                      <defs>
                        <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700 }}
                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorImp)" />
                      <Area type="monotone" dataKey="clicks" stroke="hsl(var(--chart-2))" strokeWidth={3} fill="transparent" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Distribution Doughnut */}
            <Card className="border-none shadow-none bg-muted/10 rounded-[2rem] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-indigo-500" /> Market Share
                </CardTitle>
                <CardDescription>Volume split by weekly cycle.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-6">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold uppercase tracking-tight truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 4. SPEND VELOCITY BAR CHART */}
          <Card className="border-none shadow-none bg-muted/10 rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-500" /> Spend Velocity
              </CardTitle>
              <CardDescription>Monitoring daily allocation efficiency for the last 14 days.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[280px] bg-background rounded-2xl p-4 border shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.trendData.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700 }}
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.4)' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// --- INTERNAL HELPERS ---

function formatNumber(num: number) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function EmptyPlatformState({ navigate }: { navigate: any }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 border-2 border-dashed rounded-[3rem] bg-muted/10">
      <div className="bg-background p-6 rounded-full shadow-xl mb-6"><Activity className="h-10 w-10 text-primary" /></div>
      <h2 className="text-2xl font-black uppercase tracking-tight mb-2">No Engines Connected</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">Establish your API bridges to start populating this intelligence hub with real-time marketing data.</p>
      <Button onClick={() => navigate("/api-keys")} className="rounded-full px-10 shadow-lg shadow-primary/20">Connect Platform</Button>
    </div>
  );
}

function NoDataState({ setDateRange, dateRange }: any) {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-tight uppercase">Analytics Hub</h1>
        <Select value={dateRange} onValueChange={setDateRange}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7d">7 Days</SelectItem></SelectContent></Select>
      </div>
      <Card className="border-dashed bg-muted/10 rounded-[3rem] py-20 flex flex-col items-center text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h3 className="text-xl font-bold">Data Silence Detected</h3>
        <p className="text-muted-foreground max-w-sm">There is no reported activity for the selected period. Ensure your tracking pixels and ad accounts are active.</p>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-[400px] rounded-[2rem]" />
        <Skeleton className="h-[400px] rounded-[2rem]" />
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <PlanRestrictedPage requiredFeature="advancedAnalytics" featureDescription="Advanced analytics and insights">
      <AnalyticsContent />
    </PlanRestrictedPage>
  );
}