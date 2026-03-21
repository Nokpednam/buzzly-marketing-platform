import { useNavigate, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { format, parseISO, startOfWeek, addDays, subMonths, subWeeks, subYears } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  Repeat,
  Share2,
  DollarSign,
  Loader2,
  Database,
  Trash2,
  Activity,
  AlertTriangle,
  BarChart3,
  Search,
  Info,
  ClipboardCheck,
  TrendingUp,
  Target,
  Briefcase,
  Building2,
  User,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useProductUsageMetrics, useAARRRMetrics, useFeatureUsageMetrics, useOwnerAARRRTimeSeriesData, useUserArchetypes, useOwnerPersonaTimeSeries, useFeatureUsageByPersona, useFrictionByPersona, getPreviousFeatureUsagePeriod } from "@/hooks/useOwnerMetrics";
import type { AARRRGranularity, FeatureUsageGranularity, FeatureUsageDateRange } from "@/hooks/useOwnerMetrics";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/campaigns/Sparkline";

// ── AARRR Funnel Chart (gradient bars + conversion metrics) ─────────────────
const AARRR_STAGE_COLORS = [
  { main: "#0d9488", light: "#0d948820", gradient: "from-teal-500 to-teal-600" },
  { main: "#2563eb", light: "#2563eb20", gradient: "from-blue-500 to-blue-600" },
  { main: "#7c3aed", light: "#7c3aed20", gradient: "from-violet-500 to-violet-600" },
  { main: "#d97706", light: "#d9770620", gradient: "from-amber-500 to-amber-600" },
  { main: "#be185d", light: "#be185d20", gradient: "from-pink-500 to-pink-600" },
];

const AARRR_CATEGORY_ICONS: Record<string, typeof Users> = {
  Acquisition: Search,
  Activation: Users,
  Retention: ClipboardCheck,
  Revenue: DollarSign,
  Referral: TrendingUp,
};

// Distinct colors for Persona tab — Indigo, Emerald, Amber, Rose (no blue/gray blend)
const PERSONA_SEGMENT_COLORS: Record<string, string> = {
  "Small Business": "#059669",   // Emerald
  "Agency": "#4f46e5",           // Indigo
  "Enterprise": "#e11d48",      // Rose
  "Freelancer": "#d97706",      // Amber
  "Other": "#64748b",           // Slate (neutral)
};
const SEGMENT_COLOR_FALLBACK = "#94a3b8";

