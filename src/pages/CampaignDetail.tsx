import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  BarChart,
  Bar,
} from "recharts";
import { useCampaigns, CampaignWithInsights } from "@/hooks/useCampaigns";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  scheduled: "bg-info/10 text-info border-info/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  draft: "bg-muted text-muted-foreground border-muted",
  completed: "bg-primary/10 text-primary border-primary/20",
};

// Generate mock performance data based on campaign
const generatePerformanceData = (campaign: CampaignWithInsights) => {
  const days = 7;
  const data = [];
  const baseImpressions = campaign.impressions / days;
  const baseReach = campaign.reach / days;
  const baseClicks = campaign.clicks / days;

  for (let i = 1; i <= days; i++) {
    const variance = 0.7 + Math.random() * 0.6;
    data.push({
      day: `Day ${i}`,
      impressions: Math.round(baseImpressions * variance),
      reach: Math.round(baseReach * variance),
      clicks: Math.round(baseClicks * variance),
    });
  }
  return data;
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns, isLoading, updateCampaign } = useCampaigns();

  // Find campaign by ID
  const campaign = useMemo(() => {
    return campaigns.find((c) => c.id === id);
  }, [campaigns, id]);

  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const status = localStatus ?? campaign?.status ?? "draft";

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

  const performanceData = generatePerformanceData(campaign);
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
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
          </CardContent>
        </Card>

        {/* Clicks Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
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
