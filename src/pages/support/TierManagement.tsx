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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  useTierHistory,
  usePointsTransactions,
  useSuspiciousActivities,
  useCustomerSearch,
  useManualTierOverride,
  useLoyaltyTierHistory,
  ADMIN_PAGE_SIZE,
  ALERTS_PAGE_SIZE,
  type CustomerSearchResult,
  type LoyaltyTierHistoryEntry,
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

  // Pagination state
  const [historyPage, setHistoryPage] = useState(0);
  const [loyaltyHistoryPage, setLoyaltyHistoryPage] = useState(0);
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [activitiesPage, setActivitiesPage] = useState(0);

  // Real DB hooks
  const { data: tierHistory = [], isLoading: historyLoading, isError: historyError, error: historyErrorDetail } = useTierHistory(historyPage);
  const { data: loyaltyTierHistory = [], isLoading: loyaltyHistoryLoading, isError: loyaltyHistoryError } = useLoyaltyTierHistory(loyaltyHistoryPage);
  const { data: pointsTransactions = [], isLoading: txLoading, isError: txError, error: txErrorDetail } = usePointsTransactions(transactionsPage);
  const { data: suspiciousActivities = [], isLoading: alertsLoading, unresolvedCount, resolveActivity, suspendCustomer } = useSuspiciousActivities(activitiesPage);
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
    <div className="min-h-full" style={{ background: "#f8fafc" }}>
      <div className="px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: "#0f172a" }}>Tier Management</h1>
          <p className="text-[15px] mt-1.5 font-medium text-slate-500">จัดการและตรวจสอบ Loyalty Tier ของลูกค้า</p>
        </div>
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", boxShadow: "0 6px 16px rgba(59,130,246,0.35)" }}>
          <Award className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Customer Search */}
      <Card className="rounded-[20px] bg-white overflow-hidden transition-all duration-300" style={{ border: "1.5px solid #e2e8f0", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
        <CardHeader className="border-b border-slate-100 pb-4" style={{ background: "linear-gradient(to right, #f8fafc, #ffffff)" }}>
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-800">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <Search className="h-4 w-4" />
            </div>
            ค้นหาลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="ค้นหาด้วยชื่อ, อีเมล หรือ ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#0f172a" }}
                onFocus={e => (e.target.style.borderColor = "#3b82f6")}
                onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
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
        <Card className="rounded-[20px] bg-white overflow-hidden transition-all duration-300" style={{ border: "1.5px solid #e2e8f0", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4" style={{ background: "linear-gradient(to right, #f8fafc, #ffffff)" }}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm bg-white" style={{ border: "1px solid #e2e8f0" }}>
                {safeTierIcons[selectedCustomer.loyalty_tier ?? ""] ?? "👤"}
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-slate-800">
                  {selectedCustomer.full_name ?? "ไม่ระบุชื่อ"}
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-0.5">{selectedCustomer.email}</CardDescription>
              </div>
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
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-5">
              {[
                { label: "Points", value: (selectedCustomer.loyalty_points_balance ?? 0).toLocaleString(), iconBorder: "#fef08a", color: "#eab308", bg: "#fefce8", border: "#fef08a" },
                { label: "Total Spend", value: `฿ ${(selectedCustomer.total_spend ?? 0).toLocaleString()}`, iconBorder: "#bfdbfe", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
                { label: "Member Duration", value: `${selectedCustomer.created_at ? Math.floor((Date.now() - new Date(selectedCustomer.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0} เดือน`, iconBorder: "#a7f3d0", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
                { label: "Current Tier", value: selectedCustomer.loyalty_tier ?? "ไม่มี", iconBorder: "#ddd6fe", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
              ].map((stat, i) => (
                <div key={i} className="rounded-[18px] p-5 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:-translate-y-1" style={{ background: "#ffffff", border: `1.5px solid ${stat.border}`, boxShadow: "0 2px 14px rgba(0,0,0,0.03)" }}>
                  <div className="h-10 w-10 text-xl font-bold rounded-[14px] flex items-center justify-center mb-3 shadow-sm" style={{ background: stat.bg, color: stat.color, border: `1px solid ${stat.iconBorder}` }}>
                    {i === 0 ? "★" : i === 1 ? "฿" : i === 2 ? <Clock className="h-5 w-5" /> : safeTierIcons[selectedCustomer.loyalty_tier ?? ""] ?? "—"}
                  </div>
                  <p className="text-[22px] font-extrabold text-slate-800" style={{ fontVariantNumeric: "tabular-nums" }}>{stat.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-6 mt-2">
        <TabsList className="bg-[#f1f5f9] p-1.5 rounded-2xl inline-flex h-auto border border-slate-200 shadow-inner">
          <TabsTrigger value="history" className="flex items-center gap-2 rounded-xl py-2.5 px-5 font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <History className="h-4 w-4" /> ประวัติการเปลี่ยน Tier
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2 rounded-xl py-2.5 px-5 font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md">
            <ArrowUpDown className="h-4 w-4" /> ธุรกรรม Points
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2 rounded-xl py-2.5 px-5 font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md">
            <AlertTriangle className="h-4 w-4" /> Suspicious Activities
            {unresolvedCount > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-[10px] h-5 px-1.5 ml-1.5 shadow-sm">
                {unresolvedCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Tier History */}
        <TabsContent value="history">
          {/* Section 1: Auto-logged trigger history (loyalty_tier_history) */}
          <Card className="mb-4 rounded-[20px] bg-white overflow-hidden transition-all duration-300 group" style={{ border: "1.5px solid #e2e8f0", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
            <CardHeader className="border-b border-emerald-100 pb-4" style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)" }}>
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-emerald-900">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
                ประวัติการเปลี่ยน Tier (Auto-Log)
              </CardTitle>
              <CardDescription>
                บันทึกอัตโนมัติจาก Trigger เมื่อ Tier ของลูกค้าเปลี่ยนแปลง
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] flex flex-col justify-between">
                <div>
                  {loyaltyHistoryLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : loyaltyTierHistory.length === 0 ? (
                    <div className="relative flex flex-col items-center justify-center py-24 px-4 text-center overflow-hidden rounded-[16px] border border-dashed border-emerald-200 bg-emerald-50/30">
                      {/* Decorative Background Pattern */}
                      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#10b981 2px, transparent 2px)", backgroundSize: "24px 24px" }} />
                      
                      <div className="relative z-10">
                        <div className="h-24 w-24 rounded-full bg-emerald-100/50 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10 relative group-hover:scale-105 transition-transform duration-500">
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-300/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                          <TrendingUp className="h-10 w-10 text-emerald-500 stroke-[1.5]" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 mb-2.5 relative z-10">ไม่พบประวัติแบบอัตโนมัติ</h3>
                      <p className="text-[15px] font-medium text-slate-500 max-w-[380px] leading-relaxed relative z-10">
                        ยังไม่มีการบันทึกประวัติการเปลี่ยน Tier อัตโนมัติจากระบบ ข้อมูลจะเริ่มแสดงเมื่อมีกิจกรรมที่ทำให้เงื่อนไข Tier ของลูกค้ามีการเปลี่ยนแปลง
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>วันที่</TableHead>
                          <TableHead>ลูกค้า</TableHead>
                          <TableHead>Tier เดิม</TableHead>
                          <TableHead>Tier ใหม่</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loyaltyTierHistory.slice(0, ADMIN_PAGE_SIZE).map((h: LoyaltyTierHistoryEntry) => {
                          const oldT = h.old_tier ?? "—";
                          const newT = h.new_tier;
                          const cust = (h as any).customer;
                          const customerName = cust
                            ? (cust.first_name || cust.last_name
                                ? `${cust.first_name ?? ""} ${cust.last_name ?? ""}`.trim()
                                : cust.user_id?.slice(0, 8))
                            : h.profile_customer_id.slice(0, 8);

                          return (
                            <TableRow key={h.id}>
                              <TableCell className="text-sm">
                                {format(new Date(h.changed_at), "d MMM yyyy HH:mm", { locale: safeLocale })}
                              </TableCell>
                              <TableCell className="font-medium">{customerName}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "rounded-full px-3 py-0.5 text-sm font-medium border-none shadow-none",
                                    safeTierColors[oldT]?.bg,
                                    safeTierColors[oldT]?.text
                                  )}
                                >
                                  <span className="mr-1.5">{safeTierIcons[oldT] ?? "—"}</span>
                                  {oldT}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "rounded-full px-3 py-0.5 text-sm font-medium border-none shadow-none",
                                      safeTierColors[newT]?.bg,
                                      safeTierColors[newT]?.text
                                    )}
                                  >
                                    <span className="mr-1.5">{safeTierIcons[newT] ?? "?"}</span>
                                    {newT}
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {!loyaltyHistoryLoading && !loyaltyHistoryError && loyaltyTierHistory.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">หน้า {loyaltyHistoryPage + 1}</p>
                    <Pagination className="mx-0 w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <Button variant="ghost" size="sm" onClick={() => setLoyaltyHistoryPage((p) => Math.max(0, p - 1))} disabled={loyaltyHistoryPage === 0} className="gap-1 pl-2.5">
                            <ChevronLeft className="h-4 w-4" /><span>Previous</span>
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <Button variant="ghost" size="sm" onClick={() => setLoyaltyHistoryPage((p) => p + 1)} disabled={loyaltyTierHistory.length <= ADMIN_PAGE_SIZE} className="gap-1 pr-2.5">
                            <span>Next</span><ChevronRight className="h-4 w-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Legacy tier_history (manual overrides + complex) */}
          <Card className="rounded-[20px] bg-white overflow-hidden transition-all duration-300 group" style={{ border: "1.5px solid #e2e8f0", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
            <CardHeader className="border-b border-indigo-100 pb-4" style={{ background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)" }}>
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-indigo-900">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-md group-hover:scale-110 transition-transform">
                  <History className="h-5 w-5" />
                </div>
                Manual Overrides (Legacy)
              </CardTitle>
              <CardDescription>รายการเปลี่ยน Tier แบบ Manual โดย Admin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] flex flex-col justify-between">
                <div>
                  {historyLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: ADMIN_PAGE_SIZE }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : historyError ? (
                    <div className="text-center py-8 text-destructive flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8" />
                      <p className="font-medium">ไม่สามารถโหลดประวัติการเปลี่ยน Tier ได้</p>
                      <p className="text-sm text-muted-foreground">{(historyErrorDetail as Error)?.message ?? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}</p>
                    </div>
                  ) : tierHistory.length === 0 ? (
                    <div className="relative flex flex-col items-center justify-center py-24 px-4 text-center overflow-hidden rounded-[16px] border border-dashed border-indigo-200 bg-indigo-50/30">
                      {/* Decorative Background Pattern */}
                      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#6366f1 2px, transparent 2px)", backgroundSize: "24px 24px" }} />
                      
                      <div className="relative z-10">
                        <div className="h-24 w-24 rounded-full bg-indigo-100/50 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/10 relative group-hover:scale-105 transition-transform duration-500">
                          <div className="absolute inset-0 rounded-full border-2 border-indigo-300/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                          <History className="h-10 w-10 text-indigo-500 stroke-[1.5]" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 mb-2.5 relative z-10">ไม่พบประวัติแบบแมนนวล</h3>
                      <p className="text-[15px] font-medium text-slate-500 max-w-[380px] leading-relaxed relative z-10">
                        ยังไม่มีประวัติที่ผู้ดูแลระบบแก้ไข Tier ให้กับลูกค้าแบบกำหนดเอง (Manual Override)
                      </p>
                    </div>
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
                        {tierHistory.slice(0, ADMIN_PAGE_SIZE).map((history) => {
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
                                <div className="flex items-center">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "rounded-full px-3 py-0.5 text-sm font-medium border-none shadow-none",
                                      safeTierColors[prevTierName]?.bg,
                                      safeTierColors[prevTierName]?.text
                                    )}
                                  >
                                    <span className="mr-1.5 text-base leading-none">{safeTierIcons[prevTierName] ?? "?"}</span>
                                    {prevTierName}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-4">
                                  {(history.new_tier?.priority_level ?? 0) > (history.previous_tier?.priority_level ?? 0) ? (
                                    <TrendingUp className="h-5 w-5 text-green-500" strokeWidth={2.5} />
                                  ) : (
                                    <TrendingDown className="h-5 w-5 text-red-500" strokeWidth={2.5} />
                                  )}
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "rounded-full px-3 py-0.5 text-sm font-medium border-none shadow-none",
                                      safeTierColors[newTierName]?.bg,
                                      safeTierColors[newTierName]?.text
                                    )}
                                  >
                                    <span className="mr-1.5 text-base leading-none">{safeTierIcons[newTierName] ?? "?"}</span>
                                    {newTierName}
                                  </Badge>
                                </div>
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
                </div>

                {!historyLoading && !historyError && tierHistory.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">หน้า {historyPage + 1}</p>
                    <Pagination className="mx-0 w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <Button variant="ghost" size="sm" onClick={() => setHistoryPage((p) => Math.max(0, p - 1))} disabled={historyPage === 0} className="gap-1 pl-2.5">
                            <ChevronLeft className="h-4 w-4" /><span>Previous</span>
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <Button variant="ghost" size="sm" onClick={() => setHistoryPage((p) => p + 1)} disabled={tierHistory.length <= ADMIN_PAGE_SIZE} className="gap-1 pr-2.5">
                            <span>Next</span><ChevronRight className="h-4 w-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Points Transactions */}
        <TabsContent value="transactions">
          <Card className="rounded-[20px] bg-white overflow-hidden transition-all duration-300 group" style={{ border: "1.5px solid #e2e8f0", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
            <CardHeader className="border-b border-blue-100 pb-4" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-blue-900">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-md group-hover:scale-110 transition-transform">
                  <ArrowUpDown className="h-5 w-5" />
                </div>
                รายการธุรกรรม Points
              </CardTitle>
              <CardDescription>ประวัติการได้รับ/ใช้คะแนนทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[500px] flex flex-col justify-between">
                <div>
                  {txLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: ADMIN_PAGE_SIZE }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : txError ? (
                    <div className="text-center py-8 text-destructive flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8" />
                      <p className="font-medium">ไม่สามารถโหลดธุรกรรม Points ได้</p>
                      <p className="text-sm text-muted-foreground">{(txErrorDetail as Error)?.message ?? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}</p>
                    </div>
                  ) : pointsTransactions.length === 0 ? (
                    <div className="relative flex flex-col items-center justify-center py-24 px-4 text-center overflow-hidden rounded-[16px] border border-dashed border-blue-200 bg-blue-50/30">
                      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#3b82f6 2px, transparent 2px)", backgroundSize: "24px 24px" }} />
                      
                      <div className="relative z-10">
                        <div className="h-24 w-24 rounded-full bg-blue-100/50 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10 relative group-hover:scale-105 transition-transform duration-500">
                          <div className="absolute inset-0 rounded-full border-2 border-blue-300/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                          <ArrowUpDown className="h-10 w-10 text-blue-500 stroke-[1.5]" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 mb-2.5 relative z-10">ยังไม่มีประวัติธุรกรรม</h3>
                      <p className="text-[15px] font-medium text-slate-500 max-w-[380px] leading-relaxed relative z-10">
                        ลูกค้ายังไม่เคยได้รับหรือใช้คะแนน Points ข้อมูลธุรกรรมจะแสดงในส่วนนี้เมื่อมีการสะสมหรือแลกคะแนน
                      </p>
                    </div>
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
                        {pointsTransactions.slice(0, ADMIN_PAGE_SIZE).map((tx) => {
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
                </div>

                {/* Pagination Controls */}
                {!txLoading && !txError && pointsTransactions.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      หน้า {transactionsPage + 1}
                    </p>
                    <Pagination className="mx-0 w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTransactionsPage((p) => Math.max(0, p - 1))}
                            disabled={transactionsPage === 0}
                            className="gap-1 pl-2.5"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Previous</span>
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTransactionsPage((p) => p + 1)}
                            disabled={pointsTransactions.length <= ADMIN_PAGE_SIZE}
                            className="gap-1 pr-2.5"
                          >
                            <span>Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Suspicious Activities */}
        <TabsContent value="alerts">
          <Card className="rounded-[20px] bg-white overflow-hidden transition-all duration-300 group" style={{ border: "1.5px solid #e2e8f0", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
            <CardHeader className="border-b border-orange-100 pb-4" style={{ background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)" }}>
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-orange-900">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md group-hover:scale-110 transition-transform">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                Suspicious Activities ({unresolvedCount} unresolved)
              </CardTitle>
              <CardDescription>กิจกรรมที่น่าสงสัยและต้องตรวจสอบ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[450px] flex flex-col justify-between">
                <div>
                  {alertsLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: ALERTS_PAGE_SIZE }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : suspiciousActivities.length === 0 ? (
                    <div className="relative flex flex-col items-center justify-center py-24 px-4 text-center overflow-hidden rounded-[16px] border border-dashed border-emerald-200 bg-emerald-50/30 mt-4">
                      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#10b981 2px, transparent 2px)", backgroundSize: "24px 24px" }} />
                      
                      <div className="relative z-10">
                        <div className="h-24 w-24 rounded-full bg-emerald-100/50 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10 relative group-hover:scale-105 transition-transform duration-500">
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-300/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                          <CheckCircle className="h-10 w-10 text-emerald-500 stroke-[1.5]" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 mb-2.5 relative z-10">ไม่มีกิจกรรมที่น่าสงสัย</h3>
                      <p className="text-[15px] font-medium text-slate-500 max-w-[380px] leading-relaxed relative z-10">
                        ระบบการตรวจจับไม่พบความผิดปกติหรือกิจกรรมที่ต้องตรวจสอบเพิ่มเติมในขณะนี้ สถานะบัญชีลูกค้าปลอดภัย
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {suspiciousActivities.slice(0, ALERTS_PAGE_SIZE).map((activity) => {
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
                </div>

                {/* Pagination Controls */}
                {!alertsLoading && suspiciousActivities.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      หน้า {activitiesPage + 1}
                    </p>
                    <Pagination className="mx-0 w-auto">
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActivitiesPage((p) => Math.max(0, p - 1))}
                            disabled={activitiesPage === 0}
                            className="gap-1 pl-2.5"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Previous</span>
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActivitiesPage((p) => p + 1)}
                            disabled={suspiciousActivities.length <= ALERTS_PAGE_SIZE}
                            className="gap-1 pr-2.5"
                          >
                            <span>Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
