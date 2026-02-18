import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  Pause,
  Play,
  Download,
  DollarSign,
  TrendingUp,
  Eye,
  MousePointer,
  Target,
  Users,
  Calendar,
  Clock,
  Megaphone,
  Loader2,
  Tag,
  Plus,
  X,
  BarChart2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useCampaigns, CampaignWithInsights } from "@/hooks/useCampaigns";
import { useCampaignInsights } from "@/hooks/useAdInsights";
import { useTags, useCampaignTags } from "@/hooks/useTags";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  scheduled: "bg-info/10 text-info border-info/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-muted",
  completed: "bg-primary/10 text-primary border-primary/20",
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns, isLoading, updateCampaign } = useCampaigns();

  // Real daily insights from ad_insights table
  const { dailyInsights, isLoading: insightsLoading } = useCampaignInsights(id);

  // Tags
  const { tags, createTag, assignTagToCampaign, removeTagFromCampaign } = useTags("campaign");
  const { data: campaignTags = [], isLoading: tagsLoading } = useCampaignTags(id ?? null);

  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");

  // Find campaign by ID
  const campaign = useMemo(() => {
    return campaigns.find((c) => c.id === id);
  }, [campaigns, id]);

  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const status = localStatus ?? campaign?.status ?? "draft";

  const campaignTagIds = new Set(campaignTags.map((t) => t.id));

  const handleToggleTag = async (tagId: string) => {
    if (!id) return;
    if (campaignTagIds.has(tagId)) {
      await removeTagFromCampaign.mutateAsync({ campaignId: id, tagId });
    } else {
      await assignTagToCampaign.mutateAsync({ campaignId: id, tagId });
    }
  };

  const handleCreateAndAddTag = async () => {
    if (!newTagName.trim() || !id) return;
    const tag = await createTag.mutateAsync({
      name: newTagName.trim(),
      color_code: newTagColor,
      entity_type: "campaign",
    });
    if (tag) {
      await assignTagToCampaign.mutateAsync({ campaignId: id, tagId: tag.id });
    }
    setNewTagName("");
    setNewTagColor("#6366f1");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Megaphone className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Campaign not found</h2>
        <Button onClick={() => navigate("/campaigns")}>
          Back to Campaigns
        </Button>
      </div>
    );
  }

  const progress = status === "completed" ? 100 : status === "active" ? 50 : 0;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleToggleStatus = async () => {
    const newStatus = status === "active" ? "paused" : "active";
    setLocalStatus(newStatus);
    await updateCampaign.mutateAsync({ id: campaign.id, updates: { status: newStatus } });
    toast.success(`Campaign ${newStatus === "active" ? "resumed" : "paused"}`);
  };

  const ctr = campaign.impressions > 0
    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
    : "0";
  const cvr = campaign.clicks > 0
    ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2)
    : "0";

  const metrics = [
    { title: "Impressions", value: formatNumber(campaign.impressions), icon: Eye, color: "text-blue-600" },
    { title: "Reach", value: formatNumber(campaign.reach), icon: Users, color: "text-green-600" },
    { title: "Clicks", value: formatNumber(campaign.clicks), icon: MousePointer, color: "text-orange-600" },
    { title: "Conversions", value: formatNumber(campaign.conversions), icon: Target, color: "text-pink-600" },
    { title: "Spend", value: `$${campaign.spend.toFixed(0)}`, icon: DollarSign, color: "text-cyan-600" },
    { title: "CTR", value: `${ctr}%`, icon: TrendingUp, color: "text-purple-600" },
  ];

  // Format chart data: use real date labels
  const chartData = dailyInsights.map((d) => ({
    day: format(new Date(d.date), "MMM d"),
    impressions: d.impressions,
    reach: d.reach,
    clicks: d.clicks,
    conversions: d.conversions,
    spend: d.spend,
  }));

  const hasChartData = chartData.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/campaigns")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge
                variant="outline"
                className={statusStyles[status] || statusStyles.draft}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
            <p className="text-muted-foreground mt-1">{campaign.objective || "ไม่มีรายละเอียด"}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {campaign.start_date
                  ? new Date(campaign.start_date).toLocaleDateString("th-TH")
                  : "TBD"} - {campaign.end_date
                    ? new Date(campaign.end_date).toLocaleDateString("th-TH")
                    : "TBD"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Budget: ${campaign.budget_amount?.toLocaleString() || 0}
              </span>
            </div>

            {/* Tag Chips */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {tagsLoading ? (
                <span className="text-xs text-muted-foreground">Loading tags...</span>
              ) : (
                campaignTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tag.color_code }}
                  >
                    {tag.name}
                    <button
                      onClick={() => handleToggleTag(tag.id)}
                      className="ml-0.5 hover:opacity-70 transition-opacity"
                      aria-label={`Remove tag ${tag.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}

              {/* Add Tag Popover */}
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1">
                    <Tag className="h-3 w-3" />
                    + Tag
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">EXISTING TAGS</p>
                  <div className="flex flex-col gap-1 max-h-36 overflow-y-auto mb-3">
                    {tags.length === 0 && (
                      <p className="text-xs text-muted-foreground">No tags yet</p>
                    )}
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleToggleTag(tag.id)}
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted text-sm text-left transition-colors"
                      >
                        <span
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color_code }}
                        />
                        <span className="flex-1 truncate">{tag.name}</span>
                        {campaignTagIds.has(tag.id) && (
                          <span className="text-xs text-success font-medium">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">CREATE NEW TAG</p>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="h-7 text-xs"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateAndAddTag()}
                    />
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="h-7 w-7 rounded border cursor-pointer"
                      title="Pick color"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-7 text-xs gap-1"
                    onClick={handleCreateAndAddTag}
                    disabled={!newTagName.trim() || createTag.isPending}
                  >
                    <Plus className="h-3 w-3" />
                    Create & Add
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-12 sm:ml-0">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          {status !== "completed" && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleToggleStatus}
              disabled={updateCampaign.isPending}
            >
              {updateCampaign.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : status === "active" ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Campaign Progress</span>
            <span className="text-sm font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <p className="text-sm text-muted-foreground">{metric.title}</p>
              </div>
              <p className="mt-2 text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Impressions & Reach Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Impressions & Reach Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !hasChartData ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-center border-2 border-dashed rounded-xl">
                <BarChart2 className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No daily insights yet</p>
                <p className="text-xs text-muted-foreground/60 max-w-[200px]">
                  Daily performance data will appear here once ad insights are recorded for this campaign.
                </p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="impressions"
                      name="Impressions"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="reach"
                      name="Reach"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clicks Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !hasChartData ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-center border-2 border-dashed rounded-xl">
                <BarChart2 className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No daily insights yet</p>
                <p className="text-xs text-muted-foreground/60 max-w-[200px]">
                  Click data will appear here once ad insights are recorded for this campaign.
                </p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      name="Clicks"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Click-Through Rate</p>
              <p className="text-2xl font-bold">{ctr}%</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{cvr}%</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Cost Per Click</p>
              <p className="text-2xl font-bold">
                ${campaign.clicks > 0 ? (campaign.spend / campaign.clicks).toFixed(2) : "0"}
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Cost Per Conversion</p>
              <p className="text-2xl font-bold">
                ${campaign.conversions > 0 ? (campaign.spend / campaign.conversions).toFixed(2) : "0"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
