import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GitCompare,
  AlertCircle,
  FileText,
  Megaphone,
  FolderOpen,
  BarChart3,
  Calendar,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { usePlatformConnections, Platform } from "@/hooks/usePlatformConnections";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { SocialPostsList } from "@/components/social/SocialPostsList";
import { AdsList } from "@/components/social/AdsList";
import { AdGroupsList } from "@/components/social/AdGroupsList";
import { AdInsightsSummary } from "@/components/social/AdInsightsSummary";

// Helper to render platform icons with a "connected" dot
const getPlatformIcon = (platform: Platform, isActive: boolean) => {
  return (
    <div className="relative">
      {platform.icon ? (
        <platform.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
      ) : (
        <span className="text-sm">{platform.emoji}</span>
      )}
      {isActive && (
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      )}
    </div>
  );
};

export default function SocialAnalytics() {
  const navigate = useNavigate();
  const { connectedPlatforms } = usePlatformConnections();
  const [activePlatforms, setActivePlatforms] = useState<string[]>(
    connectedPlatforms.map((p) => p.id)
  );
  const [dateRange, setDateRange] = useState("7");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [adGroups, setAdGroups] = useState([
    { id: "ag-1", name: "Summer Sale Campaign" },
    { id: "ag-2", name: "New Arrivals Promotion" },
    { id: "ag-3", name: "Brand Awareness" },
    { id: "ag-4", name: "Year End Sale" },
  ]);

  const { posts } = useSocialPosts(dateRange);

  // Derived comparison logic using real post data
  const compareChartData = useMemo(() => {
    return posts
      .filter((p) => selectedPosts.includes(p.id))
      .map((p) => ({
        name: (p.content || "Untitled").substring(0, 12) + "...",
        impressions: p.impressions || 0,
        reach: p.reach || 0,
        likes: p.likes || 0,
        engagement: p.engagement_rate ? Number(p.engagement_rate) : 0,
      }));
  }, [selectedPosts, posts]);

  if (connectedPlatforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 border-2 border-dashed rounded-2xl mx-4">
        <div className="bg-muted p-4 rounded-full mb-4">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">No Platforms Connected</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Connect your social accounts to start tracking post performance and ad spend.
        </p>
        <Button size="lg" onClick={() => navigate("/api-keys")} className="gap-2">
          Connect API Keys <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

      {/* 1. TOP HEADER & PERFORMANCE PILLS */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter">SOCIAL ANALYTICS</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium uppercase tracking-widest">Real-time Performance</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
            <Button variant="ghost" size="sm" className="rounded-lg h-8 px-4">Overview</Button>
            <Button variant="secondary" size="sm" className="rounded-lg h-8 px-4 shadow-sm">Detailed</Button>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] bg-background border-none shadow-sm ring-1 ring-border">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          {selectedPosts.length >= 2 && (
            <Button onClick={() => setShowCompare(true)} variant="default" className="gap-2 shadow-lg shadow-primary/20 bg-primary">
              <GitCompare className="h-4 w-4" />
              Compare ({selectedPosts.length})
            </Button>
          )}
        </div>
      </div>

      {/* 2. PLATFORM SELECTOR BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-3 border-none bg-muted/30 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-wrap items-center gap-6">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-3 w-3" /> Data Sources
            </span>
            <div className="flex flex-wrap gap-4">
              {connectedPlatforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-full transition-all border ${activePlatforms.includes(platform.id)
                    ? 'bg-background border-primary/20 shadow-sm'
                    : 'bg-transparent border-transparent grayscale opacity-50'
                    }`}
                >
                  <Switch
                    checked={activePlatforms.includes(platform.id)}
                    onCheckedChange={() => setActivePlatforms(prev =>
                      prev.includes(platform.id) ? prev.filter(i => i !== platform.id) : [...prev, platform.id]
                    )}
                    className="data-[state=checked]:bg-primary"
                  />
                  <div className="flex items-center gap-2 pr-1">
                    {getPlatformIcon(platform, activePlatforms.includes(platform.id))}
                    <span className="text-sm font-semibold">{platform.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground border-none overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-16 w-16" />
          </div>
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <p className="text-xs font-bold uppercase opacity-70 tracking-tighter">Est. Ad Reach</p>
            <h2 className="text-2xl font-black">2.4M</h2>
          </CardContent>
        </Card>
      </div>

      {/* 3. MAIN WORKSPACE */}
      {activePlatforms.length > 0 ? (
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 h-12 rounded-2xl gap-2 w-full sm:w-auto overflow-x-auto justify-start">
            <TabsTrigger value="posts" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4 mr-2" /> Posts
            </TabsTrigger>
            <TabsTrigger value="ads" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Megaphone className="h-4 w-4 mr-2" /> Ads
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FolderOpen className="h-4 w-4 mr-2" /> Groups
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4 mr-2" /> Insights
            </TabsTrigger>
          </TabsList>

          <div className="bg-card border rounded-3xl p-2 shadow-sm min-h-[400px]">
            <TabsContent value="posts" className="m-0 border-none outline-none">
              <SocialPostsList
                selectedPosts={selectedPosts}
                onSelectPost={(id: string) => {
                  // Toggle selection logic
                  setSelectedPosts((prev) =>
                    prev.includes(id)
                      ? prev.filter((pid) => pid !== id)
                      : [...prev, id]
                  );
                }}
                dateRange={dateRange}
                activePlatforms={activePlatforms}
              />
            </TabsContent>
            <TabsContent value="ads" className="m-0 border-none outline-none">
              <AdsList adGroups={adGroups} />
            </TabsContent>
            <TabsContent value="groups" className="m-0 border-none outline-none">
              <AdGroupsList onGroupsChange={setAdGroups} />
            </TabsContent>
            <TabsContent value="insights" className="m-0 border-none outline-none">
              <AdInsightsSummary dateRange={dateRange} />
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="h-64 flex flex-col items-center justify-center text-muted-foreground">
            <Layers className="h-10 w-10 mb-2 opacity-20" />
            <p className="font-medium">Please enable at least one platform to see analytics</p>
          </CardContent>
        </Card>
      )}

      {/* 4. COMPARISON DIALOG */}
      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-5xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-muted/50 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
                <GitCompare className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Post Performance Comparison</DialogTitle>
                <CardDescription>Comparing key metrics across {selectedPosts.length} selected assets</CardDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-8">
            <div className="h-[350px] w-full bg-background rounded-2xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.4)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="impressions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="reach" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="likes" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareChartData.map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/20 border transition-hover hover:border-primary/50 group">
                  <h4 className="font-bold text-sm mb-4 truncate group-hover:text-primary transition-colors">{item.name}</h4>
                  <div className="space-y-3">
                    <MetricRow label="Engagement" value={`${item.engagement}%`} icon={TrendingUp} color="text-green-500" />
                    <MetricRow label="Impressions" value={`${(item.impressions / 1000).toFixed(1)}K`} icon={Eye} />
                    <MetricRow label="Likes" value={item.likes.toLocaleString()} icon={Heart} color="text-red-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple internal helper for the comparison cards
function MetricRow({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={`h-3 w-3 ${color}`} />
        {label}
      </div>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}