import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAdInsights } from "@/hooks/useAdInsights";
import { useSocialFilters } from "@/contexts/SocialFiltersContext";

export function AdInsightsSummary() {
  const { dateRange, activePlatforms } = useSocialFilters();
  const { summary, isLoading, error } = useAdInsights(dateRange, activePlatforms);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return "฿" + num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  if (isLoading) {
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

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </div>
      </Card>
    );
  }

  if (summary.dailyData.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">ยังไม่มีข้อมูล Insights</p>
          <p className="text-sm">ข้อมูลจะแสดงเมื่อมีการเชื่อมต่อกับ Ad Platform</p>
        </div>
      </Card>
    );
  }

  const chartData = summary.dailyData.map((i) => ({
    date: new Date(i.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" }),
    impressions: i.impressions,
    clicks: i.clicks,
    spend: i.spend,
    conversions: i.conversions,
  }));

  const stats = [
    { label: "Impressions", value: formatNumber(summary.totalImpressions), icon: Eye, color: "text-blue-500" },
    { label: "Reach", value: formatNumber(summary.totalReach), icon: Users, color: "text-purple-500" },
    { label: "Clicks", value: formatNumber(summary.totalClicks), icon: MousePointer, color: "text-green-500" },
    { label: "CTR", value: summary.avgCtr.toFixed(2) + "%", icon: Percent, color: "text-cyan-500" },
    { label: "Spend", value: formatCurrency(summary.totalSpend), icon: DollarSign, color: "text-red-500" },
    { label: "CPC", value: formatCurrency(summary.avgCpc), icon: Coins, color: "text-orange-500" },
    { label: "CPM", value: formatCurrency(summary.avgCpm), icon: BarChart3, color: "text-yellow-500" },
    { label: "Conversions", value: formatNumber(summary.totalConversions), icon: Target, color: "text-emerald-500" },
    { label: "ROAS", value: summary.avgRoas.toFixed(2) + "x", icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.slice(0, 5).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {stats.slice(5).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Impressions & Clicks</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    name="Impressions"
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2) / 0.2)"
                    name="Clicks"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spend & Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Bar dataKey="spend" fill="hsl(var(--chart-1))" name="Spend (฿)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" fill="hsl(var(--chart-3))" name="Conversions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
