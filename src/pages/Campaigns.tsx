import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Users,
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Search,
  Copy,
  Trash2,
  Eye,
  Edit,
  Loader2,
  ArrowUpRight,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useCampaigns, CampaignWithInsights, calculateCampaignProgress } from "@/hooks/useCampaigns";
import { supabase } from "@/integrations/supabase/client";
import { AdAllocator } from "@/components/campaigns/AdAllocator";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  paused: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  draft: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  completed: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

export default function Campaigns() {
  const navigate = useNavigate();
  const {
    campaigns: dbCampaigns,
    isLoading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  } = useCampaigns();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] =
    useState<CampaignWithInsights | null>(null);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);

  const handleDuplicate = async (campaign: CampaignWithInsights) => {
    try {
      await createCampaign.mutateAsync({
        name: `${campaign.name} (Copy)`,
        objective: campaign.objective,
        budget_amount: campaign.budget_amount,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        status: "draft", // Always default a copy to draft
        ad_account_id: campaign.ad_account_id, // Critical for RLS/Permissions
      });
      toast.success("คัดลอกแคมเปญสำเร็จ");
    } catch (error) {
      console.error("Duplicate failed:", error);
      toast.error("ไม่สามารถคัดลอกแคมเปญได้");
    }
  };
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>("");

  const { state: onboardingState } = useOnboardingGuard();

  // Use React Query so this auto-refetches when a platform is connected
  const { data: adAccounts = [] } = useQuery({
    queryKey: ["ad-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_accounts")
        .select("id, account_name")
        .eq("is_active", true)
        .order("account_name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });

  // Auto-select first ad account when data loads
  useEffect(() => {
    if (adAccounts.length > 0 && !selectedAdAccount) {
      setSelectedAdAccount(adAccounts[0].id);
    }
  }, [adAccounts, selectedAdAccount]);

  const [formData, setFormData] = useState({
    name: "",
    objective: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "draft",
    adAccountId: "",
    kpiMetric: "",
    kpiValue: "",
  });

  const campaigns = useMemo(() => {
    return dbCampaigns.map((c) => ({
      ...c,
      displayStatus: c.status || "draft",
      progress: calculateCampaignProgress(c).overallProgress,
    }));
  }, [dbCampaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesTab = activeTab === "all" || campaign.status === activeTab;
      const matchesSearch = campaign.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [campaigns, activeTab, searchQuery]);

  // Global Stats
  const activeCampaignsCount = campaigns.filter(
    (c) => c.status === "active",
  ).length;
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleToggleStatus = async (
    id: string,
    currentStatus: string | null,
  ) => {
    // Pause: only from active
    if (currentStatus === "active") {
      await updateCampaign.mutateAsync({ id, updates: { status: "paused" } });
      return;
    }
    // Activate: from paused, draft, or scheduled
    if (currentStatus === "paused" || currentStatus === "draft" || currentStatus === "scheduled") {
      await updateCampaign.mutateAsync({ id, updates: { status: "active" } });
      return;
    }
    if (currentStatus === "completed") {
      toast.error("Cannot change completed campaign");
      return;
    }
    toast.error("Cannot toggle this status");
  };

  const handleDelete = (id: string) => {
    setDeletingCampaignId(id);
  };

  const confirmDelete = async () => {
    if (!deletingCampaignId) return;
    await deleteCampaign.mutateAsync(deletingCampaignId);
    setDeletingCampaignId(null);
  };

  const openCreateDialog = () => {
    setEditingCampaign(null);
    setSelectedAdIds([]);
    setFormData({
      name: "",
      objective: "",
      budget: "",
      startDate: "",
      endDate: "",
      status: "draft",
      adAccountId: selectedAdAccount || "",
      kpiMetric: "",
      kpiValue: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (campaign: CampaignWithInsights) => {
    setEditingCampaign(campaign);
    setSelectedAdIds(campaign.ad_ids || []);
    setFormData({
      name: campaign.name,
      objective: campaign.objective || "",
      budget: campaign.budget_amount?.toString() || "",
      startDate: campaign.start_date?.split("T")[0] || "",
      endDate: campaign.end_date?.split("T")[0] || "",
      status: campaign.status || "draft",
      adAccountId: campaign.ad_account_id || selectedAdAccount || "",
      kpiMetric: campaign.target_kpi_metric || "",
      kpiValue: campaign.target_kpi_value?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error("กรุณาใส่ชื่อ Campaign");
    const adAccountId = formData.adAccountId || selectedAdAccount;
    if (!adAccountId) return toast.error("กรุณาเลือกบัญชีโฆษณา");

    try {
      const payload = {
        name: formData.name,
        objective: formData.objective || null,
        budget_amount: formData.budget ? Number(formData.budget) : null,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        ad_account_id: adAccountId,
        target_kpi_metric: formData.kpiMetric || null,
        target_kpi_value: formData.kpiValue ? Number(formData.kpiValue) : null,
      } as any; // new columns not yet in generated types.ts

      const status = (formData.status || "draft") as "draft" | "scheduled" | "active" | "paused" | "completed";
      if (editingCampaign) {
        await updateCampaign.mutateAsync({
          id: editingCampaign.id,
          updates: { ...payload, status },
          adIds: selectedAdIds,
        });
      } else {
        await createCampaign.mutateAsync({ ...payload, status, adIds: selectedAdIds });
      }
      setIsDialogOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Operation failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Synchronizing campaign data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <Target className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-xl font-bold">Failed to load campaigns</h3>
        <p className="text-muted-foreground text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  if (onboardingState !== "ready") {
    return <OnboardingBanner state={onboardingState} />;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 p-4 md:p-8">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
            <BarChart3 className="h-3.5 w-3.5" /> Performance Hub
          </div>
          <h1 className="text-3xl font-black tracking-tighter">CAMPAIGNS</h1>
          <p className="text-muted-foreground">
            Monitor and scale your growth initiatives across all platforms.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="rounded-xl px-6 shadow-lg shadow-primary/20 bg-primary h-11 transition-all hover:scale-[1.02]"
        >
          <Plus className="h-5 w-5 mr-2" /> New Campaign
        </Button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Active Campaigns"
          value={activeCampaignsCount}
          icon={Target}
          color="text-blue-500"
          bgColor="bg-blue-50/50 dark:bg-blue-950/20"
          borderColor="border-blue-200/40 dark:border-blue-800/40"
        />
        <MetricCard
          label="Total Impressions"
          value={formatNumber(totalImpressions)}
          icon={Eye}
          color="text-emerald-500"
          bgColor="bg-emerald-50/50 dark:bg-emerald-950/20"
          borderColor="border-emerald-200/40 dark:border-emerald-800/40"
        />
        <MetricCard
          label="Total Spend"
          value={`฿${formatNumber(totalSpend)}`}
          icon={DollarSign}
          color="text-amber-500"
          bgColor="bg-amber-50/50 dark:bg-amber-950/20"
          borderColor="border-amber-200/40 dark:border-amber-800/40"
        />
        <MetricCard
          label="Conversions"
          value={formatNumber(totalConversions)}
          icon={Users}
          color="text-indigo-500"
          bgColor="bg-indigo-50/50 dark:bg-indigo-950/20"
          borderColor="border-indigo-200/40 dark:border-indigo-800/40"
        />
      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-gradient-to-r from-violet-50/30 via-sky-50/30 to-emerald-50/30 dark:from-violet-950/10 dark:via-sky-950/10 dark:to-emerald-950/10 p-2 rounded-2xl backdrop-blur-sm border-2 border-violet-200/30 dark:border-violet-800/30">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full lg:w-auto"
        >
          <TabsList className="bg-transparent h-10 gap-1">
            {["all", "active", "paused", "scheduled", "draft", "completed"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-lg px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm capitalize"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-9 bg-background border-none shadow-none rounded-xl h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 4. CAMPAIGN LIST */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <Card className="border-2 border-dashed border-border/60 bg-muted/10">
            <CardContent className="py-20 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-background rounded-full mb-4 shadow-sm">
                <Target className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-bold">No Campaigns Found</h3>
              <p className="text-muted-foreground max-w-xs">
                Try adjusting your filters or create a new campaign to get
                started.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="group overflow-hidden border-2 border-border/60 shadow-md hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(`/campaigns/${campaign.id}`)}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Meta Column */}
                <div className="p-6 lg:w-80 border-b-2 lg:border-b-0 lg:border-r-2 border-border/50 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-950/10 dark:to-purple-950/10 transition-colors group-hover:from-blue-100/40 group-hover:to-purple-100/40 dark:group-hover:from-blue-900/20 dark:group-hover:to-purple-900/20">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md text-[10px] font-bold px-1.5 py-0",
                        statusStyles[campaign.status || "draft"],
                      )}
                    >
                      {campaign.status?.toUpperCase() || "DRAFT"}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
                      <Clock className="h-3 w-3" />{" "}
                      {campaign.start_date
                        ? new Date(campaign.start_date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )
                        : "TBD"}
                    </span>
                  </div>
                  <h3 className="text-lg font-black leading-tight mb-2 group-hover:text-primary transition-colors">
                    {campaign.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 italic">
                    {campaign.objective || "No objective defined."}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-primary/10 text-primary p-1 rounded">
                      <DollarSign className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-bold">
                      ฿{campaign.budget_amount?.toLocaleString() ?? "—"}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest ml-1">
                      Budget
                    </span>
                  </div>

                  {/* Ad Account */}
                  {campaign.ad_account_name && (
                    <p className="text-[10px] text-muted-foreground font-medium mb-2 truncate">
                      {campaign.ad_account_name}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                    {campaign.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white shadow-sm"
                        style={{ backgroundColor: tag.color_code }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Performance Column */}
                <div className="p-6 flex-1 bg-gradient-to-br from-emerald-50/20 to-cyan-50/20 dark:from-emerald-950/5 dark:to-cyan-950/5 relative">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <DataPoint
                      label="Impressions"
                      value={formatNumber(campaign.impressions)}
                    />
                    <DataPoint
                      label="CTR"
                      value={`${((campaign.clicks / (campaign.impressions || 1)) * 100).toFixed(2)}%`}
                    />
                    <DataPoint
                      label="Conversions"
                      value={formatNumber(campaign.conversions)}
                      highlight
                    />
                    <DataPoint
                      label="Cost/Conv"
                      value={`$${(campaign.spend / (campaign.conversions || 1)).toFixed(2)}`}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-1.5 text-muted-foreground">
                        <span>Campaign Delivery</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <Progress value={campaign.progress} className="h-1.5" />
                    </div>

                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {campaign.status !== "completed" && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full h-10 w-10 shadow-sm"
                          onClick={() =>
                            handleToggleStatus(campaign.id, campaign.status)
                          }
                        >
                          {campaign.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 fill-current" />
                          )}
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-10 w-10"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl p-2"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/campaigns/${campaign.id}`)
                            }
                            className="rounded-lg"
                          >
                            <Eye className="h-4 w-4 mr-2" /> View Insights
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(campaign)}
                            className="rounded-lg"
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(campaign)}
                            className="rounded-lg"
                          >
                            <Copy className="h-4 w-4 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(campaign.id)}
                            className="text-destructive rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {/* Visual background flourish */}
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                    <TrendingUp className="h-24 w-24" />
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog
        open={!!deletingCampaignId}
        onOpenChange={(open) => { if (!open) setDeletingCampaignId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบ Campaign นี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 5. DIALOG - STYLED FOR CLARITY */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-muted/50 border-b">
            <DialogTitle className="text-2xl font-black">
              {editingCampaign ? "EDIT CAMPAIGN" : "NEW CAMPAIGN"}
            </DialogTitle>
            <DialogDescription>
              Set up your delivery parameters and budget.
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-5 overflow-y-auto max-h-[65vh]">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Ad Account
              </Label>
              <Select
                value={formData.adAccountId || selectedAdAccount}
                onValueChange={(value) =>
                  setFormData((p) => ({ ...p, adAccountId: value }))
                }
              >
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none shadow-none focus:ring-2 ring-primary/20">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {adAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Campaign Identity
              </Label>
              <Input
                placeholder="e.g. Q1 Global Brand Awareness"
                value={formData.name}
                className="h-12 rounded-xl bg-muted/30 border-none shadow-none"
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Budget ($)
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="h-12 rounded-xl bg-muted/30 border-none shadow-none"
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, budget: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Objective
                </Label>
                <Input
                  placeholder="e.g. Conversion"
                  className="h-12 rounded-xl bg-muted/30 border-none shadow-none"
                  value={formData.objective}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, objective: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none shadow-none focus:ring-2 ring-primary/20">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  type="date"
                  className="h-12 rounded-xl bg-muted/30 border-none shadow-none"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  End Date
                </Label>
                <Input
                  type="date"
                  className="h-12 rounded-xl bg-muted/30 border-none shadow-none"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, endDate: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* KPI Target */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                KPI Target
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={formData.kpiMetric || "none"}
                  onValueChange={(v) => setFormData((p) => ({ ...p, kpiMetric: v === "none" ? "" : v }))}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none shadow-none focus:ring-2 ring-primary/20">
                    <SelectValue placeholder="Select Metric" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="clicks">Clicks</SelectItem>
                    <SelectItem value="conversions">Conversions</SelectItem>
                    <SelectItem value="spend">Spend (฿)</SelectItem>
                    <SelectItem value="impressions">Impressions</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="Target value"
                  className="h-12 rounded-xl bg-muted/30 border-none shadow-none"
                  value={formData.kpiValue}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, kpiValue: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Assign Ads */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Assign Ads
                </Label>
                {selectedAdIds.length > 0 && (
                  <span className="text-xs text-primary font-semibold">
                    {selectedAdIds.length} selected
                  </span>
                )}
              </div>
              <AdAllocator value={selectedAdIds} onChange={setSelectedAdIds} />
            </div>
          </div>
          <DialogFooter className="p-8 bg-muted/20 border-t flex items-center justify-between sm:justify-between">
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="rounded-xl px-8 shadow-lg shadow-primary/10"
            >
              {editingCampaign ? "Save Changes" : "Initialize Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// UI HELPERS
function MetricCard({ label, value, icon: Icon, color, bgColor, borderColor }: any) {
  return (
    <Card className={`border-2 ${borderColor} ${bgColor} shadow-sm rounded-2xl group transition-all hover:shadow-md hover:border-primary/30`}>
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`p-3 rounded-xl bg-background ${color} shadow-sm group-hover:scale-110 transition-transform`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
            {label}
          </p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DataPoint({ label, value, highlight }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p
        className={cn(
          "text-xl font-black tracking-tight",
          highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}
