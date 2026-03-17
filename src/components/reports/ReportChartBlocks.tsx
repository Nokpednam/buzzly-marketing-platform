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
import { TrendingUp, PieChart as PieIcon, DollarSign, Users, MapPin } from "lucide-react";
import type { DashboardMetrics } from "@/hooks/useDashboardMetrics";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const GENDER_COLORS: Record<string, string> = {
  Male: "#3B82F6",
  Female: "#EC4899",
  Other: "#F59E0B",
  "Unspecified": "#94A3B8",
  male: "#3B82F6",
  female: "#EC4899",
  unknown: "#94A3B8",
};

const DEVICE_COLORS: Record<string, string> = {
  mobile: "#3B82F6",
  desktop: "#10B981",
  tablet: "#F59E0B",
};

export const REPORT_CHART_OPTIONS = [
  { id: "trend", name: "Multi-Channel Trend", source: "Campaign", icon: TrendingUp, description: "Impressions & Clicks over time" },
  { id: "market-share", name: "Market Share", source: "Analytics", icon: PieIcon, description: "Volume split by week" },
  { id: "spend-velocity", name: "Spend Velocity", source: "Analytics", icon: DollarSign, description: "Daily ad spend (last 14 days)" },
] as const;

export type ReportChartId = (typeof REPORT_CHART_OPTIONS)[number]["id"];

interface PersonaDataForReport {
  age_distribution: Record<string, number>;
  gender: Record<string, number>;
  top_locations: { name: string; pct: number }[];
  interests: { name: string; pct: number }[];
  device_type: Record<string, number>;
}

interface ReportChartBlocksProps {
  metrics: DashboardMetrics | null | undefined;
  selectedChartIds: ReportChartId[];
  reportType?: string;
  personaData?: PersonaDataForReport | null;
  personaImpressions?: number;
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

function ChannelReportCharts({
  personaData,
  totalImpressions,
}: {
  personaData: PersonaDataForReport;
  totalImpressions: number;
}) {
  const ageData = Object.entries(personaData.age_distribution ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value: Math.round(value * 100) }));

  const genderData = Object.entries(personaData.gender ?? {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value * 100),
  }));

  const interestData = (personaData.interests ?? []).map((i) => ({
    name: i.name,
    value: Math.round(i.pct * 100),
  }));

  const deviceData = Object.entries(personaData.device_type ?? {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round(value * 100),
  }));

  const countryData = (personaData.top_locations ?? []).map((l) => ({
    name: l.name,
    value: Math.round(l.pct * 100),
  }));

  return (
    <div className="space-y-8 mt-8">
      {ageData.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" /> Age Distribution
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }} formatter={(v: number) => [`${v}%`, "Share"]} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {genderData.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" /> Gender Split
          </h4>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={GENDER_COLORS[entry.name] ?? CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }} formatter={(v: number) => [`${v}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {interestData.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" /> Top Interests
          </h4>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interestData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} width={100} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }} formatter={(v: number) => [`${v}%`, "Affinity"]} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 999, 999, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {deviceData.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" /> Device Type
          </h4>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                  {deviceData.map((entry, i) => (
                    <Cell key={i} fill={DEVICE_COLORS[entry.name.toLowerCase()] ?? CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }} formatter={(v: number) => [`${v}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {countryData.length > 0 && (
        <div className="border rounded-xl p-4 bg-muted/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Geographic Reach
          </h4>
          <p className="text-[10px] text-muted-foreground mb-4">Easy-to-read bar chart — share by region</p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryData} margin={{ bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "11px" }} formatter={(v: number) => [`${v}%`, "Share"]} />
                <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {ageData.length === 0 && genderData.length === 0 && interestData.length === 0 && deviceData.length === 0 && countryData.length === 0 && (
        <div className="border rounded-xl p-8 bg-muted/10 text-center text-muted-foreground text-sm">
          No Persona data — connect ad platforms to pull audience data
        </div>
      )}
    </div>
  );
}

export function ReportChartBlocks({
  metrics,
  selectedChartIds,
  reportType = "campaign",
  personaData,
  personaImpressions = 0,
}: ReportChartBlocksProps) {
  // Channel report: Persona + country bar chart
  if (reportType === "channel" && personaData) {
    return (
      <ChannelReportCharts personaData={personaData} totalImpressions={personaImpressions} />
    );
  }

  // Campaign & ROI: metrics-based charts
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
