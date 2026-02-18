import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  Eye,
  Heart,
  TrendingUp,
  Facebook,
  Instagram,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { usePlatformConnections } from "@/hooks/usePlatformConnections";
import { useSocialPosts } from "@/hooks/useSocialPosts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Engagement() {
  const navigate = useNavigate();
  const { connectedPlatforms } = usePlatformConnections();
  const [dateRange, setDateRange] = useState("30");

  // Calculate date range for query
  const getDaysFromRange = () => {
    switch (dateRange) {
      case "7": return 7;
      case "30": return 30;
      case "90": return 90;
      default: return 30;
    }
  };

  const { posts, isLoading } = useSocialPosts();

  // Filter posts based on date range
  const filteredPosts = posts?.filter(post => {
    if (!post.created_at) return false;
    const postDate = new Date(post.created_at);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - getDaysFromRange());
    return postDate >= cutoffDate;
  }) || [];

  // Calculate engagement data from posts
  const engagementData = (() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayTotals: Record<string, { likes: number; comments: number; shares: number }> = {};

    days.forEach(day => {
      dayTotals[day] = { likes: 0, comments: 0, shares: 0 };
    });

    filteredPosts.forEach(post => {
      if (post.created_at) {
        const date = new Date(post.created_at);
        const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
        dayTotals[dayName].likes += post.likes || 0;
        dayTotals[dayName].comments += post.comments || 0;
        dayTotals[dayName].shares += post.shares || 0;
      }
    });

    return days.map(day => ({
      date: day,
      likes: dayTotals[day].likes,
      comments: dayTotals[day].comments,
      shares: dayTotals[day].shares,
    }));
  })();

  // Calculate top posts
  const topPosts = filteredPosts
    .filter(post => post.status === 'published')
    .map(post => {
      const engagement = ((post.likes || 0) + (post.comments || 0) + (post.shares || 0));
      const reach = (post.likes || 0) * 10; // Estimate
      const engagementRate = reach > 0 ? (engagement / reach) * 100 : 0;
      return {
        id: post.id,
        platform: post.platform_id || 'Unknown',
        content: post.content?.substring(0, 40) || 'No content',
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        reach,
        engagement: Number(engagementRate.toFixed(1)),
      };
    })
    .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
    .slice(0, 10);

  // Calculate social metrics by platform
  const socialMetrics = (() => {
    const platformStats: Record<string, { posts: number; likes: number; comments: number; shares: number }> = {};

    filteredPosts.forEach(post => {
      const platform = post.platform_id || 'unknown';
      if (!platformStats[platform]) {
        platformStats[platform] = { posts: 0, likes: 0, comments: 0, shares: 0 };
      }
      platformStats[platform].posts += 1;
      platformStats[platform].likes += post.likes || 0;
      platformStats[platform].comments += post.comments || 0;
      platformStats[platform].shares += post.shares || 0;
    });

    return Object.entries(platformStats).map(([platform, stats]) => {
      const totalEngagement = stats.likes + stats.comments + stats.shares;
      return {
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        followers: totalEngagement.toLocaleString(), // Total engagement (no estimate)
        growth: null, // No real growth data available
        engagement: Number((stats.posts > 0 ? (totalEngagement / stats.posts / 100) : 0).toFixed(1)),
        posts: stats.posts,
        icon: platform === 'facebook' ? Facebook : platform === 'instagram' ? Instagram : Heart,
        color: platform === 'facebook' ? "bg-info/10 text-info" :
          platform === 'instagram' ? "bg-primary/10 text-primary" :
            "bg-destructive/10 text-destructive",
      };
    });
  })();

  // Show empty state if no platforms connected
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

  // Show empty state if no data
  const hasData = filteredPosts.length > 0;

  if (!isLoading && !hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Engagement</h1>
            <p className="text-muted-foreground">
              Monitor social media engagement across all platforms
            </p>
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มีข้อมูลในช่วงเวลานี้</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              ไม่พบข้อมูล Social Posts ในฐานข้อมูล กรุณารัน sample-data.sql ใน Supabase SQL Editor
            </p>
            <Button variant="outline" onClick={() => window.open('https://supabase.com/dashboard/project/xpmswnktazcjpqumrfsh/sql/new', '_blank')}>
              เปิด SQL Editor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Engagement</h1>
          <p className="text-muted-foreground">
            Monitor social media engagement across all platforms
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <Skeleton className="h-10 w-10 rounded-lg mb-3" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Social Platform Stats */}
          {socialMetrics.length > 0 && (
            <div className="grid gap-4 md:grid-cols-4">
              {socialMetrics.map((metric) => (
                <Card key={metric.platform} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.color}`}>
                        <metric.icon className="h-5 w-5" />
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success border-0">
                        +{metric.growth}%
                      </Badge>
                    </div>
                    <h4 className="mt-3 font-semibold">{metric.platform}</h4>
                    <p className="text-2xl font-bold">{metric.followers}</p>
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Engagement: {metric.engagement}%</span>
                      <span>{metric.posts} posts</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Engagement Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Weekly Engagement Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="likes"
                      name="Likes"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="comments"
                      name="Comments"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="shares"
                      name="Shares"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Posts */}
          {topPosts.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead className="text-center">
                        <ThumbsUp className="h-4 w-4 inline mr-1" />
                        Likes
                      </TableHead>
                      <TableHead className="text-center">
                        <MessageSquare className="h-4 w-4 inline mr-1" />
                        Comments
                      </TableHead>
                      <TableHead className="text-center">
                        <Share2 className="h-4 w-4 inline mr-1" />
                        Shares
                      </TableHead>
                      <TableHead className="text-center">
                        <Eye className="h-4 w-4 inline mr-1" />
                        Reach
                      </TableHead>
                      <TableHead className="text-center">
                        <TrendingUp className="h-4 w-4 inline mr-1" />
                        Engagement
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <Badge variant="secondary">{post.platform}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {post.content}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {post.likes.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {post.comments.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {post.shares.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {post.reach.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={Math.min(post.engagement * 10, 100)} className="w-16 h-2" />
                            <span className="font-medium text-success">{post.engagement}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
