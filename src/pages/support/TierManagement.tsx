import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  useTierHistory,
  usePointsTransactions,
  useSuspiciousActivities,
  useCustomerSearch,
  useManualTierOverride,
  type CustomerSearchResult,
} from "@/hooks/useTierManagement";

// Fallback constants
const defaultTierColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: "bg-amber-700/20", text: "text-amber-700", border: "border-amber-700" },
  Silver: { bg: "bg-slate-400/20", text: "text-slate-500", border: "border-slate-400" },
  Gold: { bg: "bg-yellow-500/20", text: "text-yellow-600", border: "border-yellow-500" },
  Platinum: { bg: "bg-slate-300/20", text: "text-slate-600", border: "border-slate-400" },
};
const defaultTierIcons: Record<string, string> = {
  Bronze: "🥉", Silver: "🥈", Gold: "🥇", Platinum: "💎",
};

export default function TierManagement() {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideTier, setOverrideTier] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  // Real DB hooks
  const { data: tierHistory = [], isLoading: historyLoading, isError: historyError, error: historyErrorDetail } = useTierHistory();
  const { data: pointsTransactions = [], isLoading: txLoading, isError: txError, error: txErrorDetail } = usePointsTransactions();
  const { data: suspiciousActivities = [], isLoading: alertsLoading, resolveActivity, suspendCustomer } = useSuspiciousActivities();
  const { query: searchQuery, setQuery: setSearchQuery, data: searchResults = [], isFetching: searchLoading } = useCustomerSearch();
  const manualOverride = useManualTierOverride();

  const safeTierIcons = tierIcons || defaultTierIcons;
  const safeTierColors = tierColors || defaultTierColors;
  const safeLocale = th || undefined;

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
      default: return "text-foreground";
    }
  };

  const handleManualOverride = async () => {
    if (!selectedCustomer || !overrideTier || !overrideReason.trim()) return;
    await manualOverride.mutateAsync({
      userId: selectedCustomer.id,
      newTierName: overrideTier,
      reason: overrideReason,
    });
    setOverrideDialogOpen(false);
    setOverrideTier("");
    setOverrideReason("");
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
            <Search className="h-5 w-5" /> ค้นหาลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="ค้นหาด้วยชื่อ, อีเมล หรือ ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {searchQuery.length >= 2 && (
            <div className="mt-4 space-y-2">
              {searchResults.length === 0 && !searchLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">ไม่พบลูกค้าที่ตรงกัน</p>
              ) : (
                searchResults.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{safeTierIcons[customer.loyalty_tier ?? ""] ?? "👤"}</div>
                      <div>
                        <p className="font-medium">{customer.full_name ?? "ไม่ระบุชื่อ"}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={safeTierColors[customer.loyalty_tier ?? ""]?.bg ?? "bg-muted"}>
                        {customer.loyalty_tier ?? "—"}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(customer.loyalty_points_balance ?? 0).toLocaleString()} pts
                      </p>
                    </div>
                  </div>
                ))
              )}
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
                {safeTierIcons[selectedCustomer.loyalty_tier ?? ""] ?? "👤"} {selectedCustomer.full_name ?? "ไม่ระบุชื่อ"}
              </CardTitle>
              <CardDescription>{selectedCustomer.email}</CardDescription>
            </div>
            <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" /> Manual Override
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manual Tier Override</DialogTitle>
                  <DialogDescription>
                    เปลี่ยน Tier ของลูกค้า {selectedCustomer.full_name} ด้วยตนเอง
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Current Tier</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{safeTierIcons[selectedCustomer.loyalty_tier ?? ""] ?? "—"}</span>
                      <Badge className={safeTierColors[selectedCustomer.loyalty_tier ?? ""]?.bg ?? "bg-muted"}>
                        {selectedCustomer.loyalty_tier ?? "ไม่มี"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>New Tier</Label>
                    <Select value={overrideTier} onValueChange={setOverrideTier}>
                      <SelectTrigger><SelectValue placeholder="เลือก Tier ใหม่" /></SelectTrigger>
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
                  <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>ยกเลิก</Button>
                  <Button
                    onClick={handleManualOverride}
                    disabled={!overrideTier || !overrideReason.trim() || manualOverride.isPending}
                  >
                    {manualOverride.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    บันทึกการเปลี่ยนแปลง
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{(selectedCustomer.loyalty_points_balance ?? 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">฿{(selectedCustomer.total_spend ?? 0).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Spend</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">
                  {selectedCustomer.created_at
                    ? Math.floor((Date.now() - new Date(selectedCustomer.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
                    : 0} เดือน
                </p>
                <p className="text-sm text-muted-foreground">Member Duration</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{safeTierIcons[selectedCustomer.loyalty_tier ?? ""] ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{selectedCustomer.loyalty_tier ?? "ไม่มี"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" /> ประวัติการเปลี่ยน Tier
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" /> ธุรกรรม Points
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Suspicious Activities
            {suspiciousActivities.filter(a => !a.is_resolved).length > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-[10px] h-4 px-1 ml-1">
                {suspiciousActivities.filter(a => !a.is_resolved).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Tier History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>ประวัติการเปลี่ยน Tier</CardTitle>
              <CardDescription>บันทึกการเปลี่ยน Tier ทั้งหมดในระบบ</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : historyError ? (
                <div className="text-center py-8 text-destructive flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8" />
                  <p className="font-medium">ไม่สามารถโหลดประวัติการเปลี่ยน Tier ได้</p>
                  <p className="text-sm text-muted-foreground">{(historyErrorDetail as Error)?.message ?? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}</p>
                </div>
              ) : tierHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">ยังไม่มีประวัติการเปลี่ยน Tier</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>วันที่</TableHead>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead>Tier เดิม</TableHead>
                      <TableHead>Tier ใหม่</TableHead>
                      <TableHead>เหตุผล</TableHead>
                      <TableHead>โดย</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tierHistory.map((history) => {
                      const prevTierName = history.previous_tier?.name ?? "—";
                      const newTierName = history.new_tier?.name ?? "—";
                      const customerName = history.customer?.full_name ?? history.customer?.email ?? history.user_id.slice(0, 8);
                      const changerName = history.is_manual_override
                        ? (history.changer?.full_name ?? "Admin")
                        : "System";

                      return (
                        <TableRow key={history.id}>
                          <TableCell className="text-sm">
                            {format(new Date(history.created_at), "d MMM yyyy", { locale: safeLocale })}
                          </TableCell>
                          <TableCell className="font-medium">{customerName}</TableCell>
                          <TableCell>
                            <Badge className={safeTierColors[prevTierName]?.bg ?? "bg-muted"}>
                              {safeTierIcons[prevTierName] ?? "?"} {prevTierName}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              {prevTierName < newTierName ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                              <Badge className={safeTierColors[newTierName]?.bg ?? "bg-muted"}>
                                {safeTierIcons[newTierName] ?? "?"} {newTierName}
                              </Badge>
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{history.change_reason ?? "—"}</TableCell>
                          <TableCell>
                            <Badge variant={history.is_manual_override ? "destructive" : "secondary"}>
                              {changerName}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Points Transactions */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>รายการธุรกรรม Points</CardTitle>
              <CardDescription>ประวัติการได้รับ/ใช้คะแนนทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : txError ? (
                <div className="text-center py-8 text-destructive flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8" />
                  <p className="font-medium">ไม่สามารถโหลดธุรกรรม Points ได้</p>
                  <p className="text-sm text-muted-foreground">{(txErrorDetail as Error)?.message ?? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}</p>
                </div>
              ) : pointsTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">ยังไม่มีธุรกรรม Points</div>
              ) : (
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
                    {pointsTransactions.map((tx) => {
                      const customerName = tx.customer?.full_name ?? tx.customer?.email ?? tx.user_id.slice(0, 8);
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm">
                            {format(new Date(tx.created_at), "d MMM yyyy HH:mm", { locale: safeLocale })}
                          </TableCell>
                          <TableCell className="font-medium">{customerName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{tx.transaction_type}</Badge>
                          </TableCell>
                          <TableCell className={cn("text-right font-medium", getTransactionTypeColor(tx.transaction_type))}>
                            {(tx.points_amount ?? 0) > 0 ? "+" : ""}{(tx.points_amount ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">{(tx.balance_after ?? 0).toLocaleString()}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{tx.description ?? "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Suspicious Activities */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Suspicious Activities ({suspiciousActivities.filter(a => !a.is_resolved).length} unresolved)
              </CardTitle>
              <CardDescription>กิจกรรมที่น่าสงสัยและต้องตรวจสอบ</CardDescription>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
              ) : suspiciousActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3 opacity-50" />
                  ไม่มีกิจกรรมที่น่าสงสัย
                </div>
              ) : (
                <div className="space-y-4">
                  {suspiciousActivities.map((activity) => {
                    const customerName = activity.customer?.full_name ?? activity.customer?.email ?? activity.user_id.slice(0, 8);
                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border",
                          activity.is_resolved ? "bg-muted/30" : "bg-destructive/5 border-destructive/20"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full",
                            activity.is_resolved ? "bg-green-500/20" : "bg-destructive/20"
                          )}>
                            {activity.is_resolved ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{customerName}</p>
                              <Badge className={getSeverityColor(activity.severity)}>{activity.severity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{activity.description ?? activity.activity_type}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(activity.created_at), "d MMM yyyy HH:mm", { locale: safeLocale })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!activity.is_resolved && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resolveActivity.mutate({ activityId: activity.id })}
                                disabled={resolveActivity.isPending}
                              >
                                <Eye className="h-4 w-4 mr-1" /> แก้ไขแล้ว
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => suspendCustomer.mutate(activity.user_id)}
                                disabled={suspendCustomer.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-1" /> ระงับ
                              </Button>
                            </>
                          )}
                          {activity.is_resolved && (
                            <Badge variant="outline" className="text-green-600 border-green-600">แก้ไขแล้ว</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}