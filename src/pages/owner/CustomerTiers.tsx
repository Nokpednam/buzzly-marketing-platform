import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerTiers } from "@/hooks/useCustomerTiers";
import { useDiscounts } from "@/hooks/useDiscounts";
import { useToast } from "@/hooks/use-toast";
import { tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, Area, AreaChart, CartesianGrid
} from "recharts";
import {
  Users, TrendingUp, TrendingDown, DollarSign,
  Award, ArrowUpRight, ArrowDownRight, Clock, Zap, AlertTriangle, Send, Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Sparkline } from "@/components/campaigns/Sparkline";

interface TierDistribution {
  name: string;
  value: number;
  color: string;
}

interface RevenueByTier {
  name: string;
  revenue: number;
  avgSpend: number;
}

interface TierMovement {
  month: string;
  upgrades: number;
  downgrades: number;
}

interface TopPerformer {
  id: string;
  name: string;
  tier: string;
  totalSpend: number;
  points: number;
}

export default function CustomerTiers() {
  const [timePeriod, setTimePeriod] = useState("30d");
  const { toast } = useToast();

  // Promo Dispatch Modal State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string, name: string } | null>(null);
  const [promoContext, setPromoContext] = useState<"promo" | "re_engage">("promo");
  const [promoTab, setPromoTab] = useState<"select" | "create">("select");
  const [selectedCodeId, setSelectedCodeId] = useState<string>("");
  const [newPromoForm, setNewPromoForm] = useState({
    code: "",
    discount_type: "percent" as "percent" | "fixed",
    discount_value: 10,
  });

  const { draftDiscounts, ongoingDiscounts, createDiscount } = useDiscounts();
  const availableDiscounts = [...ongoingDiscounts, ...draftDiscounts];

  const handleOpenPromoModal = (customerId: string, customerName: string, context: "promo" | "re_engage" = "promo") => {
    setSelectedCustomer({ id: customerId, name: customerName });
    setPromoContext(context);
    setIsPromoModalOpen(true);
  };

  const handleCopyAndSend = async () => {
    let discountId = "";

    if (promoTab === "select") {
      const selected = availableDiscounts.find(d => d.id === selectedCodeId);
      if (!selected) return;
      discountId = selected.id;
    } else {
      if (!newPromoForm.code) return;
      try {
        const created = await createDiscount.mutateAsync({
          code: newPromoForm.code,
          discount_type: newPromoForm.discount_type,
          discount_value: newPromoForm.discount_value,
          description: `Created explicitly for ${selectedCustomer?.name}`,
        });
        discountId = created.id;
      } catch (error) {
        return; // Error handled by mutation hook
      }
    }

    if (!selectedCustomer?.id || !discountId) return;

    try {
      const { data, error } = await supabase.rpc("send_promo_to_customer", {
        p_customer_id: selectedCustomer.id,
        p_discount_id: discountId,
        p_context: promoContext,
      });

      if (error) throw error;

      const success = (data as { success?: boolean })?.success;
      if (success) {
        toast({
          title: "ส่งสำเร็จ!",
          description: `โค้ดส่วนลดถูกส่งไปยังช่องแจ้งเตือนของ ${selectedCustomer.name} แล้ว`,
        });
      } else {
        toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถส่งได้", variant: "destructive" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถส่งได้";
      toast({ title: "เกิดข้อผิดพลาด", description: msg, variant: "destructive" });
    }

    setIsPromoModalOpen(false);
    setNewPromoForm({ code: "", discount_type: "percent", discount_value: 10 });
    setSelectedCodeId("");
  };

  const { data, isLoading: loading } = useCustomerTiers(timePeriod);

  const tierDistribution = data?.tierDistribution ?? [];
  const revenueByTier = data?.revenueByTier ?? [];
  const tierMovement = data?.tierMovement ?? [];
  const topPerformers = data?.topPerformers ?? [];
  const nearUpgradeCustomers = data?.nearUpgradeCustomers ?? [];
  const churnRiskCustomers = data?.churnRiskCustomers ?? [];
  const pointsBurnRate = data?.pointsBurnRate ?? 0;
  const totalCustomers = data?.totalCustomers ?? 0;
  const totalRevenue = data?.totalRevenue ?? 0;
  const avgSpendAll = data?.avgSpendAll ?? 0;
  const platinumCount = data?.platinumCount ?? 0;
  const byGender = data?.byGender ?? [];
  const genderTrend = data?.genderTrend ?? [];
  const kpiSparklines = data?.kpiSparklines ?? { totalCustomers: [], newMonthly: [], active: [], churned: [] };
  const kpiChange = data?.kpiChange ?? { totalCustomers: 0, newMonthly: 0, active: 0, churned: 0 };
  const accountGrowth = data?.accountGrowth ?? [];
  const retentionChurn = data?.retentionChurn ?? [];

  const ACCENT = "#06b6d4";
  const GENDER_COLORS = { Male: "#0ea5e9", Female: "#14b8a6", "Not Specified": "#94a3b8" };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-sm text-gray-500 font-medium">กำลังโหลดภาพรวมลูกค้า...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              ภาพรวมลูกค้า
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Customer Overview — Loyalty Tier & Performance
            </p>
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <SelectValue placeholder="ช่วงเวลา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 วันล่าสุด</SelectItem>
              <SelectItem value="30d">30 วันล่าสุด</SelectItem>
              <SelectItem value="90d">90 วันล่าสุด</SelectItem>
              <SelectItem value="1y">1 ปีล่าสุด</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 4 KPI Cards — Linear style with Sparklines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: "totalCustomers", label: "ลูกค้าทั้งหมด", value: totalCustomers, change: kpiChange.totalCustomers, sparkline: kpiSparklines.totalCustomers, icon: Users },
            { key: "newMonthly", label: "ลูกค้าใหม่ (รายเดือน)", value: kpiSparklines.newMonthly[kpiSparklines.newMonthly.length - 1]?.value ?? 0, change: kpiChange.newMonthly, sparkline: kpiSparklines.newMonthly, icon: TrendingUp },
            { key: "active", label: "ลูกค้าที่ใช้งานอยู่", value: kpiSparklines.active[kpiSparklines.active.length - 1]?.value ?? 0, change: kpiChange.active, sparkline: kpiSparklines.active, icon: Zap },
            { key: "churned", label: "ลูกค้าที่หลุด", value: kpiSparklines.churned[kpiSparklines.churned.length - 1]?.value ?? 0, change: kpiChange.churned, sparkline: kpiSparklines.churned, icon: TrendingDown },
          ].map(({ key, label, value, change, sparkline, icon: Icon }) => (
            <Card key={key} className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <CardContent className="p-4">
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1 tabular-nums">{(value ?? 0).toLocaleString()}</p>
                <div className="mt-2 h-10">
                  {sparkline.length >= 2 && (
                    <Sparkline data={sparkline} height={36} strokeColor={ACCENT} />
                  )}
                </div>
                <p className={cn(
                  "text-xs font-medium mt-2",
                  change >= 0 ? "text-cyan-600 dark:text-cyan-400" : "text-gray-500 dark:text-gray-400"
                )}>
                  {change >= 0 ? "+" : ""}{change}% vs เดือนก่อน
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-xl h-10 inline-flex">
          <TabsTrigger value="overview" className="rounded-lg h-8 px-5 text-sm data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg h-8 px-5 text-sm data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg h-8 px-5 text-sm data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
            Actionable Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6 mt-6">
          {/* Actionable Insights Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Near Upgrade */}
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50 rounded-t-xl pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                      <ArrowUpRight className="h-5 w-5" />
                      Near-Upgrade Customers
                    </CardTitle>
                    <CardDescription className="mt-1">Close to reaching the next loyalty tier</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-white">Opportunity</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {nearUpgradeCustomers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">No customers currently near upgrade</div>
                  ) : (
                    nearUpgradeCustomers.map((cust) => (
                      <div key={cust.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900">{cust.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-500">
                            <span style={{ color: tierColors[cust.currentTier as keyof typeof tierColors]?.text }}>{cust.currentTier}</span>
                            <ArrowUpRight className="h-3 w-3" />
                            <span style={{ color: tierColors[cust.nextTier as keyof typeof tierColors]?.text }}>{cust.nextTier}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-emerald-600">ต้อง ฿{cust.spendNeeded.toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => handleOpenPromoModal(cust.id, cust.name, "promo")}
                            className="h-8 px-3 rounded-md bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors whitespace-nowrap">
                            <Send className="h-3 w-3" /> Send Promo
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Churn Risk VIPs */}
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <CardHeader className="bg-gray-50 dark:bg-gray-800/50 rounded-t-xl pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      At-Risk VIPs
                    </CardTitle>
                    <CardDescription className="mt-1">High-tier members inactive &gt; 60 days</CardDescription>
                  </div>
                  <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none">Win-back</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {churnRiskCustomers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">No VIP customers currently at risk</div>
                  ) : (
                    churnRiskCustomers.map((cust) => (
                      <div key={cust.id} className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors">
                        <div>
                          <p className="font-bold text-slate-900">{cust.name}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs font-medium">
                            <span style={{ color: tierColors[cust.tier as keyof typeof tierColors]?.text }}>{tierIcons[cust.tier as keyof typeof tierIcons]} {cust.tier}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:flex items-center text-red-600 gap-1 text-sm font-bold">
                            <Clock className="h-3 w-3" />
                            {cust.daysInactive} days ago
                          </div>
                          <button
                            onClick={() => handleOpenPromoModal(cust.id, cust.name, "re_engage")}
                            className="h-8 px-3 rounded-md bg-red-100 text-red-600 hover:bg-red-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors whitespace-nowrap">
                            <Send className="h-3 w-3" /> Re-engage
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Main Visualization: Gender Donut + Line Trend */}
          <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">การกระจายตามเพศและแนวโน้ม</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Gender Segment & Trend (6 เดือน)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-[1fr,1.5fr]">
                {/* Donut — Left */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative h-[220px] w-full max-w-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={byGender.filter((g) => g.count > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="count"
                        >
                          {byGender.filter((g) => g.count > 0).map((entry, i) => (
                            <Cell key={entry.gender} fill={(GENDER_COLORS as Record<string, string>)[entry.gender] ?? "#94a3b8"} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                          formatter={(value: number, _name: string, props: { payload: { gender: string; percentage: number } }) => [`${value} (${props.payload.percentage}%)`, props.payload.gender]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{totalCustomers}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">ลูกค้า</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {byGender.filter((g) => g.count > 0).map((g) => (
                      <div key={g.gender} className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: (GENDER_COLORS as Record<string, string>)[g.gender] ?? "#94a3b8" }} />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{g.gender}</span>
                        <span className="text-xs text-gray-500 tabular-nums">{g.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Line Chart — Right */}
                <div className="min-h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={genderTrend} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                        labelFormatter={(label) => label}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="Male" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Male" />
                      <Line type="monotone" dataKey="Female" stroke="#14b8a6" strokeWidth={2} dot={false} name="Female" />
                      <Line type="monotone" dataKey="Not Specified" stroke="#94a3b8" strokeWidth={2} dot={false} name="Not Specified" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Account Growth Trend */}
          <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Account Growth Trend</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">การสร้างบัญชีและ Activation รายเดือน</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accountGrowth} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id="creationsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="activationsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                      formatter={(value: number, name: string) => [value.toLocaleString(), name === "creations" ? "สร้างบัญชี" : "Activation"]}
                    />
                    <Legend formatter={(value) => (value === "creations" ? "สร้างบัญชี" : "Activation")} />
                    <Area type="monotone" dataKey="creations" stroke={ACCENT} strokeWidth={2} fill="url(#creationsGrad)" name="creations" />
                    <Area type="monotone" dataKey="activations" stroke="#0ea5e9" strokeWidth={2} fill="url(#activationsGrad)" name="activations" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. Retention & Churn Analytics */}
          <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">Retention & Churn Analytics</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">อัตราการคงอยู่และอัตราการหลุดตามเวลา</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={retentionChurn} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", fontSize: "12px" }}
                      formatter={(value: number, name: string) => [`${value}%`, name === "retentionRate" ? "Retention Rate" : "Churn Rate"]}
                    />
                    <Legend formatter={(value) => (value === "retentionRate" ? "Retention Rate" : "Churn Rate")} />
                    <Line type="monotone" dataKey="retentionRate" stroke={ACCENT} strokeWidth={2} dot={false} name="retentionRate" />
                    <Line type="monotone" dataKey="churnRate" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="5 5" name="churnRate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue by Tier */}
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Revenue by Tier</CardTitle>
                <CardDescription>Total revenue and average spend per segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueByTier} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 'bold' }} />
                      <YAxis tickFormatter={(v) => `$${v / 1000}K`} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                        formatter={(value: number, name: string) => {
                          if (name === "avgSpend") return [`฿${value.toLocaleString()}`, "AOV"];
                          return [`฿${value.toLocaleString()}`, "Revenue"];
                        }}
                      />
                      <Bar
                        dataKey="revenue"
                        name="revenue"
                        radius={[10, 10, 0, 0]}
                        barSize={40}
                      >
                        {revenueByTier.map((entry, index) => {
                          const color = entry.name === 'Bronze' ? '#A85823' :
                            entry.name === 'Silver' ? '#94A3B8' :
                              entry.name === 'Gold' ? '#F59E0B' : '#6366F1';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                      <Bar
                        dataKey="avgSpend"
                        name="avgSpend"
                        radius={[10, 10, 0, 0]}
                        barSize={20}
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tier Movement Trends */}
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold italic tracking-tight">Tier Transition Velocity</CardTitle>
                <CardDescription>Momentum of customer upgrades and downgrades over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tierMovement}>
                      <defs>
                        <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="upgrades"
                        name="Upgrades"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fill="url(#colorUp)"
                      />
                      <Area
                        type="monotone"
                        dataKey="downgrades"
                        name="Downgrades"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        fill="transparent"
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
      </div>

      {/* Promo Dispatch Modal */}
      <Dialog open={isPromoModalOpen} onOpenChange={setIsPromoModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Send Promo to {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription>
              Select an existing active/draft code or generate a new one specifically for this customer.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={promoTab} onValueChange={(v) => setPromoTab(v as "select" | "create")} className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Select Existing</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Available Discount Codes</Label>
                <Select value={selectedCodeId} onValueChange={setSelectedCodeId}>
                  <SelectTrigger className="font-medium">
                    <SelectValue placeholder="Select a discount code..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDiscounts.map(d => (
                      <SelectItem key={d.id} value={d.id} className="font-mono text-sm">
                        <span className="font-bold text-primary mr-2">{d.code}</span>
                        <span className="text-muted-foreground">
                          ({d.discount_type === 'percent' ? `${d.discount_value}%` : `฿${d.discount_value}`}) {d.published_at ? 'Live' : 'Draft'}
                        </span>
                      </SelectItem>
                    ))}
                    {availableDiscounts.length === 0 && (
                      <SelectItem value="none" disabled>No active or draft codes available.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>New Promo Code</Label>
                <Input
                  placeholder="e.g. SPECIAL50"
                  value={newPromoForm.code}
                  onChange={e => setNewPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="font-mono uppercase tracking-widest font-bold text-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select value={newPromoForm.discount_type} onValueChange={v => setNewPromoForm(p => ({ ...p, discount_type: v as "percent" | "fixed" }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percent (%)</SelectItem>
                      <SelectItem value="fixed">Fixed (฿)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={newPromoForm.discount_value}
                    onChange={e => setNewPromoForm(p => ({ ...p, discount_value: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/50">
            <Button variant="ghost" onClick={() => setIsPromoModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCopyAndSend}
              disabled={
                (promoTab === "select" && !selectedCodeId) ||
                (promoTab === "create" && (!newPromoForm.code || createDiscount.isPending))
              }
              className="gap-2 font-bold shadow-lg shadow-primary/20"
            >
              {createDiscount.isPending ? "Creating..." : (
                <>
                  <Send className="h-4 w-4" />
                  ส่งให้ลูกค้า
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
