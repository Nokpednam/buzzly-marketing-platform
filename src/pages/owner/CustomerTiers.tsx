import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomerTiers } from "@/hooks/useCustomerTiers";
import { tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, Area, AreaChart
} from "recharts";
import {
  Users, TrendingUp, TrendingDown, DollarSign,
  Award, ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";

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

  const { data, isLoading: loading } = useCustomerTiers();

  const tierDistribution = data?.tierDistribution ?? [];
  const revenueByTier = data?.revenueByTier ?? [];
  const tierMovement = data?.tierMovement ?? [];
  const topPerformers = data?.topPerformers ?? [];
  const totalCustomers = data?.totalCustomers ?? 0;
  const totalRevenue = data?.totalRevenue ?? 0;
  const avgSpendAll = data?.avgSpendAll ?? 0;
  const platinumCount = data?.platinumCount ?? 0;

  if (loading) {
    return <div className="p-8 text-center">Loading tier analytics...</div>;
  }

  // Reuse existing JSX structure but with real data
  return (
    <div className="space-y-6 px-6 pb-6 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Customer Tiers
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Loyalty Tier Overview & Performance
          </p>
        </div>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[180px]">
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

      {/* Summary Cards */}
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Total Members - Deep Blue Gradient */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="h-24 w-24 text-white transform rotate-12 translate-x-8 translate-y-[-10px]" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-100">สมาชิกทั้งหมด</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-white shadow-sm">{(totalCustomers || 0).toLocaleString()}</div>
            <div className="flex items-center text-xs font-medium mt-3 text-blue-100">
              <span className="flex items-center bg-white/20 px-2 py-1 rounded-lg text-white mr-2 backdrop-blur-sm">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                12.5%
              </span>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue - Deep Emerald Gradient */}
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="h-24 w-24 text-white transform rotate-12 translate-x-8 translate-y-[-10px]" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-emerald-100">รายได้รวม</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-white shadow-sm">${(totalRevenue / 1000000).toFixed(2)}M</div>
            <div className="flex items-center text-xs font-medium mt-3 text-emerald-100">
              <span className="flex items-center bg-white/20 px-2 py-1 rounded-lg text-white mr-2 backdrop-blur-sm">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                8.2%
              </span>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Spend - Deep Orange/Red Gradient */}
        <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="h-24 w-24 text-white transform rotate-12 translate-x-8 translate-y-[-10px]" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-orange-100">ค่าใช้จ่ายเฉลี่ย</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-white shadow-sm">${avgSpendAll.toLocaleString()}</div>
            <div className="flex items-center text-xs font-medium mt-3 text-orange-100">
              <span className="flex items-center bg-white/20 px-2 py-1 rounded-lg text-white mr-2 backdrop-blur-sm">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                5.4%
              </span>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Platinum - Deep Indigo/Purple Gradient */}
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award className="h-24 w-24 text-white transform rotate-12 translate-x-8 translate-y-[-10px]" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-indigo-100">Platinum Members</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <Award className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-white shadow-sm">{platinumCount}</div>
            <div className="flex items-center text-xs font-medium mt-3 text-indigo-100">
              <span className="flex items-center bg-white/20 px-2 py-1 rounded-lg text-white mr-2 backdrop-blur-sm">
                Premium
              </span>
              <span>Segment</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tier Distribution Pie Chart */}
        <Card className="glass-panel border-primary/10 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Customer Distribution</CardTitle>
            <CardDescription>Members segmented by loyalty tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    itemStyle={{ fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold tracking-tighter">{totalCustomers}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-sans">Total Members</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-4">
              {tierDistribution.map((tier) => (
                <div key={tier.name} className="flex flex-col items-center">
                  <div className="text-xl font-black" style={{ color: tier.color }}>{tier.value}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                    {tier.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Tier */}
        <Card className="glass-panel border-primary/10 shadow-lg shadow-primary/5">
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
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar
                    dataKey="revenue"
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
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Movement Trends */}
      <Card className="glass-panel border-primary/10 shadow-lg shadow-primary/5">
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

      {/* Top Performers */}
      <div className="grid gap-6 md:grid-cols-1">
        <Card className="glass-panel border-primary/10 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Award className="h-6 w-6 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>High-value customers based on lifetime spend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((customer, index) => (
                <div key={customer.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-black text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{customer.name}</p>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {tierIcons[customer.tier]} {customer.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-primary">${customer.totalSpend.toLocaleString() ?? 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{customer.points.toLocaleString() ?? 0} PTS</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
