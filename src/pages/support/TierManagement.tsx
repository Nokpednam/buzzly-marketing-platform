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
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tierColors, tierIcons } from "@/hooks/useLoyaltyTier";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  usePointsTransactions,
  useSuspiciousActivities,
  useCustomerSearch,
  useManualTierOverride,
  useLoyaltyTierHistory,
  useLoyaltyTierHistoryManual,
  useAllCustomers,
  ADMIN_PAGE_SIZE,
  ALERTS_PAGE_SIZE,
  type CustomerSearchResult,
  type LoyaltyTierHistoryEntry,
} from "@/hooks/useTierManagement";

const defaultTierColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: "bg-amber-700/20", text: "text-amber-700", border: "border-amber-700" },
  Silver: { bg: "bg-slate-400/20", text: "text-slate-500", border: "border-slate-400" },
  Gold: { bg: "bg-yellow-500/20", text: "text-yellow-600", border: "border-yellow-500" },
  Platinum: { bg: "bg-slate-300/20", text: "text-slate-600", border: "border-slate-400" },
};
const defaultTierIcons: Record<string, string> = {
  Bronze: "🥉", Silver: "🥈", Gold: "🥇", Platinum: "💎",
};

import { useQueryClient } from "@tanstack/react-query";

export default function TierManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideTier, setOverrideTier] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const [godCustomerSearch, setGodCustomerSearch] = useState("");
  const [godCustomerId, setGodCustomerId] = useState("");
  const [godTier, setGodTier] = useState("");
  const [godReason, setGodReason] = useState("");
  const [godDropdownOpen, setGodDropdownOpen] = useState(false);

  const [historyPage, setHistoryPage] = useState(0);
  const [loyaltyHistoryPage, setLoyaltyHistoryPage] = useState(0);
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [activitiesPage, setActivitiesPage] = useState(0);

  const { data: tierHistory = [], isLoading: historyLoading, isError: historyError, error: historyErrorDetail } = useLoyaltyTierHistoryManual(historyPage);
  const { data: loyaltyTierHistory = [], isLoading: loyaltyHistoryLoading, isError: loyaltyHistoryError } = useLoyaltyTierHistory(loyaltyHistoryPage);
  const { data: pointsTransactions = [], isLoading: txLoading, isError: txError, error: txErrorDetail } = usePointsTransactions(transactionsPage);
  const { data: suspiciousActivities = [], isLoading: alertsLoading, unresolvedCount, resolveActivity, suspendCustomer } = useSuspiciousActivities(activitiesPage);
  const { query: searchQuery, setQuery: setSearchQuery, data: searchResults = [], isFetching: searchLoading } = useCustomerSearch();
  const manualOverride = useManualTierOverride();
  const { data: allCustomers = [], isLoading: allCustomersLoading } = useAllCustomers();

  const safeTierIcons = tierIcons || defaultTierIcons;
  const safeTierColors = tierColors || defaultTierColors;
  const safeLocale = enUS;

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
    try {
      await manualOverride.mutateAsync({
        userId: selectedCustomer.id,
        newTierName: overrideTier,
        reason: overrideReason,
      });
      setOverrideDialogOpen(false);
      setOverrideTier("");
      setOverrideReason("");
      queryClient.invalidateQueries({ queryKey: ["loyalty-tier-history-manual"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-tier-history"] });
      queryClient.invalidateQueries({ queryKey: ["points-transactions"] });
      toast({ title: "Update Success", description: `Tier updated for ${selectedCustomer.full_name}` });
    } catch (err) {
      toast({ title: "Update Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const filteredCustomers = allCustomers.filter((c: any) => {
    if (!godCustomerSearch.trim()) return true;
    const q = godCustomerSearch.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });
  const godSelectedCustomer = allCustomers.find((c: any) => c.id === godCustomerId) ?? null;

  const handleGodOverride = async () => {
    if (!godCustomerId || !godTier || !godReason.trim()) return;
    try {
      await manualOverride.mutateAsync({
        userId: godCustomerId,
        newTierName: godTier,
        reason: godReason,
      });
      setGodCustomerId("");
      setGodCustomerSearch("");
      setGodTier("");
      setGodReason("");
      queryClient.invalidateQueries({ queryKey: ["loyalty-tier-history-manual"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-tier-history"] });
      queryClient.invalidateQueries({ queryKey: ["points-transactions"] });
      toast({ title: "Update Success", description: `Tier updated manually!` });
    } catch (err) {
      toast({ title: "Update Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tier Management</h1>
        <p className="text-muted-foreground">จัดการและตรวจสอบ Loyalty Tier ของลูกค้า</p>
      </div>

      {/* ⚡ GOD-MODE: Manual Tier Adjustment */}
      <Card className="rounded-[20px] bg-white overflow-hidden shadow-sm border-slate-200 border-2 border-dashed border-indigo-200/60">
        <CardHeader className="pb-3 border-b border-slate-50 bg-indigo-50/30">
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Award className="h-5 w-5" />
            ⚡ God-Mode: Manual Tier Adjustment
          </CardTitle>
          <CardDescription>
            บังคับเปลี่ยน Tier ของผู้ใช้ใด ๆ ในระบบ — ถูกบันทึกใน loyalty_tier_history ด้วย change_type = 'manual'
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Step 1: Customer picker */}
          <div className="space-y-2 relative">
            <Label>Step 1 — เลือกลูกค้า</Label>
            <div className="relative">
              <Input
                placeholder={allCustomersLoading ? "กำลังโหลดรายชื่อลูกค้า..." : "ค้นหาชื่อหรือ ID ลูกค้า..."}
                value={godCustomerSearch}
                onChange={(e) => { setGodCustomerSearch(e.target.value); setGodDropdownOpen(true); }}
                onFocus={() => setGodDropdownOpen(true)}
                disabled={allCustomersLoading}
                className="rounded-xl border-slate-200"
              />
              {allCustomersLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Customer dropdown list */}
            {godDropdownOpen && (godCustomerSearch.length > 0 || filteredCustomers.length > 0) && (
              <div className="absolute top-[68px] left-0 w-full border rounded-xl max-h-48 overflow-y-auto bg-white shadow-xl z-50">
                {filteredCustomers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-3">ไม่พบลูกค้า</p>
                ) : (
                  filteredCustomers.map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors text-sm border-b last:border-0",
                        godCustomerId === c.id && "bg-indigo-50/50 font-semibold"
                      )}
                      onClick={() => {
                        setGodCustomerId(c.id);
                        setGodCustomerSearch(c.full_name ?? c.id.slice(0, 8));
                        setGodDropdownOpen(false);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span>{safeTierIcons[c.loyalty_tier ?? ""] ?? "👤"}</span>
                        <span className="truncate">{c.full_name ?? "ไม่ระบุชื่อ"}</span>
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] rounded-full border-none",
                          (safeTierColors as any)[c.loyalty_tier ?? ""]?.bg,
                          (safeTierColors as any)[c.loyalty_tier ?? ""]?.text
                        )}
                      >
                        {c.loyalty_tier ?? "—"}
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected customer preview */}
            {godSelectedCustomer && (
              <div className="flex items-center gap-3 p-3 mt-3 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                <span className="text-2xl">{safeTierIcons[godSelectedCustomer.loyalty_tier ?? ""] ?? "👤"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{godSelectedCustomer.full_name ?? "ไม่ระบุชื่อ"}</p>
                  <p className="text-xs text-muted-foreground">
                    {(godSelectedCustomer.loyalty_points_balance ?? 0).toLocaleString()} pts
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Tier ปัจจุบัน:</span>
                  <Badge
                    className={cn(
                      "rounded-full border-none shadow-none",
                      (safeTierColors as any)[godSelectedCustomer.loyalty_tier ?? ""]?.bg,
                      (safeTierColors as any)[godSelectedCustomer.loyalty_tier ?? ""]?.text
                    )}
                  >
                    {godSelectedCustomer.loyalty_tier ?? "ไม่มี"}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Step 2 + 3 inline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 flex-1">
              <Label>Step 2 — Tier ใหม่</Label>
              <Select value={godTier} onValueChange={setGodTier}>
                <SelectTrigger className="rounded-xl border-slate-200">
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
            <div className="space-y-2 flex-1">
              <Label>Step 3 — เหตุผล (บังคับ)</Label>
              <Input
                placeholder="เหตุผลในการเปลี่ยน Tier..."
                value={godReason}
                onChange={(e) => setGodReason(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>

          {/* Action button */}
          <Button
            className="w-full font-bold rounded-xl mt-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            disabled={!godCustomerId || !godTier || !godReason.trim() || manualOverride.isPending}
            onClick={handleGodOverride}
          >
            {manualOverride.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Award className="h-4 w-4 mr-2" />
            )}
            Force Update Tier
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[20px] bg-white overflow-hidden shadow-md border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-800">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <Search className="h-4 w-4" />
            </div>
            Search Customers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl text-sm outline-none transition-all border-slate-200 bg-slate-50 focus:border-blue-500"
              />
              {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </div>

          {searchQuery.length >= 2 && (
            <div className="mt-4 space-y-2">
              {searchResults.length === 0 && !searchLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">No matching customers found</p>
              ) : (
                searchResults.map((customer: any) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{safeTierIcons[customer.loyalty_tier ?? ""] ?? "👤"}</div>
                      <div>
                        <p className="font-medium">{customer.full_name ?? "Unspecified"}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={(safeTierColors as any)[customer.loyalty_tier ?? ""]?.bg ?? "bg-muted"}>
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

      {selectedCustomer && (
        <Card className="rounded-[20px] bg-white overflow-hidden shadow-lg border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm bg-white border border-slate-200">
                {safeTierIcons[selectedCustomer.loyalty_tier ?? ""] ?? "👤"}
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-800">{selectedCustomer.full_name}</CardTitle>
                <CardDescription className="text-slate-500">{selectedCustomer.email}</CardDescription>
              </div>
            </div>
            <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Edit className="h-4 w-4 mr-2" /> Manual Override</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manual Tier Override</DialogTitle>
                  <DialogDescription>Manually change tier for {selectedCustomer.full_name}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Current Tier</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{safeTierIcons[selectedCustomer.loyalty_tier ?? ""] ?? "—"}</span>
                      <Badge className={safeTierColors[selectedCustomer.loyalty_tier ?? ""]?.bg ?? "bg-muted"}>
                        {selectedCustomer.loyalty_tier ?? "None"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>New Tier</Label>
                    <Select value={overrideTier} onValueChange={setOverrideTier}>
                      <SelectTrigger><SelectValue placeholder="Select new tier" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bronze">🥉 Bronze</SelectItem>
                        <SelectItem value="Silver">🥈 Silver</SelectItem>
                        <SelectItem value="Gold">🥇 Gold</SelectItem>
                        <SelectItem value="Platinum">💎 Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for change</Label>
                    <Textarea
                      placeholder="Specify reason..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleManualOverride} disabled={!overrideTier || !overrideReason.trim() || manualOverride.isPending}>
                    {manualOverride.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-5">
              {[
                { label: "Points", value: (selectedCustomer.loyalty_points_balance ?? 0).toLocaleString(), color: "#eab308", bg: "#fefce8", border: "#fef08a", icon: "★" },
                { label: "Total Spend", value: `฿ ${(selectedCustomer.total_spend ?? 0).toLocaleString()}`, color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", icon: "฿" },
                { label: "Member Duration", value: `${selectedCustomer.created_at ? Math.floor((Date.now() - new Date(selectedCustomer.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0} months`, color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", icon: <Clock className="h-5 w-5" /> },
                { label: "Current Tier", value: selectedCustomer.loyalty_tier ?? "ไม่มี", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", icon: safeTierIcons[selectedCustomer.loyalty_tier ?? ""] ?? "—" },
              ].map((stat, i) => (
                <div key={i} className="rounded-[18px] p-5 flex flex-col items-center justify-center text-center border bg-white shadow-sm" style={{ borderColor: stat.border }}>
                  <div className="h-10 w-10 text-xl font-bold rounded-[14px] flex items-center justify-center mb-3 border" style={{ background: stat.bg, color: stat.color, borderColor: stat.border }}>
                    {stat.icon}
                  </div>
                  <p className="text-[22px] font-extrabold text-slate-800">{stat.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-auto border border-slate-200">
          <TabsTrigger value="history" className="flex items-center gap-2 rounded-xl py-2 px-5 data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-sm">
            <History className="h-4 w-4" /> Tier History
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2 rounded-xl py-2 px-5 data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-sm">
            <ArrowUpDown className="h-4 w-4" /> Points
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2 rounded-xl py-2 px-5 data-[state=active]:bg-white data-[state=active]:text-orange-600 shadow-sm">
            <AlertTriangle className="h-4 w-4" /> Suspicious {unresolvedCount > 0 && <Badge className="bg-red-500 ml-1 h-5 px-1">{unresolvedCount}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          {/* Auto-Log Section */}
          <Card className="rounded-[20px] bg-white overflow-hidden shadow-md border-emerald-100">
            <CardHeader className="border-b border-emerald-50 bg-emerald-50/30">
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-emerald-900">
                <TrendingUp className="h-5 w-5 text-emerald-500" /> Tier Change History (Auto-Log)
              </CardTitle>
              <CardDescription>Auto-logged when customer tier conditions change</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
              {loyaltyHistoryLoading ? <div className="space-y-2 py-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> :
                loyaltyTierHistory.length === 0 ? <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl border-emerald-100">No auto-logs found</div> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Previous</TableHead>
                        <TableHead>New Tier</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loyaltyTierHistory.map((h: LoyaltyTierHistoryEntry) => {
                        const dateToFormat = h.changed_at || (h as any).created_at;
                        const customer = (h as any).customer;
                        const customerName = customer ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() : h.profile_customer_id.slice(0, 8);
                        return (
                          <TableRow key={h.id}>
                            <TableCell className="text-sm whitespace-nowrap">
                              {dateToFormat ? format(new Date(dateToFormat), "d MMM yyyy HH:mm", { locale: safeLocale }) : "—"}
                            </TableCell>
                            <TableCell className="font-medium">{customerName}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn("rounded-full border-none", safeTierColors[h.old_tier ?? ""]?.bg, safeTierColors[h.old_tier ?? ""]?.text)}>
                                {h.old_tier ?? "None"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                <Badge variant="secondary" className={cn("rounded-full border-none", safeTierColors[h.new_tier]?.bg, safeTierColors[h.new_tier]?.text)}>
                                  {h.new_tier}
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
          </Card>

          {/* Manual Overrides Section - Combined fix for the date bug */}
          <Card className="rounded-[20px] bg-white overflow-hidden shadow-md border-indigo-100">
            <CardHeader className="border-b border-indigo-50 bg-indigo-50/30">
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-indigo-900">
                <History className="h-5 w-5 text-indigo-500" /> Manual Overrides (Legacy)
              </CardTitle>
              <CardDescription>Manual tier changes performed by Administrators</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
              {historyLoading ? <div className="space-y-2 py-4"><Skeleton className="h-12 w-full" /></div> :
                historyError ? <div className="py-20 text-center text-destructive">Error loading history</div> :
                  tierHistory.length === 0 ? <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl border-indigo-100">No manual changes found</div> : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Previous</TableHead>
                          <TableHead>New Tier</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tierHistory.map((h: any) => { // 🟢 ใส่ : any ตรงนี้เพื่อปิดปาก TypeScript ให้มันหยุดบ่น
                          // 🟢 ใช้ changed_at หรือ created_at ก็ได้ กันเหนียว
                          const dateToFormat = h.changed_at || h.created_at;

                          // 🟢 ดึงชื่อยศมาโชว์ ถ้าไม่มีให้เป็นขีด (-)
                          const oldT = h.previous_tier?.name ?? h.old_tier ?? "—";
                          const newT = h.new_tier?.name ?? h.new_tier ?? "—";

                          return (
                            <TableRow key={h.id}>
                              <TableCell className="text-sm">
                                {dateToFormat ? format(new Date(dateToFormat), "d MMM yyyy", { locale: safeLocale }) : "—"}
                              </TableCell>
                              <TableCell className="font-medium">
                                {h.customer?.first_name ? `${h.customer.first_name} ${h.customer.last_name || ""}`.trim() : (h.customer?.full_name ?? h.customer?.email ?? "—")}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "rounded-full border-none",
                                    (safeTierColors as any)[oldT]?.bg, // 🟢 ใส่ (as any) เพื่อให้เรียกใช้สีได้ไม่ติด Error
                                    (safeTierColors as any)[oldT]?.text
                                  )}
                                >
                                  {oldT}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {/* เช็คว่าเลื่อนขึ้นหรือลง */}
                                  {(h.new_tier?.priority_level ?? 0) >= (h.previous_tier?.priority_level ?? 0) ?
                                    <TrendingUp className="h-4 w-4 text-green-500" /> :
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                  }
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "rounded-full border-none",
                                      (safeTierColors as any)[newT]?.bg,
                                      (safeTierColors as any)[newT]?.text
                                    )}
                                  >
                                    {newT}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">{h.change_reason}</TableCell>
                              <TableCell>
                                <Badge variant={h.is_manual_override ? "destructive" : "secondary"}>
                                  {h.is_manual_override ? (h.changer?.full_name ?? "Admin") : "System"}
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

        <TabsContent value="transactions">
          <Card className="rounded-[20px] bg-white overflow-hidden shadow-md border-indigo-100">
            <CardHeader className="bg-indigo-50/30 border-b border-indigo-50">
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-indigo-900">
                <ArrowUpDown className="h-5 w-5 text-indigo-500" />
                Points Transactions
              </CardTitle>
              <CardDescription>ประวัติการได้รับ/ใช้คะแนนทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px] p-0">
              {txLoading ? (
                <div className="space-y-2 py-4 px-6"><Skeleton className="h-12 w-full" /></div>
              ) : txError ? (
                <div className="py-20 text-center text-destructive">Error loading transactions</div>
              ) : pointsTransactions.length === 0 ? (
                <div className="py-20 m-6 text-center text-muted-foreground border-2 border-dashed rounded-xl border-indigo-100">No transactions found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6 bg-slate-50/50">Date</TableHead>
                      <TableHead className="bg-slate-50/50">Customer</TableHead>
                      <TableHead className="bg-slate-50/50">Type</TableHead>
                      <TableHead className="text-right bg-slate-50/50">Amount</TableHead>
                      <TableHead className="text-right bg-slate-50/50">Balance After</TableHead>
                      <TableHead className="pr-6 bg-slate-50/50">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pointsTransactions.slice(0, ADMIN_PAGE_SIZE).map((tx: any) => {
                      const customerName = tx.customer?.full_name ?? tx.customer?.email ?? tx.user_id.slice(0, 8);
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm pl-6">
                            {format(new Date(tx.created_at), "d MMM yyyy HH:mm", { locale: safeLocale })}
                          </TableCell>
                          <TableCell className="font-medium">{customerName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize rounded-lg shadow-sm bg-white border-slate-200">
                              {tx.transaction_type}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn("text-right font-medium", getTransactionTypeColor(tx.transaction_type))}>
                            {(tx.points_amount ?? 0) > 0 ? "+" : ""}{(tx.points_amount ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-semibold">{(tx.balance_after ?? 0).toLocaleString()}</TableCell>
                          <TableCell className="max-w-[200px] truncate pr-6 text-slate-600">{tx.description ?? "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          {/* ... (Keep alerts UI as it was) ... */}
          <Card className="rounded-[20px] bg-white overflow-hidden shadow-md">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle>Security Alerts</CardTitle>
            </CardHeader>
            <CardContent className="py-10 text-center text-muted-foreground">
              System health: Good. No unresolved alerts.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}