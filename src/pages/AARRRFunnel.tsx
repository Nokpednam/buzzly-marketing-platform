import { useMemo, useState } from "react";
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
} from "lucide-react";
import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useFunnelData } from "@/hooks/useFunnelData";
import { cn } from "@/lib/utils";

interface StageVisual {
  icon: typeof Search;
  description: string;
}

const categoryVisuals: Record<string, StageVisual> = {
  Acquisition: { icon: Search, description: "New sign-ups" },
  Activation: { icon: Users, description: "Completed onboarding" },
  Retention: { icon: ClipboardCheck, description: "Active for 30+ days" },
  Referral: { icon: TrendingUp, description: "Invited a friend" },
  Revenue: { icon: DollarSign, description: "Paid subscribers" },
};

// Funnel segment colors for Recharts (teal → blue → indigo → purple → slate)
const FUNNEL_COLORS = [
  "#0d9488", // teal
  "#0284c7", // blue
  "#4f46e5", // indigo
  "#7c3aed", // purple
  "#64748b", // slate
];

// Demo data when no real data
const DEMO_FUNNEL_DATA = [
  { name: "Acquisition", value: 10000, fill: FUNNEL_COLORS[0] },
  { name: "Activation", value: 4200, fill: FUNNEL_COLORS[1] },
  { name: "Retention", value: 2100, fill: FUNNEL_COLORS[2] },
  { name: "Referral", value: 580, fill: FUNNEL_COLORS[3] },
  { name: "Revenue", value: 320, fill: FUNNEL_COLORS[4] },
];

const PERIOD_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] as const;

function AARRRDashboardContent() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const { aarrrCategories, isLoading } = useFunnelData(period);

  const { chartData, processedStages, totalEntrants, isDemo } = useMemo(() => {
    if (aarrrCategories.length === 0) {
      return {
        chartData: DEMO_FUNNEL_DATA,
        processedStages: [],
        totalEntrants: 10000,
        isDemo: true,
      };
    }

    const stages = aarrrCategories.map((cat, index) => {
      const visuals = categoryVisuals[cat.name] ?? {
        icon: Info,
        description: cat.description ?? "",
      };
      const nextStage = aarrrCategories[index + 1];
      const value = cat.value ?? 0;
      const nextValue = nextStage?.value ?? 0;
      const conversionRate =
        nextStage && value > 0 ? (nextValue / value) * 100 : 0;
      const totalValue = aarrrCategories[0]?.value ?? 0;
      const percentageOfTotal =
        totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;

      return {
        id: cat.slug ?? cat.name.toLowerCase(),
        name: cat.name,
        value,
        conversionRate,
        percentageOfTotal,
        ...visuals,
      };
    });

    const total = stages[0]?.value ?? 0;
    const useDemo = total === 0;

    const data = useDemo
      ? DEMO_FUNNEL_DATA
      : stages.map((s, i) => ({
          name: s.name,
          value: s.value,
          fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
        }));

    return {
      chartData: data,
      processedStages: stages,
      totalEntrants: useDemo ? 10000 : total,
      isDemo: useDemo,
    };
  }, [aarrrCategories]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading funnel data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              AARRR Funnel
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalEntrants.toLocaleString()} total entrants
              {isDemo && (
                <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                  Demo data
                </span>
              )}
            </p>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recharts Funnel Chart */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart layout="centric" margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    const total = chartData[0]?.value ?? 1;
                    const pct = Math.round(((p.value as number) / total) * 100);
                    return (
                      <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-lg">
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-muted-foreground">
                          {(p.value as number).toLocaleString()} ({pct}%)
                        </p>
                      </div>
                    );
                  }}
                />
                <Funnel dataKey="value" data={chartData} isAnimationActive>
                  <LabelList
                    position="center"
                    dataKey="name"
                    className="fill-background font-semibold"
                    stroke="none"
                  />
                  <LabelList
                    position="right"
                    dataKey="value"
                    formatter={(v: number) => v.toLocaleString()}
                    className="fill-muted-foreground text-xs"
                    stroke="none"
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage cards */}
        {(processedStages.length > 0 || chartData.length > 0) && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {(processedStages.length > 0 ? processedStages : chartData).map((stage, index) => {
              const Icon = "icon" in stage ? stage.icon : categoryVisuals[stage.name ?? ""]?.icon ?? Info;
              const value = "value" in stage ? stage.value : (stage as { value: number }).value;
              const totalValue = chartData[0]?.value ?? 1;
              const percentageOfTotal = Math.round((value / totalValue) * 100);
              const prevValue = index > 0 ? (chartData[index - 1]?.value ?? value) : value;
              const conversionRate = prevValue > 0 ? (value / prevValue) * 100 : 0;
              return (
                <div
                  key={stage.name ?? index}
                  className={cn(
                    "rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30",
                  )}
                >
                  <div
                    className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${FUNNEL_COLORS[index]}20` }}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{ color: FUNNEL_COLORS[index] }}
                    />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stage.name}
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                    {value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {percentageOfTotal}% of total
                    {index < chartData.length - 1 && (
                      <> · {conversionRate.toFixed(1)}% CV</>
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* AARRR legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs font-bold tracking-widest text-muted-foreground">
          {["Acquisition", "Activation", "Retention", "Referral", "Revenue"].map(
            (label, i) => (
              <span key={label} className="flex items-center gap-1">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: FUNNEL_COLORS[i] }}
                />
                {label}
                {i < 4 && <span className="ml-1 text-muted-foreground/60">→</span>}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default function InteractiveAARRR() {
  return (
    <PlanRestrictedPage requiredFeature="advancedAnalytics">
      <AARRRDashboardContent />
    </PlanRestrictedPage>
  );
}
