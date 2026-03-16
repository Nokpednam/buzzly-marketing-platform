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
} from "recharts";
import { TrendingUp, PieChart as PieIcon, DollarSign } from "lucide-react";
import type { DashboardMetrics } from "@/hooks/useDashboardMetrics";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const REPORT_CHART_OPTIONS = [
  { id: "trend", name: "Multi-Channel Trend", source: "Dashboard", icon: TrendingUp, description: "Impressions & Clicks over time" },
  { id: "market-share", name: "Market Share", source: "Analytics", icon: PieIcon, description: "Volume split by week" },
  { id: "spend-velocity", name: "Spend Velocity", source: "Analytics", icon: DollarSign, description: "Daily ad spend (last 14 days)" },
] as const;

export type ReportChartId = (typeof REPORT_CHART_OPTIONS)[number]["id"];

interface ReportChartBlocksProps {
  metrics: DashboardMetrics | null | undefined;
  selectedChartIds: ReportChartId[];
}

function buildPieData(trendData: { date: string; impressions: number }[]) {
  return trendData.reduce((acc, item, index) => {
    const weekLabel = `Week ${Math.floor(index / 7) + 1}`;
    const existing = acc.find((i) => i.name === weekLabel);
    if (existing) existing.value += item.impressions;
    else acc.push({ name: weekLabel, value: item.impressions });
    return acc;
  }, [] as { name: string; value: number }[]).map((item, i) => ({
    ...item,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
}

export function ReportChartBlocks({ metrics, selectedChartIds }: ReportChartBlocksProps) {
  if (!metrics || selectedChartIds.length === 0) return null;

  const trendData = metrics.trendData ?? [];
  const pieData = buildPieData(trendData);
  const spendData = trendData.slice(-14);

  return (
    <div className="space-y-8 mt-8">
      {selectedChartIds.includes("trend") && trendData.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Multi-Channel Trend
          </h4>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="report-colorImp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="report-colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9 }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }} />
                <Area type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#report-colorImp)" />
                <Area type="monotone" dataKey="clicks" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#report-colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedChartIds.includes("market-share") && pieData.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <PieIcon className="h-4 w-4" /> Market Share
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedChartIds.includes("spend-velocity") && spendData.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Spend Velocity
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9 }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }} />
                <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
