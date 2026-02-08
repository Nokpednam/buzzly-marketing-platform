import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Filter,
  Loader2,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useCampaigns, CampaignWithInsights } from "@/hooks/useCampaigns";
import { supabase } from "@/integrations/supabase/client";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  scheduled: "bg-info/10 text-info border-info/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-muted",
  completed: "bg-primary/10 text-primary border-primary/20",
};

const platformStyles: Record<string, string> = {
  Facebook: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Instagram: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  TikTok: "bg-slate-800/10 text-slate-700 border-slate-800/20 dark:text-slate-300",
  Shopee: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export default function Campaigns() {
  const navigate = useNavigate();
  const {
    campaigns: dbCampaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign
  } = useCampaigns();

  const [activeTab, setActiveTab] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignWithInsights | null>(null);

  // Ad Accounts state
  const [adAccounts, setAdAccounts] = useState<Array<{ id: string; account_name: string }>>([]);
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>("");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    objective: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "draft",
    adAccountId: "",
  });

  // Fetch ad_accounts on mount
  useEffect(() => {
    const fetchAdAccounts = async () => {
      try {
        const { data, error } = await supabase
          .from("ad_accounts")
          .select("id, account_name")
          .eq("is_active", true)
          .order("account_name");

        if (error) throw error;

        setAdAccounts(data || []);

        // Auto-select first account if available
        if (data && data.length > 0) {
          setSelectedAdAccount(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching ad accounts:", error);
        toast.error("ไม่สามารถโหลดบัญชีโฆษณา");
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAdAccounts();
  }, []);

  // Map DB campaigns to display format
  const campaigns = useMemo(() => {
    return dbCampaigns.map((c) => ({
      ...c,
      displayStatus: c.status || "draft",
      progress: c.status === "completed" ? 100 : c.status === "active" ? 50 : 0,
    }));
  }, [dbCampaigns]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesTab = activeTab === "all" || campaign.status === activeTab;
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.objective?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesTab && matchesSearch;
    });
  }, [campaigns, activeTab, searchQuery]);

  // Stats
  const activeCampaignsCount = campaigns.filter((c) => c.status === "active").length;
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalEngagement = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgEngagementRate = totalImpressions > 0 ? ((totalEngagement / totalImpressions) * 100).toFixed(2) : "0";

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleToggleStatus = async (id: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await updateCampaign.mutateAsync({ id, updates: { status: newStatus } });
  };

  const handleDuplicate = async (campaign: CampaignWithInsights) => {
    try {
      await createCampaign.mutateAsync({
        name: `${campaign.name} (Copy)`,
        objective: campaign.objective,
        budget_amount: campaign.budget_amount,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        status: "draft",
      });
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    // Issue #1 Fix: Add confirmation dialog
    const confirmed = window.confirm(
      "คุณแน่ใจหรือไม่ที่จะลบ Campaign นี้?\n\nการลบจะไม่สามารถย้อนกลับได้"
    );

    if (!confirmed) return;

    try {
      await deleteCampaign.mutateAsync(id);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/campaigns/${id}`);
  };

  const openCreateDialog = () => {
    setEditingCampaign(null);
    setFormData({
      name: "",
      objective: "",
      budget: "",
      startDate: "",
      endDate: "",
      status: "draft",
      adAccountId: selectedAdAccount || "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (campaign: CampaignWithInsights) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      objective: campaign.objective || "",
      budget: campaign.budget_amount?.toString() || "",
      startDate: campaign.start_date?.split("T")[0] || "",
      endDate: campaign.end_date?.split("T")[0] || "",
      status: campaign.status || "draft",
      adAccountId: campaign.ad_account_id || selectedAdAccount || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Issue #4 Fix: Comprehensive Form Validation

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("กรุณาใส่ชื่อ Campaign");
      return;
    }

    // Validate budget
    if (formData.budget) {
      const budgetNum = Number(formData.budget);
      if (isNaN(budgetNum)) {
        toast.error("Budget ต้องเป็นตัวเลขเท่านั้น");
        return;
      }
      if (budgetNum <= 0) {
        toast.error("Budget ต้องมากกว่า 0");
        return;
      }
    }

    // Validate dates
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate > endDate) {
        toast.error("วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");
        return;
      }
    }

    // Validate end date not in the past (for new campaigns)
    if (!editingCampaign && formData.endDate) {
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day

      if (endDate < today) {
        toast.error("วันที่สิ้นสุดต้องไม่เป็นอดีต");
        return;
      }
    }

    // Validate ad_account_id (CRITICAL for RLS)
    const adAccountId = formData.adAccountId || selectedAdAccount;
    if (!adAccountId) {
      toast.error("กรุณาเลือกบัญชีโฆษณา");
      return;
    }

    try {
      if (editingCampaign) {
        await updateCampaign.mutateAsync({
          id: editingCampaign.id,
          updates: {
            name: formData.name,
            objective: formData.objective || null,
            budget_amount: formData.budget ? Number(formData.budget) : null,
            start_date: formData.startDate || null,
            end_date: formData.endDate || null,
            ad_account_id: adAccountId,
          },
        });
      } else {
        await createCampaign.mutateAsync({
          name: formData.name,
          objective: formData.objective || null,
          budget_amount: formData.budget ? Number(formData.budget) : null,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          status: "draft",
          ad_account_id: adAccountId,
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground">
            Create, manage and track your marketing campaigns
          </p>
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Campaign Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign ? "แก้ไขรายละเอียดแคมเปญ" : "สร้างแคมเปญใหม่"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Ad Account Selector */}
            <div className="grid gap-2">
              <Label htmlFor="adAccount">
                บัญชีโฆษณา <span className="text-destructive">*</span>
              </Label>
              {isLoadingAccounts ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังโหลด...
                </div>
              ) : adAccounts.length === 0 ? (
                <div className="text-sm text-destructive">
                  ไม่พบบัญชีโฆษณา กรุณาสร้างบัญชีโฆษณาก่อน
                </div>
              ) : (
                <Select
                  value={formData.adAccountId || selectedAdAccount}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, adAccountId: value }));
                    setSelectedAdAccount(value);
                  }}
                >
                  <SelectTrigger id="adAccount">
                    <SelectValue placeholder="เลือกบัญชีโฆษณา" />
                  </SelectTrigger>
                  <SelectContent>
                    {adAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                ชื่อ Campaign <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="เช่น Summer Sale 2025"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="objective">วัตถุประสงค์</Label>
              <Textarea
                id="objective"
                placeholder="รายละเอียดเกี่ยวกับแคมเปญ..."
                value={formData.objective}
                onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="5000"
                value={formData.budget}
                onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">วันที่เริ่มต้น</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCampaign.isPending || updateCampaign.isPending}
            >
              {(createCampaign.isPending || updateCampaign.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editingCampaign ? "บันทึก" : "สร้าง Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{activeCampaignsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Eye className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{formatNumber(totalImpressions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                <p className="text-2xl font-bold">{avgEngagementRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold">{formatNumber(totalConversions)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Campaigns List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "ไม่พบ Campaign ที่ค้นหา" : "ยังไม่มี Campaign กด 'New Campaign' เพื่อสร้าง"}
              </div>
            ) : (
              filteredCampaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="border shadow-none cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleViewDetails(campaign.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-6">
                      {/* Left Column */}
                      <div className="flex-shrink-0 w-64 border-r border-border pr-6">
                        <h3 className="font-semibold text-lg mb-2">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {campaign.objective || "ไม่มีรายละเอียด"}
                        </p>
                        <div className="space-y-1.5 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {campaign.start_date
                                ? new Date(campaign.start_date).toLocaleDateString("th-TH")
                                : "TBD"}{" "}
                              -{" "}
                              {campaign.end_date
                                ? new Date(campaign.end_date).toLocaleDateString("th-TH")
                                : "TBD"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Budget: ${campaign.budget_amount?.toLocaleString() || "0"}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(statusStyles[campaign.status || "draft"] || statusStyles.draft, "mt-3")}
                        >
                          {campaign.status
                            ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)
                            : "Draft"}
                        </Badge>
                      </div>

                      {/* Right Column */}
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-5 gap-4 text-center mb-4">
                          <div>
                            <p className="text-lg font-semibold">{formatNumber(campaign.impressions)}</p>
                            <p className="text-xs text-muted-foreground">Impressions</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{formatNumber(campaign.reach)}</p>
                            <p className="text-xs text-muted-foreground">Reach</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{formatNumber(campaign.clicks)}</p>
                            <p className="text-xs text-muted-foreground">Clicks</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">${campaign.spend.toFixed(0)}</p>
                            <p className="text-xs text-muted-foreground">Spend</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-success">
                              {formatNumber(campaign.conversions)}
                            </p>
                            <p className="text-xs text-muted-foreground">Conversions</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-3 border-t border-border">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{campaign.progress}%</span>
                            </div>
                            <Progress value={campaign.progress} className="h-2" />
                          </div>

                          <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                            {campaign.status === "active" ? (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                                disabled={updateCampaign.isPending}
                              >
                                {updateCampaign.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Pause className="h-4 w-4" />
                                )}
                              </Button>
                            ) : campaign.status === "paused" ||
                              campaign.status === "draft" ||
                              campaign.status === "scheduled" ? (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                                disabled={updateCampaign.isPending}
                              >
                                {updateCampaign.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            ) : null}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-popover">
                                <DropdownMenuItem onClick={() => handleViewDetails(campaign.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEditDialog(campaign)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDuplicate(campaign)}
                                  disabled={createCampaign.isPending}
                                >
                                  {createCampaign.isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Copy className="h-4 w-4 mr-2" />
                                  )}
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(campaign.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
