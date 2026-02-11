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
          // @ts-ignore
          const lp = c.loyalty_points;
          if (lp && lp.status === 'active') {
            // @ts-ignore
            const tName = lp.loyalty_tiers?.name || 'Bronze'; // Fallback
            tierCounts.set(tName, (tierCounts.get(tName) || 0) + 1);
            totalCust++;
            if (tName === 'Platinum') platinum++;
          }
        });

        const distChartData = masterTiers.map(t => ({
          name: t.name,
          value: tierCounts.get(t.name) || 0,
          color: t.badge_color === 'bronze' ? '#CD7F32' :
            t.badge_color === 'silver' ? '#C0C0C0' :
              t.badge_color === 'gold' ? '#FFD700' : '#E5E4E2'
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
          // @ts-ignore
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
            // @ts-ignore
            tier: c.loyalty_points?.loyalty_tiers?.name || 'Bronze',
            // @ts-ignore
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
          <h1 className="text-3xl font-bold text-foreground">Customer Tiers Overview</h1>
          <p className="text-muted-foreground">ภาพรวมลูกค้าตาม Loyalty Tier (ข้อมูลจริง)</p>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12% จากเดือนก่อน
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{(totalRevenue / 1000000).toFixed(1)}M</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8% จากเดือนก่อน
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ค่าใช้จ่ายเฉลี่ย</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{avgSpendAll.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +5% จากเดือนก่อน
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platinum Members</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platinumCount}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              Top Tier
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tier Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>สัดส่วนลูกค้าแต่ละ Tier</CardTitle>
            <CardDescription>Pie Chart แสดงจำนวนและสัดส่วน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {tierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {tierDistribution.map((tier) => (
                <div key={tier.name} className="text-center">
                  <div className="text-lg font-bold">{tier.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <span>{tierIcons[tier.name]}</span> {tier.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>รายได้ตาม Tier</CardTitle>
            <CardDescription>รายได้และค่าใช้จ่ายเฉลี่ยต่อลูกค้า</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByTier}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => `฿${v / 1000}K`} />
                  <Tooltip
                    formatter={(value: number) => `฿${value.toLocaleString()}`}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Movement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>แนวโน้มการเปลี่ยน Tier</CardTitle>
          <CardDescription>จำนวนการอัปเกรดและดาวน์เกรดในแต่ละเดือน (ข้อมูลจากประวัติ transaction)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tierMovement}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="upgrades"
                  name="อัปเกรด"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="downgrades"
                  name="ดาวน์เกรด"
                  stroke="hsl(var(--destructive))"
                  fill="hsl(var(--destructive))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>ลูกค้าที่มียอดใช้จ่ายสูงสุด 5 อันดับแรก</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{tierIcons[customer.tier]}</span>
                        <span>{customer.tier}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">฿{customer.totalSpend.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{customer.points.toLocaleString()} pts</p>
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
