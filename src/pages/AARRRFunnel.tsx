import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PlanRestrictedPage } from "@/components/PlanRestrictedPage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  ClipboardCheck,
  DollarSign,
  TrendingUp,
  Info,
  Loader2,
  LayoutGrid,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { useFunnelData } from "@/hooks/useFunnelData";
import { useAARRRMonthlyData } from "@/hooks/useAARRRMonthlyData";
import { cn } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────────

const STAGE_COLORS = [
  { main: "#0d9488", light: "#0d948820", gradient: "from-teal-500 to-teal-600" }, // Acquisition
  { main: "#2563eb", light: "#2563eb20", gradient: "from-blue-500 to-blue-600" }, // Activation
  { main: "#7c3aed", light: "#7c3aed20", gradient: "from-violet-500 to-violet-600" }, // Retention
  { main: "#d97706", light: "#d9770620", gradient: "from-amber-500 to-amber-600" }, // Revenue
  { main: "#be185d", light: "#be185d20", gradient: "from-pink-500 to-pink-600" }, // Referral
];

const DEMO_FUNNEL_DATA = [
  { name: "Acquisition", value: 10000 },
  { name: "Activation", value: 4200 },
  { name: "Retention", value: 2100 },
  { name: "Revenue", value: 580 },
  { name: "Referral", value: 320 },
];

const DISPLAY_ORDER = ["Acquisition", "Activation", "Retention", "Revenue", "Referral"];

const PERIOD_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] as const;

const CATEGORY_ICONS: Record<string, typeof Search> = {
  Acquisition: Search,
  Activation: Users,
  Retention: ClipboardCheck,
  Revenue: DollarSign,
  Referral: TrendingUp,
};

// ── Mixed Funnel: gradient bars + conversion + metrics ──────────────────────────

type FunnelStage = { name: string; value: number };

