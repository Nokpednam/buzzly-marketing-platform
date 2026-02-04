import React from "react";
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
import {
  RefreshCw,
  Eye,
  Target,
  Wallet,
  TrendingUp,
  ArrowUp,
  ArrowDown,
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
} from "recharts";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Skeleton } from "@/components/ui/skeleton";

const formatValue = (value: number, format: string) => {
  switch (format) {
    case "number":
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toLocaleString();
    case "percent":
      return `${value.toFixed(1)}%`;
    case "currency":
      return `$${value.toFixed(2)}`;
    case "multiplier":
      return `${value.toFixed(1)}x`;
    default:
      return value.toString();
  }
};

const ChangeIndicator = ({ change }: { change: number }) => {
  const isPositive = change >= 0;
  const formatted = Math.abs(change).toFixed(1);
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
      {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {formatted}%
    </span>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { connectedPlatforms } = usePlatformConnections();
  const [dateRange, setDateRange] = React.useState("7d");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data: metrics, isLoading, refetch } = useDashboardMetrics(dateRange);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Show empty state if no platforms connected
  if (connectedPlatforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
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

  // Show empty state if no data
  const hasData = metrics && (metrics.totalImpressions > 0 || metrics.totalClicks > 0);

  if (!isLoading && !hasData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Marketing Dashboard</h1>
            <p className="text-muted-foreground">ภาพรวมผลลัพธ์การตลาดจากทุก Platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">วันนี้</SelectItem>
                <SelectItem value="7d">7 วัน</SelectItem>
                <SelectItem value="30d">30 วัน</SelectItem>
                <SelectItem value="90d">90 วัน</SelectItem>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketing Dashboard</h1>
          <p className="text-muted-foreground">ภาพรวมผลลัพธ์การตลาดจากทุก Platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">วันนี้</SelectItem>
              <SelectItem value="7d">7 วัน</SelectItem>
              <SelectItem value="30d">30 วัน</SelectItem>
              <SelectItem value="90d">90 วัน</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : metrics && (
        <>
          {/* Overview Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Reach & Awareness */}
            <Card className="bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Eye className="h-5 w-5" />
                  <CardTitle className="text-sm font-medium">Reach & Awareness</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{formatValue(metrics.totalImpressions, "number")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Impressions</p>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold">{formatValue(metrics.totalClicks, "number")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Clicks</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="bg-gradient-to-br from-emerald-50 to-background dark:from-emerald-950/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Target className="h-5 w-5" />
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{formatValue(metrics.totalConversions, "number")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Conversions</p>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold">{formatValue(metrics.avgCtr, "percent")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Click-Through Rate</p>
                </div>
              </CardContent>
            </Card>

            {/* ROI & Cost */}
            <Card className="bg-gradient-to-br from-amber-50 to-background dark:from-amber-950/20">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Wallet className="h-5 w-5" />
                  <CardTitle className="text-sm font-medium">ROI & Cost</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{formatValue(metrics.avgRoas, "multiplier")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">ROAS</p>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold">{formatValue(metrics.totalSpend, "currency")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Spend</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics Grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Avg CPC</p>
                <p className="text-xl font-bold">{formatValue(metrics.avgCpc, "currency")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Avg CPM</p>
                <p className="text-xl font-bold">{formatValue(metrics.avgCpm, "currency")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Total Spend</p>
                <p className="text-xl font-bold">{formatValue(metrics.totalSpend, "currency")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Data Points</p>
                <p className="text-xl font-bold">{metrics.trendData.length} days</p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.trendData.length > 0 ? (
                <div className="h-[300px]">
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
                        labelFormatter={(value) => `Date: ${value}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="impressions"
                        name="Impressions"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        name="Clicks"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
