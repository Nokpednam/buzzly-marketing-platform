import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
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
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
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
  const [loading, setLoading] = useState(true);

  // Data States
  const [tierDistribution, setTierDistribution] = useState<TierDistribution[]>([]);
  const [revenueByTier, setRevenueByTier] = useState<RevenueByTier[]>([]);
  const [tierMovement, setTierMovement] = useState<TierMovement[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);

  // Summary Stats
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgSpendAll, setAvgSpendAll] = useState(0);
  const [platinumCount, setPlatinumCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [timePeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Tiers (Master Data)
      const { data: tiers } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .order('min_points');

      // 2. Fetch Customers with Points & Tier Info
      const { data: customers } = await supabase
        .from('profile_customers')
        .select(`
          user_id,
          first_name,
          last_name,
          loyalty_point_id,
          loyalty_points(
            point_balance,
            total_points_earned,
            loyalty_tier_id,
            status,
            loyalty_tiers(name, badge_color)
          )
        `);

      // 3. Fetch Transactions
      const { data: txs } = await supabase
        .from('payment_transactions')
        .select('amount, user_id, created_at')
        .order('created_at', { ascending: true });

      if (tiers && customers && txs) {
        // --- Process Data ---

        // A. Process Tiers & Distribution (Deduplicate by Name)
        // Create a map of unique tiers by name to handle duplicate DB entries
        const uniqueTiers = new Map<string, typeof tiers[0]>();
        tiers.forEach(t => {
          if (!uniqueTiers.has(t.name)) {
            uniqueTiers.set(t.name, t);
          }
        });
        const masterTiers = Array.from(uniqueTiers.values()).sort((a, b) => a.min_points - b.min_points);

        // Count active customers per unique tier name
        const tierCounts = new Map<string, number>();
        let totalCust = 0;
        let platinum = 0;

        customers.forEach(c => {
          const lp = c.loyalty_points;
          if (lp && lp.status === 'active') {
            const tName = lp.loyalty_tiers?.name || 'Bronze'; // Fallback
            tierCounts.set(tName, (tierCounts.get(tName) || 0) + 1);
            totalCust++;
            if (tName === 'Platinum') platinum++;
          }
        });

        const distChartData = masterTiers.map(t => ({
          name: t.name,
          value: tierCounts.get(t.name) || 0,
          color: t.name === 'Bronze' ? '#A85823' :
            t.name === 'Silver' ? '#94A3B8' :
              t.name === 'Gold' ? '#F59E0B' : '#6366F1'
        }));

        setTierDistribution(distChartData);
        setTotalCustomers(totalCust);
        setPlatinumCount(platinum);


        // B. Process Revenue & Spend (Calculated from Txs)
        const userSpendMap = new Map<string, number>();
        let totalRev = 0;

        txs.forEach(tx => {
          userSpendMap.set(tx.user_id, (userSpendMap.get(tx.user_id) || 0) + tx.amount);
          totalRev += tx.amount;
        });

        setTotalRevenue(totalRev);
        setAvgSpendAll(totalCust > 0 ? Math.round(totalRev / totalCust) : 0);

        // Revenue by Tier (Group by Current Tier of User)
        // We need to map UserId -> Current Tier Name
        const userTierNameMap = new Map<string, string>();
        customers.forEach(c => {
          const tName = c.loyalty_points?.loyalty_tiers?.name || 'Bronze';
          userTierNameMap.set(c.user_id, tName);
        });

        const tierRevenueMap = new Map<string, number>();
        userSpendMap.forEach((spend, userId) => {
          const tName = userTierNameMap.get(userId);
          if (tName) {
            tierRevenueMap.set(tName, (tierRevenueMap.get(tName) || 0) + spend);
          }
        });

        const revChartData = masterTiers.map(t => {
          const rev = tierRevenueMap.get(t.name) || 0;
          const count = tierCounts.get(t.name) || 1; // Avoid divide by zero
          return {
            name: t.name,
            revenue: rev,
            avgSpend: Math.round(rev / Math.max(count, 1))
          };
        });
        setRevenueByTier(revChartData);


        // C. Process Top Performers
        // Join customer info with calculated total spend
        const topListFormatted = customers
          .map(c => ({
            id: c.user_id,
            name: `${c.first_name} ${c.last_name}`,
            tier: c.loyalty_points?.loyalty_tiers?.name || 'Bronze',
            points: c.loyalty_points?.total_points_earned || 0,
            totalSpend: userSpendMap.get(c.user_id) || 0
          }))
          .sort((a, b) => b.totalSpend - a.totalSpend)
          .slice(0, 5);

        setTopPerformers(topListFormatted);


        // D. Tier History (Calculated Upgrades)
        const trendsMap = new Map<string, { up: number, down: number }>();
        const endDate = new Date();
        const startDate = subMonths(endDate, 6);

        // Initialize buckets
        for (let i = 5; i >= 0; i--) {
          const d = subMonths(endDate, i);
          const key = format(d, 'MMM', { locale: th });
          trendsMap.set(key, { up: 0, down: 0 });
        }

        // Replay for Upgrades
        // Use masterTiers (sorted by points/spend) for thresholds
        // Sort tiers by min_spend_amount for logic
        const sortedLogicTiers = [...masterTiers].sort((a, b) => a.min_spend_amount - b.min_spend_amount);
        const defaultLogicTier = sortedLogicTiers[0];

        const replayUserSpend = new Map<string, number>();

        txs.forEach(tx => {
          const txDate = new Date(tx.created_at);
          const currentSpend = replayUserSpend.get(tx.user_id) || 0;
          const newSpend = currentSpend + tx.amount;
          replayUserSpend.set(tx.user_id, newSpend);

          // Detect Tier Change based on Spend Thresholds
          let oldTier = defaultLogicTier;
          let newTier = defaultLogicTier;

          for (const t of sortedLogicTiers) {
            if (currentSpend >= t.min_spend_amount) oldTier = t;
            if (newSpend >= t.min_spend_amount) newTier = t;
          }

          if (newTier.min_spend_amount > oldTier.min_spend_amount) {
            // Upgrade event
            if (txDate >= startDate) {
              const key = format(txDate, 'MMM', { locale: th });
              if (trendsMap.has(key)) {
                trendsMap.get(key)!.up++;
              }
            }
          }
        });

        const trendData = Array.from(trendsMap.entries()).map(([month, data]) => ({
          month,
          upgrades: data.up,
          downgrades: data.down
        }));
        setTierMovement(trendData);
      }

    } catch (error) {
      console.error("Error fetching tier data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-panel border-primary/10 shadow-lg shadow-primary/5 hover:translate-y-[-2px] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">สมาชิกทั้งหมด</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{(totalCustomers || 0).toLocaleString()}</div>
            <div className="flex items-center text-xs text-emerald-600 mt-1 font-bold">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5%
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/10 shadow-lg shadow-primary/5 hover:translate-y-[-2px] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">รายได้รวม</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">฿{(totalRevenue / 1000000).toFixed(2)}M</div>
            <div className="flex items-center text-xs text-emerald-600 mt-1 font-bold">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8.2%
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/10 shadow-lg shadow-primary/5 hover:translate-y-[-2px] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">ค่าใช้จ่ายเฉลี่ย</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">฿{avgSpendAll.toLocaleString()}</div>
            <div className="flex items-center text-xs text-emerald-600 mt-1 font-bold">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +5.4%
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/10 shadow-lg shadow-primary/5 hover:translate-y-[-2px] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Platinum Members</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{platinumCount}</div>
            <div className="flex items-center text-xs text-indigo-600 mt-1 font-bold italic">
              Premium Segment
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
                  <YAxis tickFormatter={(v) => `฿${v / 1000}K`} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    formatter={(value: number) => [`฿${value.toLocaleString()}`, "Revenue"]}
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
                    <p className="font-black text-xl text-primary">฿{customer.totalSpend.toLocaleString() ?? 0}</p>
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