const MixedFunnelCard = ({
  stages,
  topVal,
}: {
  stages: FunnelStage[];
  topVal: number;
}) => {
  // Scale lower stages (Activation→Referral) relative to their own max,
  // so Activation > Retention > Revenue/Referral are visually distinct
  const maxLower = stages.length > 1
    ? Math.max(...stages.slice(1).map((s) => s.value), 1)
    : 1;
  const LOWER_STAGES_MAX_PCT = 72; // lower stages cap at 72% of bar width

  return (
    <div className="relative w-full space-y-0 py-1">
      {stages.map((stage, i) => {
        const Icon = CATEGORY_ICONS[stage.name] ?? Info;
        const color = STAGE_COLORS[i % STAGE_COLORS.length];
        const widthPct =
          i === 0
            ? 100
            : maxLower > 0
              ? Math.max(6, (stage.value / maxLower) * LOWER_STAGES_MAX_PCT)
              : 6;
        const prevVal = i > 0 ? stages[i - 1].value : stage.value;
        const convPct =
          i > 0 && prevVal > 0 ? ((stage.value / prevVal) * 100).toFixed(2) : null;
        const pctValue = (stage.value / topVal) * 100;
        const pctOfTopDisplay =
          pctValue > 0 && pctValue < 0.1 ? "< 0.1" : pctValue.toFixed(1);

        return (
          <div key={stage.name}>
            {/* Conversion connector (↳ X% converted) */}
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

            {/* Stage row: icon + name | gradient bar | conv badge | big number + % */}
            <div
              className="group flex items-center gap-4 py-3 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              {/* Left: Icon + Stage name */}
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

              {/* Middle: Gradient funnel bar */}
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
                    <span className="text-xs font-bold text-white drop-shadow-sm truncate">
                      {stage.name}
                    </span>
                    <span className="text-xs font-bold text-white/95 tabular-nums shrink-0">
                      {stage.value.toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Conversion badge */}
                <span className="shrink-0 w-11 text-center rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                  {convPct ?? "—"}
                </span>
              </div>

              {/* Right: Big number + % of total */}
              <div className="shrink-0 text-right w-28 sm:w-32">
                <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                  {stage.value.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {pctOfTopDisplay}% of total
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Main dashboard ─────────────────────────────────────────────────────────────

function AARRRDashboardContent() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const { data: adAccounts = [] } = useQuery({
    queryKey: ["ad-accounts-active-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_accounts")
        .select("id, account_name, platform_id, is_active")
        .eq("is_active", true)
        .order("account_name");
      if (error) throw error;
      return data || [];
    },
  });

  const platformIdFilter = selectedPlatform === "all" ? undefined : selectedPlatform;
  const { aarrrCategories, isLoading } = useFunnelData(period, platformIdFilter);
  const { monthlyData, isLoading: monthlyLoading } = useAARRRMonthlyData(6, platformIdFilter);

  const uniquePlatformOptions = useMemo(() => {
    const seen = new Set<string>();
    return adAccounts.filter((acc) => {
      const pid = acc.platform_id ?? acc.id;
      if (seen.has(pid)) return false;
      seen.add(pid);
      return true;
    });
  }, [adAccounts]);

  const { stages, isDemo } = useMemo(() => {
    if (aarrrCategories.length === 0) {
      return { stages: DEMO_FUNNEL_DATA, isDemo: true };
    }

    const byName = Object.fromEntries(aarrrCategories.map((c) => [c.name, c]));
    const ordered = DISPLAY_ORDER.map((n) => byName[n]).filter(Boolean);
    const total = ordered[0]?.value ?? 0;

    if (total === 0) {
      return { stages: DEMO_FUNNEL_DATA, isDemo: true };
    }

    return {
      stages: ordered.map((c) => ({ name: c.name, value: c.value ?? 0 })),
      isDemo: false,
    };
  }, [aarrrCategories]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-slate-50 dark:bg-slate-950">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/50 dark:to-blue-900/50 flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-teal-600 dark:text-teal-400" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-3xl blur-xl animate-pulse" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          Loading funnel data…
        </p>
      </div>
    );
  }

  const topVal = stages[0]?.value || 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-[1600px] mx-auto px-4 md:p-6 lg:p-8 py-10">
        {/* ── Header ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AARRR Funnel
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {topVal.toLocaleString()} total entrants
              {isDemo && (
                <span className="ml-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                  Demo
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {uniquePlatformOptions.length > 0 && (
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[180px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100">
                  <LayoutGrid className="h-3.5 w-3.5 mr-1.5 text-slate-500 shrink-0" />
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <SelectItem value="all" className="text-sm text-slate-700 dark:text-slate-300">
                    All Platforms
                  </SelectItem>
                  {uniquePlatformOptions.map((acc) => (
                    <SelectItem key={acc.id} value={acc.platform_id ?? acc.id} className="text-sm text-slate-700 dark:text-slate-300">
                      {acc.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger className="w-[148px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                {PERIOD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-sm text-slate-700 dark:text-slate-300">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Mixed Funnel: gradient bars + conversion + metrics in one card ── */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900/80 dark:via-slate-900 dark:to-slate-900/80 shadow-lg shadow-slate-200/50 dark:shadow-none p-6 md:p-8 max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                Funnel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Conversion flow from top to bottom
              </p>
            </div>
            <div className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {stages.length} stages
            </div>
          </div>
          <div className="min-h-[380px]">
            <MixedFunnelCard stages={stages} topVal={topVal} />
          </div>
        </div>

        {/* Monthly Comparison — split by scale for clarity */}
        <div className="mt-8 space-y-6">
          {/* Chart 1: Acquisition & Activation (high volume) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900/80 dark:via-slate-900 dark:to-slate-900/80 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Monthly Comparison — Acquisition & Activation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Impressions & clicks — top of funnel
              </p>
            </div>
            <div className="p-4 md:p-6">
              <div className="h-[260px] w-full">
                {monthlyLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                      <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) =>
                          v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v)
                        }
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) =>
                          v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v)
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--card))",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => value.toLocaleString()}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="acquisition" name="Acquisition" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="activation" name="Activation" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <BarChart3 className="h-10 w-10 mb-2 opacity-40" />
                    <p className="text-sm">No monthly data yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart 2: Retention, Revenue & Referral (lower volume) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-900/80 dark:via-slate-900 dark:to-slate-900/80 shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Monthly Comparison — Retention, Revenue & Referral
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Leads, conversions & referrals — bottom of funnel
              </p>
            </div>
            <div className="p-4 md:p-6">
              <div className="h-[260px] w-full">
                {monthlyLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                      <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v) => (v >= 1_000 ? `${(v / 1_000).toFixed(1)}K` : String(v))}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--card))",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => value.toLocaleString()}
                      />
                      <Legend />
                      <Bar dataKey="retention" name="Retention" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" name="Revenue" fill="#d97706" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="referral" name="Referral" fill="#be185d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <BarChart3 className="h-10 w-10 mb-2 opacity-40" />
                    <p className="text-sm">No monthly data yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────────

export default function InteractiveAARRR() {
  return (
    <PlanRestrictedPage requiredFeature="advancedAnalytics">
      <AARRRDashboardContent />
    </PlanRestrictedPage>
  );
}
