import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  UserCheck,
  Repeat,
  Share2,
  DollarSign,
  Loader2,
  Database,
  Plus,
  Trash2,
  Activity,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  Info,
  ClipboardCheck,
  TrendingUp
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart
} from "recharts";
import { useProductUsageMetrics, useUserSegments, useAARRRMetrics, useFeatureUsageMetrics, useOwnerAARRRTimeSeriesData } from "@/hooks/useOwnerMetrics";
import type { AARRRGranularity } from "@/hooks/useOwnerMetrics";
// usePersonas (legacy) is intentionally used here — this page manages internal
// Buzzly user-segment personas (AARRR analytics), not customer marketing personas.
// For marketing personas use useCustomerPersonas instead.
import { usePersonas } from "@/hooks/usePersonas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  const { data: usageMetrics, isLoading: usageLoading, isError: usageError } = useProductUsageMetrics();
  const { data: aarrrStages = [], isLoading: aarrrLoading, isError: aarrrError } = useAARRRMetrics();
  const { data: aarrrTimeSeries = [], isLoading: aarrrTimeSeriesLoading } = useOwnerAARRRTimeSeriesData(aarrrGranularity, aarrrPeriodsBack);
  const { data: userSegments, isLoading: segmentsLoading, isError: segmentsError } = useUserSegments();
  const { data: featureData, isLoading: featureLoading, isError: featureError } = useFeatureUsageMetrics(30);
  const { personas, createPersona, deletePersona } = usePersonas();

  const hasQueryError = usageError || aarrrError || segmentsError || featureError;

  // Form State
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    characteristics: "",
    behaviors: ""
  });

  const isLoading = usageLoading || aarrrLoading || segmentsLoading || featureLoading;
  const hasData = (usageMetrics?.totalUsers || 0) > 0
    || (usageMetrics?.activeSubscriptions || 0) > 0
    || aarrrStages.length > 0;

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

  const handleCreatePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPersona.mutateAsync({
        name: formData.name,
        description: formData.description,
        characteristics: { list: formData.characteristics.split('\n').filter(Boolean) },
        behaviors: { list: formData.behaviors.split('\n').filter(Boolean) }
      });
      toast.success("Persona added successfully");
      setOpen(false);
      setFormData({ name: "", description: "", characteristics: "", behaviors: "" });
    } catch (error) {
      toast.error("Failed to add persona");
    }
  };

  const handleDeletePersona = async (id: string) => {
    if (confirm("Are you sure you want to delete this persona?")) {
      try {
        await deletePersona.mutateAsync(id);
        toast.success("Persona deleted");
      } catch (error) {
        toast.error("Failed to delete persona");
      }
    }
  }

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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Product Usage
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Real-time user behavior analytics and engagement tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/dev/audit-logs"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            ดู Audit Logs (ใครทำอะไร)
          </Link>
          <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
            <Activity className="w-3 h-3 mr-2 animate-pulse" />
            Live Data
          </Badge>
        </div>

      </div>

      {/* Quick Stats - Tech Panels */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Total Users", value: usageMetrics?.totalUsers?.toLocaleString() || "0", icon: Users, gradient: "from-blue-600 to-blue-700", text: "text-blue-100" },
          { label: "Active Subscriptions", value: usageMetrics?.activeSubscriptions?.toLocaleString() || "0", icon: UserCheck, gradient: "from-violet-600 to-purple-700", text: "text-purple-100" },
          { label: "Daily Active", value: usageMetrics?.dau?.toLocaleString() || "0", icon: Activity, gradient: "from-cyan-500 to-blue-600", text: "text-cyan-100" },
          { label: "DAU/MAU Ratio", value: `${usageMetrics?.dauMauRatio || 0}%`, icon: Repeat, gradient: "from-fuchsia-600 to-pink-700", text: "text-pink-100" }
        ].map((stat, i) => (
          <Card key={i} className={`bg-gradient-to-br ${stat.gradient} border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <stat.icon className="h-24 w-24 text-white transform rotate-12 translate-x-8 translate-y-[-10px]" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className={`text-sm font-medium ${stat.text}`}>
                {stat.label}
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold tracking-tight text-white shadow-sm">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="feature-usage" className="space-y-8">
        <TabsList className="w-full max-w-3xl grid grid-cols-4 bg-muted/50 p-1 rounded-lg border border-border/50">
          <TabsTrigger value="feature-usage" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">
            Feature Usage
          </TabsTrigger>
          <TabsTrigger value="aarrr" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">AARRR Funnel</TabsTrigger>
          <TabsTrigger value="journey" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">User Journey</TabsTrigger>
          <TabsTrigger value="persona" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300">User Persona</TabsTrigger>
        </TabsList>

        {/* Feature Usage Tab — FIRST (default) */}
        <TabsContent value="feature-usage" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-l-4 border-l-emerald-500 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Feature Usage Ranking
                </CardTitle>
                <CardDescription>
                  ฟีเจอร์ที่ถูกใช้งานมากที่สุด (30 วันล่าสุด) — ใช้ตัดสินใจลงทุนหรือปรับปรุง
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!featureData?.featureUsage?.length ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                    <BarChart3 className="h-12 w-12 mb-3 opacity-40" />
                    ไม่มีข้อมูล audit logs — รัน migration seed หรือใช้ฟีเจอร์ต่างๆ เพื่อให้ข้อมูลปรากฏ
                  </div>
                ) : (
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureData.featureUsage} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
                        <YAxis type="category" dataKey="feature" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => [v.toLocaleString() + " ครั้ง", "จำนวน"]} />
                        <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} name="จำนวนครั้ง" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Friction Points / จุดค้าง
                </CardTitle>
                <CardDescription>
                  จุดที่ผู้ใช้ล้มเหลวหรือติดมากที่สุด — ใช้ตัดสินใจแก้ไขหรือตัดฟีเจอร์
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!featureData?.frictionPoints?.length ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                    <PieChartIcon className="h-12 w-12 mb-3 opacity-40" />
                    ไม่มีข้อมูลการล้มเหลว — ใช้เป็นสัญญาณดีว่าผู้ใช้ผ่านฟีเจอร์ได้
                  </div>
                ) : (
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={featureData.frictionPoints.map((p) => ({ ...p, label: `${p.feature}: ${p.action}` }))}
                          dataKey="count"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ payload }: { payload?: { feature?: string; count?: number } }) =>
                            payload ? `${payload.feature ?? "N/A"} (${payload.count ?? 0})` : ""
                          }
                        >
                          {featureData.frictionPoints.map((_, i) => (
                            <Cell key={i} fill={["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"][i % 5]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number, _: unknown, p: { payload: { feature: string; action: string } }) => [`${v} ครั้ง`, `${p.payload.feature}: ${p.payload.action}`]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {featureData?.featureUsage?.length ? (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">สรุปการใช้งาน</CardTitle>
                <CardDescription>ตารางสรุปฟีเจอร์ที่ใช้งานมากที่สุด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">อันดับ</th>
                        <th className="text-left py-2 font-medium">ฟีเจอร์</th>
                        <th className="text-right py-2 font-medium">จำนวนครั้ง</th>
                        <th className="text-right py-2 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {featureData.featureUsage.map((item, i) => (
                        <tr key={item.featureKey} className="border-b border-border/50">
                          <td className="py-2">{i + 1}</td>
                          <td className="py-2 font-medium">{item.feature}</td>
                          <td className="py-2 text-right font-mono">{item.count.toLocaleString()}</td>
                          <td className="py-2 text-right text-muted-foreground">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        {/* AARRR Funnel Tab */}
        <TabsContent value="aarrr" className="space-y-6">
          <Card className="border-l-4 border-l-teal-500 shadow-lg">
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

          <Card className="border-l-4 border-l-blue-500 shadow-lg">
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

          <Card className="border-l-4 border-l-violet-500 shadow-lg">
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
        <TabsContent value="journey" className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>User Journey Map</CardTitle>
              <CardDescription>
                Track user progression from signup to active usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userJourneySteps.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Awaiting data stream...
                </div>
              ) : (
                <div className="space-y-6">
                  {userJourneySteps.map((step, index) => (
                    <div key={step.step} className="relative">
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 ring-2 ring-background">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm uppercase tracking-wide">{step.step}</span>
                            <span className="text-sm font-mono text-muted-foreground">
                              {step.users.toLocaleString()} users
                            </span>
                          </div>
                          <Progress
                            value={(step.users / (userJourneySteps[0]?.users || 1)) * 100}
                            className="h-2.5"
                          />
                        </div>
                        {step.dropoff > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            -{step.dropoff}% Loss
                          </Badge>
                        )}
                      </div>
                      {index < userJourneySteps.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-border/50 -z-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Persona Tab */}
        <TabsContent value="persona" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
                <CardDescription>Distribution by business type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {userSegments?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No segmentation data available.
                  </div>
                ) : (
                  userSegments?.map((persona) => (
                    <div key={persona.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{persona.type}</span>
                        <span className="text-muted-foreground font-mono">
                          {persona.count.toLocaleString()} ({persona.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${persona.type === "Small Business" ? "bg-blue-500" :
                            persona.type === "Agency" ? "bg-indigo-500" :
                              persona.type === "Enterprise" ? "bg-purple-500" :
                                "bg-slate-500"
                            }`}
                          style={{ width: `${persona.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Persona Insights</CardTitle>
                  <CardDescription>Key characteristics by segment</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1 border-primary/20 text-primary hover:bg-primary/5">
                      <Plus className="h-4 w-4" /> Add Persona
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Persona</DialogTitle>
                      <DialogDescription>Define a new user persona based on your insights.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreatePersona} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Persona Name</Label>
                        <Input
                          id="name"
                          placeholder="e.g. Growth Marketer"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="Brief description..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="characteristics">Key Characteristics (one per line)</Label>
                        <Textarea
                          id="characteristics"
                          placeholder="- Tech savvy&#10;- Budget conscious"
                          value={formData.characteristics}
                          onChange={(e) => setFormData({ ...formData, characteristics: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="behaviors">Key Behaviors (one per line)</Label>
                        <Textarea
                          id="behaviors"
                          placeholder="- Monthly purchases&#10;- High engagement"
                          value={formData.behaviors}
                          onChange={(e) => setFormData({ ...formData, behaviors: e.target.value })}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={createPersona.isPending}>
                          {createPersona.isPending ? "Adding..." : "Add Persona"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {personas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No personas defined yet.
                    </div>
                  ) : (
                    personas.map((p) => (
                      <div key={p.id} className="rounded-xl border border-border/50 p-4 group relative hover:bg-slate-50 transition-colors">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePersona(p.id)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <h4 className="font-bold text-primary flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {p.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-3 ml-4">{p.description}</p>

                        {(p.characteristics as any)?.list && (
                          <div className="mt-2 ml-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Characteristics</p>
                            <div className="flex flex-wrap gap-1">
                              {(p.characteristics as any).list.map((c: string, i: number) => (
                                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded textxs font-medium bg-secondary text-secondary-foreground text-[10px]">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div >
  );
}
