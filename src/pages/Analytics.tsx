import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Calendar, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
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

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

function AnalyticsContent() {
  const navigate = useNavigate();
  const { connectedPlatforms } = usePlatformConnections();
  const [dateRange, setDateRange] = useState("30d");

  const { data: metrics, isLoading } = useDashboardMetrics(dateRange);

  // Show empty state if no platforms connected
  if (connectedPlatforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">ยังไม่มี Platform ที่เชื่อมต่อ</h2>
        <p className="text-muted-foreground mb-4">
          ไปที่ API Keys เพื่อเชื่อมต่อ Platform ของคุณ
        </p>
        <Button variant="outline" onClick={() => navigate("/api-keys")}>
          ไปหน้า API Keys
        </Button>
      </div>
    );
  }

  const hasData = metrics && (metrics.totalImpressions > 0 || metrics.totalClicks > 0);

  // Show empty state if no data
  if (!isLoading && !hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Track your marketing performance across all platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มีข้อมูลในช่วงเวลานี้</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              ไม่พบข้อมูล Ad Insights ในฐานข้อมูล กรุณารัน sample-data.sql ใน Supabase SQL Editor เพื่อเพิ่มข้อมูลตัวอย่าง
            </p>
            <Button variant="outline" onClick={() => window.open('https://supabase.com/dashboard/project/xpmswnktazcjpqumrfsh/sql/new', '_blank')}>
              เปิด SQL Editor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate derived metrics for display
  const metricsCards = metrics ? [
    { 
      label: "Total Impressions", 
      value: metrics.totalImpressions >= 1000000 
        ? `${(metrics.totalImpressions / 1000000).toFixed(1)}M` 
        : metrics.totalImpressions >= 1000 
          ? `${(metrics.totalImpressions / 1000).toFixed(1)}K` 
          : metrics.totalImpressions.toLocaleString(),
      isPositive: true 
    },
    { 
      label: "Click-Through Rate", 
      value: `${metrics.avgCtr.toFixed(2)}%`,
      isPositive: metrics.avgCtr > 2 
    },
    { 
      label: "Cost Per Click", 
      value: `$${metrics.avgCpc.toFixed(2)}`,
      isPositive: metrics.avgCpc < 1 
    },
    { 
      label: "ROAS", 
      value: `${metrics.avgRoas.toFixed(1)}x`,
      isPositive: metrics.avgRoas > 3 
    },
    { 
      label: "Total Conversions", 
      value: metrics.totalConversions.toLocaleString(),
      isPositive: true 
    },
    { 
      label: "Total Spend", 
      value: `$${metrics.totalSpend.toFixed(2)}`,
      isPositive: true 
    },
  ] : [];

  // Group trend data by week for pie chart distribution
  const weeklyDistribution = metrics?.trendData.reduce((acc, item, index) => {
    const weekIndex = Math.floor(index / 7);
    const weekLabel = `Week ${weekIndex + 1}`;
    if (!acc[weekLabel]) {
      acc[weekLabel] = { impressions: 0, clicks: 0, spend: 0 };
    }
    acc[weekLabel].impressions += item.impressions;
    acc[weekLabel].clicks += item.clicks;
    acc[weekLabel].spend += item.spend;
    return acc;
  }, {} as Record<string, { impressions: number; clicks: number; spend: number }>);

  const pieData = weeklyDistribution 
    ? Object.entries(weeklyDistribution).map(([name, data], index) => ({
        name,
        value: data.impressions,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Track your marketing performance across all platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {metricsCards.map((metric) => (
              <Card key={metric.label} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 text-xl font-bold">{metric.value}</p>
                  <div className={`mt-1 flex items-center gap-1 text-xs ${metric.isPositive ? "text-success" : "text-destructive"}`}>
                    {metric.isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{metric.isPositive ? "Good" : "Needs improvement"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Traffic Trend */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Traffic Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {metrics && metrics.trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrics.trendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                          }}
                        />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="impressions"
                          name="Impressions"
                          stackId="1"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="clicks"
                          name="Clicks"
                          stackId="2"
                          stroke="hsl(var(--chart-2))"
                          fill="hsl(var(--chart-2))"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No trend data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Weekly Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [value.toLocaleString(), "Impressions"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No distribution data
                    </div>
                  )}
                </div>
                {pieData.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {pieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Spend Analysis */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Daily Spend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {metrics && metrics.trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.trendData.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, "Spend"]}
                      />
                      <Bar dataKey="spend" name="Spend" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No spend data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
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
