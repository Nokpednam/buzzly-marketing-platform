import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCustomerTiers } from "@/hooks/useCustomerTiers";
import { useDiscounts } from "@/hooks/useDiscounts";
import { useToast } from "@/hooks/use-toast";
import { tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, Area, AreaChart
} from "recharts";
import {
  Users, TrendingUp, TrendingDown, DollarSign,
  Award, ArrowUpRight, ArrowDownRight, Clock, Zap, AlertTriangle, Send, Tag, Copy
} from "lucide-react";

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
  const [promoTab, setPromoTab] = useState<"select" | "create">("select");
  const [selectedCodeId, setSelectedCodeId] = useState<string>("");
  const [newPromoForm, setNewPromoForm] = useState({
    code: "",
    discount_type: "percent" as "percent" | "fixed",
    discount_value: 10,
  });

  const { draftDiscounts, ongoingDiscounts, createDiscount } = useDiscounts();
  const availableDiscounts = [...ongoingDiscounts, ...draftDiscounts];

  const handleOpenPromoModal = (customerId: string, customerName: string) => {
    setSelectedCustomer({ id: customerId, name: customerName });
    setIsPromoModalOpen(true);
  };

  const handleCopyAndSend = async () => {
    let finalCode = "";

    if (promoTab === "select") {
      const selected = availableDiscounts.find(d => d.id === selectedCodeId);
      if (!selected) return;
      finalCode = selected.code;
    } else {
      if (!newPromoForm.code) return;
      try {
        const created = await createDiscount.mutateAsync({
          code: newPromoForm.code,
          discount_type: newPromoForm.discount_type,
          discount_value: newPromoForm.discount_value,
          description: `Created explicitly for ${selectedCustomer?.name}`,
        });
        finalCode = created.code;
      } catch (error) {
        return; // Error handled by mutation hook
      }
    }

    navigator.clipboard.writeText(finalCode);
    toast({
      title: "Code Copied & Ready!",
      description: `Discount code «${finalCode}» is copied and ready to be sent to ${selectedCustomer?.name}`,
    });
    setIsPromoModalOpen(false);

    // reset form
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
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Total Members - Deep Blue Gradient */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="h-24 w-24 text-white transform rotate-12 translate-x-8 translate-y-[-10px]" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-100">Total Members</CardTitle>
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
            <CardTitle className="text-sm font-medium text-emerald-100">Total Revenue</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-white shadow-sm">฿{(totalRevenue / 1000).toFixed(0)}K</div>
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
            <CardTitle className="text-sm font-medium text-orange-100">Average Spend</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-white shadow-sm">฿{avgSpendAll.toLocaleString()}</div>
            <div className="flex items-center text-xs font-medium mt-3 text-orange-100">
              <span className="flex items-center bg-white/20 px-2 py-1 rounded-lg text-white mr-2 backdrop-blur-sm">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                5.4%
              </span>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Points Burn Rate - Deep Indigo/Purple Gradient */}
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="h-24 w-24 text-white transform rotate-12 translate-x-8 translate-y-[-10px]" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-indigo-100">Points Burn Rate</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <Zap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold tracking-tight text-white shadow-sm">{pointsBurnRate}%</div>
            <div className="flex items-center text-xs font-medium mt-3 text-indigo-100">
              <span className="flex items-center bg-white/20 px-2 py-1 rounded-lg text-white mr-2 backdrop-blur-sm">
                Engagement
              </span>
              <span>Points Spent/Earned</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="bg-slate-100/50 p-1 border border-slate-200/60 rounded-xl h-12 inline-flex">
          <TabsTrigger value="overview" className="rounded-lg h-9 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg h-9 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg h-9 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Actionable Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6 mt-0">
          {/* Actionable Insights Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Near Upgrade */}
            <Card className="glass-panel border-primary/10 shadow-lg shadow-primary/5">
              <CardHeader className="bg-primary/5 rounded-t-xl pb-4 border-b border-primary/10">
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
                            <p className="text-sm font-bold text-emerald-600">฿{cust.spendNeeded.toLocaleString()} needed</p>
                          </div>
                          <button
                            onClick={() => handleOpenPromoModal(cust.id, cust.name)}
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
            <Card className="glass-panel border-destructive/10 shadow-lg shadow-destructive/5">
              <CardHeader className="bg-destructive/5 rounded-t-xl pb-4 border-b border-destructive/10">
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
                            onClick={() => handleOpenPromoModal(cust.id, cust.name)}
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

        <TabsContent value="overview" className="space-y-6 mt-0">
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

            {/* Top Performers */}
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
                              <span style={{ color: tierColors[customer.tier as keyof typeof tierColors]?.text }}>{tierIcons[customer.tier as keyof typeof tierIcons]} {customer.tier}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xl text-primary">฿{customer.totalSpend.toLocaleString() ?? 0}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{customer.points.toLocaleString() ?? 0} PTS</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-2">
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
                      <YAxis tickFormatter={(v) => `฿${v / 1000}K`} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
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
          </div>
        </TabsContent>

      </Tabs>

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
                  <Copy className="h-4 w-4" />
                  Copy & Send
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