const AARRRFunnelChart = ({ stages, topVal }: { stages: { name: string; value: number }[]; topVal: number }) => {
  const maxLower = stages.length > 1 ? Math.max(...stages.slice(1).map((s) => s.value), 1) : 1;
  const LOWER_STAGES_MAX_PCT = 72;

  return (
    <div className="relative w-full space-y-0 py-1">
      {stages.map((stage, i) => {
        const Icon = AARRR_CATEGORY_ICONS[stage.name] ?? Info;
        const color = AARRR_STAGE_COLORS[i % AARRR_STAGE_COLORS.length];
        const widthPct =
          i === 0 ? 100 : maxLower > 0 ? Math.max(6, (stage.value / maxLower) * LOWER_STAGES_MAX_PCT) : 6;
        const prevVal = i > 0 ? stages[i - 1].value : stage.value;
        const convPct = i > 0 && prevVal > 0 ? ((stage.value / prevVal) * 100).toFixed(2) : null;
        const pctValue = (stage.value / topVal) * 100;
        const pctOfTopDisplay = pctValue > 0 && pctValue < 0.1 ? "< 0.1" : pctValue.toFixed(1);

        return (
          <div key={stage.name}>
            {i > 0 && (
              <div className="flex items-center py-1.5 pl-12">
                <div className="w-9 flex justify-center shrink-0">
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-md rounded-l-none bg-red-50 dark:bg-red-950/40 pl-3 pr-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 -ml-[18px] border-l-2 border-red-300 dark:border-red-800">
                  <span className="tabular-nums">{convPct}%</span>
                  <span className="font-medium">converted</span>
                </span>
              </div>
            )}
            <div
              className="group flex items-center gap-4 py-3 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              <div className="flex w-36 shrink-0 items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color.light }}
                >
                  <Icon className="h-4 w-4" style={{ color: color.main }} strokeWidth={2} />
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {stage.name}
                </span>
              </div>
              <div className="relative flex-1 min-w-0 flex items-center gap-3">
                <div className="flex-1 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/60">
                  <div
                    className={cn(
                      "h-full rounded-xl flex items-center justify-between px-4 transition-all duration-700 ease-out",
                      `bg-gradient-to-r ${color.gradient}`
                    )}
                    style={{
                      width: `${widthPct}%`,
                      minWidth: "72px",
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px ${color.main}40`,
                    }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow-sm truncate">{stage.name}</span>
                    <span className="text-xs font-bold text-white/95 tabular-nums shrink-0">
                      {stage.value.toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 w-11 text-center rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                  {convPct ?? "—"}
                </span>
              </div>
              <div className="shrink-0 text-right w-28 sm:w-32">
                <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                  {stage.value.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{pctOfTopDisplay}% of total</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function ProductUsage() {
  const navigate = useNavigate();
  const [aarrrGranularity, setAarrrGranularity] = useState<AARRRGranularity>("month");
  const [aarrrPeriodsBack, setAarrrPeriodsBack] = useState<number>(6);
  const [journeyGranularity, setJourneyGranularity] = useState<AARRRGranularity>("month");
  const [journeyPeriodsBack, setJourneyPeriodsBack] = useState<number>(6);
  const [featureUsageGranularity, setFeatureUsageGranularity] = useState<FeatureUsageGranularity>("month");
  const [featureUsageValue, setFeatureUsageValue] = useState<string>(() => format(new Date(), "yyyy-MM"));
  const [radarVisible, setRadarVisible] = useState<Record<string, boolean>>({});
  const [radarHovered, setRadarHovered] = useState<string | null>(null);

  const featureUsageRange: FeatureUsageDateRange = useMemo(
    () => ({ granularity: featureUsageGranularity, value: featureUsageValue }),
    [featureUsageGranularity, featureUsageValue]
  );

  const featureUsagePeriodOptions = useMemo(() => {
    const now = new Date();
    if (featureUsageGranularity === "month") {
      return Array.from({ length: 24 }, (_, i) => {
        const d = subMonths(now, i);
        const value = format(d, "yyyy-MM");
        const label = format(d, "MMM yyyy");
        return { value, label };
      });
    }
    if (featureUsageGranularity === "week") {
      return Array.from({ length: 52 }, (_, i) => {
        const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
        const value = format(weekStart, "yyyy-MM-dd");
        const weekEnd = addDays(weekStart, 6);
        const label = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
        return { value, label };
      });
    }
    if (featureUsageGranularity === "year") {
      return Array.from({ length: 5 }, (_, i) => {
        const y = now.getFullYear() - i;
        return { value: String(y), label: String(y) };
      });
    }
    return [];
  }, [featureUsageGranularity]);

  const featureUsageDisplayLabel = useMemo(() => {
    const opt = featureUsagePeriodOptions.find((o) => o.value === featureUsageValue);
    return opt?.label ?? featureUsageValue;
  }, [featureUsagePeriodOptions, featureUsageValue]);

  const prevPeriodRange = useMemo(() => getPreviousFeatureUsagePeriod(featureUsageRange), [featureUsageRange]);
  const { data: usageMetrics, isLoading: usageLoading, isError: usageError } = useProductUsageMetrics();
  const { data: aarrrStages = [], isLoading: aarrrLoading, isError: aarrrError } = useAARRRMetrics();
  const { data: aarrrSparklineData = [] } = useOwnerAARRRTimeSeriesData("month", 6);
  const { data: aarrrTimeSeries = [], isLoading: aarrrTimeSeriesLoading } = useOwnerAARRRTimeSeriesData(aarrrGranularity, aarrrPeriodsBack);
  const { data: journeyTimeSeries = [], isLoading: journeyTimeSeriesLoading } = useOwnerAARRRTimeSeriesData(journeyGranularity, journeyPeriodsBack);
  const { data: featureData, isLoading: featureLoading, isError: featureError } = useFeatureUsageMetrics(featureUsageRange);
  const { data: prevFeatureData } = useFeatureUsageMetrics(prevPeriodRange);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const { data: userArchetypes = [], isLoading: archetypesLoading } = useUserArchetypes(featureData);
  const { data: personaTimeSeries } = useOwnerPersonaTimeSeries(6);
  const { data: featureByPersona = [] } = useFeatureUsageByPersona(featureUsageRange);
  const { data: frictionByPersona = [] } = useFrictionByPersona(featureUsageRange);

  const hasQueryError = usageError || aarrrError || featureError;

  const isLoading = usageLoading || aarrrLoading || featureLoading || archetypesLoading;
  const hasData = (usageMetrics?.totalUsers || 0) > 0
    || (usageMetrics?.activeSubscriptions || 0) > 0
    || aarrrStages.length > 0;

  // All useMemo must run before any early return (Rules of Hooks)
  const featureWithTrend = useMemo(() => {
    const curr = featureData?.featureUsage ?? [];
    const prevMap = new Map((prevFeatureData?.featureUsage ?? []).map((f) => [f.feature, f.count]));
    return curr.map((f) => {
      const prevCount = prevMap.get(f.feature) ?? 0;
      const trend = prevCount > 0 ? Math.round(((f.count - prevCount) / prevCount) * 100) : 0;
      return { ...f, trend };
    });
  }, [featureData?.featureUsage, prevFeatureData?.featureUsage]);

  const totalUsersSparkline = useMemo(() =>
    aarrrSparklineData.map((r) => ({ date: r.periodLabel, value: r.acquisition })),
    [aarrrSparklineData]
  );
  const activeSubsSparkline = useMemo(() =>
    aarrrSparklineData.map((r) => ({ date: r.periodLabel, value: r.retention })),
    [aarrrSparklineData]
  );
  const stickinessSparkline = useMemo(() => {
    if (aarrrSparklineData.length < 2) return [];
    return aarrrSparklineData.map((r) => ({
      date: r.periodLabel,
      value: r.activation > 0 ? Math.round((r.retention / r.activation) * 100) : 0,
    }));
  }, [aarrrSparklineData]);
  const weeklyGrowthSparkline = useMemo(() => {
    const ts = featureData?.featureUsageTimeSeries ?? [];
    if (ts.length < 14) return ts.map((r) => ({ date: r.dateLabel, value: r.total }));
    const weekly: { date: string; value: number }[] = [];
    for (let i = 0; i < ts.length - 6; i += 7) {
      const week = ts.slice(i, i + 7);
      const sum = week.reduce((s, d) => s + (d.total as number), 0);
      weekly.push({ date: week[0]?.dateLabel ?? "", value: sum });
    }
    return weekly;
  }, [featureData?.featureUsageTimeSeries]);
  const weeklyActiveGrowth = useMemo(() => {
    const ts = featureData?.featureUsageTimeSeries ?? [];
    if (ts.length < 14) return 0;
    const thisWeek = ts.slice(-7).reduce((s, d) => s + (d.total as number), 0);
    const lastWeek = ts.slice(-14, -7).reduce((s, d) => s + (d.total as number), 0);
    return lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;
  }, [featureData?.featureUsageTimeSeries]);
  const uxInsights = useMemo(() => {
    const insights: { text: string; type: "friction" | "underutilized" | "opportunity" | "neutral" }[] = [];
    const features = featureData?.featureUsage ?? [];
    const friction = featureData?.frictionPoints ?? [];
    const totalActions = features.reduce((s, f) => s + f.count, 0) || 1;
    const prevMap = new Map((prevFeatureData?.featureUsage ?? []).map((f) => [f.feature, f.count]));
    const topFriction = friction.slice(0, 2);
    topFriction.forEach((p) => {
      const totalFail = friction.reduce((s, x) => s + x.count, 0);
      const pct = totalFail > 0 ? Math.round((p.count / totalFail) * 100) : 0;
      insights.push({
        text: `High Friction: ${p.feature} has ${p.count} failed actions (${pct}% of failures) — Invest UX here`,
        type: "friction",
      });
    });
    featureWithTrend
      .filter((f) => f.trend < -5)
      .slice(0, 2)
      .forEach((f) => {
        insights.push({
          text: `Underutilized: ${f.feature} usage down ${Math.abs(f.trend)}% — needs better onboarding`,
          type: "underutilized",
        });
      });
    const highUsage = features.filter((f) => f.percentage >= 15);
    if (highUsage.length > 0 && friction.length === 0) {
      insights.push({
        text: `Strong performer: ${highUsage[0].feature} drives ${highUsage[0].percentage}% of actions — maintain quality`,
        type: "opportunity",
      });
    }
    if (insights.length === 0) {
      insights.push({ text: "Collect more audit log data to surface UX investment insights.", type: "neutral" });
    }
    return insights.slice(0, 4);
  }, [featureData, prevFeatureData, featureWithTrend]);
  const filteredInsights = useMemo(() => {
    if (!selectedFeature) return uxInsights;
    return uxInsights.filter((i) => i.text.toLowerCase().includes(selectedFeature.toLowerCase()));
  }, [uxInsights, selectedFeature]);

  // Persona tab: Executive summary + Feature-by-Persona chart data
  const personaExecutiveSummary = useMemo(() => {
    const byPersona = new Map<string, number>();
    featureByPersona.forEach(({ persona, count }) => {
      byPersona.set(persona, (byPersona.get(persona) ?? 0) + count);
    });
    const sorted = [...byPersona.entries()].sort((a, b) => b[1] - a[1]);
    const topPersona = sorted[0];
    const byFeature = new Map<string, number>();
    featureByPersona.forEach(({ feature, count }) => {
      byFeature.set(feature, (byFeature.get(feature) ?? 0) + count);
    });
    const topFeature = [...byFeature.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      topSegment: topPersona ? { name: topPersona[0], count: topPersona[1] } : null,
      topFeature: topFeature ? { name: topFeature[0], count: topFeature[1] } : null,
      totalPersonas: sorted.length,
    };
  }, [featureByPersona]);

  const featureByPersonaChartData = useMemo(() => {
    const personas = [...new Set(featureByPersona.map((p) => p.persona))];
    const features = [...new Set(featureByPersona.map((p) => p.feature))].slice(0, 6);
    return features.map((feature) => {
      const row: Record<string, string | number> = { feature };
      personas.forEach((p) => {
        const item = featureByPersona.find((x) => x.feature === feature && x.persona === p);
        row[p] = item?.count ?? 0;
      });
      return row;
    });
  }, [featureByPersona]);

  // Enrich archetypes with real data: Top Features, Least Used, Key Friction
  const enrichedArchetypes = useMemo(() => {
    return userArchetypes.map((archetype) => {
      const persona = archetype.businessType;
      const personaFeatures = featureByPersona
        .filter((x) => x.persona === persona)
        .sort((a, b) => b.count - a.count);
      const topFeatures = personaFeatures.slice(0, 3).map((x) => x.feature);
      const leastUsed = personaFeatures.length >= 2
        ? personaFeatures.slice(-2).map((x) => x.feature)
        : personaFeatures.length === 1 ? [] : [];

      const personaFrictions = frictionByPersona
        .filter((x) => x.persona === persona)
        .sort((a, b) => b.count - a.count);
      const topFriction = personaFrictions[0];
      const painPoint = topFriction
        ? `${topFriction.percentage}% of failures at ${topFriction.feature} (${topFriction.action})`
        : "No significant friction detected in this period";

      return {
        ...archetype,
        topFeatures: topFeatures.length > 0 ? topFeatures : archetype.topFeatures,
        leastUsedFeatures: leastUsed.length > 0 ? leastUsed : archetype.leastUsedFeatures,
        painPoint,
        demographics: "Based on usage data",
      };
    });
  }, [userArchetypes, featureByPersona, frictionByPersona]);

  // AARRR funnel from real data (customer → subscriptions → payment_transactions)
  const aarrFunnelData = aarrrStages.map((stage, index) => ({
    stage: stage.name,
    description: stage.description,
    icon: [Users, UserCheck, Repeat, DollarSign, Share2][index] || Users,
    value: stage.value,
    percentage: stage.percentage,
    change: 0
  }));

  // User Journey derived from AARRR funnel steps (same data, different view)
  const userJourneySteps = aarrFunnelData.length > 0
    ? aarrFunnelData.map((stage, index) => ({
      step: stage.stage,
      users: stage.value,
      dropoff: index > 0 && aarrFunnelData[index - 1].value > 0
        ? Math.max(0, Math.round((1 - stage.value / aarrFunnelData[index - 1].value) * 100))
        : 0,
    }))
    : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground mt-4 font-mono text-sm tracking-wider animate-pulse">Initializing Analytics Core...</p>
      </div>
    );
  }

  // Error state — prevents white screen when queries fail (RLS, missing tables, etc.)
  if (hasQueryError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-destructive/20">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight">Failed to Load Analytics</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Unable to fetch product usage data. This may be due to database permissions (RLS) or missing tables. Check the browser console for details.
        </p>
        <div className="flex gap-3">
          <Button variant="default" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
          <Button variant="outline" onClick={() => navigate("/owner/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-lg shadow-primary/5">
          <Database className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight">No Usage Data Detected</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The analytics engine requires initial data seeding. Please execute <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono text-xs">sample-data.sql</code> in the Supabase SQL Editor.
        </p>
        <Button variant="default" size="lg" onClick={() => window.open("https://supabase.com/dashboard", "_blank")} className="shadow-lg shadow-primary/25">
          Open Database Console
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Product Usage
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Actionable UX insights, AARRR funnel, journey & persona
            </p>
          </div>

        </div>

        <Tabs defaultValue="ux-insights" className="space-y-6">
          <TabsList className="inline-flex h-10 w-full sm:w-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-xl">
            <TabsTrigger value="ux-insights" className="px-4 sm:px-6 text-sm rounded-lg">UX Insights</TabsTrigger>
            <TabsTrigger value="aarrr" className="px-4 sm:px-6 text-sm rounded-lg">AARRR</TabsTrigger>
            <TabsTrigger value="journey" className="px-4 sm:px-6 text-sm rounded-lg">Journey</TabsTrigger>
            <TabsTrigger value="persona" className="px-4 sm:px-6 text-sm rounded-lg">Persona</TabsTrigger>
          </TabsList>

        {/* UX Insights Tab */}
        <TabsContent value="ux-insights" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            <Select
              value={featureUsageGranularity}
              onValueChange={(v) => {
                setFeatureUsageGranularity(v as FeatureUsageGranularity);
                const now = new Date();
                if (v === "month") setFeatureUsageValue(format(now, "yyyy-MM"));
                else if (v === "week") setFeatureUsageValue(format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"));
                else if (v === "year") setFeatureUsageValue(format(now, "yyyy"));
              }}
            >
              <SelectTrigger className="w-[120px] h-8 border-gray-200 dark:border-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">By month</SelectItem>
                <SelectItem value="week">By week</SelectItem>
                <SelectItem value="year">By year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={featureUsageValue} onValueChange={setFeatureUsageValue}>
              <SelectTrigger className="w-[140px] h-8 border-gray-200 dark:border-gray-800">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {featureUsagePeriodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        {/* Top row: 4 KPI cards with sparklines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-mono font-semibold text-foreground mt-1 tracking-tight">
              {usageMetrics?.totalUsers?.toLocaleString() ?? "0"}
            </p>
            <div className="mt-2 h-10">
              {totalUsersSparkline.length >= 2 && (
                <Sparkline data={totalUsersSparkline} height={36} strokeColor="#06b6d4" />
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Subs</p>
            <p className="text-2xl font-mono font-semibold text-foreground mt-1 tracking-tight">
              {usageMetrics?.activeSubscriptions?.toLocaleString() ?? "0"}
            </p>
            <div className="mt-2 h-10">
              {activeSubsSparkline.length >= 2 && (
                <Sparkline data={activeSubsSparkline} height={36} strokeColor="#06b6d4" />
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Stickiness (DAU/MAU)</p>
            <p className="text-2xl font-mono font-semibold text-foreground mt-1 tracking-tight">
              {usageMetrics?.dauMauRatio ?? 0}%
            </p>
            <div className="mt-2 h-10">
              {stickinessSparkline.length >= 2 && (
                <Sparkline data={stickinessSparkline} height={36} strokeColor="#06b6d4" />
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Weekly Active Growth</p>
            <p className={cn(
              "text-2xl font-mono font-semibold mt-1 tracking-tight",
              weeklyActiveGrowth >= 0 ? "text-cyan-600 dark:text-cyan-400" : "text-red-600 dark:text-red-400"
            )}>
              {weeklyActiveGrowth >= 0 ? "+" : ""}{weeklyActiveGrowth}%
            </p>
            <div className="mt-2 h-10">
              {weeklyGrowthSparkline.length >= 2 && (
                <Sparkline data={weeklyGrowthSparkline} height={36} strokeColor="#06b6d4" />
              )}
            </div>
          </div>
        </div>

        {/* Main section: Feature Leaderboard (60%) + UX Investment Radar (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-base font-semibold tracking-tight text-foreground mb-4">
                Feature Leaderboard — {featureUsageDisplayLabel}
              </h3>
              {!featureData?.featureUsage?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                  <BarChart3 className="h-10 w-10 mb-2 opacity-40" />
                  <p>No audit log data yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {featureWithTrend.map((item, i) => {
                    const maxCount = featureWithTrend[0]?.count ?? 1;
                    const pctWidth = (item.count / maxCount) * 100;
                    const isSelected = selectedFeature === item.feature;
                    return (
                      <div
                        key={item.featureKey}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedFeature(isSelected ? null : item.feature)}
                        onKeyDown={(e) => e.key === "Enter" && setSelectedFeature(isSelected ? null : item.feature)}
                        className={cn(
                          "relative flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-colors",
                          isSelected ? "bg-cyan-50 dark:bg-cyan-950/30 ring-1 ring-cyan-200 dark:ring-cyan-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                      >
                        <div className="absolute inset-0 left-0 top-0 bottom-0 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/5" style={{ width: `${pctWidth}%` }} />
                        <div className="relative z-10 flex flex-1 min-w-0 items-center justify-between gap-3">
                          <span className="text-sm font-medium text-foreground truncate">{item.feature}</span>
                          <div className="flex items-center gap-4 shrink-0">
                            <span className="text-xs font-mono text-muted-foreground tabular-nums w-16 text-right">
                              {item.count.toLocaleString()}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground tabular-nums w-12 text-right">
                              {item.percentage}%
                            </span>
                            <span className={cn(
                              "text-xs font-mono tabular-nums w-12 text-right",
                              item.trend > 0 ? "text-emerald-600 dark:text-emerald-400" : item.trend < 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                            )}>
                              {item.trend > 0 ? `+${item.trend}%` : item.trend < 0 ? `${item.trend}%` : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm h-full">
              <h3 className="text-base font-semibold tracking-tight text-foreground mb-1 flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                UX Investment Radar
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {selectedFeature ? `Filtered by ${selectedFeature}` : "Data-driven insights"}
              </p>
              <ul className="space-y-3">
                {(filteredInsights.length > 0 ? filteredInsights : uxInsights).map((insight, i) => (
                  <li
                    key={i}
                    className={cn(
                      "text-sm flex items-start gap-2",
                      insight.type === "friction" && "text-amber-700 dark:text-amber-400",
                      insight.type === "underutilized" && "text-red-600 dark:text-red-400",
                      insight.type === "opportunity" && "text-emerald-600 dark:text-emerald-400",
                      insight.type === "neutral" && "text-muted-foreground"
                    )}
                  >
                    <span className="text-cyan-500 mt-0.5">•</span>
                    <span>{insight.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        </TabsContent>

        {/* AARRR Tab */}
        <TabsContent value="aarrr" className="space-y-6 mt-6">
          <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                  AARRR Funnel
                </CardTitle>
                <CardDescription>
                  User progression from Acquisition → Activation → Retention → Revenue → Referral
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Select
                  value={aarrrGranularity}
                  onValueChange={(v) => {
                    setAarrrGranularity(v as AARRRGranularity);
                    const defaults: Record<AARRRGranularity, number> = { month: 6, week: 8, year: 3 };
                    setAarrrPeriodsBack(defaults[v as AARRRGranularity]);
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="View by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={String(aarrrPeriodsBack)} onValueChange={(v) => setAarrrPeriodsBack(Number(v))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {aarrrGranularity === "month" && (
                      <>
                        <SelectItem value="3">Last 3 months</SelectItem>
                        <SelectItem value="6">Last 6 months</SelectItem>
                        <SelectItem value="12">Last 12 months</SelectItem>
                      </>
                    )}
                    {aarrrGranularity === "week" && (
                      <>
                        <SelectItem value="4">Last 4 weeks</SelectItem>
                        <SelectItem value="8">Last 8 weeks</SelectItem>
                        <SelectItem value="12">Last 12 weeks</SelectItem>
                      </>
                    )}
                    {aarrrGranularity === "year" && (
                      <>
                        <SelectItem value="2">Last 2 years</SelectItem>
                        <SelectItem value="3">Last 3 years</SelectItem>
                        <SelectItem value="5">Last 5 years</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {aarrFunnelData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
                  <BarChart3 className="h-12 w-12 mb-3 opacity-40" />
                  No AARRR data — run migration seed or add customer/subscriptions data
                </div>
              ) : (
                <AARRRFunnelChart
                  stages={aarrFunnelData.map((item) => ({ name: item.stage, value: item.value }))}
                  topVal={aarrFunnelData[0]?.value || 1}
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Acquisition & Activation</CardTitle>
              <CardDescription>
                New customers and subscribers ({aarrrGranularity === "month" ? `${aarrrPeriodsBack} months` : aarrrGranularity === "week" ? `${aarrrPeriodsBack} weeks` : `${aarrrPeriodsBack} years`})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                {aarrrTimeSeriesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : aarrrTimeSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={aarrrTimeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                      <XAxis dataKey="periodLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => (v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v))}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => (v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v))}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                        formatter={(value: number) => value.toLocaleString()}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="acquisition" name="Acquisition" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="activation" name="Activation" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <BarChart3 className="h-10 w-10 mb-2 opacity-40" />
                    <p className="text-sm">No time series data yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Retention, Revenue & Referral</CardTitle>
              <CardDescription>
                Retained users, paying customers, and referrals ({aarrrGranularity === "month" ? `${aarrrPeriodsBack} months` : aarrrGranularity === "week" ? `${aarrrPeriodsBack} weeks` : `${aarrrPeriodsBack} years`})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full">
                {aarrrTimeSeriesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : aarrrTimeSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aarrrTimeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                      <XAxis dataKey="periodLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => (v >= 1_000 ? `${(v / 1_000).toFixed(1)}K` : String(v))}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                        formatter={(value: number) => value.toLocaleString()}
                      />
                      <Legend />
                      <Bar dataKey="retention" name="Retention" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" name="Revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="referral" name="Referral" fill="#be185d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <BarChart3 className="h-10 w-10 mb-2 opacity-40" />
                    <p className="text-sm">No time series data yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Journey Tab */}
        <TabsContent value="journey" className="space-y-6 mt-6">
          {/* Journey over time — selectable month/week/year */}
          <Card className="border-0 shadow-none">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-600" />
                  Journey Over Time
                </CardTitle>
                <CardDescription>
                  User progression by period — Acquisition, Activation, Retention, Revenue, Referral
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Select
                  value={journeyGranularity}
                  onValueChange={(v) => {
                    setJourneyGranularity(v as AARRRGranularity);
                    const defaults: Record<AARRRGranularity, number> = { month: 6, week: 8, year: 3 };
                    setJourneyPeriodsBack(defaults[v as AARRRGranularity]);
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="View by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={String(journeyPeriodsBack)} onValueChange={(v) => setJourneyPeriodsBack(Number(v))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {journeyGranularity === "month" && (
                      <>
                        <SelectItem value="3">Last 3 months</SelectItem>
                        <SelectItem value="6">Last 6 months</SelectItem>
                        <SelectItem value="12">Last 12 months</SelectItem>
                      </>
                    )}
                    {journeyGranularity === "week" && (
                      <>
                        <SelectItem value="4">Last 4 weeks</SelectItem>
                        <SelectItem value="8">Last 8 weeks</SelectItem>
                        <SelectItem value="12">Last 12 weeks</SelectItem>
                      </>
                    )}
                    {journeyGranularity === "year" && (
                      <>
                        <SelectItem value="2">Last 2 years</SelectItem>
                        <SelectItem value="3">Last 3 years</SelectItem>
                        <SelectItem value="5">Last 5 years</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {journeyTimeSeriesLoading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : journeyTimeSeries.length > 0 ? (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={journeyTimeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                      <XAxis dataKey="periodLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => (v >= 1_000 ? `${(v / 1_000).toFixed(1)}K` : String(v))}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                        formatter={(value: number) => value.toLocaleString()}
                      />
                      <Legend />
                      <Bar dataKey="acquisition" name="Acquisition" fill={AARRR_STAGE_COLORS[0].main} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="activation" name="Activation" fill={AARRR_STAGE_COLORS[1].main} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="retention" name="Retention" fill={AARRR_STAGE_COLORS[2].main} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" name="Revenue" fill={AARRR_STAGE_COLORS[3].main} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="referral" name="Referral" fill={AARRR_STAGE_COLORS[4].main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mb-2 opacity-40" />
                  <p className="text-sm">No time series data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">User Journey Map (Current Snapshot)</CardTitle>
              <CardDescription>
                Track user progression from signup to active usage — funnel view with conversion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userJourneySteps.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Awaiting data stream...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Chart: Horizontal funnel bar chart */}
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userJourneySteps.map((s, i) => ({
                          name: s.step,
                          users: s.users,
                          dropoff: s.dropoff,
                          fill: AARRR_STAGE_COLORS[i % AARRR_STAGE_COLORS.length].main,
                          pctOfTop: ((s.users / (userJourneySteps[0]?.users || 1)) * 100).toFixed(1),
                        }))}
                        layout="vertical"
                        margin={{ top: 8, right: 24, left: 100, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.6} />
                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          tickFormatter={(v) => (v >= 1_000 ? `${(v / 1_000).toFixed(1)}K` : String(v))}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={90}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 600 }}
                          tickFormatter={(v) => v.toUpperCase()}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border))",
                            backgroundColor: "hsl(var(--card))",
                            fontSize: "12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value: number, _name: string, props: { payload: { users: number; dropoff: number; pctOfTop: string } }) => [
                            `${value.toLocaleString()} users (${props.payload.pctOfTop}% of top)`,
                            "Users",
                          ]}
                          labelFormatter={(label) => `Stage: ${label}`}
                          content={({ active, payload }) => {
                            if (!active || !payload?.[0]) return null;
                            const p = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-card p-3 shadow-md">
                                <p className="font-semibold text-sm mb-1">{p.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {p.users.toLocaleString()} users · {p.pctOfTop}% of Acquisition
                                </p>
                                {p.dropoff > 0 && (
                                  <p className="text-xs text-destructive font-medium mt-1">-{p.dropoff}% dropoff from previous</p>
                                )}
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="users"
                          name="Users"
                          radius={[0, 6, 6, 0]}
                          maxBarSize={36}
                          label={{ position: "right", formatter: (v: number) => v.toLocaleString(), fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        >
                          {userJourneySteps.map((_, i) => (
                            <Cell key={i} fill={AARRR_STAGE_COLORS[i % AARRR_STAGE_COLORS.length].main} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Conversion flow: compact step cards */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {userJourneySteps.map((step, index) => {
                      const Icon = AARRR_CATEGORY_ICONS[step.step] ?? Info;
                      const color = AARRR_STAGE_COLORS[index % AARRR_STAGE_COLORS.length];
                      const pctOfTop = ((step.users / (userJourneySteps[0]?.users || 1)) * 100);
                      return (
                        <div
                          key={step.step}
                          className="rounded-xl p-4 bg-card/50 hover:bg-card transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg"
                              style={{ backgroundColor: color.light }}
                            >
                              <Icon className="h-4 w-4" style={{ color: color.main }} strokeWidth={2} />
                            </div>
                            <span className="font-semibold text-sm uppercase tracking-wide text-foreground">
                              {step.step}
                            </span>
                          </div>
                          <p className="text-2xl font-bold tabular-nums text-foreground">{step.users.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{pctOfTop.toFixed(1)}% of Acquisition</p>
                          {step.dropoff > 0 && (
                            <Badge variant="outline" className="mt-2 text-destructive border-destructive/30 bg-destructive/5">
                              -{step.dropoff}% from prev
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Persona Tab — Executive-friendly: Persona overview, trends, top features */}
        <TabsContent value="persona" className="space-y-6 mt-6">
          {/* Period selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            <Select
              value={featureUsageGranularity}
              onValueChange={(v) => {
                setFeatureUsageGranularity(v as FeatureUsageGranularity);
                const now = new Date();
                if (v === "month") setFeatureUsageValue(format(now, "yyyy-MM"));
                else if (v === "week") setFeatureUsageValue(format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"));
                else if (v === "year") setFeatureUsageValue(format(now, "yyyy"));
              }}
            >
              <SelectTrigger className="w-[120px] h-8 border-gray-200 dark:border-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">By month</SelectItem>
                <SelectItem value="week">By week</SelectItem>
                <SelectItem value="year">By year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={featureUsageValue} onValueChange={setFeatureUsageValue}>
              <SelectTrigger className="w-[140px] h-8 border-gray-200 dark:border-gray-800">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {featureUsagePeriodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Executive Summary — Large, scannable numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-emerald-500 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Most Active Segment</p>
                <p className="text-2xl font-bold text-foreground mt-2 tracking-tight">
                  {personaExecutiveSummary.topSegment?.name ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {personaExecutiveSummary.topSegment?.count.toLocaleString() ?? 0} actions this period
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-indigo-500 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Feature</p>
                <p className="text-2xl font-bold text-foreground mt-2 tracking-tight">
                  {personaExecutiveSummary.topFeature?.name ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {personaExecutiveSummary.topFeature?.count.toLocaleString() ?? 0} uses this period
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Segments</p>
                <p className="text-2xl font-bold text-foreground mt-2 tracking-tight">
                  {personaExecutiveSummary.totalPersonas}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Personas using Buzzly
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 1. Persona Overview — Radar Chart */}
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                Persona Overview
              </CardTitle>
              <CardDescription className="text-sm">
                Compare segments by Retention, Feature Depth, LTV. Click legend to toggle, hover to highlight.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {userArchetypes.length > 0 ? (
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={[
                        { subject: "Retention", fullMark: 100, ...Object.fromEntries(userArchetypes.map((a, i) => [`archetype_${i}`, a.radarMetrics.retention])) },
                        { subject: "Feature Depth", fullMark: 100, ...Object.fromEntries(userArchetypes.map((a, i) => [`archetype_${i}`, a.radarMetrics.featureDepth])) },
                        { subject: "LTV", fullMark: 100, ...Object.fromEntries(userArchetypes.map((a, i) => [`archetype_${i}`, a.radarMetrics.ltv])) },
                      ]}
                      margin={{ top: 24, right: 48, bottom: 24, left: 48 }}
                    >
                      <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickLine={false}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        tickCount={5}
                      />
                      {userArchetypes.map((a, i) => {
                        const isVisible = radarVisible[a.id] !== false;
                        const isHighlighted = radarHovered === a.id || (radarHovered === null && isVisible);
                        const color = PERSONA_SEGMENT_COLORS[a.businessType] ?? SEGMENT_COLOR_FALLBACK;
                        if (!isVisible) return null;
                        return (
                          <Radar
                            key={a.id}
                            name={a.displayName}
                            dataKey={`archetype_${i}`}
                            stroke={color}
                            fill={color}
                            fillOpacity={radarHovered === null ? 0.25 : isHighlighted ? 0.35 : 0.08}
                            strokeWidth={isHighlighted ? 3 : 1.5}
                            strokeOpacity={isHighlighted ? 1 : 0.4}
                          />
                        );
                      })}
                      <Legend
                        wrapperStyle={{ paddingTop: 16 }}
                        content={({ payload }) => (
                          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            {payload?.map((entry) => {
                              const archetype = userArchetypes.find((a) => a.displayName === entry.value);
                              const id = archetype?.id ?? entry.value;
                              const isVisible = radarVisible[id] !== false;
                              const isHovered = radarHovered === id;
                              const color = archetype ? (PERSONA_SEGMENT_COLORS[archetype.businessType] ?? SEGMENT_COLOR_FALLBACK) : entry.color;
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  className={cn(
                                    "inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                                    !isVisible && "opacity-40 line-through",
                                    isHovered && "ring-1 ring-offset-1"
                                  )}
                                  style={{
                                    color: isVisible ? color : "hsl(var(--muted-foreground))",
                                    backgroundColor: isHovered ? `${color}15` : "transparent",
                                  }}
                                  onClick={() => setRadarVisible((prev) => ({ ...prev, [id]: !isVisible }))}
                                  onMouseEnter={() => setRadarHovered(id)}
                                  onMouseLeave={() => setRadarHovered(null)}
                                >
                                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                                  {entry.value}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                        formatter={(value: number) => [`${value}%`, ""]}
                        labelFormatter={(label) => label}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Target className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No archetype data yet</p>
                  <p className="text-xs mt-1">Workspaces with business type set will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Persona Trend */}
          {personaTimeSeries?.businessType && personaTimeSeries.businessType.length > 0 && (
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Persona Trend
                </CardTitle>
                <CardDescription className="text-sm">
                  Activity over time. Each line = one persona. See who is rising or falling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={personaTimeSeries.businessType}
                      margin={{ top: 16, right: 24, bottom: 16, left: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => format(parseISO(v), "MMM d")}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "10px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "13px", padding: "12px 16px" }}
                        labelFormatter={(v) => format(parseISO(v), "MMM d, yyyy")}
                        formatter={(value: number) => [value.toLocaleString(), ""]}
                      />
                      <Legend />
                      {["Small Business", "Agency", "Enterprise", "Freelancer", "Other"].map((key) => {
                        const color = PERSONA_SEGMENT_COLORS[key] ?? SEGMENT_COLOR_FALLBACK;
                        return (
                          <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={key}
                            stroke={color}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 2 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. Feature Usage by Persona */}
          {featureByPersonaChartData.length > 0 && (
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Feature Usage by Persona
                </CardTitle>
                <CardDescription className="text-sm">
                  {featureUsageDisplayLabel} — Which segments use which features most.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={featureByPersonaChartData}
                      margin={{ top: 16, right: 32, bottom: 16, left: 16 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
                      />
                      <YAxis
                        type="category"
                        dataKey="feature"
                        width={130}
                        tick={{ fontSize: 12, fill: "hsl(var(--foreground))", fontWeight: 500 }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "10px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "13px", padding: "12px 16px" }}
                        formatter={(value: number) => [value.toLocaleString(), ""]}
                      />
                      <Legend />
                      {(["Small Business", "Agency", "Enterprise", "Freelancer", "Other"] as const)
                        .filter((p) => featureByPersona.some((x) => x.persona === p))
                        .map((persona) => {
                          const color = PERSONA_SEGMENT_COLORS[persona] ?? SEGMENT_COLOR_FALLBACK;
                          return (
                            <Bar
                              key={persona}
                              dataKey={persona}
                              name={persona}
                              stackId="a"
                              fill={color}
                              radius={[0, 0, 0, 0]}
                            />
                          );
                        })}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 4. Feature Usage Trend */}
          {featureData?.featureUsageTimeSeries && featureData.featureUsageTimeSeries.length > 0 && (
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Feature Usage Trend
                </CardTitle>
                <CardDescription className="text-sm">
                  Daily engagement. See which features gain traction over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={featureData.featureUsageTimeSeries}
                      margin={{ top: 16, right: 24, bottom: 16, left: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="dateLabel"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => (Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : String(v))}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "10px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "13px", padding: "12px 16px" }}
                        formatter={(value: number) => [value.toLocaleString(), ""]}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      {featureData.featureUsage?.slice(0, 4).map((f, i) => {
                        const colors = ["#059669", "#4f46e5", "#d97706", "#64748b"];
                        return (
                          <Line
                            key={f.feature}
                            type="monotone"
                            dataKey={f.feature}
                            name={f.feature}
                            stroke={colors[i % 4]}
                            strokeWidth={1.5}
                            dot={false}
                            strokeDasharray={i === 0 ? undefined : "4 2"}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Persona Spotlight — Real data from usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {enrichedArchetypes.map((archetype, idx) => {
              const IconMap = [Briefcase, Zap, Building2, User] as const;
              const Icon = IconMap[idx % 4] ?? Sparkles;
              const accentColor = PERSONA_SEGMENT_COLORS[archetype.businessType] ?? SEGMENT_COLOR_FALLBACK;
              const hasFriction = !archetype.painPoint.startsWith("No significant");
              const topFeaturesStr = archetype.topFeatures.slice(0, 3).join(", ") || "—";
              const leastUsedStr = archetype.leastUsedFeatures.slice(0, 2).join(", ") || "—";
              return (
                <Card
                  key={archetype.id}
                  className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-1" style={{ backgroundColor: accentColor }} />
                  <CardHeader className="pb-2 pt-5">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${accentColor}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: accentColor }} strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-semibold leading-tight text-foreground">
                          {archetype.displayName}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1 font-medium">
                          {archetype.count} workspaces · {archetype.percentage}%
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0 pb-5">
                    <div
                      className={cn(
                        "rounded-lg p-3",
                        hasFriction
                          ? "bg-amber-50 dark:bg-amber-950/25 border border-amber-200/50 dark:border-amber-900/40"
                          : "bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200/50 dark:border-emerald-900/40"
                      )}
                    >
                      <p className={cn(
                        "text-xs font-semibold uppercase tracking-wider mb-1",
                        hasFriction ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
                      )}>
                        Key Friction
                      </p>
                      <p className={cn(
                        "text-sm leading-snug",
                        hasFriction ? "text-amber-800 dark:text-amber-300" : "text-emerald-800 dark:text-emerald-300"
                      )}>
                        {archetype.painPoint}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Top Features
                      </p>
                      <p className="text-sm text-foreground font-medium">{topFeaturesStr}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Least Used
                      </p>
                      <p className="text-sm text-muted-foreground">{leastUsedStr}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {enrichedArchetypes.length === 0 && (
            <Card className="border border-dashed border-gray-300 dark:border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-sm font-medium">No user archetypes yet</p>
                <p className="text-xs mt-1">Set business type on workspaces to see segment-based personas.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
