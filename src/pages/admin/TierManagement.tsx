import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Search,
  Filter,
  History,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import { format } from "date-fns";
import { th } from "date-fns/locale";

// Mock data
const mockTierHistory = [
  { id: 1, userId: "u1", userName: "คุณสมชาย ใจดี", previousTier: "Gold", newTier: "Platinum", reason: "Points threshold reached", changedBy: "System", isManual: false, createdAt: new Date(2026, 0, 15) },
  { id: 2, userId: "u2", userName: "คุณวิภา สุขใจ", previousTier: "Silver", newTier: "Gold", reason: "Spend threshold reached", changedBy: "System", isManual: false, createdAt: new Date(2026, 0, 14) },
  { id: 3, userId: "u3", userName: "คุณธนา รวยดี", previousTier: "Gold", newTier: "Silver", reason: "Manual adjustment - suspected fraud", changedBy: "Admin", isManual: true, createdAt: new Date(2026, 0, 13) },
  { id: 4, userId: "u4", userName: "คุณมานี มีทรัพย์", previousTier: "Bronze", newTier: "Silver", reason: "Membership duration", changedBy: "System", isManual: false, createdAt: new Date(2026, 0, 12) },
];

const mockPointsTransactions = [
  { id: 1, userId: "u1", userName: "คุณสมชาย ใจดี", type: "earn", amount: 500, balance: 12500, description: "Purchase order #12345", createdAt: new Date(2026, 0, 15, 14, 30) },
  { id: 2, userId: "u1", userName: "คุณสมชาย ใจดี", type: "spend", amount: -200, balance: 12300, description: "Redeem voucher", createdAt: new Date(2026, 0, 15, 10, 15) },
  { id: 3, userId: "u2", userName: "คุณวิภา สุขใจ", type: "bonus", amount: 1000, balance: 9250, description: "Birthday bonus", createdAt: new Date(2026, 0, 14, 9, 0) },
  { id: 4, userId: "u3", userName: "คุณธนา รวยดี", type: "adjustment", amount: -5000, balance: 4750, description: "Fraud investigation - points removed", createdAt: new Date(2026, 0, 13, 16, 45) },
  { id: 5, userId: "u4", userName: "คุณมานี มีทรัพย์", type: "earn", amount: 150, balance: 3900, description: "Purchase order #12340", createdAt: new Date(2026, 0, 12, 11, 20) },
];

const mockSuspiciousActivities = [
  { id: 1, userId: "u5", userName: "คุณผิดปกติ", type: "rapid_points_gain", severity: "high", description: "ได้รับ 10,000 points ใน 1 ชั่วโมง", isResolved: false, createdAt: new Date(2026, 0, 15, 18, 0) },
  { id: 2, userId: "u6", userName: "คุณน่าสงสัย", type: "multiple_redemptions", severity: "medium", description: "แลก voucher 5 ครั้งใน 10 นาที", isResolved: false, createdAt: new Date(2026, 0, 15, 12, 30) },
  { id: 3, userId: "u3", userName: "คุณธนา รวยดี", type: "account_sharing", severity: "critical", description: "เข้าใช้งานจาก 3 IP พร้อมกัน", isResolved: true, resolvedAt: new Date(2026, 0, 13, 17, 0) },
];

const mockCustomerSearch = [
  { id: "u1", name: "คุณสมชาย ใจดี", email: "somchai@example.com", tier: "Platinum", points: 12500, totalSpend: 250000, memberSince: new Date(2024, 5, 1) },
  { id: "u2", name: "คุณวิภา สุขใจ", email: "wipa@example.com", tier: "Gold", points: 9250, totalSpend: 185000, memberSince: new Date(2024, 8, 15) },
];

