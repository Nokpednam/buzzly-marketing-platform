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

// Mock data for demo - would be replaced with real queries
const mockTierDistribution = [
  { name: "Bronze", value: 1250, color: "#CD7F32" },
  { name: "Silver", value: 680, color: "#C0C0C0" },
  { name: "Gold", value: 320, color: "#FFD700" },
  { name: "Platinum", value: 85, color: "#E5E4E2" },
];

const mockRevenueByTier = [
  { name: "Bronze", revenue: 125000, avgSpend: 100 },
  { name: "Silver", revenue: 340000, avgSpend: 500 },
  { name: "Gold", revenue: 480000, avgSpend: 1500 },
  { name: "Platinum", revenue: 850000, avgSpend: 10000 },
];

const mockTierMovement = [
  { month: "ม.ค.", upgrades: 45, downgrades: 12 },
  { month: "ก.พ.", upgrades: 52, downgrades: 8 },
  { month: "มี.ค.", upgrades: 38, downgrades: 15 },
  { month: "เม.ย.", upgrades: 61, downgrades: 10 },
  { month: "พ.ค.", upgrades: 48, downgrades: 7 },
  { month: "มิ.ย.", upgrades: 55, downgrades: 9 },
];

const mockTopPerformers = [
  { id: 1, name: "คุณสมชาย ใจดี", tier: "Platinum", totalSpend: 250000, points: 12500 },
  { id: 2, name: "คุณวิภา สุขใจ", tier: "Platinum", totalSpend: 185000, points: 9250 },
  { id: 3, name: "คุณธนา รวยดี", tier: "Gold", totalSpend: 95000, points: 4750 },
  { id: 4, name: "คุณมานี มีทรัพย์", tier: "Gold", totalSpend: 78000, points: 3900 },
  { id: 5, name: "คุณสุนีย์ สดใส", tier: "Silver", totalSpend: 45000, points: 2250 },
];

const mockBehaviorData = [
  { feature: "Dashboard", Bronze: 45, Silver: 62, Gold: 78, Platinum: 92 },
  { feature: "Campaigns", Bronze: 30, Silver: 55, Gold: 85, Platinum: 95 },
  { feature: "Analytics", Bronze: 15, Silver: 42, Gold: 70, Platinum: 88 },
  { feature: "Reports", Bronze: 10, Silver: 35, Gold: 65, Platinum: 82 },
  { feature: "API", Bronze: 5, Silver: 20, Gold: 45, Platinum: 75 },
];

export default function CustomerTiers() {
  const [timePeriod, setTimePeriod] = useState("30d");
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const totalCustomers = mockTierDistribution.reduce((sum, t) => sum + t.value, 0);
  const totalRevenue = mockRevenueByTier.reduce((sum, t) => sum + t.revenue, 0);
  const avgSpendAll = Math.round(totalRevenue / totalCustomers);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Tiers Overview</h1>
          <p className="text-muted-foreground">ภาพรวมลูกค้าตาม Loyalty Tier</p>
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
            <div className="text-2xl font-bold">{mockTierDistribution[3].value}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +3 คนใหม่เดือนนี้
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
                    data={mockTierDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockTierDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {mockTierDistribution.map((tier) => (
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
                <BarChart data={mockRevenueByTier}>
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
          <CardDescription>จำนวนการอัปเกรดและดาวน์เกรดในแต่ละเดือน</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTierMovement}>
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

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>ลูกค้าที่มียอดใช้จ่ายสูงสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopPerformers.map((customer, index) => (
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

        {/* Feature Usage by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Behavior ตาม Tier</CardTitle>
            <CardDescription>% การใช้งานฟีเจอร์แต่ละประเภท</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockBehaviorData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="feature" type="category" width={80} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="Bronze" fill="#CD7F32" stackId="stack" />
                  <Bar dataKey="Silver" fill="#C0C0C0" stackId="stack" />
                  <Bar dataKey="Gold" fill="#FFD700" stackId="stack" />
                  <Bar dataKey="Platinum" fill="#E5E4E2" stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
