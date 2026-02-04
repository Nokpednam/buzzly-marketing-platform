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
  MessageCircle,
  Share2,
  TrendingUp,
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
import { SocialPostsList } from "@/components/social/SocialPostsList";
import { AdsList } from "@/components/social/AdsList";
import { AdGroupsList } from "@/components/social/AdGroupsList";
import { AdInsightsSummary } from "@/components/social/AdInsightsSummary";

// Mock comparison data
const getComparisonData = (selectedIds: string[]) => {
  const mockPosts = [
    { id: "sp-1", title: "เปิดตัวคอลเลคชันใหม่", impressions: 45200, reach: 38500, likes: 1250, comments: 89, shares: 234, engagement_rate: 8.5 },
    { id: "sp-2", title: "Behind the scenes", impressions: 28300, reach: 24100, likes: 2100, comments: 156, shares: 89, engagement_rate: 12.3 },
    { id: "sp-3", title: "Tutorial: 5 วิธีแต่งตัว", impressions: 125000, reach: 98000, likes: 8900, comments: 456, shares: 1200, engagement_rate: 18.5 },
    { id: "sp-4", title: "Flash Sale", impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0, engagement_rate: 0 },
  ];
  
  return mockPosts
    .filter(p => selectedIds.includes(p.id))
    .map(p => ({
      name: p.title.length > 15 ? p.title.substring(0, 15) + "..." : p.title,
      impressions: p.impressions,
      reach: p.reach,
      likes: p.likes,
      engagement: p.engagement_rate,
    }));
};

const getPlatformIcon = (platform: Platform) => {
  if (platform.icon) {
    const IconComponent = platform.icon;
    return <IconComponent className="h-4 w-4" />;
  }
  return <span className="text-sm">{platform.emoji}</span>;
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

  const togglePlatform = (platformId: string) => {
    setActivePlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const togglePostSelection = (id: string) => {
    setSelectedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const compareChartData = useMemo(() => {
    return getComparisonData(selectedPosts);
  }, [selectedPosts]);

  if (connectedPlatforms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">ยังไม่มี Platform ที่เชื่อมต่อ</h2>
        <p className="text-muted-foreground mb-4">
          ไปที่ API Keys เพื่อเชื่อมต่อ Platform ของคุณ
        </p>
        <Button variant="outline" onClick={() => navigate("/api-keys")}>
          ไปหน้า API Keys
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Social Analytics</h1>
          <p className="text-muted-foreground">
            จัดการโพสต์, โฆษณา และวิเคราะห์ประสิทธิภาพ
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[130px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 วัน</SelectItem>
              <SelectItem value="30">30 วัน</SelectItem>
              <SelectItem value="90">90 วัน</SelectItem>
            </SelectContent>
          </Select>

          {/* Compare Button */}
          {selectedPosts.length >= 2 && selectedPosts.length <= 5 && (
            <Button onClick={() => setShowCompare(true)} className="gap-2">
              <GitCompare className="h-4 w-4" />
              เปรียบเทียบ ({selectedPosts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Platform Toggles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Platforms:</span>
            {connectedPlatforms.map((platform) => (
              <div key={platform.id} className="flex items-center gap-2">
                <Switch
                  checked={activePlatforms.includes(platform.id)}
                  onCheckedChange={() => togglePlatform(platform.id)}
                />
                <Badge variant="outline" className="gap-1">
                  {getPlatformIcon(platform)}
                  {platform.name}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {activePlatforms.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              เปิด Platform อย่างน้อย 1 ตัวเพื่อดูข้อมูล
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="posts" className="gap-2">
              <FileText className="h-4 w-4" />
              Social Posts
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Ads
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Ad Groups
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Social Posts Tab */}
          <TabsContent value="posts">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Social Posts
                </CardTitle>
                <CardDescription>
                  จัดการโพสต์บน Social Media ทั้ง Organic และ Scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialPostsList
                  selectedPosts={selectedPosts}
                  onSelectPost={togglePostSelection}
                  dateRange={dateRange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  Ads Management
                </CardTitle>
                <CardDescription>
                  สร้างและจัดการโฆษณา พร้อม Headline, Ad Copy และ Call-to-Action
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdsList adGroups={adGroups} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ad Groups Tab */}
          <TabsContent value="groups">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Ad Groups
                </CardTitle>
                <CardDescription>
                  จัดกลุ่มโฆษณาเพื่อให้ง่ายต่อการจัดการและวิเคราะห์
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdGroupsList onGroupsChange={setAdGroups} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Ad Insights Summary
                </CardTitle>
                <CardDescription>
                  สรุปประสิทธิภาพโฆษณา: Impressions, Clicks, Spend, ROAS, Conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdInsightsSummary dateRange={dateRange} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Compare Dialog */}
      <Dialog open={showCompare} onOpenChange={setShowCompare}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              เปรียบเทียบโพสต์
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Comparison Chart */}
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="impressions" name="Impressions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reach" name="Reach" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="likes" name="Likes" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparison Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {compareChartData.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p className="font-medium text-sm mb-3 truncate">{item.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span>{(item.impressions / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        <span>{(item.likes / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span>{item.engagement}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3 w-3 text-muted-foreground" />
                        <span>{(item.reach / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