export default function TierManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomerSearch[0] | null>(null);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideTier, setOverrideTier] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "earn": return "text-green-600";
      case "bonus": return "text-blue-600";
      case "spend": return "text-orange-600";
      case "adjustment": return "text-destructive";
      case "expire": return "text-muted-foreground";
      default: return "text-foreground";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tier Management</h1>
        <p className="text-muted-foreground">จัดการและตรวจสอบ Loyalty Tier ของลูกค้า</p>
      </div>

      {/* Customer Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            ค้นหาลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="ค้นหาด้วยชื่อ, อีเมล หรือ ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>ค้นหา</Button>
          </div>

          {searchQuery && (
            <div className="mt-4 space-y-2">
              {mockCustomerSearch.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{tierIcons[customer.tier]}</div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={tierColors[customer.tier]?.bg}>
                      {customer.tier}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {customer.points.toLocaleString()} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Customer Detail */}
      {selectedCustomer && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {tierIcons[selectedCustomer.tier]} {selectedCustomer.name}
              </CardTitle>
              <CardDescription>{selectedCustomer.email}</CardDescription>
            </div>
            <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Manual Override
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manual Tier Override</DialogTitle>
                  <DialogDescription>
                    เปลี่ยน Tier ของลูกค้า {selectedCustomer.name} ด้วยตนเอง
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Current Tier</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tierIcons[selectedCustomer.tier]}</span>
                      <Badge className={tierColors[selectedCustomer.tier]?.bg}>
                        {selectedCustomer.tier}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>New Tier</Label>
                    <Select value={overrideTier} onValueChange={setOverrideTier}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือก Tier ใหม่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bronze">🥉 Bronze</SelectItem>
                        <SelectItem value="Silver">🥈 Silver</SelectItem>
                        <SelectItem value="Gold">🥇 Gold</SelectItem>
                        <SelectItem value="Platinum">💎 Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>เหตุผลในการเปลี่ยน</Label>
                    <Textarea
                      placeholder="ระบุเหตุผลในการเปลี่ยน Tier..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={() => setOverrideDialogOpen(false)}>
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{selectedCustomer.points.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">฿{selectedCustomer.totalSpend.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Spend</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">
                  {Math.floor((Date.now() - selectedCustomer.memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30))} เดือน
                </p>
                <p className="text-sm text-muted-foreground">Member Duration</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{tierIcons[selectedCustomer.tier]}</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer.tier}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            ประวัติการเปลี่ยน Tier
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            ธุรกรรม Points
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Suspicious Activities
          </TabsTrigger>
        </TabsList>

        {/* Tier History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการเปลี่ยน Tier</CardTitle>
              <CardDescription>Timeline การอัป/ดาวน์เกรด Tier พร้อมเหตุผล</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead>เปลี่ยนจาก</TableHead>
                    <TableHead>เป็น</TableHead>
                    <TableHead>เหตุผล</TableHead>
                    <TableHead>โดย</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTierHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell className="text-sm">
                        {format(history.createdAt, "d MMM yyyy", { locale: th })}
                      </TableCell>
                      <TableCell className="font-medium">{history.userName}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {tierIcons[history.previousTier]} {history.previousTier}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {history.previousTier < history.newTier ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          {tierIcons[history.newTier]} {history.newTier}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{history.reason}</TableCell>
                      <TableCell>
                        <Badge variant={history.isManual ? "destructive" : "secondary"}>
                          {history.changedBy}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>รายการธุรกรรม Points</CardTitle>
              <CardDescription>ประวัติการได้รับ/ใช้คะแนนทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันเวลา</TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead className="text-right">จำนวน</TableHead>
                    <TableHead className="text-right">ยอดคงเหลือ</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPointsTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">
                        {format(tx.createdAt, "d MMM yyyy HH:mm", { locale: th })}
                      </TableCell>
                      <TableCell className="font-medium">{tx.userName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("text-right font-medium", getTransactionTypeColor(tx.type))}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{tx.balance.toLocaleString()}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{tx.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suspicious Activities Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Suspicious Activities
              </CardTitle>
              <CardDescription>กิจกรรมที่น่าสงสัยและต้องตรวจสอบ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSuspiciousActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      activity.isResolved ? "bg-muted/30" : "bg-destructive/5 border-destructive/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        activity.isResolved ? "bg-green-500/20" : "bg-destructive/20"
                      )}>
                        {activity.isResolved ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{activity.userName}</p>
                          <Badge className={getSeverityColor(activity.severity)}>
                            {activity.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {format(activity.createdAt, "d MMM yyyy HH:mm", { locale: th })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!activity.isResolved && (
                        <>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            ตรวจสอบ
                          </Button>
                          <Button variant="destructive" size="sm">
                            <XCircle className="h-4 w-4 mr-1" />
                            ระงับ
                          </Button>
                        </>
                      )}
                      {activity.isResolved && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          แก้ไขแล้ว
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
