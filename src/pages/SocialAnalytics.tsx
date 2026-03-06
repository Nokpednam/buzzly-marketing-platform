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
import { useAdInsights } from "@/hooks/useAdInsights";
import { useOnboardingGuard } from "@/hooks/useOnboardingGuard";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
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
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("detailed");

  const { state: onboardingState } = useOnboardingGuard();

  const { posts } = useSocialPosts(dateRange);
  const { summary: adSummary } = useAdInsights(dateRange);

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

  if (onboardingState !== "ready") {
    return <OnboardingBanner state={onboardingState} />;
  }

  return (
    <div className="relative min-h-[90vh] w-full bg-[#f4f7fb] dark:bg-background overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative z-10 animate-in fade-in duration-500">

        {/* 1. TOP HEADER & PERFORMANCE PILLS */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-border/40 pb-8">
          <div className="space-y-1 py-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-foreground inline-block bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl shadow-sm">
              Social Analytics
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
              <Button
                variant={viewMode === "overview" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg h-8 px-4 shadow-sm"
                onClick={() => setViewMode("overview")}
              >
                Overview
              </Button>
              <Button
                variant={viewMode === "detailed" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg h-8 px-4 shadow-sm"
                onClick={() => setViewMode("detailed")}
              >
                Detailed
              </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-3 border-none bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 shrink-0">
                <Layers className="h-4 w-4" /> Data Sources
              </span>
              <div className="flex flex-wrap gap-4">
                {connectedPlatforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all border duration-300 ${activePlatforms.includes(platform.id)
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-slate-50 dark:bg-slate-800 border-transparent grayscale opacity-50 hover:opacity-80'
                      }`}
                  >
                    <Switch
                      checked={activePlatforms.includes(platform.id)}
                      onCheckedChange={() => setActivePlatforms(prev =>
                        prev.includes(platform.id) ? prev.filter(i => i !== platform.id) : [...prev, platform.id]
                      )}
                      className="data-[state=checked]:bg-primary shadow-sm"
                    />
                    <div className="flex items-center gap-2 pr-1">
                      <div className={activePlatforms.includes(platform.id) ? "scale-105 transition-transform" : ""}>
                        {getPlatformIcon(platform, activePlatforms.includes(platform.id))}
                      </div>
                      <span className="text-sm font-bold tracking-tight">{platform.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#A88BFA] to-[#7C3AED] text-white border-none rounded-[2rem] overflow-hidden shadow-[0_12px_40px_rgb(139,92,246,0.3)] relative">
            <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-white/20 rounded-full blur-2xl" />
            <CardContent className="p-8 flex flex-col justify-center h-full relative z-10">
              <p className="text-sm tracking-wider opacity-90 font-medium mb-1">Est. Ad Reach</p>
              <h2 className="text-5xl font-bold tracking-tight">
                {adSummary.totalReach >= 1_000_000
                  ? <>{(adSummary.totalReach / 1_000_000).toFixed(1)}<span className="text-3xl ml-1">M</span></>
                  : adSummary.totalReach >= 1_000
                    ? <>{(adSummary.totalReach / 1_000).toFixed(1)}<span className="text-3xl ml-1">K</span></>
                    : <>{adSummary.totalReach > 0 ? adSummary.totalReach.toLocaleString() : "—"}</>}
              </h2>
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

            <div className="bg-white dark:bg-slate-900 border-none rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[400px]">
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
                <AdsList adGroups={[]} />
              </TabsContent>
              <TabsContent value="groups" className="m-0 border-none outline-none">
                <AdGroupsList />
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

        <Dialog open={showCompare} onOpenChange={setShowCompare}>
          <DialogContent className="max-w-5xl rounded-[2.5rem] bg-card/95 backdrop-blur-2xl border border-border/50 shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-8 bg-muted/30 border-b border-border/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
                  <GitCompare className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-foreground/90">Post Performance Comparison</DialogTitle>
                  <CardDescription className="text-sm font-medium mt-1">Comparing key metrics across {selectedPosts.length} selected assets</CardDescription>
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